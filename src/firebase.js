import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAB4gky8rQHonFbAmAjKjB8yf8xztSJ-Yw",
  authDomain: "help-desk-96e13.firebaseapp.com",
  projectId: "help-desk-96e13",
  storageBucket: "help-desk-96e13.firebasestorage.app",
  messagingSenderId: "533155897262",
  appId: "1:533155897262:web:6d7be08627afaac86af23f"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);