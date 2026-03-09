import { initializeApp, getApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const rotationConfig = {
  apiKey: "AIzaSyBcnSHwNkHdhBK6-8xLpsPfHnHgmPdl4pc",
  authDomain: "whhc-clinic.firebaseapp.com",
  databaseURL: "https://whhc-clinic-default-rtdb.firebaseio.com",
  projectId: "whhc-clinic",
  storageBucket: "whhc-clinic.firebasestorage.app",
  messagingSenderId: "420295059908",
  appId: "1:420295059908:web:bfd814b3128a42ced71c91"
};

let rotationApp;
try {
  rotationApp = getApp('rotation');
} catch {
  rotationApp = initializeApp(rotationConfig, 'rotation');
}

export const rotationDb = getDatabase(rotationApp);
