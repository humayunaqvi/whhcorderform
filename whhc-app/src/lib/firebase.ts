import { initializeApp, getApps } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyBcnSHwNkHdhBK6-8xLpsPfHnHgmPdl4pc",
  authDomain: "whhc-clinic.firebaseapp.com",
  databaseURL: "https://whhc-clinic-default-rtdb.firebaseio.com",
  projectId: "whhc-clinic",
  storageBucket: "whhc-clinic.firebasestorage.app",
  messagingSenderId: "420295059908",
  appId: "1:420295059908:web:bfd814b3128a42ced71c91"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getDatabase(app);

// All new app data lives under 'v2/' to avoid conflicts with the existing production app
export const DB_PREFIX = 'v2';

export default app;
