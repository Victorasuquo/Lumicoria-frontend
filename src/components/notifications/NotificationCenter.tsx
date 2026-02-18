import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { notificationApi, Notification, NotificationPriority } from '@/services/api';
import NotificationItem from './NotificationItem';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const NotificationCenter = () => {
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
    const [wsConnected, setWsConnected] = useState(false);

    // Ref to track if component is mounted to prevent state updates on unmount
    const isMounted = useRef(true);
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        return () => {
            isMounted.current = false;
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, []);

    // WebSocket Connection
    useEffect(() => {
        if (!user?.id) {
            console.log('NotificationCenter: No user ID, skipping WS connection');
            return;
        }

        const connectWebSocket = () => {
            const token = localStorage.getItem('accessToken');
            if (!token) return;

            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
            // Handle both http/https to ws/wss
            const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            // If API URL is absolute (http://...), replace protocol. If relative, construct from window.location
            let wsUrl = '';
            if (apiUrl.startsWith('http')) {
                // Determine ws protocol based on http protocol of API URL
                const isHttps = apiUrl.startsWith('https');
                const wsScheme = isHttps ? 'wss' : 'ws';
                wsUrl = apiUrl.replace(/^http(s)?/, wsScheme) + `/ws/notifications/${user.id}?token=${token}`;
            } else {
                wsUrl = `${wsProtocol}//${window.location.host}${apiUrl}/ws/notifications/${user.id}?token=${token}`;
            }

            console.log('Connecting to Notification WS:', wsUrl);
            const ws = new WebSocket(wsUrl);

            ws.onopen = () => {
                console.log('Notification WebSocket Connected');
                setWsConnected(true);
            };

            ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);

                    if (message.type === 'notification') {
                        const newNotification = message.data;
                        // Optimistically add to list
                        // We need to ensure the format matches usage. 
                        // The backend sends partial data in "data", ensuring we map it correctly.
                        // Actually backend sends: { "type": "notification", "data": { ...fields... } }
                        // The fields inside data match the Notification interface mostly.

                        setNotifications(prev => {
                            // Avoid duplicates
                            if (prev.find(n => n.id === newNotification.id)) return prev;

                            const mappedNotif: Notification = {
                                id: newNotification.id,
                                user_id: user.id,
                                notification_type: newNotification.notification_type, // Assuming generic string matches enum or is compatible
                                title: newNotification.title,
                                content: newNotification.content,
                                priority: newNotification.priority,
                                read: false,
                                metadata: newNotification.metadata,
                                created_at: newNotification.created_at
                            };
                            return [mappedNotif, ...prev];
                        });
                        setUnreadCount(prev => prev + 1);

                    } else if (message.type === 'notification_read') {
                        const { notification_id } = message.data;
                        setNotifications(prev => prev.map(n =>
                            n.id === notification_id ? { ...n, read: true } : n
                        ));
                        setUnreadCount(prev => Math.max(0, prev - 1));

                    } else if (message.type === 'all_notifications_read') {
                        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                        setUnreadCount(0);

                    } else if (message.type === 'notification_deleted') {
                        const { notification_id } = message.data;
                        setNotifications(prev => prev.filter(n => n.id !== notification_id));
                        // Re-fetch count to ensure accuracy
                        fetchUnreadCount();

                    } else if (message.type === 'ping') {
                        ws.send(JSON.stringify({ type: 'pong' }));
                    }
                } catch (e) {
                    console.error('Error parsing WS message', e);
                }
            };

            ws.onclose = (event) => {
                console.log('Notification WebSocket Disconnected', event.code, event.reason);
                setWsConnected(false);
                // Simple reconnect logic: retry after 5s
                // setTimeout(() => {
                //   if (isMounted.current) connectWebSocket();
                // }, 5000);
            };

            ws.onerror = (error) => {
                console.error('WebSocket Error:', error);
            };

            wsRef.current = ws;
        };

        connectWebSocket();

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [user?.id]);

    const fetchUnreadCount = async () => {
        try {
            const data = await notificationApi.getUnreadCount();
            if (isMounted.current) {
                setUnreadCount(data.unread_count);
            }
        } catch (error) {
            console.error('Failed to fetch unread count', error);
        }
    };

    const fetchNotifications = async () => {
        // Always fetch latest when opening
        setLoading(true);
        try {
            const data = await notificationApi.getNotifications(
                activeTab === 'unread', // unreadOnly
                50 // limit
            );
            if (isMounted.current) {
                if (Array.isArray(data)) {
                    setNotifications(data);
                } else {
                    console.error('NotificationCenter: Received non-array data', data);
                    setNotifications([]);
                }
            }
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        } finally {
            if (isMounted.current) {
                setLoading(false);
            }
        }
    };

    // Initial fetch of count
    useEffect(() => {
        fetchUnreadCount();
    }, []);

    // Fetch list when opened or tab changes
    useEffect(() => {
        if (open) {
            fetchNotifications();
            fetchUnreadCount();
        }
    }, [open, activeTab]);

    const handleMarkAsRead = async (id: string) => {
        // Optimistic update
        setNotifications(prev => prev.map(n =>
            n.id === id ? { ...n, read: true } : n
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));

        try {
            await notificationApi.markAsRead(id);
        } catch (error) {
            console.error('Failed to mark as read', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        // Optimistic update
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);

        try {
            await notificationApi.markAllAsRead();
        } catch (error) {
            console.error('Failed to mark all as read', error);
        }
    };

    const handleDelete = async (id: string) => {
        // Optimistic update
        const notification = notifications.find(n => n.id === id);
        setNotifications(prev => prev.filter(n => n.id !== id));
        if (notification && !notification.read) {
            setUnreadCount(prev => Math.max(0, prev - 1));
        }

        try {
            await notificationApi.deleteNotification(id);
        } catch (error) {
            console.error('Failed to delete notification', error);
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative rounded-full h-9 w-9 hover:bg-gray-100/50 dark:hover:bg-white/10"
                >
                    <Bell className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-lumicoria-purple ring-2 ring-white dark:ring-gray-950 animate-pulse"></span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 sm:w-96 rounded-2xl border-gray-200 shadow-xl bg-white/95 backdrop-blur-xl dark:bg-gray-900/95 dark:border-gray-800" align="end">
                <div className="flex items-center justify-between border-b px-4 py-3 dark:border-gray-800">
                    <h4 className="font-semibold">Notifications</h4>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto px-2 py-1 text-xs text-lumicoria-purple hover:bg-lumicoria-purple/10"
                            onClick={handleMarkAllAsRead}
                        >
                            <Check className="mr-1 h-3 w-3" />
                            Mark all read
                        </Button>
                    )}
                </div>

                <Tabs defaultValue="all" className="w-full" value={activeTab} onValueChange={(val) => setActiveTab(val as 'all' | 'unread')}>
                    <div className="px-4 pt-2">
                        <TabsList className="grid w-full grid-cols-2 bg-gray-100/50 dark:bg-gray-800/50">
                            <TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-950">All</TabsTrigger>
                            <TabsTrigger value="unread" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-950">
                                Unread
                                {unreadCount > 0 && (
                                    <Badge variant="secondary" className="ml-2 h-5 bg-lumicoria-purple/10 text-lumicoria-purple hover:bg-lumicoria-purple/20">
                                        {unreadCount}
                                    </Badge>
                                )}
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <ScrollArea className="h-[400px]">
                        <TabsContent value="all" className="m-0">
                            {loading ? (
                                <div className="flex h-32 items-center justify-center text-sm text-gray-500">
                                    Loading...
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center p-8 text-center text-gray-500">
                                    <Bell className="mb-2 h-8 w-8 opacity-20" />
                                    <p className="text-sm">No notifications yet</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {notifications.map((notification) => (
                                        <NotificationItem
                                            key={notification.id}
                                            notification={notification}
                                            onRead={handleMarkAsRead}
                                            onDelete={handleDelete}
                                        />
                                    ))}
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="unread" className="m-0">
                            {loading ? (
                                <div className="flex h-32 items-center justify-center text-sm text-gray-500">
                                    Loading...
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center p-8 text-center text-gray-500">
                                    <Check className="mb-2 h-8 w-8 opacity-20" />
                                    <p className="text-sm">You're all caught up!</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {notifications.map((notification) => (
                                        <NotificationItem
                                            key={notification.id}
                                            notification={notification}
                                            onRead={handleMarkAsRead}
                                            onDelete={handleDelete}
                                        />
                                    ))}
                                </div>
                            )}
                        </TabsContent>
                    </ScrollArea>
                </Tabs>
            </PopoverContent>
        </Popover>
    );
};

export default NotificationCenter;
