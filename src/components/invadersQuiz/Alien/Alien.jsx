import './Alien.css';

function Alien({ x, y }) {
  return (
    <div 
      className="alien-container"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <img 
        src="https://images.genially.com/59e059d30b9c21060cb4c2ec/5bab942f0c96e06f5f345a9c/bf25f7db-c6ad-4e5a-953b-09c958bf11ac.gif"
        alt="Alien" 
        className="alien-image"
      />
    </div>
  );
}

export default Alien;