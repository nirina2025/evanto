import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: "AIzaSyAVDggRzIAAoEf1FwkiB6xeGzxuygrK35k",
  authDomain: "netflix-70cf9.firebaseapp.com",
  projectId: "netflix-70cf9",
  storageBucket: "netflix-70cf9.firebasestorage.app",
  messagingSenderId: "895303539410",
  appId: "1:895303539410:web:5eccd9d4154fc30d966b0b"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

export default app;