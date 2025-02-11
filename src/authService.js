// src/authService.js
import { auth, db } from "./firebaseConfig";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

// Sign Up User & Store Extra Details
export const signUp = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Store extra user details in Firestore
    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      createdAt: new Date(),
    });

    return user;
  } catch (error) {
    console.error("Signup Error:", error.message);
    throw error;
  }
};

// Log In User
export const logIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Login Error:", error.message);
    throw error;
  }
};

// Log Out User
export const logOut = async () => {
  try {
    await signOut(auth);
    console.log("User Logged Out");
    window.location.reload(); // Reload page to reset UI
  } catch (error) {
    console.error("Logout Error:", error.message);
    throw error;
  }
};
