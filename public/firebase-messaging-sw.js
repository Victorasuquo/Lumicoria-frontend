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

// Ensure config is present before initializing
if (firebaseConfig.apiKey) {
    firebase.initializeApp(firebaseConfig);

    // Retrieve an instance of Firebase Messaging so that it can handle background
    // messages.
    const messaging = firebase.messaging();

    messaging.onBackgroundMessage((payload) => {
        console.log('[firebase-messaging-sw.js] Received background message ', payload);
        // Customize notification here
        const notificationTitle = payload.notification.title;
        const notificationOptions = {
            body: payload.notification.body,
            icon: '/lumicoria-logo-white.png' // Use the logo
        };

        self.registration.showNotification(notificationTitle, notificationOptions);
    });
} else {
    console.error('Firebase config missing in Service Worker URL parameters.');
}
