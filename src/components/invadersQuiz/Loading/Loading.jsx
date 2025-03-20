import './Loading.css';

function Loading() {
  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <div className="loading-text">LOADING QUIZ DATA...</div>
    </div>
  );
}

export default Loading;