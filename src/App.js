import React, { useState, useRef } from 'react';
import Game from './Game';
import SettingsMenu from './SettingsMenu';
import './styles.css';
import './settings-menu.css';
import './mobile-controls.css';
import './maze-editor.css';

export default function App() {
  const [gameState, setGameState] = useState('start');
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [highScores, setHighScores] = useState(
    JSON.parse(localStorage.getItem('pacmanHighScores')) || 
    Array(10).fill({ name: 'AAA', score: 0 })
  );
  const [settings, setSettings] = useState({
    soundOn: true,
    ghostSpeed: 2,
    customMaze: null,
  });
  const [showSettings, setShowSettings] = useState(false);
  const inputRef = useRef(null);

  const handleGameOver = (finalScore) => {
    setScore(finalScore);
    const minHighScore = Math.min(...highScores.map(h => h.score));
    if (finalScore > minHighScore) {
      setGameState('newHighScore');
    } else {
      setGameState('gameOver');
    }
  };

  const handleWin = (finalScore) => {
    setScore(finalScore);
    setGameState('won');
  };

  const handleNextLevel = (newScore) => {
    setScore(newScore);
    setLevel(prev => prev + 1);
    setGameState('playing');
  };

  const handlePause = () => {
    setGameState(prev => prev === 'paused' ? 'playing' : 'paused');
  };

  const saveHighScore = (name) => {
    const newScores = [...highScores, { name: name.toUpperCase(), score }]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    
    setHighScores(newScores);
    localStorage.setItem('pacmanHighScores', JSON.stringify(newScores));
    setGameState('start');
  };

  const handleUpdateSettings = (newSettings) => {
    setSettings(newSettings);
  };

  const handleCustomMaze = (maze) => {
    setSettings(s => ({ ...s, customMaze: maze }));
    setShowSettings(false);
    setGameState('playing');
    setLevel(1);
    setScore(0);
  };

  return (
    <div className="app-container">
      <h1>Brave PacMan</h1>
      <div className="score-bar">
        <span>Score: {score}</span>
        <span>High Score: {Math.max(...highScores.map(h => h.score), score)}</span>
        <button
          className="settings-btn"
          onClick={() => setShowSettings(true)}
          aria-label="Settings"
        >
          ⚙️
        </button>
      </div>

      {showSettings && (
        <SettingsMenu
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          settings={settings}
          onUpdate={handleUpdateSettings}
          onCustomMaze={handleCustomMaze}
        />
      )}

      {gameState === 'start' && (
        <div className="overlay">
          <h2>High Scores</h2>
          <table className="high-score-table">
            <tbody>
              {highScores.map((entry, i) => (
                <tr key={i}>
                  <td>{i+1}. {entry.name}</td>
                  <td className="score-value">{entry.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={() => setGameState('playing')}>Start Game</button>
        </div>
      )}

      {gameState === 'playing' && (
        <Game
          level={level}
          score={score}
          onGameOver={handleGameOver}
          onWin={handleWin}
          onNextLevel={handleNextLevel}
          onPause={handlePause}
          settings={settings}
        />
      )}

      {gameState === 'newHighScore' && (
        <div className="overlay">
          <h2>New High Score!</h2>
          <p>Your Score: {score}</p>
          <input
            ref={inputRef}
            type="text"
            maxLength="3"
            placeholder="AAA"
            className="high-score-input"
          />
          <button onClick={() => saveHighScore(inputRef.current.value)}>
            Save Score
          </button>
        </div>
      )}

      {gameState === 'gameOver' && (
        <div className="overlay">
          <h2>Game Over</h2>
          <p>Final Score: {score}</p>
          <button onClick={() => setGameState('start')}>Main Menu</button>
        </div>
      )}

      {gameState === 'won' && (
        <div className="overlay">
          <h2>You Won!</h2>
          <p>Final Score: {score}</p>
          <button onClick={() => setGameState('start')}>Main Menu</button>
        </div>
      )}

      {gameState === 'paused' && (
        <div className="overlay">
          <h2>Paused</h2>
          <button onClick={() => setGameState('playing')}>Resume</button>
          <button onClick={() => setGameState('start')}>Main Menu</button>
        </div>
      )}
    </div>
  );
}