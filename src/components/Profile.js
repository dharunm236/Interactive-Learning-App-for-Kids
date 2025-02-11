import React, { useState, useEffect } from "react";
import { auth, db } from "../firebaseConfig"; // Ensure correct path
import { doc, getDoc, setDoc } from "firebase/firestore";

const Profile = () => {
  const [profile, setProfile] = useState({
    name: "",
    age: "",
    grade: "",
    interestedTopics: "",
    gender: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const user = auth.currentUser;
      console.log("Current User:", user); // Debugging
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          setProfile(userDocSnap.data()); // Load existing profile data
        }
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("No user is signed in.");
      }

      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, profile, { merge: true });

      console.log("User profile saved successfully!");
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error saving profile:", error.message);
    }
  };

  return (
    <div>
      <h2>Edit Profile</h2>
      <input type="text" name="name" placeholder="Name" value={profile.name} onChange={handleChange} />
      <input type="number" name="age" placeholder="Age" value={profile.age} onChange={handleChange} />
      <input type="text" name="grade" placeholder="Grade" value={profile.grade} onChange={handleChange} />
      <input type="text" name="interestedTopics" placeholder="Interested Topics" value={profile.interestedTopics} onChange={handleChange} />
      <input type="text" name="gender" placeholder="Gender" value={profile.gender} onChange={handleChange} />
      <button onClick={handleSave}>Save Profile</button>
    </div>
  );
};

export default Profile;
