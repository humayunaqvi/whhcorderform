import { initializeApp, getApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const rotationConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let rotationApp;
try {
  rotationApp = getApp('rotation');
} catch {
  rotationApp = initializeApp(rotationConfig, 'rotation');
}

export const rotationDb = getDatabase(rotationApp);
