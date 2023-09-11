import React, { useState, useEffect } from 'react';
import './GameBoard.css';

function GameBoard() {
  const [snake, setSnake] = useState([{ x: 15, y: 15 }]);
  const [direction, setDirection] = useState({ x: 0, y: -1 });
  const [apple, setApple] = useState(null);
  const [score, setScore] = useState(0);
  const [gamePaused, setGamePaused] = useState(false);
  const [speed, setSpeed] = useState('200');
  const [isGameOver, setIsGameOver] = useState(false);
  const [snakeColor, setSnakeColor] = useState("#fff");
  const [appleColor, setAppleColor] = useState("red");

  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowUp':
          if (direction.y !== 1) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          if (direction.y !== -1) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          if (direction.x !== 1) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          if (direction.x !== -1) setDirection({ x: 1, y: 0 });
          break;
        case 'Enter':
          if (isGameOver){
            restart();
          } 
          break;
        case ' ':
          //togglePause();
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [direction, isGameOver]);

  const togglePause = () => {
    setGamePaused(prevGamePaused => !prevGamePaused);
  };

  const gameLoop = () => {
    if (gamePaused) return;
    
    
    let head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

    if (head.x < 0 || head.y < 0 || head.x >= 30 || head.y >= 30 || snake.some(dot => dot.x === head.x && dot.y === head.y)) {
      setIsGameOver(true);

      return;
    }

    let newSnake = [head, ...snake];
    
    if (apple && apple.x === head.x && apple.y === head.y) {
      const newScore = score + parseInt(speed);
      setScore(newScore);
      setApple(null);
      setSnakeColor(appleColor);
      setAppleColor(getRandomColor());
    } 
    else {
      newSnake.pop();
    }

    if (!apple) {
      setApple({ x: Math.floor(Math.random() * 30), y: Math.floor(Math.random() * 30) });
    }

    setSnake(newSnake);
  };

  useEffect(() => {
    const interval = setInterval(gameLoop, parseInt(speed));
    return () => clearInterval(interval);
  }, []);
  

  

  const restart = () => {
    setSnake([{ x: 15, y: 15 }]);
    setDirection({ x: 0, y: -1 });
    setApple(null);
    setScore(0);
    setSnakeColor("#fff");
    setAppleColor("red");
    setIsGameOver(false);
  };

  const getRandomColor = () => {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgb(${r},${g},${b})`;
  };

  return (
    <div>
      <div id="game-board">
        {snake.map((segment, index) => (
        <div key={index} className="dot" style={{ left: `${segment.x * 20}px`, top: `${segment.y * 20}px`, backgroundColor: snakeColor }}></div>
        ))}
        {apple && <div className="dot" style={{ left: `${apple.x * 20}px`, top: `${apple.y * 20}px`, backgroundColor: appleColor }}></div>}
      </div>

      <div id="game-over-popup" style={{ display: isGameOver ? 'block' : 'none' }}>
        <h2>Game Over</h2>
        <p>Your score: <span>{score}</span></p>
        <button onClick={restart}>Try Again</button>
      </div>

      <div id="difficulty-level">
        <select value={speed} onChange={e => setSpeed(e.target.value)}>
          <option value="200">Easy</option>
          <option value="150">Medium</option>
          <option value="100">Hard</option>
        </select>
      </div>

      <div id="score">Score: {score}</div>
    </div>
  );
}

export default GameBoard;