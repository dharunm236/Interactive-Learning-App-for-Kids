import React, { useState, useEffect, useRef } from "react";
import { auth, db } from "../../firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { FaPencilAlt } from "react-icons/fa";
import styles from "./ProfilePage.module.css"; // Import CSS Module
import lionImage from "../assets/lion.jpg";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState({
    username: "",
    gender: "",
    age: "",
    grade: "",
  });
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [changesMade, setChangesMade] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setProfileData(userSnap.data());
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleEdit = (field) => {
    setEditing(editing === field ? null : field);
  };

  const handleChange = (e, field) => {
    setProfileData({ ...profileData, [field]: e.target.value });
    setChangesMade(true);
  };

  const handleSave = async () => {
    if (!profileData.age || isNaN(profileData.age) || profileData.age <= 0) {
      alert("Please enter a valid age.");
      return;
    }

    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, profileData, { merge: true });

    alert("Profile updated successfully!");
    setEditing(null);
    setChangesMade(false);
  };

  // Click outside to close edit mode
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setEditing(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!user) return <p>User not logged in</p>;

  return (
    <div className={styles.profilePage}>
      <div className={styles.profileContainer}>
        <div className={styles.profileCard} ref={profileRef}>
          <div className={styles.profileHeader}>
            <img src={user.photoURL || lionImage} alt="Profile" className={styles.profilePicture} />
            <h2>{profileData.name || "N/A"}</h2>
            <p className={styles.email}><strong>Email:</strong> {user.email}</p>
          </div>

          {["username", "gender", "age", "grade"].map((field) => (
            <div key={field} className={styles.profileField}>
              <strong>{field.charAt(0).toUpperCase() + field.slice(1)}:</strong>
              {editing === field ? (
                field === "gender" ? (
                  <select value={profileData[field]} onChange={(e) => handleChange(e, field)}>
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <input
                    type={field === "age" ? "number" : "text"}
                    value={profileData[field]}
                    onChange={(e) => handleChange(e, field)}
                    autoFocus
                  />
                )
              ) : (
                <span>{profileData[field] || "N/A"}</span>
              )}
              <FaPencilAlt onClick={() => handleEdit(field)} className={styles.editIcon} />
            </div>
          ))}

          {changesMade && <button className={styles.saveButton} onClick={handleSave}>Save</button>}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
