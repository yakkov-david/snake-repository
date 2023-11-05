import React, { useState, useEffect, useRef } from 'react';
import './GameBoard.css';

function GameBoard() {
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [speed, setSpeed] = useState(200);
  const [renderTrigger, setRenderTrigger] = useState(0); // Added state to trigger re-renders

  const snakeRef = useRef([{ x: 15, y: 15 }]);
  const directionRef = useRef({ x: 0, y: -1 });
  const appleRef = useRef(null);
  const gamePausedRef = useRef(false);
  const snakeColorRef = useRef("#fff");
  const appleColorRef = useRef("red");
  const gameLoopRef = useRef(null); // To hold the game loop timeout/interval

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isGameOver]); // Dependency ensures event listener is managed correctly

  /*useEffect(() => {

    return () => {
      // Clears the game loop interval when the component unmounts
      if (gameLoopRef.current) {
        clearTimeout(gameLoopRef.current);
      }
    };
  }, []); // Empty array ensures this effect runs once on mount and on unmount
  */

  useEffect(() => {
    const handleKeyUp = (e) => {
      if (e.key === 'Enter' && isGameOver) {
        restart(); // Restart the game if Enter is pressed and the game is over
      }
    };

    window.addEventListener('keyup', handleKeyUp); // Add keyup event listener

    // Return a cleanup function to remove the event listener
    return () => {
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isGameOver]); // Only re-run if isGameOver changes

  const generateApplePosition = () => {
    let newApple;
    do {
      newApple = {
        x: Math.floor(Math.random() * 30),
        y: Math.floor(Math.random() * 30),
      };
    } while (snakeRef.current.some(segment => segment.x === newApple.x && segment.y === newApple.y));
    return newApple;
  };

  const handleKeyDown = (e) => {
    if (!isGameOver) {
      switch (e.key) {
        case 'ArrowUp':
          if (directionRef.current.y !== 1) directionRef.current = { x: 0, y: -1 };
          break;
        case 'ArrowDown':
          if (directionRef.current.y !== -1) directionRef.current = { x: 0, y: 1 };
          break;
        case 'ArrowLeft':
          if (directionRef.current.x !== 1) directionRef.current = { x: -1, y: 0 };
          break;
        case 'ArrowRight':
          if (directionRef.current.x !== -1) directionRef.current = { x: 1, y: 0 };
          break;
        case 'Enter':
          if (isGameOver) {
            restart();
          }
          break;
        case ' ':
          if (!isGameOver) {
            gamePausedRef.current = !gamePausedRef.current;
            if (!gamePausedRef.current) {
              gameLoop(); // Resume the game if it's not paused anymore
            }
          }
          break;
        default:
          break;
      }
    }
  };

  // Create a function to handle scoring based on difficulty level
  const handleScoring = () => {
    let points;
    switch (speed) {
      case 200: // Easy
        points = 2;
        break;
      case 150: // Medium
        points = 4;
        break;
      case 100: // Hard
        points = 6;
        break;
      default:
        points = 2; // Default to Easy if for some reason none of the above matches
    }
    setScore(prev => prev + points);
  };

  const gameLoop = () => {
    if (gamePausedRef.current || isGameOver) return;

    let snake = snakeRef.current;
    let newDirection = directionRef.current;
    let head = { x: snake[0].x + newDirection.x, y: snake[0].y + newDirection.y };

    // Check for game over conditions
    if (head.x < 0 || head.y < 0 || head.x >= 30 || head.y >= 30 || snake.some(segment => segment.x === head.x && segment.y === head.y)) {
      setIsGameOver(true);
      return;
    }

    let newSnake = [head, ...snake];

    // Check if apple is eaten
    if (appleRef.current && appleRef.current.x === head.x && appleRef.current.y === head.y) {
      handleScoring(); // Adjusted to use the new handleScoring function
      appleRef.current = null;
      snakeColorRef.current = appleColorRef.current;
      appleColorRef.current = getRandomColor();
    } else {
      newSnake.pop(); // Remove the tail segment
    }

    // Create new apple if it doesn't exist
    if (!appleRef.current) {
      appleRef.current = generateApplePosition(); // Use the new function to get a valid apple position
    }

    snakeRef.current = newSnake;
    setRenderTrigger(rt => rt + 1); // Trigger a re-render


    // Continue the game loop
    gameLoopRef.current = setTimeout(gameLoop, speed);
  };

  const startGame = () => {
    gameLoop();
  };

  const startGameAndRemoveFocus = () => {
    startGame();
    document.activeElement.blur(); // Blur the active element to remove focus
  };

  const restart = () => {
    snakeRef.current = [{ x: 15, y: 15 }];
    directionRef.current = { x: 0, y: -1 };
    appleRef.current = null;
    setScore(0);
    snakeColorRef.current = "#fff";
    appleColorRef.current = "red";
    setIsGameOver(false);
    gamePausedRef.current = false;
    if (gameLoopRef.current) {
      clearTimeout(gameLoopRef.current);
    }
    setRenderTrigger(0); // Reset render trigger for a new game
    startGame(); // Restart the game loop
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
        {snakeRef.current.map((segment, index) => (
          <div key={index} className="dot" style={{ left: `${segment.x * 20}px`, top: `${segment.y * 20}px`, backgroundColor: snakeColorRef.current }}></div>
        ))}
        {appleRef.current && <div className="dot" style={{ left: `${appleRef.current.x * 20}px`, top: `${appleRef.current.y * 20}px`, backgroundColor: appleColorRef.current }}></div>}
      </div>

      <div id="game-over-popup" style={{ display: isGameOver ? 'block' : 'none' }}>
        <h2>Game Over</h2>
        <p>Your score: <span>{score}</span></p>
        <button onClick={restart}>Try Again</button>
      </div>

      <div id="difficulty-level">
        <select value={speed} onChange={e => setSpeed(parseInt(e.target.value))}>
          <option value="200">Easy</option>
          <option value="150">Medium</option>
          <option value="100">Hard</option>
        </select>
      </div>

      <div id="difficulty-level">
        <button onClick={startGameAndRemoveFocus}>Start Game</button>
      </div>

      <div id="score">Score: {score}</div>
    </div>
  );
}

export default GameBoard;
