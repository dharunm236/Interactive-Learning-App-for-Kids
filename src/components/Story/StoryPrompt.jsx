import React, { useState } from "react";
import axios from "axios";
import styles from "./StoryPrompt.module.css"; // Import CSS Module
import { Link, useNavigate } from 'react-router-dom';

const StoryPrompt = () => {
  const [prompt, setPrompt] = useState("");
  const [story, setStory] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const apiKey = "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"; // Use your actual API key here
  const handleBackClick = () => {
    navigate('/'); 
  };
  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setStory("");
    setImage("");

    try {
      // Text Generation using OpenRouter GPT
      const textResponse = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "openai/gpt-3.5-turbo",
          messages: [{ role: "user", content: `Write a short kids story about: ${prompt}` }],
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      const generatedStory = textResponse.data.choices[0].message.content;
      setStory(generatedStory);

      // Image Generation using Lexica API
      // Add your image generation logic here
    } catch (error) {
      console.error("Error:", error);
      setStory("Failed to generate the story. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.backButtonContainer}>
        <img
          src="https://cdn-icons-png.flaticon.com/512/93/93634.png"
          alt="Back"
          className={styles.backButtonImage}
          onClick={handleBackClick}
        />
      </div>
      <div className={styles.toysWrapper}>
        <img
          src="https://cdn-icons-png.flaticon.com/512/5238/5238389.png"
          alt="toy"
          className={styles.toy1}
        />
        <img
          src="https://cdn-icons-png.flaticon.com/512/5238/5238370.png"
          alt="toy"
          className={styles.toy2}
        />
        <img
          src="https://cdn-icons-png.flaticon.com/512/5238/5238397.png"
          alt="toy"
          className={styles.toy3}
        />

        <div className={styles.contentBox}>
          <h2 className={styles.title}>✨ Create Your Magical Story! ✨</h2>
          <input
            type="text"
            className={styles.input}
            placeholder="Enter your story idea..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <button
            className={styles.button}
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? (
              <div className={styles.loading}>
                <div className={styles.bounce1}></div>
                <div className={styles.bounce2}></div>
                <div className={styles.bounce3}></div>
              </div>
            ) : (
              "🎪 Generate Story!"
            )}
          </button>

          {story && (
            <div className={styles.storyContainer}>
              <h3 className={styles.storyTitle}>📖 Your Amazing Story:</h3>
              {story.split("\n").map((paragraph, index) => (
                <p
                  key={index}
                  className={`${styles.storyText} ${styles.visible}`}
                  style={{ color: index % 2 ? "#2a9d8f" : "#e76f51" }}
                >
                  {paragraph}
                </p>
              ))}
              {image && (
                <img
                  src={image}
                  alt="Story Illustration"
                  className={styles.image}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoryPrompt;