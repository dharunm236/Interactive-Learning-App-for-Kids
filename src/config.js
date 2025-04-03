const isDevelopment = process.env.NODE_ENV === 'development';

const config = {
  // Base API URL - will be different in development vs production
  apiBaseUrl: isDevelopment ? 'http://localhost:5000' : '',
  
  // API Keys should be stored in environment variables
  openRouterApiKey: process.env.REACT_APP_OPENROUTER_API_KEY || "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"
};

export default config;