import { getAuth, signInAnonymously } from "firebase/auth";
import { collection, getDocs, getFirestore } from "firebase/firestore";
import firebase from "firebase/compat/app";
import "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  // apiKey: "AIzaSyCK_goiwoUmdsDWGQleFCg-2FZa_RpDlT4",
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: "attendance-60543.firebaseapp.com",
  projectId: "attendance-60543",
  storageBucket: "attendance-60543.firebasestorage.app",
  messagingSenderId: "556337319361",
  appId: "1:556337319361:web:5224c67a039eacf700f340",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);

signInAnonymously(auth).catch((error) => {
  console.error("Firebase Auth Error:", error);
});
