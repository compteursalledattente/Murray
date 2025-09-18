import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyB0a1w1yBTMj1JSvJOXnkJ6WmnOcEKCgbc",
  authDomain: "murray-sherbrooke-ciussse-chus.firebaseapp.com",
  projectId: "murray-sherbrooke-ciussse-chus",
  storageBucket: "murray-sherbrooke-ciussse-chus.appspot.com",
  messagingSenderId: "778444330791",
  appId: "1:778444330791:web:ca694b885eace97cbf7b02",
  measurementId: "G-KV50CFQ81C"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
