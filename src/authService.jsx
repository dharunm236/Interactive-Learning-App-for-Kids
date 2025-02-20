import { auth, db } from "./firebaseConfig";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, setDoc, getDocs, query, where, collection } from "firebase/firestore";

// ✅ Sign Up User & Store Extra Details (with username)
export const signUp = async (email, password, username) => {
  try {
    // Check if username is already taken
    const q = query(collection(db, "users"), where("username", "==", username));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      throw new Error("Username is already taken!");
    }

    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Store user data in Firestore
    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      username: username,
      createdAt: new Date(),
    });

    return user;
  } catch (error) {
    console.error("Signup Error:", error.message);
    throw error;
  }
};

// ✅ Log In User
export const logIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Login Error:", error.message);
    throw error;
  }
};

// ✅ Log Out User
export const logOut = async () => {
  try {
    await signOut(auth);
    console.log("User Logged Out");
    window.location.reload();
  } catch (error) {
    console.error("Logout Error:", error.message);
    throw error;
  }
};
