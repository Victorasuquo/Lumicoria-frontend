// Firebase init — lazy, iOS-safe.
//
// IMPORTANT: Do NOT eagerly call getAnalytics() or getMessaging() at module
// top. On iOS Safari both throw FirebaseError because the runtime lacks the
// required APIs (Web Push is PWA-only on iOS 16.4+; gtag/IndexedDB can
// fail in private mode). An uncaught error here kills the whole bundle
// before React's createRoot runs, producing the iPhone blank screen.
//
// We initialise the app + auth (always safe) at module load, and gate
// analytics + messaging behind feature-detection + try/catch.

import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";
import {
  getAnalytics as fbGetAnalytics,
  isSupported as analyticsIsSupported,
  type Analytics,
} from "firebase/analytics";
import {
  getMessaging as fbGetMessaging,
  isSupported as messagingIsSupported,
  type Messaging,
} from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Safe synchronous core
const app: FirebaseApp = initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Cached lazy singletons
let _analytics: Analytics | null = null;
let _messaging: Messaging | null = null;

/** Lazily initialise Firebase Analytics. Returns null on unsupported runtimes. */
export async function getAnalyticsSafe(): Promise<Analytics | null> {
  if (_analytics) return _analytics;
  try {
    if (typeof window === "undefined") return null;
    if (!(await analyticsIsSupported())) return null;
    _analytics = fbGetAnalytics(app);
    return _analytics;
  } catch (err) {
    console.warn("[firebase] analytics unavailable", err);
    return null;
  }
}

/** Lazily initialise Firebase Cloud Messaging. Returns null on iOS Safari (tab) and unsupported runtimes. */
export async function getMessagingSafe(): Promise<Messaging | null> {
  if (_messaging) return _messaging;
  try {
    if (typeof window === "undefined") return null;
    if (!("serviceWorker" in navigator)) return null;
    if (!(await messagingIsSupported())) return null;
    _messaging = fbGetMessaging(app);
    return _messaging;
  } catch (err) {
    console.warn("[firebase] messaging unavailable", err);
    return null;
  }
}

/** Register the FCM service worker. No-op on browsers that don't support push. */
async function registerMessagingSW(): Promise<void> {
  try {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (!(await messagingIsSupported())) return;

    const swParams = new URLSearchParams({
      apiKey: firebaseConfig.apiKey ?? "",
      authDomain: firebaseConfig.authDomain ?? "",
      projectId: firebaseConfig.projectId ?? "",
      storageBucket: firebaseConfig.storageBucket ?? "",
      messagingSenderId: firebaseConfig.messagingSenderId ?? "",
      appId: firebaseConfig.appId ?? "",
      measurementId: firebaseConfig.measurementId ?? "",
    });

    await navigator.serviceWorker.register(
      `/firebase-messaging-sw.js?${swParams.toString()}`,
    );
  } catch (err) {
    console.warn("[firebase] SW registration skipped", err);
  }
}

// Kick off SW registration after first paint so it never blocks render.
if (typeof window !== "undefined") {
  if (typeof requestIdleCallback === "function") {
    (window as any).requestIdleCallback(() => void registerMessagingSW());
  } else {
    setTimeout(() => void registerMessagingSW(), 0);
  }
}

// Backwards-compat: a `messaging` named export. Callers that rely on the
// old synchronous shape will get `null` on iOS Safari and should switch
// to `await getMessagingSafe()`. Keeping it null-typed lets the build
// continue while we audit call sites.
const messaging: Messaging | null = null;

export { app, auth, googleProvider, messaging };
