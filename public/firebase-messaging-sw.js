/* eslint-disable no-undef */
// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
// TODO: These values must be replaced with your actual Firebase config values
// because Service Workers cannot access environment variables directly.
firebase.initializeApp({
    apiKey: "AIzaSyCQE0ziUV7uhV7UovwnhgROAxDIW238LcA",
    authDomain: "lumicoria-55fbd.firebaseapp.com",
    projectId: "lumicoria-55fbd",
    storageBucket: "lumicoria-55fbd.firebasestorage.app",
    messagingSenderId: "757874659613",
    appId: "1:757874659613:web:2fac7b12c12a70c62b91f4",
    measurementId: "G-QSQ8T5GDRM"
});

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
