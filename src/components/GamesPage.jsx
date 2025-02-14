import { Link } from 'react-router-dom';

const GamesPage = () => {
  return (
    <div>
      <h1>Games</h1>
      <ul>
        <li>
          <Link to="/Ballongame">🎈 Balloon Game</Link>
        </li>
        {/* You can add more games here in the future */}
      </ul>
    </div>
  );
};

export default GamesPage;
