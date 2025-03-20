import './Laser.css';

function Laser({ x, y }) {
  return (
    <div 
      className="laser"
      style={{ left: `${x}%`, bottom: `${100-y}%` }}
    ></div>
  );
}

export default Laser;