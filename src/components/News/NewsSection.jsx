import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import './NewsSection.css';

const NewsSection = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  

  const API_KEY = '8243ad01604fe2c9e7aedabc23d535b2';
  

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        
        // Try different query approaches to maximize chances of getting real news
        // Reduced number of queries to minimize rate limit issues
        const queryOptions = [
          { q: 'india kids education science discovery', country: 'in', lang: 'en' },
          { q: 'children learning science facts', country: 'in', lang: 'en' },
          { q: 'students innovation technology', country: 'in', lang: 'en' }
        ];
        
        let allEnglishArticles = [];
        
        // Try each query with delay between requests
        for (const queryOption of queryOptions) {
          if (allEnglishArticles.length >= 6) break; // Stop if we have enough articles
          
          try {
            console.log(`Trying query: ${queryOption.q}`);
            
            const response = await axios.get('https://gnews.io/api/v4/search', {
              params: {
                ...queryOption,
                max: 10,
                sortby: 'relevance',
                in: 'title,description',
                apikey: API_KEY
              },
              // Add timeout to prevent hanging requests
              timeout: 10000
            });
            
            if (response.data.articles && Array.isArray(response.data.articles)) {
              allEnglishArticles = [...allEnglishArticles, ...response.data.articles];
              console.log(`Found ${response.data.articles.length} articles with query "${queryOption.q}"`);
            }
            
            // Add delay between API calls to avoid rate limiting
            await delay(1000);
            
          } catch (queryError) {
            console.error(`Error with query "${queryOption.q}":`, queryError);
            
            // Check if this is a rate limit error
            if (queryError.response && queryError.response.status === 429) {
              console.log("Rate limit hit. Waiting longer before next request...");
              await delay(3000); // Wait longer if we hit rate limit
            }
          }
        }
        
        // Try to get Tamil news - only use one query to reduce API calls
        let tamilArticles = [];
        const tamilQueries = [
          'குழந்தைகள் கல்வி அறிவியல்' // Children education science
        ];
        
        for (const tamilQuery of tamilQueries) {
          try {
            console.log(`Trying Tamil query: ${tamilQuery}`);
            
            // Add delay before Tamil query
            await delay(1000);
            
            const tamilResponse = await axios.get('https://gnews.io/api/v4/search', {
              params: {
                q: tamilQuery,
                lang: 'ta',
                country: 'in',
                max: 5,
                sortby: 'relevance',
                apikey: API_KEY
              },
              timeout: 10000
            });
            
            if (tamilResponse.data.articles && 
                Array.isArray(tamilResponse.data.articles) && 
                tamilResponse.data.articles.length > 0) {
              tamilArticles = tamilResponse.data.articles;
              console.log(`Found ${tamilArticles.length} Tamil articles with query "${tamilQuery}"`);
            }
          } catch (tamilError) {
            console.error(`Error with Tamil query "${tamilQuery}":`, tamilError);
            // Handle rate limiting for Tamil queries
            if (tamilError.response && tamilError.response.status === 429) {
              console.log("Rate limit hit on Tamil query.");
            }
          }
        }
        
        // If we still don't have enough articles and haven't hit rate limits too much,
        // try top headlines but only for one category
        if (allEnglishArticles.length < 3) {
          try {
            // Add delay before headlines query
            await delay(1000);
            
            const headlinesResponse = await axios.get('https://gnews.io/api/v4/top-headlines', {
              params: {
                category: 'science',
                lang: 'en',
                country: 'in',
                max: 10,
                apikey: API_KEY
              },
              timeout: 10000
            });
            
            if (headlinesResponse.data.articles && Array.isArray(headlinesResponse.data.articles)) {
              allEnglishArticles = [...allEnglishArticles, ...headlinesResponse.data.articles];
              console.log(`Added ${headlinesResponse.data.articles.length} articles from science headlines`);
            }
          } catch (headlinesError) {
            console.error("Error fetching headlines:", headlinesError);
          }
        }
        
        // Filter out inappropriate content for children
        const inappropriateTerms = ['death', 'dead', 'kill', 'war', 'crime', 'gun', 'shot', 'violence', 
                                   'murder', 'suicide', 'blood', 'attack', 'terror', 'porn', 'sex',
                                   'abuse', 'assault', 'bomb', 'drunk', 'alcohol'];
        
        // Filter English articles
        const filteredEnglishArticles = allEnglishArticles.filter(article => {
          if (!article.title || !article.description) return false;
          
          const titleLower = article.title.toLowerCase();
          const descLower = article.description.toLowerCase();
          
          return !inappropriateTerms.some(term => 
            titleLower.includes(term) || descLower.includes(term)
          );
        });
        
        // Filter Tamil articles
        const filteredTamilArticles = tamilArticles.filter(article => {
          if (!article.title || !article.description) return false;
          
          const titleLower = article.title.toLowerCase();
          const descLower = article.description.toLowerCase();
          
          // Filter out articles containing these terms that might be recognized in Tamil content
          const tamilFilterTerms = ['death', 'dead', 'kill', 'murder', 'suicide', 'blood', 'terror'];
          return !tamilFilterTerms.some(term => 
            titleLower.includes(term) || descLower.includes(term)
          );
        });
        
        // Prepare final news collection
        // First, try to get articles with images
        let englishNewsWithImages = filteredEnglishArticles
          .filter(article => article.image)
          .slice(0, 3);
        
        // If not enough articles with images, add articles without images
        if (englishNewsWithImages.length < 3) {
          const englishNewsWithoutImages = filteredEnglishArticles
            .filter(article => !article.image)
            .slice(0, 3 - englishNewsWithImages.length);
            
          englishNewsWithImages = [...englishNewsWithImages, ...englishNewsWithoutImages];
        }
        
        // Select Tamil news
        let selectedTamilNews = [];
        if (filteredTamilArticles.length > 0) {
          // Prefer Tamil articles with images
          const tamilWithImage = filteredTamilArticles.filter(article => article.image);
          
          if (tamilWithImage.length > 0) {
            selectedTamilNews = [tamilWithImage[0]];
          } else {
            selectedTamilNews = [filteredTamilArticles[0]];
          }
          
          // Add Tamil indicator
          selectedTamilNews[0].isTamil = true;
        }
        
        // Combine English and Tamil news
        const finalNews = [...englishNewsWithImages, ...selectedTamilNews];
        
        // Check if we have any news articles
        if (finalNews.length === 0) {
          // Try a final, very general query as last resort
          try {
            await delay(2000); // Wait longer before last attempt
            
            const generalResponse = await axios.get('https://gnews.io/api/v4/top-headlines', {
              params: {
                lang: 'en',  
                country: 'in',
                max: 5,
                apikey: API_KEY
              },
              timeout: 10000
            });
            
            if (generalResponse.data.articles && 
                Array.isArray(generalResponse.data.articles) && 
                generalResponse.data.articles.length > 0) {
                
              // Filter for kid-friendly content
              const safeGeneralArticles = generalResponse.data.articles.filter(article => {
                const titleLower = article.title?.toLowerCase() || '';
                const descLower = article.description?.toLowerCase() || '';
                return !inappropriateTerms.some(term => 
                  titleLower.includes(term) || descLower.includes(term)
                );
              }).slice(0, 3);
              
              if (safeGeneralArticles.length > 0) {
                setNews(safeGeneralArticles);
                setLoading(false);
                return;
              }
            }
          } catch (finalError) {
            console.error("Final attempt failed:", finalError);
          }
          
          setError("No suitable news found. Please try again later.");
          setLoading(false);
          return;
        }
        
        setNews(finalNews);
        setLoading(false);
        
      } catch (err) {
        console.error("Error fetching news:", err);
        setLoading(false);
        setError("Unable to load news content. Please try again later.");
      }
    };
    
    fetchNews();
  }, []);
  
  // Improved error display with retry button
  const handleRetry = () => {
    window.location.reload();
  };
  
  return (
    <section className="news-section">
      <div className="section-header">
        <h1>Today's Learning News</h1>
        <p className="section-subtitle">Stay updated with kid-friendly discoveries from India and around the world</p>
      </div>
      
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading today's exciting news...</p>
        </div>
      ) : error ? (
        <div className="news-error">
          <p>{error}</p>
          <button onClick={handleRetry} className="retry-button">Try Again</button>
        </div>
      ) : (
        <div className="news-grid">
          {news.map((item, index) => (
            <motion.div 
              key={index}
              className={`news-card ${item.isTamil ? 'tamil-news' : ''}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -10, boxShadow: "0 15px 30px rgba(0, 0, 0, 0.2)" }}
            >
              {item.isTamil && (
                <div className="language-badge">தமிழ்</div>
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
                <p>{item.description?.substring(0, 90)}...</p>
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