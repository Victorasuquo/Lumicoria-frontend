import { useState, useEffect } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { getMessagingSafe } from '../firebase';
import { toast } from 'sonner';
import api from '../services/api';

// iOS Safari (outside an installed PWA) does NOT support FCM. All entry
// points here must guard against `getMessagingSafe()` returning null.

const supportsNotifications = () =>
    typeof window !== 'undefined' && 'Notification' in window;

export const usePushNotifications = () => {
    const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
        supportsNotifications() ? Notification.permission : 'denied'
    );
    const [fcmToken, setFcmToken] = useState<string | null>(null);

    useEffect(() => {
        let unsubscribe: (() => void) | undefined;
        let cancelled = false;

        (async () => {
            const messaging = await getMessagingSafe();
            if (!messaging || cancelled) return;
            unsubscribe = onMessage(messaging, (payload) => {
                const title = payload.notification?.title || 'New Notification';
                const body = payload.notification?.body;
                toast(title, { description: body });
                if (supportsNotifications() && Notification.permission === 'granted') {
                    new Notification(title, {
                        body,
                        icon: '/lumicoria-logo-gradient.png',
                    });
                }
            });
        })();

        return () => {
            cancelled = true;
            if (unsubscribe) unsubscribe();
        };
    }, []);

    const requestForToken = async () => {
        if (!supportsNotifications()) return;
        const messaging = await getMessagingSafe();
        if (!messaging) return;

        try {
            const permission = await Notification.requestPermission();
            setNotificationPermission(permission);
            if (permission !== 'granted') return;

            const registration = await navigator.serviceWorker.ready;
            const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
            if (!vapidKey) return;

            const token = await getToken(messaging, {
                vapidKey,
                serviceWorkerRegistration: registration,
            });
            if (token) {
                setFcmToken(token);
                await registerToken(token);
            }
        } catch (error) {
            console.warn('push: retrieve token failed', error);
        }
    };

    const registerToken = async (token: string) => {
        try {
            await api.post('/device-tokens/register', {
                token,
                platform: 'web',
                device_name: navigator.userAgent,
            });
        } catch (error) {
            console.warn('push: register failed', error);
        }
    };

    const deleteToken = async () => {
        const messaging = await getMessagingSafe();
        if (!messaging) return;
        try {
            const currentToken = fcmToken || await getToken(messaging, {
                vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
            });
            if (currentToken) {
                await api.delete('/device-tokens/deregister', { data: { token: currentToken } });
                setFcmToken(null);
            }
        } catch (error) {
            console.warn('push: deregister failed', error);
        }
    };

    return {
        requestForToken,
        deleteToken,
        fcmToken,
        notificationPermission,
    };
};
