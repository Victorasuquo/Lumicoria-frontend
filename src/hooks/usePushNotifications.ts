import { useState, useEffect } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '../firebase';
import { toast } from 'sonner';
import api from '../services/api';

export const usePushNotifications = () => {
    const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
        Notification.permission
    );
    const [fcmToken, setFcmToken] = useState<string | null>(null);

    // Removed auto-request on mount to prevents 401 loop if user is not logged in.
    // The calling component (MainNav) is responsible for calling requestForToken when authenticated.

    useEffect(() => {
        // Listen for incoming messages when the app is in the foreground
        const unsubscribe = onMessage(messaging, (payload) => {
            console.log('Foreground push notification received:', payload);
            const title = payload.notification?.title || 'New Notification';
            const body = payload.notification?.body;

            // Show toast
            toast(title, {
                description: body,
            });

            // Show native notification if supported and granted
            if (Notification.permission === 'granted') {
                new Notification(title, {
                    body: body,
                    icon: '/lumicoria-logo-gradient.png'
                });
            }
        });

        return () => {
            unsubscribe();
        };
    }, []);

    const requestForToken = async () => {
        try {
            const permission = await Notification.requestPermission();
            setNotificationPermission(permission);

            if (permission === 'granted') {
                // Get the service worker registration we created in firebase.ts
                const registration = await navigator.serviceWorker.getRegistration();

                const token = await getToken(messaging, {
                    // Using the VITE env var for the key. Ensure this is set in .env
                    vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
                    serviceWorkerRegistration: registration
                });

                if (token) {
                    console.log('FCM Token generated:', token);
                    setFcmToken(token);
                    // Send token to backend
                    await registerToken(token);
                } else {
                    console.log('No registration token available. Request permission to generate one.');
                }
            } else {
                console.log('Notification permission denied.');
            }
        } catch (error) {
            console.error('An error occurred while retrieving token:', error);
        }
    };

    const registerToken = async (token: string) => {
        try {
            await api.post('/device-tokens/register', {
                token: token,
                platform: 'web',
                device_name: navigator.userAgent
            });
            console.log('Device token registered with backend');
        } catch (error) {
            console.error('Failed to register device token:', error);
        }
    };

    const deleteToken = async () => {
        try {
            const currentToken = fcmToken || await getToken(messaging, {
                vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
            });

            if (currentToken) {
                await api.delete('/device-tokens/deregister', {
                    data: { token: currentToken }
                });
                console.log('Device token deregistered from backend');
                setFcmToken(null);
            }
        } catch (error) {
            console.error('Failed to deregister device token:', error);
        }
    };

    return {
        requestForToken,
        deleteToken,
        fcmToken,
        notificationPermission
    };
};
