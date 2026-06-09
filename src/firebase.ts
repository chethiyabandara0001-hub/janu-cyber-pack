import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';
import defaultFirebaseConfig from '../firebase-applet-config.json';

// Support Vercel environment variables block with fallback to JSON
const firebaseConfig = {
  apiKey: "AIzaSyClstsLmizDZJ6OD_WnKaSE06yIwHdtq-8",
  authDomain: "gen-lang-client-0008438867.firebaseapp.com",
  projectId: "gen-lang-client-0008438867",
  storageBucket: "gen-lang-client-0008438867.firebasestorage.app",
  messagingSenderId: "796923319104",
  appId: "1:796923319104:web:5408ce4861d12aec6460a5"
};

const customDatabaseId = "ai-studio-05efdffc-31e5-48da-b96f-d2964f93684b";

// Initialize Firebase safely
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const storage = getStorage(app);
export const db = getFirestore(app, customDatabaseId);


