import { initializeApp, getApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const rotationConfig = {
  apiKey: "AIzaSyBf3Ks7kxcNy3U2k0fDEqtpLHDPhDdKCpc",
  authDomain: "whhc-rotation-schedule.firebaseapp.com",
  databaseURL: "https://whhc-rotation-schedule-default-rtdb.firebaseio.com",
  projectId: "whhc-rotation-schedule",
  storageBucket: "whhc-rotation-schedule.firebasestorage.app",
  messagingSenderId: "20990716822",
  appId: "1:20990716822:web:e00fde7b8b137e471f0bb7"
};

let rotationApp;
try {
  rotationApp = getApp('rotation');
} catch {
  rotationApp = initializeApp(rotationConfig, 'rotation');
}

export const rotationDb = getDatabase(rotationApp);
