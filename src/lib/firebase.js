import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "react-chat-app-499c7.firebaseapp.com",
  projectId: "react-chat-app-499c7",
  storageBucket: "react-chat-app-499c7.appspot.com",
  messagingSenderId: "700578066677",
  appId: "1:700578066677:web:e53f5224fbf045717495bc"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth()
export const db = getFirestore()
export const storage = getStorage()