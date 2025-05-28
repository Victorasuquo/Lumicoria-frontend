// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCQE0ziUV7uhV7UovwnhgROAxDIW238LcA",
  authDomain: "lumicoria-55fbd.firebaseapp.com",
  projectId: "lumicoria-55fbd",
  storageBucket: "lumicoria-55fbd.firebasestorage.app",
  messagingSenderId: "757874659613",
  appId: "1:757874659613:web:2fac7b12c12a70c62b91f4",
  measurementId: "G-QSQ8T5GDRM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { auth }; 