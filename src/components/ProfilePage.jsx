import React, { useState, useEffect } from "react";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { FaPencilAlt } from "react-icons/fa";
import "./ProfilePage.css";
import lionImage from "./assets/lion.jpg";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState({
    username: "",
    gender: "",
    age: "",
    grade: "",
  });
  const [editing, setEditing] = useState({});
  const [loading, setLoading] = useState(true);
  const [changesMade, setChangesMade] = useState(false);

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
    setEditing({ ...editing, [field]: true });
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
    setEditing({});
    setChangesMade(false);
  };

  if (loading) return <p>Loading...</p>;
  if (!user) return <p>User not logged in</p>;

  return (
    <div className="profile-page">
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header"></div>
        <img src={user.photoURL || lionImage} alt="Profile" className="profile-picture" />
        <h2>{profileData.name || "N/A"}</h2>
        <p><strong>Email:</strong> {user.email}</p>

        <div className="profile-field">
          <strong>Username:</strong>
          {editing.username ? (
            <input type="text" value={profileData.username} onChange={(e) => handleChange(e, "username")} />
          ) : (
            <span>{profileData.username || "N/A"}</span>
          )}
          <FaPencilAlt onClick={() => handleEdit("username")} className="edit-icon" />
        </div>

        <div className="profile-field">
          <strong>Gender:</strong>
          {editing.gender ? (
            <select value={profileData.gender} onChange={(e) => handleChange(e, "gender")}>
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          ) : (
            <span>{profileData.gender || "N/A"}</span>
          )}
          <FaPencilAlt onClick={() => handleEdit("gender")} className="edit-icon" />
        </div>
        <div className="profile-field">
          <strong>Age:</strong>
          {editing.age ? (
            <input type="number" value={profileData.age} onChange={(e) => handleChange(e, "age")} />
          ) : (
            <span>{profileData.age || "N/A"}</span>
          )}
          <FaPencilAlt onClick={() => handleEdit("age")} className="edit-icon" />
        </div>

        <div className="profile-field">
          <strong>Class:</strong>
          {editing.grade ? (
            <input type="text" value={profileData.grade} onChange={(e) => handleChange(e, "grade")} />
          ) : (
            <span>{profileData.grade || "N/A"}</span>
          )}
          <FaPencilAlt onClick={() => handleEdit("grade")} className="edit-icon" />
        </div>

        <button className="save-button" onClick={handleSave}>Save</button>
      </div>
    </div>
  </div>
  );
};

export default ProfilePage;