import './Ship.css';

function Ship({ position }) {
  return (
    <div className="ship-container" style={{ left: `${position}%` }}>
      <img 
        src="https://images.genially.com/59e059d30b9c21060cb4c2ec/5bab942f0c96e06f5f345a9c/b994c9b9-3a02-4c03-8aec-13cf1d743014.gif" 
        alt="Spaceship" 
        className="ship-image"
      />
    </div>
  );
}

export default Ship;