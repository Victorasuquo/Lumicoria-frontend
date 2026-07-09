import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, Trash2, ExternalLink } from 'lucide-react';
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
import { useNotifications } from '@/contexts/NotificationsContext';
import { notificationLink, isExternalUrl } from '@/lib/notificationLink';

const NotificationCenter = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    // Live state comes from the shared NotificationsContext socket —
    // this component previously opened its OWN duplicate WebSocket
    // (two connections per user for the same stream).
    const {
        unreadCount,
        recent,
        markAsRead: ctxMarkAsRead,
        markAllAsRead: ctxMarkAllAsRead,
        remove: ctxRemove,
    } = useNotifications();
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

    // Ref to track if component is mounted to prevent state updates on unmount
    const isMounted = useRef(true);

    useEffect(() => {
        return () => { isMounted.current = false; };
    }, []);

    // Merge live arrivals from the shared socket into the local list.
    useEffect(() => {
        if (!recent.length) return;
        setNotifications(prev => {
            const known = new Set(prev.map(n => n.id));
            const fresh = recent.filter(n => !known.has(n.id));
            return fresh.length ? [...fresh, ...prev] : prev;
        });
    }, [recent]);

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

    // Fetch list when opened or tab changes
    useEffect(() => {
        if (open) {
            fetchNotifications();
        }
    }, [open, activeTab]);

    const handleMarkAsRead = async (id: string) => {
        setNotifications(prev => prev.map(n =>
            n.id === id ? { ...n, read: true } : n
        ));
        await ctxMarkAsRead(id); // context handles API + unread count
    };

    const handleMarkAllAsRead = async () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        await ctxMarkAllAsRead();
    };

    const handleDelete = async (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
        await ctxRemove(id);
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
                                            onClick={(id) => {
                                                const target = notifications.find(x => x.id === id);
                                                if (target && !target.read) void handleMarkAsRead(id);
                                                setOpen(false);
                                                if (target) {
                                                    const href = notificationLink(target);
                                                    if (isExternalUrl(href)) {
                                                        window.open(href, "_blank", "noopener,noreferrer");
                                                    } else {
                                                        navigate(href);
                                                    }
                                                } else {
                                                    navigate(`/notifications?id=${id}`);
                                                }
                                            }}
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
                                            onClick={(id) => {
                                                const target = notifications.find(x => x.id === id);
                                                if (target && !target.read) void handleMarkAsRead(id);
                                                setOpen(false);
                                                if (target) {
                                                    const href = notificationLink(target);
                                                    if (isExternalUrl(href)) {
                                                        window.open(href, "_blank", "noopener,noreferrer");
                                                    } else {
                                                        navigate(href);
                                                    }
                                                } else {
                                                    navigate(`/notifications?id=${id}`);
                                                }
                                            }}
                                        />
                                    ))}
                                </div>
                            )}
                        </TabsContent>
                    </ScrollArea>
                </Tabs>

                {/* View all footer */}
                <div className="border-t px-4 py-2.5">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50 gap-1.5"
                        onClick={() => {
                            setOpen(false);
                            navigate('/notifications');
                        }}
                    >
                        <ExternalLink className="h-3 w-3" />
                        View all notifications
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default NotificationCenter;
