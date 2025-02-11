// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBsOYgm3s2v5h3iBKK-CgNWsDnBcpxBBms",
  authDomain: "kids-interactive.firebaseapp.com",
  projectId: "kids-interactive",
  storageBucket: "kids-interactive.firebasestorage.app",
  messagingSenderId: "400569866966",
  appId: "1:400569866966:web:a7fcce5bf48b6e93d0c777",
  measurementId: "G-H8X6SEPVHF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { app,auth,db };