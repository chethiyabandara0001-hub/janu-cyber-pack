import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import defaultFirebaseConfig from '../firebase-applet-config.json';

// Support Vercel environment variables block with fallback to JSON
const firebaseConfig = {
  apiKey: (import.meta.env?.VITE_FIREBASE_API_KEY) || defaultFirebaseConfig.apiKey,
  authDomain: (import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN) || defaultFirebaseConfig.authDomain,
  projectId: (import.meta.env?.VITE_FIREBASE_PROJECT_ID) || defaultFirebaseConfig.projectId,
  storageBucket: (import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET) || defaultFirebaseConfig.storageBucket,
  messagingSenderId: (import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID) || defaultFirebaseConfig.messagingSenderId,
  appId: (import.meta.env?.VITE_FIREBASE_APP_ID) || defaultFirebaseConfig.appId,
};

// Initialize Firebase safely
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const storage = getStorage(app);

