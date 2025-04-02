import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import './NewsSection.css';

const NewsSection = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Helper function for delay
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        
        // List of educational and science RSS feeds
        const rssSources = [
          {
            url: 'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fwww.sciencedaily.com%2Frss%2Ftop%2Fscience.xml',
            count: 10,
            name: 'Science Daily'
          },
          {
            url: 'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fwww.indiatoday.in%2Frss%2F1206578',
            count: 10,
            name: 'India Today Education'
          },
          {
            url: 'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fwww.sciencenews.org%2Ffeed',
            count: 10,
            name: 'Science News'
          },
          {
            url: 'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fwww.space.com%2Ffeeds%2Fall',
            count: 10,
            name: 'Space.com'
          }
        ];
        
        let allArticles = [];
        
        // Try each RSS feed until we get enough articles
        for (const source of rssSources) {
          if (allArticles.length >= 10) break;
          
          try {
            console.log(`Fetching from ${source.name}...`);
            const response = await axios.get(source.url);
            
            if (response.data && response.data.items && Array.isArray(response.data.items)) {
              console.log(`Found ${response.data.items.length} items from ${source.name}`);
              allArticles = [...allArticles, ...response.data.items.map(item => ({
                ...item,
                sourceName: source.name
              }))];
            }
          } catch (rssError) {
            console.error(`Error fetching from ${source.name}:`, rssError);
          }
          
          // Add delay between requests to avoid rate limits
          await delay(500);
        }
        
        // Filter inappropriate content
        const filteredArticles = filterInappropriateContent(allArticles);
        console.log(`Filtered to ${filteredArticles.length} appropriate articles`);
        
        // Format articles into our required structure
        const formattedEnglishNews = formatRssItems(filteredArticles)
          .slice(0, 3);
        
        // Add Tamil article
        const tamilNews = {
          title: "குழந்தைகளுக்கான அறிவியல் சோதனைகள்",
          description: "வீட்டிலேயே செய்யக்கூடிய எளிய அறிவியல் சோதனைகள் மூலம் குழந்தைகள் அறிவியல் கருத்துகளை கற்றுக்கொள்ள உதவும் வழிகள்.",
          image: "https://images.unsplash.com/photo-1566140967404-b8b3932483f5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
          url: "https://ta.wikipedia.org/wiki/அறிவியல்",
          publishedAt: new Date().toISOString(),
          isTamil: true
        };
        
        // Combine English and Tamil news
        const finalNews = [...formattedEnglishNews, tamilNews];
        
        if (finalNews.length === 0) {
          setError("No news found. Please try again later.");
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
  
  // Function to filter inappropriate content
  const filterInappropriateContent = (items) => {
    const inappropriateTerms = ['death', 'dead', 'kill', 'war', 'crime', 'gun', 'shot', 'violence', 
                               'murder', 'suicide', 'blood', 'attack', 'terror', 'porn', 'sex',
                               'abuse', 'assault', 'bomb', 'drunk', 'alcohol'];
    
    return items.filter(item => {
      const titleLower = (item.title || '').toLowerCase();
      const descLower = (item.description || '').toLowerCase();
      const contentLower = (item.content || '').toLowerCase();
      
      return !inappropriateTerms.some(term => 
        titleLower.includes(term) || descLower.includes(term) || contentLower.includes(term)
      );
    });
  };
  
  // Function to format RSS items into our required structure
  const formatRssItems = (items) => {
    return items.map(item => {
      // Extract the first image from the content if available
      let image = item.thumbnail || null;
      
      if (!image && item.content) {
        const imgMatch = item.content.match(/<img[^>]+src="([^">]+)"/);
        if (imgMatch && imgMatch[1]) {
          image = imgMatch[1];
        }
      }
      
      // If enclosure exists and it's an image, use that
      if (!image && item.enclosure && item.enclosure.link) {
        const link = item.enclosure.link;
        if (link.match(/\.(jpeg|jpg|gif|png)$/)) {
          image = link;
        }
      }
      
      // Clean HTML from description
      let cleanDescription = item.description || '';
      cleanDescription = cleanDescription.replace(/<[^>]*>/g, ' ')
        .replace(/\s{2,}/g, ' ')
        .trim();
      
      if (cleanDescription.length === 0 && item.content) {
        cleanDescription = item.content.replace(/<[^>]*>/g, ' ')
          .replace(/\s{2,}/g, ' ')
          .trim()
          .substring(0, 150) + '...';
      }
      
      // Format to match our existing article structure
      return {
        title: item.title,
        description: cleanDescription,
        image: image,
        url: item.link,
        publishedAt: item.pubDate || new Date().toISOString(),
        sourceName: item.sourceName || 'Educational News'
      };
    });
  };
  
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
              {item.sourceName && !item.isTamil && (
                <div className="source-badge">{item.sourceName}</div>
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
                <p>{item.description?.substring(0, 120)}...</p>
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