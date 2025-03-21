import React, { useState, useEffect, useRef } from "react";
import { auth, db } from "../../firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { FaPencilAlt, FaArrowLeft, FaUser, FaCheck, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./ProfilePage.css";
import defaultAvatar from "../assets/lion.jpg"; // Default avatar if user has none

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState({
    username: "",
    gender: "",
    age: "",
    grade: "",
    name: "",
  });
  const [originalData, setOriginalData] = useState({});
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changesMade, setChangesMade] = useState(false);
  const [updatedFields, setUpdatedFields] = useState([]);
  const [savingStatus, setSavingStatus] = useState("");
  const profileRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setProfileData(userData);
          setOriginalData(userData);
        }
      } else {
        // Redirect to login if no user
        navigate("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  // Focus on input when editing starts
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  const handleEdit = (field) => {
    setEditing(editing === field ? null : field);
  };

  const handleChange = (e, field) => {
    const newValue = e.target.value;
    setProfileData({ ...profileData, [field]: newValue });
    
    if (originalData[field] !== newValue) {
      setChangesMade(true);
    } else {
      // Check if there are any other changes
      const anyOtherChanges = Object.keys(profileData).some(
        key => key !== field && profileData[key] !== originalData[key]
      );
      setChangesMade(anyOtherChanges);
    }
  };

  const handleCancel = (field) => {
    setProfileData({ ...profileData, [field]: originalData[field] || "" });
    setEditing(null);
  };

  const handleSaveField = async (field) => {
    if (field === "age" && (!profileData.age || isNaN(profileData.age) || profileData.age <= 0)) {
      alert("Please enter a valid age.");
      return;
    }

    try {
      setSaving(true);
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, { [field]: profileData[field] }, { merge: true });
      
      setOriginalData({...originalData, [field]: profileData[field]});
      setEditing(null);
      
      // Add field to updated list for animation
      setUpdatedFields([...updatedFields, field]);
      setTimeout(() => {
        setUpdatedFields(updatedFields.filter(f => f !== field));
      }, 1500);
      
      // Show success status
      showStatus("Saved successfully!");
    } catch (error) {
      console.error("Error saving field:", error);
      showStatus("Error saving changes");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAll = async () => {
    if (profileData.age && (isNaN(profileData.age) || profileData.age <= 0)) {
      alert("Please enter a valid age.");
      return;
    }

    try {
      setSaving(true);
      showStatus("Saving changes...");
      
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, profileData, { merge: true });
      
      setOriginalData({...profileData});
      setEditing(null);
      setChangesMade(false);
      showStatus("All changes saved successfully!");
    } catch (error) {
      console.error("Error saving profile:", error);
      showStatus("Error saving changes");
    } finally {
      setSaving(false);
    }
  };

  const showStatus = (message) => {
    setSavingStatus(message);
    setTimeout(() => {
      setSavingStatus("");
    }, 2000);
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

  if (loading) {
    return (
      <div className="profile-wrapper">
        <div className="profilePage">
          <div className="loading">Loading profile...</div>
        </div>
      </div>
    );
  }

  const fieldLabels = {
    username: "Username",
    gender: "Gender",
    age: "Age",
    grade: "Grade",
  };

  return (
    <div className="profile-wrapper">
      <div className="profilePage">
        {savingStatus && <div className="savingIndicator">{savingStatus}</div>}
        
        <div className="profileContainer">
          <div className="profileCard" ref={profileRef}>
            <button className="backButton" onClick={() => navigate(-1)}>
              <FaArrowLeft />
            </button>
            
            <div className="profileHeader">
              <h2>{profileData.name || user.displayName || "Your Profile"}</h2>
              <p className="email">{user.email}</p>
              
              <div className="avatarContainer">
                <img 
                  src={user.photoURL || defaultAvatar} 
                  alt="Profile" 
                  className="profilePicture"
                />
                <div className="changeAvatarOverlay">
                  Change Photo
                </div>
              </div>
            </div>
            
            <div className="profileContent">
              {Object.keys(fieldLabels).map((field) => (
                <div 
                  key={field} 
                  className={`profileField ${updatedFields.includes(field) ? 'updated' : ''}`}
                >
                  <strong>{fieldLabels[field]}:</strong>
                  
                  {editing === field ? (
                    <>
                      {field === "gender" ? (
                        <select 
                          value={profileData[field] || ""} 
                          onChange={(e) => handleChange(e, field)}
                          ref={inputRef}
                        >
                          <option value="">Select</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      ) : (
                        <input
                          type={field === "age" ? "number" : "text"}
                          value={profileData[field] || ""}
                          onChange={(e) => handleChange(e, field)}
                          ref={inputRef}
                          placeholder={`Enter your ${fieldLabels[field].toLowerCase()}`}
                        />
                      )}
                      
                      <div className="actionButtons">
                        <button 
                          className="saveFieldButton" 
                          onClick={() => handleSaveField(field)}
                          disabled={saving}
                        >
                          <FaCheck />
                        </button>
                        <button 
                          className="cancelButton" 
                          onClick={() => handleCancel(field)}
                        >
                          <FaTimes />
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <span>{profileData[field] || "Not set"}</span>
                      <FaPencilAlt 
                        onClick={() => handleEdit(field)} 
                        className="editIcon" 
                      />
                    </>
                  )}
                </div>
              ))}
              
              {changesMade && (
                <button 
                  className="saveButton" 
                  onClick={handleSaveAll}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save All Changes"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
