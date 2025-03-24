import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import styles from './SpeechChecker.module.css';

const SpeechChecker = () => {
  // State management
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [language, setLanguage] = useState('en-US');
  const [currentTopic, setCurrentTopic] = useState('');
  const [timeLeft, setTimeLeft] = useState(30); // 30 seconds timer (reduced from 60)
  const [timerActive, setTimerActive] = useState(false);
  const [stage, setStage] = useState('initial'); // 'initial', 'topic', 'recording', 'feedback'
  const [apiFailCount, setApiFailCount] = useState(0);
  
  // Refs
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const fullTranscriptRef = useRef('');
  
  // We'll use simulation mode to avoid API key issues
  const useSimulation = true;
  
  const languages = [
    { code: 'en-US', name: 'English (US)' },
    { code: 'en-GB', name: 'English (UK)' },
    { code: 'es-ES', name: 'Spanish' },
    { code: 'fr-FR', name: 'French' },
    { code: 'de-DE', name: 'German' }
  ];

  const topics = [
    "My favorite toy and why I love it",
    "If I had a superpower, what would it be?",
    "My favorite animal and what makes it special",
    "The best day I ever had",
    "My dream vacation",
    "If I could invent something new",
    "My favorite character from a book or movie",
    "My favorite game to play with friends",
    "If I could talk to animals for a day",
    "My favorite season and what I like to do during it",
    "If I could visit space, what would I want to see?",
    "The most interesting thing I learned recently",
    "If I could be any character in a video game",
    "My favorite holiday and how I celebrate it",
    "If I had a magic wand, what would I do with it?"
  ];

  // Initialize speech recognition
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      // Create a new instance only if not already created
      if (!recognitionRef.current) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
      }
      
      // Update language even if instance exists
      recognitionRef.current.lang = language;
      
      // FIX: Reset the recognition on each session to prevent duplicate sentences
      recognitionRef.current.onstart = () => {
        console.log('Speech recognition started');
      };
      
      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        
        // FIX: Only use the current session's results instead of all history
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            fullTranscriptRef.current += event.results[i][0].transcript + ' ';
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        // Show both final and interim speech
        setTranscript(fullTranscriptRef.current + interimTranscript);
      };
      
      recognitionRef.current.onend = () => {
        console.log('Speech recognition ended');
        // Only restart if still actively listening
        if (isListening) {
          console.log('Restarting speech recognition');
          // FIX: Use a small delay before restarting to prevent overlapping sessions
          setTimeout(() => {
            if (isListening) {
              try {
                recognitionRef.current.start();
              } catch (e) {
                console.error('Error restarting recognition:', e);
              }
            }
          }, 300);
        }
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        if (event.error === 'no-speech') {
          // Don't show error for no-speech, just restart
          if (isListening) {
            console.log('No speech detected, restarting');
            recognitionRef.current.stop();
            setTimeout(() => {
              if (isListening) {
                recognitionRef.current.start();
              }
            }, 300);
          }
        } else {
          setError('Speech recognition error: ' + event.error);
          setIsListening(false);
        }
      };
      
      // Start or stop based on isListening state
      if (isListening) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.error('Error starting recognition:', e);
          // If already started, stop first and then restart
          if (e.message.includes('already started')) {
            recognitionRef.current.stop();
            setTimeout(() => {
              if (isListening) {
                recognitionRef.current.start();
              }
            }, 300);
          }
        }
      } else {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.error('Error stopping recognition:', e);
        }
      }
    } else {
      setError('Speech recognition not supported in this browser.');
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.error('Error stopping recognition in cleanup:', e);
        }
      }
    };
  }, [isListening, language]);

  // Timer functionality
  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timerActive && timeLeft === 0) {
      stopRecording();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [timerActive, timeLeft]);

  const getRandomTopic = () => {
    const randomIndex = Math.floor(Math.random() * topics.length);
    return topics[randomIndex];
  };

  const startExercise = () => {
    setCurrentTopic(getRandomTopic());
    setStage('topic');
  };

  const startRecording = () => {
    // Reset all necessary state
    fullTranscriptRef.current = '';
    setTranscript('');
    setFeedback({});
    setError(null);
    setTimeLeft(30); // 30 seconds now
    setTimerActive(true);
    setStage('recording');
    
    // Start recognition after a small delay to ensure everything is reset
    setTimeout(() => {
      setIsListening(true);
    }, 100);
  };

  const stopRecording = () => {
    setIsListening(false);
    setTimerActive(false);
    
    // Give a small delay to ensure transcript is final before analysis
    setTimeout(() => {
      if (transcript.trim()) {
        // Always use simulation for now to avoid API key issues
        simulateAnalysis();
      }
    }, 300);
  };

  const resetExercise = () => {
    fullTranscriptRef.current = '';
    setTranscript('');
    setFeedback({});
    setError(null);
    setTimeLeft(30); // 30 seconds
    setStage('initial');
  };

  const simulateAnalysis = () => {
    setLoading(true);
    
    if (!transcript || transcript.trim().length === 0) {
      setError("No speech detected. Please try again.");
      setLoading(false);
      return;
    }
    
    setError("Analyzing your speech... This might take a few moments.");
    analyzeWithAI(2);
  };

  const analyzeWithAI = async (retries = 2) => {
    try {
      console.log("Sending transcript to OpenRouter API for analysis...");
      
      const response = await callOpenRouterAPI();
      console.log("API response received:", response.status);
      
      validateAPIResponse(response);
      processAPIContent(response.data.choices[0].message.content);
    } catch (error) {
      await handleAnalysisError(error, retries);
    }
  };

  // Extracted error-handling logic
  const handleAnalysisError = async (error, retries) => {
    console.error("API error:", error);
    
    if (retries > 0) {
      console.log(`Retrying API call. Retries left: ${retries}`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return analyzeWithAI(retries - 1);
    } else {
      handleAPIFailure();
    }
  };

  // Helper function to make the API call
  const callOpenRouterAPI = async () => {
    return await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "anthropic/claude-3-sonnet-20240229",
        messages: [
          { 
            role: "system", 
            content: createSystemPrompt()
          },
          { 
            role: "user", 
            content: `Analyze this speech about "${currentTopic}": "${transcript}"` 
          }
        ],
        response_format: { type: "json_object" }, // Request JSON format explicitly
      },
      {
        headers: {
          "Authorization": `Bearer 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`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://kids-interactive.com",
          "X-Title": "Kids Interactive - Speech Analysis"
        },
        timeout: 15000, // 15 second timeout
      }
    );
  };
  
  // Helper function to create the system prompt
  const createSystemPrompt = () => {
    return `You are a helpful speaking coach for children. Analyze the following speech about "${currentTopic}" and provide constructive feedback.
    
    Analyze these aspects:
    1. Topic relevance: How well did they stay on topic?
    2. Vocabulary: Did they use interesting or advanced words?
    3. Sentence structure: Were sentences complete and varied?
    4. Delivery: Did they use many filler words?
    5. Overall effectiveness
    
    Return your response as a JSON object with these fields:
    {
      "overview": "Brief summary of the speech",
      "topicAdherence": "Feedback on staying on topic",
      "grammar": "Feedback on sentence structure",
      "vocabulary": "Feedback on word choice",
      "delivery": "Feedback on speaking style",
      "strengths": "2-3 things they did well",
      "improvementAreas": "2-3 things to improve",
      "nextStepsTips": "Specific practice suggestions",
      "score": "A number from 1-10",
      "encouragement": "A positive encouraging message"
    }
    
    Make the feedback friendly, specific, and encouraging for a child.
    IMPORTANT: Format your response as valid JSON only, with NO additional text before or after the JSON.`;
  };
  
  // Helper function to validate API response
  const validateAPIResponse = (response) => {
    if (!response.data || !response.data.choices || 
        !response.data.choices[0] || !response.data.choices[0].message) {
      throw new Error("Invalid API response structure");
    }
  };
  
  // Helper function to process API content
  const processAPIContent = (content) => {
    try {
      // Try to parse the response as JSON
      const analysisResult = JSON.parse(content);
      console.log("Successfully parsed API response");
      
      validateResultFields(analysisResult);
      normalizeScore(analysisResult);
      
      // Update the UI with the feedback
      setFeedback(analysisResult);
      setStage('feedback');
      setLoading(false);
    } catch (parseError) {
      console.error("Failed to parse API response:", parseError);
      throw parseError;
    }
  };
  
  // Helper function to validate required fields
  const validateResultFields = (analysisResult) => {
    const requiredFields = [
      "overview", "topicAdherence", "grammar", "vocabulary", 
      "delivery", "strengths", "improvementAreas", 
      "nextStepsTips", "score", "encouragement"
    ];
    
    const missingFields = requiredFields.filter(field => !analysisResult.hasOwnProperty(field));
    
    if (missingFields.length > 0) {
      console.warn("API response missing fields:", missingFields);
      throw new Error(`API response missing fields: ${missingFields.join(", ")}`);
    }
  };
  
  // Helper function to normalize score
  const normalizeScore = (analysisResult) => {
    // Ensure score is a number between 1-10
    if (typeof analysisResult.score !== 'number') {
      analysisResult.score = parseInt(analysisResult.score) || 5;
    }
    analysisResult.score = Math.min(10, Math.max(1, Math.round(analysisResult.score)));
  };
  
  // Helper function to handle API failure
  const handleAPIFailure = () => {
    console.log("All API retries failed. Falling back to local analysis");
    setApiFailCount(prevCount => prevCount + 1);
    const localAnalysis = analyzeTranscript(transcript, currentTopic);
    setFeedback(localAnalysis);
    setStage('feedback');
    setLoading(false);
    
    // If we've had multiple API failures, show a persistent error
    if (apiFailCount >= 2) {
      setError("We're experiencing issues connecting to our AI service. Your feedback is being generated locally instead.");
    }
  };

  // Analyze the transcript for real metrics
  const analyzeTranscript = (text, topic) => {
    // Text preprocessing
    const words = text.trim().split(/\s+/);
    const wordCount = words.length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const sentenceCount = sentences.length;
    
    // Word-level analysis
    const uniqueWords = new Set(words.map(w => w.toLowerCase()));
    const vocabularyRichness = uniqueWords.size / wordCount;
    
    // Sentence length analysis
    const avgWordsPerSentence = wordCount / Math.max(1, sentenceCount);
    
    // Filler words detection - expanded list
    const fillerWords = (text.match(/um|uh|like|you know|sort of|kind of|basically|actually|well|so|anyway|i mean|i guess|right|okay|just|stuff|things/gi) || []);
    const fillerWordCount = fillerWords.length;
    const fillerWordRatio = fillerWordCount / wordCount;
    
    // Topic relevance (enhanced keyword matching)
    const topicKeywords = topic.toLowerCase().split(/\s+/).filter(w => 
      w.length > 3 && !['the', 'and', 'that', 'this', 'with', 'from', 'what', 'would', 'about', 'have', 'when', 'your', 'will'].includes(w)
    );
    
    // Extract key concepts from the topic
    const topicConcepts = new Set(topicKeywords);
    
    // Count keyword occurrences and weights
    let topicRelevanceScore = 0;
    let keywordsFound = 0;
    
    topicKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = text.match(regex) || [];
      if (matches.length > 0) {
        keywordsFound++;
        // More occurrences give diminishing returns
        topicRelevanceScore += Math.min(3, matches.length) / 3;
      }
    });
    
    // Normalize relevance score (0-1)
    topicRelevanceScore = Math.min(1, topicRelevanceScore / Math.max(1, topicKeywords.length));
    
    // Analyze sentence complexity
    const complexSentences = sentences.filter(s => {
      const sentenceWords = s.trim().split(/\s+/);
      return sentenceWords.length >= 10 || // Longer sentences
             s.includes(",") || // Contains commas (likely complex)
             /because|therefore|however|although|since|while|whereas|if|when|despite|though|unless/i.test(s); // Contains connecting words
    }).length;
    
    const sentenceComplexityRatio = complexSentences / Math.max(1, sentenceCount);
    
    // Impressive words (longer words the user used)
    const impressiveWords = words
      .filter(w => w.length > 6)
      .filter(w => !['because', 'different', 'something', 'everything', 'anything', 'another', 'probably', 'actually', 'basically'].includes(w.toLowerCase()))
      .slice(0, 5);
    
    // Check for repetition
    const wordFrequency = {};
    words.forEach(word => {
      const normalizedWord = word.toLowerCase();
      if (normalizedWord.length > 3) { // Only count meaningful words
        wordFrequency[normalizedWord] = (wordFrequency[normalizedWord] || 0) + 1;
      }
    });
    
    const repeatedWords = Object.entries(wordFrequency)
      .filter(([word, count]) => count > 3 && !['this', 'that', 'with', 'have', 'like'].includes(word))
      .map(([word, count]) => ({ word, count }));
    
    // Calculate score - more strict evaluation
    let score = 5; // Lower base score
    
    // Adjust score based on metrics with stricter criteria
    if (wordCount > 60) score += 0.5;
    if (wordCount > 90) score += 0.5;
    
    // Vocabulary richness (penalize low diversity)
    if (vocabularyRichness < 0.4) score -= 0.75;
    if (vocabularyRichness > 0.6) score += 0.5;
    if (vocabularyRichness > 0.7) score += 0.5;
    
    // Sentence structure
    if (sentenceComplexityRatio < 0.3) score -= 0.5;
    if (sentenceComplexityRatio > 0.5) score += 0.5;
    if (avgWordsPerSentence < 5) score -= 0.5;
    if (avgWordsPerSentence > 25) score -= 0.5;
    
    // Filler words (stricter penalties)
    if (fillerWordRatio > 0.05) score -= 0.75;
    if (fillerWordRatio > 0.1) score -= 0.5;
    
    // Topic relevance (higher standards)
    if (topicRelevanceScore < 0.4) score -= 0.5;
    if (topicRelevanceScore > 0.6) score += 0.5;
    if (topicRelevanceScore > 0.8) score += 0.5;
    
    // Impressive vocabulary
    if (impressiveWords.length >= 2) score += 0.5;
    if (impressiveWords.length >= 4) score += 0.5;
    
    // Penalize repetition
    if (repeatedWords.length > 2) score -= 0.7;
    
    score = Math.min(10, Math.max(1, Math.round(score)));
    
    // Generate more detailed, critical feedback
    return {
      overview: `You spoke about "${topic}" using ${wordCount} words in ${sentenceCount} sentences. ${
        wordCount > 90 ? "You provided a thorough response." : 
        wordCount > 60 ? "You gave a decent amount of information." : 
        "Your response was quite brief. Try to speak more extensively next time."
      }`,
      
      topicAdherence: topicRelevanceScore > 0.7 
        ? `You stayed on topic and clearly addressed the key aspects of "${topic}".` 
        : topicRelevanceScore > 0.5
          ? `You generally addressed the topic of "${topic}", but could have explored it more thoroughly.`
          : `Your speech didn't fully address the topic "${topic}". Make sure to focus more directly on the assigned topic next time.`,
      
      grammar: sentenceComplexityRatio > 0.6
        ? "You used a good mix of complex and simple sentences, which made your speech engaging."
        : sentenceComplexityRatio > 0.3
          ? "Your sentences were adequate, but try to vary your sentence structure more for better expression."
          : "Your speech used mostly simple sentences. Work on creating more complex sentences by combining ideas with words like 'because,' 'however,' and 'although'.",
      
      vocabulary: impressiveWords.length > 3 
        ? `You used impressive vocabulary like '${impressiveWords.slice(0, 3).join("', '")}', which enriched your speech.` 
        : impressiveWords.length > 1
          ? `You used some good words like '${impressiveWords.join("', '")}', but could expand your vocabulary further.`
          : "Your word choice was basic. Try using more varied and descriptive vocabulary to make your speech more engaging.",
      
      delivery: fillerWordRatio > 0.1 
        ? `I noticed frequent filler words like 'um' and 'like' (${Math.round(fillerWordRatio*100)}% of your speech). This significantly affects clarity and confidence.` 
        : fillerWordRatio > 0.05
          ? `You used some filler words (${Math.round(fillerWordRatio*100)}% of your speech), which occasionally interrupted your flow.`
          : "You spoke with minimal filler words, which made your delivery clear and confident.",
      
      strengths: [
        vocabularyRichness > 0.6 ? "Good vocabulary diversity" : null,
        fillerWordRatio < 0.05 ? "Clear delivery with few filler words" : null,
        sentenceComplexityRatio > 0.5 ? "Well-varied sentence structure" : null,
        topicRelevanceScore > 0.7 ? "Strong focus on the assigned topic" : null,
        impressiveWords.length >= 3 ? "Use of advanced vocabulary" : null,
        wordCount > 80 ? "Thorough expression of ideas" : null
      ].filter(Boolean).join(". ") + ".",
      
      improvementAreas: [
        fillerWordRatio > 0.05 ? "Reduce filler words" : null,
        vocabularyRichness < 0.5 ? "Use more varied vocabulary" : null,
        wordCount < 70 ? "Speak more extensively about the topic" : null,
        topicRelevanceScore < 0.6 ? "Stay more focused on the specific topic" : null,
        sentenceComplexityRatio < 0.4 ? "Vary your sentence structure more" : null,
        repeatedWords.length > 2 ? `Avoid repeating words like "${repeatedWords.slice(0, 2).map(w => w.word).join('", "')}"` : null,
        avgWordsPerSentence < 6 ? "Work on creating longer, more detailed sentences" : null
      ].filter(Boolean).join(". ") + ".",
      
      nextStepsTips: [
        "Record yourself regularly and identify patterns in your speech.",
        fillerWordRatio > 0.07 ? "Practice speaking slowly and pausing instead of using filler words." : null,
        vocabularyRichness < 0.6 ? "Learn 3-5 new topic-related words before each practice session." : null,
        sentenceComplexityRatio < 0.4 ? "Practice connecting simple sentences with words like 'because,' 'however,' and 'although.'" : null,
        topicRelevanceScore < 0.6 ? "Before speaking, write down 3-5 key points about the topic you want to cover." : null,
        "Try the '1-minute drill': speak for exactly one minute on various topics without stopping."
      ].filter(Boolean).join(" "),
      
      score: score,
      
      encouragement: score >= 9 
        ? "Excellent job! Your speaking skills are impressive!" 
        : score >= 7 
          ? "You're showing good speaking ability. Keep practicing specific areas to improve further." 
          : score >= 5
            ? "You have a solid foundation. With targeted practice on the areas mentioned, you'll see significant improvement."
            : "Speaking skills develop with regular practice. Focus on the suggested improvements and you'll make progress!"
    };
  };

  // Render different stages of the application
  const renderStage = () => {
    switch (stage) {
      case 'initial':
        return (
          <motion.div 
            className={styles.stageContainer}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className={styles.instructionsBox}>
              <h3>How to Practice Your Speaking Skills</h3>
              <ol>
                <li>Click "Start" to get a fun topic to talk about</li>
                <li>You'll have 30 seconds to speak about the topic</li>
                <li>Try to use clear sentences and interesting words</li>
                <li>When you finish, you'll get helpful feedback on your speaking</li>
              </ol>
            </div>
            
            <motion.button 
              className={styles.primaryButton}
              onClick={startExercise}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Speaking Practice
            </motion.button>
          </motion.div>
        );
      
      case 'topic':
        return (
          <motion.div 
            className={styles.stageContainer}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className={styles.topicBox}>
              <h3>Your Speaking Topic:</h3>
              <p className={styles.topicText}>{currentTopic}</p>
            </div>
            
            <p className={styles.topicInstructions}>
              Take a moment to think about this topic. When you're ready, click "Start Recording" 
              and speak for 30 seconds about it. Try to use complete sentences and interesting words!
            </p>
            
            <div className={styles.buttonGroup}>
              <motion.button 
                className={styles.secondaryButton}
                onClick={() => setCurrentTopic(getRandomTopic())}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{ marginRight: '1rem' }}
              >
                Try Another Topic
              </motion.button>
              
              <motion.button 
                className={styles.primaryButton}
                onClick={startRecording}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Recording
              </motion.button>
            </div>
          </motion.div>
        );
      
      case 'recording':
        return (
          <motion.div 
            className={styles.stageContainer}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className={styles.timerContainer}>
              <div className={styles.progressWrapper}>
                <CircularProgressbar 
                  value={timeLeft} 
                  maxValue={30} // Changed from 60 to 30
                  text={`${timeLeft}`}
                  styles={buildStyles({
                    textSize: '24px',
                    pathTransitionDuration: 0.5,
                    pathColor: timeLeft > 5 ? '#5561ff' : '#ff5555',
                    textColor: timeLeft > 5 ? '#5561ff' : '#ff5555',
                    trailColor: '#f0f7ff',
                  })}
                />
              </div>
              <p className={styles.topicReminder}>{currentTopic}</p>
            </div>
            
            <div className={styles.wavesContainer}>
              {isListening && (
                <div className={styles.soundWaves}>
                  <div className={styles.bar}></div>
                  <div className={styles.bar}></div>
                  <div className={styles.bar}></div>
                  <div className={styles.bar}></div>
                  <div className={styles.bar}></div>
                </div>
              )}
            </div>
            
            <div className={styles.transcriptBox}>
              <h3>Your Speech:</h3>
              <p className={styles.transcriptText}>{transcript || "Start speaking..."}</p>
            </div>
            
            <motion.button 
              className={`${styles.primaryButton} ${styles.stopButton}`}
              onClick={stopRecording}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Stop & Get Feedback
            </motion.button>
          </motion.div>
        );
      
      case 'feedback':
        return (
          <motion.div 
            className={styles.stageContainer}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className={styles.feedbackHeader}>
              <h3>Your Speaking Feedback</h3>
              <div className={styles.scoreContainer}>
                <div className={styles.score}>{feedback.score}/10</div>
                <p>Score</p>
              </div>
            </div>
            
            <div className={styles.feedbackOverview}>
              {feedback.overview}
            </div>
            
            <div className={styles.feedbackGrid}>
              <div className={styles.feedbackCard}>
                <h4>Topic Focus</h4>
                <p>{feedback.topicAdherence}</p>
              </div>
              
              <div className={styles.feedbackCard}>
                <h4>Grammar</h4>
                <p>{feedback.grammar}</p>
              </div>
              
              <div className={styles.feedbackCard}>
                <h4>Vocabulary</h4>
                <p>{feedback.vocabulary}</p>
              </div>
              
              <div className={styles.feedbackCard}>
                <h4>Delivery</h4>
                <p>{feedback.delivery}</p>
              </div>
            </div>
            
            <div className={styles.feedbackColumns}>
              <div className={styles.column}>
                <div className={styles.columnHeader}>
                  <span className={styles.icon}>✨</span>
                  <h4>Your Strengths</h4>
                </div>
                <p>{feedback.strengths}</p>
              </div>
              
              <div className={styles.column}>
                <div className={styles.columnHeader}>
                  <span className={styles.icon}>🚀</span>
                  <h4>Areas to Improve</h4>
                </div>
                <p>{feedback.improvementAreas}</p>
              </div>
            </div>
            
            <div className={styles.nextSteps}>
              <h4>Next Steps to Improve</h4>
              <p>{feedback.nextStepsTips}</p>
            </div>
            
            <div className={styles.encouragement}>
              {feedback.encouragement}
            </div>
            
            <div className={styles.audioTranscript}>
              <h4>What You Said:</h4>
              <p className={styles.transcriptText}>{transcript}</p>
            </div>
            
            <motion.button 
              className={styles.primaryButton}
              onClick={resetExercise}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Try Another Topic
            </motion.button>
          </motion.div>
        );
      
      default:
        return <div>Something went wrong. Please refresh the page.</div>;
    }
  };

  // Add this new component to show errors in a better way
  const StatusMessage = ({ error, loading, apiFailCount }) => {
    if (!error && !loading) return null;
    
    return (
      <div className={`${styles.statusMessage} ${error ? styles.errorMessage : styles.loadingMessage}`}>
        {loading ? (
          <>
            <div className={styles.smallSpinner}></div>
            <p>{error || "Processing your speech..."}</p>
          </>
        ) : (
          <p>{error}</p>
        )}
        {apiFailCount >= 2 && !loading && (
          <button 
            className={styles.retryButton}
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </button>
        )}
      </div>
    );
  };

  return (
    <div className={styles.speechCheckerContainer}>
      <motion.div 
        className={styles.speechChecker}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className={styles.title}>Speech Practice ✨</h2>
        
        {!loading && stage !== 'recording' && (
          <div className={styles.languageSelector}>
            <label htmlFor="language-select">Choose a language: </label>
            <select 
              id="language-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              disabled={isListening || loading}
              className={styles.select}
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
        )}
        
        <StatusMessage error={error} loading={loading} apiFailCount={apiFailCount} />
        
        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Analyzing your speech...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {renderStage()}
          </AnimatePresence>
        )}
      </motion.div>
    </div>
  );
};

export default SpeechChecker;