import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDIWNDrrDBZcaE0TS56Fnz0R5Ykdg1s1yI",
  authDomain: "psl-01-sherbrooke.firebaseapp.com",
  projectId: "psl-01-sherbrooke",
  storageBucket: "psl-01-sherbrooke.firebasestorage.app",
  messagingSenderId: "193501593427",
  appId: "1:193501593427:web:b2e2ac15fae134538e6ba6",
  measurementId: "G-TMF44EGYN8"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
