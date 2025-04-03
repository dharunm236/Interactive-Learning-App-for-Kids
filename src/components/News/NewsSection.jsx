import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import './NewsSection.css';

const NewsSection = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('ta'); // Default to Tamil
  const [lastRefreshTime, setLastRefreshTime] = useState(new Date());
  

  const rssSources = [
    {
      url: 'https://api.rss2json.com/v1/api.json?rss_url=https://www.sciencenewsforstudents.org/feed',
      language: 'en'
    },
    {
      url: 'https://api.rss2json.com/v1/api.json?rss_url=https://www.sciencedaily.com/rss/top/science.xml',
      language: 'en'
    },
    {
      url: 'https://api.rss2json.com/v1/api.json?rss_url=https://www.nasa.gov/rss/dyn/breaking_news.rss',
      language: 'en'
    }
  ];
  
  // Regional language sources
  const regionalSources = {
    ta: 'https://api.rss2json.com/v1/api.json?rss_url=https://feeds.bbci.co.uk/tamil/rss.xml',
    ml: 'https://api.rss2json.com/v1/api.json?rss_url=https://malayalam.news18.com/commonfeeds/v1/mal/rss/world.xml',
    te: 'https://api.rss2json.com/v1/api.json?rss_url=https://feeds.bbci.co.uk/telugu/rss.xml'
  };
  
  // Format time for display
  const formatRefreshTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const fetchRssFeed = async () => {
    try {
      setLoading(true);
      
      // Filter out inappropriate content for children
      const inappropriateTerms = ['death', 'dead', 'kill', 'war', 'crime', 'gun', 'shot', 'violence', 
                                'murder', 'suicide', 'blood', 'attack', 'terror', 'porn', 'sex',
                                'abuse', 'assault', 'bomb', 'drunk', 'alcohol'];
      
      let allEnglishArticles = [];
      let regionalArticles = [];
      
      // Fetch from English RSS sources
      for (const source of rssSources) {
        try {
          const response = await axios.get(source.url, { timeout: 10000 });
          
          if (response.data && response.data.items && Array.isArray(response.data.items)) {
            const articles = response.data.items.map(item => ({
              title: item.title,
              description: item.description || item.content,
              url: item.link,
              image: item.enclosure?.link || item.thumbnail || extractImageFromContent(item.content || item.description),
              publishedAt: item.pubDate,
              language: 'en'
            }));
            
            // Filter articles based on inappropriate terms
            const filteredArticles = articles.filter(article => {
              if (!article.title || !article.description) return false;
              
              const titleLower = article.title.toLowerCase();
              const descLower = article.description.toLowerCase();
              
              return !inappropriateTerms.some(term => 
                titleLower.includes(term) || descLower.includes(term)
              );
            });
            
            allEnglishArticles = [...allEnglishArticles, ...filteredArticles];
          }
        } catch (sourceError) {
          console.error(`Error fetching from ${source.url}:`, sourceError);
        }
      }
      
      // Fetch from selected regional language source
      try {
        const regionalSourceUrl = regionalSources[selectedLanguage];
        const response = await axios.get(regionalSourceUrl, { timeout: 10000 });
        
        if (response.data && response.data.items && Array.isArray(response.data.items)) {
          const articles = response.data.items.map(item => ({
            title: item.title,
            description: item.description || item.content,
            url: item.link,
            image: item.enclosure?.link || item.thumbnail || extractImageFromContent(item.content || item.description),
            publishedAt: item.pubDate,
            language: selectedLanguage
          }));
          
          // Filter articles based on inappropriate terms
          const filteredArticles = articles.filter(article => {
            if (!article.title || !article.description) return false;
            
            const titleLower = article.title.toLowerCase();
            const descLower = article.description.toLowerCase();
            
            return !inappropriateTerms.some(term => 
              titleLower.includes(term) || descLower.includes(term)
            );
          });
          
          regionalArticles = filteredArticles;
        }
      } catch (sourceError) {
        console.error(`Error fetching from regional source:`, sourceError);
      }
      
      // Select English articles (prioritize ones with images)
      let englishNewsWithImages = allEnglishArticles
        .filter(article => article.image)
        .slice(0, 4);
      
      // If not enough articles with images, add articles without images
      if (englishNewsWithImages.length < 4) {
        const englishNewsWithoutImages = allEnglishArticles
          .filter(article => !article.image)
          .slice(0, 4 - englishNewsWithImages.length);
          
        englishNewsWithImages = [...englishNewsWithImages, ...englishNewsWithoutImages];
      }
      
      // Select one regional article (preferably with image)
      const regionalWithImage = regionalArticles.filter(article => article.image);
      let selectedRegionalArticle = regionalWithImage.length > 0 
        ? [regionalWithImage[0]] 
        : regionalArticles.length > 0 ? [regionalArticles[0]] : [];
      
      // Add language indicator
      if (selectedRegionalArticle.length > 0) {
        selectedRegionalArticle[0].isRegional = true;
      }
      
      // Combine English and regional news - LIMIT TO 5 TOTAL
      const finalNews = [...englishNewsWithImages.slice(0, 4), ...selectedRegionalArticle].slice(0, 5);
      
      if (finalNews.length === 0) {
        // Provide sample news if no valid articles found
        const fallbackNews = [
          {
            title: "Amazing Facts About Space",
            description: "Discover fascinating facts about our solar system and the universe beyond.",
            url: "https://spaceplace.nasa.gov/",
            image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=500&auto=format&fit=crop"
          },
          {
            title: "Animals of the Amazon Rainforest",
            description: "Learn about the incredible biodiversity in Earth's largest rainforest.",
            url: "https://kids.nationalgeographic.com/",
            image: "https://images.unsplash.com/photo-1535338454770-8be927b5a00b?q=80&w=500&auto=format&fit=crop"
          },
          {
            title: "How Volcanoes Work",
            description: "Explore the science behind volcanic eruptions and their impact on Earth.",
            url: "https://www.sciencenewsforstudents.org/",
            image: "https://images.unsplash.com/photo-1622675363311-3e1904dc1885?q=80&w=500&auto=format&fit=crop"
          }
        ];
        setNews(fallbackNews.slice(0, 5));
      } else {
        setNews(finalNews);
      }
      
      setLastRefreshTime(new Date());
      setLoading(false);
      
    } catch (err) {
      console.error("Error fetching RSS feeds:", err);
      setLoading(false);
      setError("Unable to load news content. Please try again later.");
    }
  };
  
  useEffect(() => {
    fetchRssFeed();
    
    // Set up the 2-hour refresh interval
    const twoHoursInMs = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
    const refreshInterval = setInterval(() => {
      fetchRssFeed();
    }, twoHoursInMs);
    
    // Clean up the interval on component unmount
    return () => clearInterval(refreshInterval);
  }, [selectedLanguage]); // Re-fetch when language changes
  
  // Helper function to extract image from HTML content
  const extractImageFromContent = (content) => {
    if (!content) return null;
    
    // Create a temporary DOM element to parse the HTML content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    
    // Find the first image in the content
    const img = tempDiv.querySelector('img');
    return img ? img.src : null;
  };
  
  // Manually refresh news
  const handleRefresh = () => {
    fetchRssFeed();
  };
  
  // Change regional language
  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
  };
  
  // Map language codes to display names
  const languageNames = {
    ta: 'தமிழ்',
    ml: 'മലയാളം',
    te: 'తెలుగు'
  };
  
  return (
    <section className="news-section">
      <div className="section-header">
        <h1>Today's Learning News</h1>
        <p className="section-subtitle">Stay updated with kid-friendly discoveries from India and around the world</p>
        
        <div className="news-controls">
          <div className="language-selector">
            <span>Regional news: </span>
            <button 
              className={selectedLanguage === 'ta' ? 'active' : ''} 
              onClick={() => handleLanguageChange('ta')}
            >
              தமிழ்
            </button>
            <button 
              className={selectedLanguage === 'ml' ? 'active' : ''} 
              onClick={() => handleLanguageChange('ml')}
            >
              മലയാളം
            </button>
            <button 
              className={selectedLanguage === 'te' ? 'active' : ''} 
              onClick={() => handleLanguageChange('te')}
            >
              తెలుగు
            </button>
          </div>
          <div className="refresh-info">
            <span>Last updated: {formatRefreshTime(lastRefreshTime)}</span>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading today's exciting news...</p>
        </div>
      ) : error ? (
        <div className="news-error">
          <p>{error}</p>
          <button onClick={handleRefresh} className="retry-button">Try Again</button>
        </div>
      ) : (
        <div className="news-grid">
          {news.map((item, index) => (
            <motion.div 
              key={index}
              className={`news-card ${item.isRegional ? 'regional-news' : ''}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -10, boxShadow: "0 15px 30px rgba(0, 0, 0, 0.2)" }}
            >
              {item.isRegional && (
                <div className="language-badge">{languageNames[item.language] || 'Regional'}</div>
              )}
              <div className="news-image">
                <img 
                  src={item.image || "https://images.unsplash.com/photo-1584697964328-b1e7f63dca95?q=80&w=500&auto=format&fit=crop"} 
                  alt={item.title} 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://images.unsplash.com/photo-1584697964328-b1e7f63dca95?q=80&w=500&auto=format&fit=crop";
                  }}
                />
              </div>
              <div className="news-content">
                <h3>{item.title}</h3>
                <p>{item.description?.substring(0, 90).replace(/<[^>]*>/g, '')}...</p>
                <a 
                  href={item.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="read-more-button"
                >
                  Learn More
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
};

export default NewsSection;