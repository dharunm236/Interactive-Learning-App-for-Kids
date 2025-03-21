import Button from "../Button/Button";
import "./CoverScreen.css";

const CoverScreen = ({ score, onStartGame, duration }) => (
  <div className="intro">
    <h1 className="baltitle">{score > -1 ? "Game over!" : "Balloon Burst 🎈"}</h1>
    {score > -1 ? (
      <p className="description">
        {`You scored ${
          score === 0 ? "nothing" : `${score} ${score > 1 ? "hits" : "hit"}`
        }`}
      </p>
    ) : (
      <p className="description">
        A Fun &amp; interactive {duration}-second balloon game to learn Words.
      </p>
    )}
    <div className="action">
      <Button onClick={onStartGame} width={"wide"}>
        {score > -1 ? "Play again" : "Start Game"}
      </Button>
      <Button onClick={() => window.history.back()} width={"wide"}>
        {"<- BACK"}
      </Button>
    </div>
  </div>
);

export default CoverScreen;
