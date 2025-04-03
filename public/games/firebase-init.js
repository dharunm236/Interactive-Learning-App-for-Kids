// Initialize Firebase for standalone games
document.addEventListener('DOMContentLoaded', function() {
  try {
    if (typeof firebase !== 'undefined') {
      const firebaseConfig = {
        apiKey: "AIzaSyBsOYgm3s2v5h3iBKK-CgNWsDnBcpxBBms",
        authDomain: "kids-interactive.firebaseapp.com",
        projectId: "kids-interactive",
        storageBucket: "kids-interactive.firebasestorage.app",
        messagingSenderId: "400569866966",
        appId: "1:400569866966:web:a7fcce5bf48b6e93d0c777",
        measurementId: "G-H8X6SEPVHF"
      };
      
      // Initialize Firebase only if not already initialized
      if (!firebase.apps || !firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }
      console.log("Firebase initialized successfully");
    } else {
      console.error("Firebase SDK not loaded");
    }
  } catch (e) {
    console.error("Firebase initialization error:", e);
  }
});