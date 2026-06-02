/* eslint-disable no-undef */
// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object

// Parse configuration from URL query parameters
const params = new URLSearchParams(self.location.search);

const firebaseConfig = {
    apiKey: params.get('apiKey'),
    authDomain: params.get('authDomain'),
    projectId: params.get('projectId'),
    storageBucket: params.get('storageBucket'),
    messagingSenderId: params.get('messagingSenderId'),
    appId: params.get('appId'),
    measurementId: params.get('measurementId')
};

// ── Helpers ────────────────────────────────────────────────────────────

/**
 * Build the notification options from the FCM payload's `data` block.
 * Supports Phase 6's `actions` (JSON string) + `click_action` / per-action
 * URLs that the backend attaches for the agent-proposal push.
 */
function buildNotificationOptions(payload) {
    const data = (payload && payload.data) || {};
    const notification = (payload && payload.notification) || {};

    let actions = [];
    if (typeof data.actions === 'string' && data.actions.trim()) {
        try {
            const parsed = JSON.parse(data.actions);
            if (Array.isArray(parsed)) {
                actions = parsed
                    .filter((a) => a && a.action && a.title)
                    .slice(0, 2) // most browsers only render up to 2 actions
                    .map((a) => ({ action: String(a.action), title: String(a.title) }));
            }
        } catch (_) {
            // ignore malformed actions JSON — fall back to a plain notification
        }
    }

    return {
        body: notification.body || data.body || '',
        icon: '/lumicoria-logo-white.png',
        badge: '/icon-192.png',
        tag: data.task_id ? `task:${data.task_id}` : undefined,
        renotify: !!data.task_id,
        // Stash the full data payload + actions in `data` so notificationclick
        // can route based on the user's choice.
        data: { ...data, _actions: actions },
        actions,
    };
}

// ── FCM initialisation + background handler ───────────────────────────

if (firebaseConfig.apiKey) {
    firebase.initializeApp(firebaseConfig);

    const messaging = firebase.messaging();

    messaging.onBackgroundMessage((payload) => {
        console.log('[firebase-messaging-sw.js] Received background message ', payload);
        const title = (payload.notification && payload.notification.title) || 'Lumicoria';
        const options = buildNotificationOptions(payload);
        self.registration.showNotification(title, options);
    });
} else {
    console.error('Firebase config missing in Service Worker URL parameters.');
}

// ── Notification click routing ────────────────────────────────────────
//
// When the user taps an action button (event.action is set) we navigate to
// the URL the backend attached to that action.  When the user taps the
// notification body itself (no action), we use `data.click_action` if
// present, otherwise fall back to `/tasks`.

self.addEventListener('notificationclick', (event) => {
    const notif = event.notification;
    const data = (notif && notif.data) || {};
    notif.close();

    const actionId = event.action || '';
    let targetUrl = '';

    if (actionId) {
        // Match the tapped action against the attached actions list and pull
        // its URL from the data payload.  We also support direct lookups via
        // well-known keys (e.g. data.approve_url) for Phase 6 proposals.
        const lookup = {
            review: data.review_url,
            approve: data.approve_url,
            reject: data.reject_url,
        };
        targetUrl = lookup[actionId] || '';
    }

    if (!targetUrl) {
        targetUrl =
            data.click_action ||
            (data.task_id ? `/tasks?task=${data.task_id}` : '/tasks');
    }

    event.waitUntil(
        (async () => {
            const allClients = await clients.matchAll({ type: 'window', includeUncontrolled: true });
            // Reuse an existing same-origin tab when possible — best UX.
            for (const client of allClients) {
                try {
                    // Same-origin tab? Navigate it and focus.
                    if ('focus' in client) {
                        await client.focus();
                        if ('navigate' in client) {
                            try {
                                await client.navigate(targetUrl);
                            } catch (_) {
                                // navigate() can fail cross-origin; fall through to openWindow.
                            }
                        }
                        return;
                    }
                } catch (_) {
                    /* try next client */
                }
            }
            if (clients.openWindow) {
                await clients.openWindow(targetUrl);
            }
        })()
    );
});
