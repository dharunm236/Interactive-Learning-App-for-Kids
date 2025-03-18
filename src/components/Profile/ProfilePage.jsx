import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaArrowLeft, FaSave, FaUser, FaEnvelope, FaBirthdayCake, FaLanguage, FaIdCard } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import "./ProfilePage.css";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    name: "Alex Johnson",
    username: "alexkid",
    email: "alex@example.com",
    age: "8",
    language: "English",
    avatar: "https://api.dicebear.com/6.x/adventurer/svg?seed=Felix&backgroundColor=b6e3f4"
  });

  const [editing, setEditing] = useState({
    name: false,
    username: false,
    email: false,
    age: false,
    language: false,
  });

  const [tempValues, setTempValues] = useState({...profile});
  
  // Load profile data from localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem("userProfile");
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
      setTempValues(JSON.parse(savedProfile));
    }
  }, []);

  const handleBack = () => {
    navigate("/dashboard");
  };

  const handleEdit = (field) => {
    setEditing({
      ...editing,
      [field]: true,
    });
  };

  const handleChange = (field, value) => {
    setTempValues({
      ...tempValues,
      [field]: value,
    });
  };

  const handleSave = (field) => {
    const newProfile = {
      ...profile,
      [field]: tempValues[field],
    };
    
    setProfile(newProfile);
    setEditing({
      ...editing,
      [field]: false,
    });
    
    // Save to localStorage
    localStorage.setItem("userProfile", JSON.stringify(newProfile));
  };

  const handleAvatarChange = () => {
    // Generate a random seed for the avatar
    const randomSeed = Math.random().toString(36).substring(2, 8);
    const newAvatar = `https://api.dicebear.com/6.x/adventurer/svg?seed=${randomSeed}&backgroundColor=b6e3f4`;
    
    const newProfile = {
      ...profile,
      avatar: newAvatar
    };
    
    setProfile(newProfile);
    setTempValues(newProfile);
    localStorage.setItem("userProfile", JSON.stringify(newProfile));
  };

  const saveAllChanges = () => {
    const newProfile = { ...tempValues };
    setProfile(newProfile);
    setEditing({
      name: false,
      username: false,
      email: false,
      age: false,
      language: false,
    });
    
    // Save to localStorage
    localStorage.setItem("userProfile", JSON.stringify(newProfile));
  };

  return (
    <div className="profile-wrapper">
      <div className="profilePage">
        <motion.div 
          className="profileCard"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="profileHeader">
            <motion.button 
              className="backButton"
              onClick={handleBack}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <FaArrowLeft />
            </motion.button>
            
            <h1>My Profile</h1>
            <div className="sparkles">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="sparkle" style={{ 
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`
                }}></div>
              ))}
            </div>
          </div>
          
          <motion.div 
            className="avatarContainer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAvatarChange}
          >
            <img 
              src={profile.avatar} 
              alt="Profile" 
              className="profilePicture" 
            />
            <div className="changeAvatarOverlay">
              <span>Click to change</span>
            </div>
          </motion.div>
          
          <div className="profileContent">
            <AnimatePresence mode="wait">
              {Object.entries(profile).map(([key, value]) => {
                if (key === "avatar") return null;
                
                const icon = {
                  name: <FaUser />,
                  username: <FaIdCard />,
                  email: <FaEnvelope />,
                  age: <FaBirthdayCake />,
                  language: <FaLanguage />,
                }[key];
                
                return (
                  <motion.div 
                    className="profileField"
                    key={key}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="fieldLabel">
                      <span className="fieldIcon">{icon}</span>
                      <span className="fieldName">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                    </div>
                    
                    {editing[key] ? (
                      <div className="editField">
                        <input 
                          type="text" 
                          value={tempValues[key]} 
                          onChange={(e) => handleChange(key, e.target.value)}
                          className="editInput"
                          autoFocus
                        />
                        <motion.button 
                          className="saveFieldButton"
                          onClick={() => handleSave(key)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          title="Save"
                        >
                          <FaSave />
                        </motion.button>
                      </div>
                    ) : (
                      <>
                        <span className="fieldValue">{value}</span>
                        <motion.div 
                          className="editIcon"
                          onClick={() => handleEdit(key)}
                          whileHover={{ rotate: 15 }}
                          title="Edit"
                        >
                          <FaEdit />
                        </motion.div>
                      </>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
            
            {Object.values(editing).some(val => val) && (
              <motion.button 
                className="saveButton"
                onClick={saveAllChanges}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.05, background: '#e68900' }}
                whileTap={{ scale: 0.95 }}
              >
                Save All Changes
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;