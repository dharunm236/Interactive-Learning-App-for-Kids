import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import './NewsSection.css';

const NewsSection = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Using your existing API key
  const API_KEY = '8243ad01604fe2c9e7aedabc23d535b2';
  
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        
        // First attempt: Try to get Indian educational content for kids
        const response = await axios.get('https://gnews.io/api/v4/search', {
          params: {
            q: 'india kids education science discovery',
            lang: 'en',
            country: 'in',  // Specify India as country
            max: 10,
            sortby: 'publishedAt',
            in: 'title,description',
            apikey: API_KEY
          }
        });
        
        console.log("API Response:", response.data);
        
        // Get Tamil language news specifically
        const tamilResponse = await axios.get('https://gnews.io/api/v4/search', {
          params: {
            q: 'குழந்தைகள் கல்வி அறிவியல்', // Tamil keywords for "children education science"
            lang: 'ta',  // Tamil language code
            country: 'in',
            max: 3,
            sortby: 'publishedAt',
            apikey: API_KEY
          }
        });
        
        console.log("Tamil API Response:", tamilResponse.data);
        
        if (!response.data.articles || !Array.isArray(response.data.articles)) {
          throw new Error("Invalid response format");
        }
        
        // Initial strict filtering for obviously inappropriate content
        const strictInappropriateTerms = ['death', 'dead', 'kill', 'war', 'crime', 'gun', 'shot', 'violence'];
        
        // Apply strict filtering first
        let kidFriendlyNews = response.data.articles.filter(article => {
          const titleLower = article.title?.toLowerCase() || '';
          const descLower = article.description?.toLowerCase() || '';
          
          return !strictInappropriateTerms.some(term => 
            titleLower.includes(term) || descLower.includes(term)
          );
        });
        
        console.log("Filtered articles after strict filtering:", kidFriendlyNews.length);
        
        // If we don't have enough articles with strict filtering, try with looser filtering
        if (kidFriendlyNews.length < 2) {
          console.log("Not enough articles with strict filtering, applying looser filters");
          
          // Less restrictive filtering - remove some terms from the list
          const looseInappropriateTerms = ['death', 'kill', 'crime', 'gun'];
          
          kidFriendlyNews = response.data.articles.filter(article => {
            const titleLower = article.title?.toLowerCase() || '';
            const descLower = article.description?.toLowerCase() || '';
            
            return !looseInappropriateTerms.some(term => 
              titleLower.includes(term) || descLower.includes(term)
            );
          });
          
          console.log("Filtered articles after loose filtering:", kidFriendlyNews.length);
        }
        
        // Process Tamil news
        let tamilNews = [];
        if (tamilResponse.data.articles && Array.isArray(tamilResponse.data.articles) && tamilResponse.data.articles.length > 0) {
          // Take the first Tamil article
          tamilNews = [tamilResponse.data.articles[0]];
          // Add language indicator
          tamilNews[0].isTamil = true;
        } else {
          // Fallback Tamil news
          tamilNews = [{
            title: "குழந்தைகளுக்கான அறிவியல் கண்டுபிடிப்புகள்",
            description: "சென்னையில் குழந்தைகளுக்கான புதிய அறிவியல் கண்டுபிடிப்புகள் குறித்த கண்காட்சி நடைபெறவுள்ளது.",
            image: "https://images.unsplash.com/photo-1632571401005-458e9d244591?q=80&w=500&auto=format&fit=crop",
            url: "https://www.sciencekids.co.nz/sciencefacts/countries/india.html",
            isTamil: true
          }];
        }
        
        // If we still don't have enough, try a second API call with broader terms
        if (kidFriendlyNews.length < 1) {
          console.log("Still not enough articles, trying broader search query");
          
          const broadResponse = await axios.get('https://gnews.io/api/v4/search', {
            params: {
              q: 'children education technology',  // Broader search terms
              lang: 'en',
              max: 10,
              sortby: 'publishedAt',
              in: 'title,description',
              apikey: API_KEY
            }
          });
          
          if (broadResponse.data.articles && Array.isArray(broadResponse.data.articles)) {
            const broadFilteredNews = broadResponse.data.articles.filter(article => {
              const titleLower = article.title?.toLowerCase() || '';
              const descLower = article.description?.toLowerCase() || '';
              
              return !strictInappropriateTerms.some(term => 
                titleLower.includes(term) || descLower.includes(term)
              );
            });
            
            // Combine the results
            kidFriendlyNews = [...kidFriendlyNews, ...broadFilteredNews];
          }
        }
        
        // Take English articles (up to 3 since we'll add 1 Tamil article)
        let finalNews = kidFriendlyNews.slice(0, 3);
        
        // If we still don't have enough articles, use fallback data
        if (finalNews.length < 3) {
          console.log("Not enough articles after all attempts, adding fallback data");
          
          // Use fallback data with Indian content where possible
          const fallbackData = [
            {
              title: "Indian Students Create Award-Winning Science Project",
              description: "A group of students from Mumbai have created a solar-powered water purification system that won national recognition for innovation.",
              image: "https://images.unsplash.com/photo-1550565118-3a14e8d0386f?q=80&w=500&auto=format&fit=crop",
              url: "https://www.education.com/science-fair/"
            },
            {
              title: "New Children's Museum Opens in Delhi",
              description: "A state-of-the-art interactive science museum for children has opened in Delhi featuring hands-on exhibits about space, robotics, and nature.",
              image: "https://images.unsplash.com/photo-1575550959106-5a7defe28b56?q=80&w=500&auto=format&fit=crop",
              url: "https://www.sciencekids.co.nz/sciencefacts/countries/india.html"
            },
            {
              title: "Wildlife Sanctuary Creates Special Program for Young Naturalists",
              description: "A wildlife sanctuary in Kerala has launched a special program to educate children about local ecosystems and conservation efforts.",
              image: "https://images.unsplash.com/photo-1564652518878-669c5d535c00?q=80&w=500&auto=format&fit=crop",
              url: "https://kids.nationalgeographic.com/animals"
            }
          ];
          
          // Add fallback items until we have 3 English articles
          const neededFallbackItems = 3 - finalNews.length;
          finalNews = [...finalNews, ...fallbackData.slice(0, neededFallbackItems)];
        }
        
        // Combine English and Tamil news to get a total of 4 articles
        finalNews = [...finalNews, ...tamilNews];
        
        setNews(finalNews);
        setLoading(false);
        
      } catch (err) {
        console.error("Error fetching news:", err);
        setLoading(false);
        
        // Use India-focused fallback data including a Tamil article
        setNews([
          {
            title: "Indian Students Create Award-Winning Science Project",
            description: "A group of students from Mumbai have created a solar-powered water purification system that won national recognition for innovation.",
            image: "https://images.unsplash.com/photo-1550565118-3a14e8d0386f?q=80&w=500&auto=format&fit=crop",
            url: "https://www.education.com/science-fair/"
          },
          {
            title: "New Children's Museum Opens in Delhi",
            description: "A state-of-the-art interactive science museum for children has opened in Delhi featuring hands-on exhibits about space, robotics, and nature.",
            image: "https://images.unsplash.com/photo-1575550959106-5a7defe28b56?q=80&w=500&auto=format&fit=crop",
            url: "https://www.sciencekids.co.nz/sciencefacts/countries/india.html"
          },
          {
            title: "Wildlife Sanctuary Creates Special Program for Young Naturalists",
            description: "A wildlife sanctuary in Kerala has launched a special program to educate children about local ecosystems and conservation efforts.",
            image: "https://images.unsplash.com/photo-1564652518878-669c5d535c00?q=80&w=500&auto=format&fit=crop",
            url: "https://kids.nationalgeographic.com/animals"
          },
          {
            title: "குழந்தைகளுக்கான அறிவியல் கண்டுபிடிப்புகள்",
            description: "சென்னையில் குழந்தைகளுக்கான புதிய அறிவியல் கண்டுபிடிப்புகள் குறித்த கண்காட்சி நடைபெறவுள்ளது.",
            image: "https://images.unsplash.com/photo-1632571401005-458e9d244591?q=80&w=500&auto=format&fit=crop",
            url: "https://www.sciencekids.co.nz/sciencefacts/countries/india.html",
            isTamil: true
          }
        ]);
      }
    };
    
    fetchNews();
  }, []);
  
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
      ) : (
        <div className="news-grid">
          {Array.isArray(news) && news.length > 0 ? (
            news.map((item, index) => (
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
            ))
          ) : (
            <div className="news-error">
              <p>Couldn't load articles. Please try again later.</p>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default NewsSection;