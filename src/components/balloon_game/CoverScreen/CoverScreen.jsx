import Button from "../Button/Button";
import "./CoverScreen.css";

const CoverScreen = ({ score, onStartGame, duration, justCompleted }) => (
  <div className="intro">
    <h1 className="baltitle">{justCompleted ? "GAME OVER!" : "Balloon Burst 🎈"}</h1>
    {justCompleted ? (
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
        {justCompleted ? "Play again" : "Start Game"}
      </Button>
      <Button onClick={() => window.history.back()} width={"wide"}>
        {"<- BACK"}
      </Button>
    </div>
  </div>
);

export default CoverScreen;
