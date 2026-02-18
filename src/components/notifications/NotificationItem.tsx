import React from 'react';
import { format } from 'date-fns';
import {
    Bell,
    CheckCircle,
    FileText,
    CreditCard,
    Heart,
    Shield,
    Mail,
    Trash2,
    Circle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Notification, NotificationType, NotificationPriority } from '@/services/api';

interface NotificationItemProps {
    notification: Notification;
    onRead: (id: string) => void;
    onDelete: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
    notification,
    onRead,
    onDelete
}) => {
    const getIcon = () => {
        switch (notification.notification_type) {
            case NotificationType.TASK:
                return <CheckCircle className="h-4 w-4 text-emerald-500" />;
            case NotificationType.DOCUMENT:
                return <FileText className="h-4 w-4 text-blue-500" />;
            case NotificationType.BILLING:
                return <CreditCard className="h-4 w-4 text-purple-500" />;
            case NotificationType.WELLBEING:
                return <Heart className="h-4 w-4 text-rose-500" />;
            case NotificationType.AUTH:
                return <Shield className="h-4 w-4 text-amber-500" />;
            case NotificationType.EMAIL:
                return <Mail className="h-4 w-4 text-indigo-500" />;
            default:
                return <Bell className="h-4 w-4 text-gray-500" />;
        }
    };

    const getPriorityColor = () => {
        switch (notification.priority) {
            case NotificationPriority.URGENT:
                return "bg-red-500";
            case NotificationPriority.HIGH:
                return "bg-orange-500";
            default:
                return "bg-transparent";
        }
    };

    return (
        <div
            className={cn(
                "group relative flex gap-3 p-4 transition-all hover:bg-gray-50 dark:hover:bg-white/5",
                !notification.read && "bg-purple-50/50 dark:bg-purple-900/10"
            )}
        >
            {/* Icon & Priority Indicator */}
            <div className="relative mt-1 shrink-0">
                <div className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border bg-white shadow-sm dark:bg-gray-800 dark:border-gray-700",
                    !notification.read && "border-purple-200 dark:border-purple-800"
                )}>
                    {getIcon()}
                </div>
                {notification.priority !== NotificationPriority.NORMAL && notification.priority !== NotificationPriority.LOW && (
                    <span className={cn(
                        "absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-gray-900",
                        getPriorityColor()
                    )} />
                )}
            </div>

            {/* Content */}
            <div className="flex-1 space-y-1">
                <div className="flex items-start justify-between gap-2">
                    <p className={cn(
                        "text-sm font-medium leading-none",
                        !notification.read ? "text-gray-900 dark:text-gray-100" : "text-gray-600 dark:text-gray-400"
                    )}>
                        {notification.title}
                    </p>
                    <span className="text-xs text-gray-400 shrink-0">
                        {(() => {
                            try {
                                return format(new Date(notification.created_at), 'MMM d, h:mm a');
                            } catch (e) {
                                return '';
                            }
                        })()}
                    </span>
                </div>

                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                    {notification.content}
                </p>

                {/* Actions - visible on hover or if unread */}
                <div className="flex items-center gap-2 pt-2 opacity-0 transition-opacity group-hover:opacity-100 sm:gap-4">
                    {!notification.read && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto px-2 py-1 text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                            onClick={(e) => {
                                e.preventDefault();
                                onRead(notification.id);
                            }}
                        >
                            <Circle className="mr-1 h-3 w-3 fill-current" />
                            Mark as read
                        </Button>
                    )}

                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto px-2 py-1 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={(e) => {
                            e.preventDefault();
                            onDelete(notification.id);
                        }}
                    >
                        <Trash2 className="mr-1 h-3 w-3" />
                        Delete
                    </Button>
                </div>
            </div>

            {/* Unread Indicator Dot */}
            {!notification.read && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-purple-600 sm:hidden" />
            )}
        </div>
    );
};

export default NotificationItem;
