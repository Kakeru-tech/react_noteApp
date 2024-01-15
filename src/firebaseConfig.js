
import { initializeApp } from "firebase/app";
// import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import {getFirestore} from "firebase/firestore"

// const firebaseConfig = {
//     apiKey: "AIzaSyD4OR_SO5PRdFwm4rYPE0bE3LoR5vTjjQU",
//     authDomain: "mynoteapp-197ac.firebaseapp.com",
//     projectId: "mynoteapp-197ac",
//     storageBucket: "mynoteapp-197ac.appspot.com",
//     messagingSenderId: "505105432300",
//     appId: "1:505105432300:web:0a3dba1b24c254d500efc9"
// };

const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage();
const db = getFirestore();

export {app,storage, db};

// export const auth = getAuth();
// export const storage = getStorage();
// export const db = getFirestore();