import React, { useState, useEffect, useRef } from 'react';
import { drawMaze, TILE_SIZE } from './Maze';
import Pacman from './Pacman';
import Ghost from './Ghost';
import LevelManager from './LevelManager';
import MobileControls from './MobileControls';

function Game({ level, score: initialScore, onGameOver, onWin, onNextLevel, onPause, settings }) {
  const canvasRef = useRef(null);
  const [maze, setMaze] = useState(settings?.customMaze || LevelManager.getMaze(level));
  const [score, setScore] = useState(initialScore);
  const [lives, setLives] = useState(3);
  const [paused, setPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [scoreAnimations, setScoreAnimations] = useState([]);
  const [transitionEffect, setTransitionEffect] = useState(null);
  const [bonusFruit, setBonusFruit] = useState(null);
  const [fruitSpawned, setFruitSpawned] = useState(false);
  
  const pacmanRef = useRef(null);
  const ghostsRef = useRef([]);
  const animationRef = useRef(null);
  const tickRef = useRef(0);
  const pelletsEatenRef = useRef(0);

  // Initialize game
  useEffect(() => {
    const newMaze = settings?.customMaze || LevelManager.getMaze(level);
    setMaze(newMaze);
    setScore(initialScore);
    setLives(3);
    setPaused(false);
    setGameOver(false);
    setWon(false);
    setScoreAnimations([]);
    setBonusFruit(null);
    setFruitSpawned(false);
    pelletsEatenRef.current = 0;

    const pacmanStart = findPacmanStart(newMaze);
    pacmanRef.current = new Pacman(pacmanStart.row, pacmanStart.col);

    const ghostStarts = findGhostStarts(newMaze);
    ghostsRef.current = ghostStarts.map((pos, i) => {
      const personalities = ['blinky', 'pinky', 'inky', 'clyde'];
      const ghost = new Ghost(pos.row, pos.col, i, personalities[i]);
      ghost.speed = Number(settings?.ghostSpeed) || 2;
      return ghost;
    });

    startGameLoop();

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [level, initialScore, settings]);

  const startGameLoop = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const gameLoop = () => {
      if (!paused && !gameOver && !won && !transitionEffect) {
        updateGame();
      }
      renderGame(ctx);
      animationRef.current = requestAnimationFrame(gameLoop);
      tickRef.current++;
    };
    
    gameLoop();
  };

  const updateGame = () => {
    const pacman = pacmanRef.current;
    const ghosts = ghostsRef.current;
    
    pacman.update(maze);
    ghosts.forEach(ghost => ghost.update(maze, pacman, ghosts[0]));
    
    checkPelletCollision();
    checkGhostCollisions();
    
    if (!fruitSpawned && pelletsEatenRef.current > LevelManager.getInitialPelletCount(maze) * 0.7) {
      spawnBonusFruit();
    }
  };

  const renderGame = (ctx) => {
    const canvas = canvasRef.current;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawMaze(ctx, maze);
    
    if (bonusFruit) {
      const fruits = ['🍒', '🍓', '🍊', '🍋', '🍏', '🍎', '🍍', '🍑'];
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(fruits[bonusFruit.type], bonusFruit.x, bonusFruit.y);
    }
    
    ghostsRef.current.forEach(ghost => ghost.draw(ctx, ghost.frightened ? tickRef.current : 0));
    pacmanRef.current.draw(ctx, tickRef.current);
    
    scoreAnimations.forEach(anim => {
      ctx.save();
      ctx.font = 'bold 16px "Press Start 2P"';
      ctx.fillStyle = `rgba(255, 255, 255, ${anim.opacity})`;
      ctx.textAlign = 'center';
      ctx.fillText(`+${anim.points}`, anim.x, anim.y - anim.progress * 2);
      ctx.restore();
    });
    
    if (transitionEffect) {
      ctx.save();
      ctx.fillStyle = `rgba(0, 0, 0, ${transitionEffect.progress / 100})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      if (transitionEffect.type === 'levelUp') {
        ctx.fillStyle = '#ffe600';
        ctx.font = '24px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText(`LEVEL ${level}`, canvas.width/2, canvas.height/2);
      }
      ctx.restore();
    }
  };

  const findPacmanStart = (maze) => {
    for (let row = 0; row < maze.length; row++) {
      for (let col = 0; col < maze[row].length; col++) {
        if (maze[row][col] === 3) {
          return { row, col };
        }
      }
    }
    return { row: 1, col: 1 }; // Default start if no empty tile found
  };

  const findGhostStarts = (maze) => {
    const starts = [];
    for (let row = 0; row < maze.length; row++) {
      for (let col = 0; col < maze[row].length; col++) {
        if (maze[row][col] === 4) { // Ghost start positions marked with 4
          starts.push({ row, col });
        }
      }
    }
    return starts.length > 0 ? starts : [
      { row: 9, col: 9 },
      { row: 9, col: 10 },
      { row: 10, col: 9 },
      { row: 10, col: 10 }
    ];
  };

  const countPellets = () => {
    return maze.flat().filter(tile => tile === 1 || tile === 2).length;
  };

  const checkPelletCollision = () => {
    const pacman = pacmanRef.current;
    const row = Math.floor(pacman.y / TILE_SIZE);
    const col = Math.floor(pacman.x / TILE_SIZE);
    
    if (row >= 0 && row < maze.length && col >= 0 && col < maze[row].length) {
      const tile = maze[row][col];
      
      if (tile === 1) { // Regular pellet
        const newMaze = [...maze];
        newMaze[row][col] = 0;
        setMaze(newMaze);
        setScore(prev => prev + 10);
        pelletsEatenRef.current++;
        addScoreAnimation(10, pacman.x, pacman.y);
      } else if (tile === 2) { // Power pellet
        const newMaze = [...maze];
        newMaze[row][col] = 0;
        setMaze(newMaze);
        setScore(prev => prev + 50);
        pelletsEatenRef.current++;
        addScoreAnimation(50, pacman.x, pacman.y);
        
        // Make ghosts frightened
        ghostsRef.current.forEach(ghost => {
          ghost.frightened = true;
          ghost.frightenedTimer = 500; // About 10 seconds at 60fps
        });
      }
      
      // Check win condition
      if (countPellets() === 0) {
        if (level < LevelManager.getTotalLevels()) {
          startLevelTransition();
          setTimeout(() => onNextLevel(score), 1500);
        } else {
          onWin(score);
        }
      }
    }
  };

  const checkGhostCollisions = () => {
    const pacman = pacmanRef.current;
    const ghosts = ghostsRef.current;
    
    ghosts.forEach(ghost => {
      const distance = Math.sqrt(
        Math.pow(pacman.x - ghost.x, 2) + 
        Math.pow(pacman.y - ghost.y, 2)
      );
      
      if (distance < TILE_SIZE * 0.8) {
        if (ghost.frightened) {
          // Eat ghost
          ghost.frightened = false;
          ghost.x = ghost.startCol * TILE_SIZE + TILE_SIZE / 2;
          ghost.y = ghost.startRow * TILE_SIZE + TILE_SIZE / 2;
          ghost.row = ghost.startRow;
          ghost.col = ghost.startCol;
          setScore(prev => prev + 200);
          addScoreAnimation(200, pacman.x, pacman.y);
        } else {
          // Lose life
          setLives(prev => {
            const newLives = prev - 1;
            if (newLives <= 0) {
              onGameOver(score);
            } else {
              // Reset positions
              pacman.x = pacman.startCol * TILE_SIZE + TILE_SIZE / 2;
              pacman.y = pacman.startRow * TILE_SIZE + TILE_SIZE / 2;
              pacman.row = pacman.startRow;
              pacman.col = pacman.startCol;
              pacman.dir = 'ArrowLeft';
              
              ghosts.forEach(g => {
                g.x = g.startCol * TILE_SIZE + TILE_SIZE / 2;
                g.y = g.startRow * TILE_SIZE + TILE_SIZE / 2;
                g.row = g.startRow;
                g.col = g.startCol;
              });
            }
            return newLives;
          });
        }
      }
    });
  };

  const spawnBonusFruit = () => {
    const availableSpots = [];
    maze.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell === 3) availableSpots.push({ row: r, col: c });
      });
    });
    
    if (availableSpots.length > 0) {
      const spot = availableSpots[Math.floor(Math.random() * availableSpots.length)];
      setBonusFruit({
        type: Math.min(Math.floor(level / 2), 7), // Different fruits per level
        row: spot.row,
        col: spot.col,
        x: spot.col * TILE_SIZE + TILE_SIZE / 2,
        y: spot.row * TILE_SIZE + TILE_SIZE / 2
      });
      setFruitSpawned(true);
      
      // Remove fruit after some time
      setTimeout(() => {
        setBonusFruit(null);
      }, 10000);
    }
  };

  const addScoreAnimation = (points, x, y) => {
    const id = Date.now();
    setScoreAnimations(prev => [...prev, { points, x, y, id, opacity: 1, progress: 0 }]);
    
    const interval = setInterval(() => {
      setScoreAnimations(prev => {
        return prev.map(anim => {
          if (anim.id === id) {
            const newProgress = anim.progress + 1;
            if (newProgress >= 30) {
              clearInterval(interval);
              return null;
            }
            return { ...anim, progress: newProgress, opacity: 1 - newProgress / 30 };
          }
          return anim;
        }).filter(Boolean);
      });
    }, 16);
  };

  const startLevelTransition = () => {
    setTransitionEffect({ type: 'levelUp', progress: 0 });
    
    const interval = setInterval(() => {
      setTransitionEffect(prev => {
        if (prev.progress >= 100) {
          clearInterval(interval);
          return null;
        }
        return { ...prev, progress: prev.progress + 5 };
      });
    }, 50);
  };

  return (
    <div className="canvas-container">
      <canvas 
        ref={canvasRef} 
        width={maze[0].length * TILE_SIZE} 
        height={maze.length * TILE_SIZE}
        tabIndex="0"
        onKeyDown={(e) => {
          if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            pacmanRef.current.setDirection(e.key);
          } else if (e.key === 'p') {
            onPause();
          }
        }}
      />
      <MobileControls onDirection={(dir) => pacmanRef.current.setDirection(dir)} />
      <div className="lives-display">Lives: {'❤️'.repeat(lives)}</div>
    </div>
  );
}

export default Game;