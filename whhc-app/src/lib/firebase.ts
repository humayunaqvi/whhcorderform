import { initializeApp, getApps } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyD1TVMfNmh1kONRsXRSW_hyuqgvT4eqfxg",
  authDomain: "whhcorderform.firebaseapp.com",
  databaseURL: "https://whhcorderform-default-rtdb.firebaseio.com",
  projectId: "whhcorderform",
  storageBucket: "whhcorderform.appspot.com",
  messagingSenderId: "998553620096",
  appId: "1:998553620096:web:ffd5ab75680d61d7cf6065"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getDatabase(app);

// All new app data lives under 'v2/' to avoid conflicts with the existing production app
export const DB_PREFIX = 'v2';

export default app;
