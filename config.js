import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDJJtSRMuwX2bWg-o8Cmd_cyxh2vDsoBgA",
  authDomain: "compteurmurray.firebaseapp.com",
  projectId: "compteurmurray",
  storageBucket: "compteurmurray.firebasestorage.app",
  messagingSenderId: "671010378458",
  appId: "1:671010378458:web:fe4f24192606563394cbe3",
  measurementId: "G-F7JK2M9YNQ"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
