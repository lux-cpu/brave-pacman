import { TILE_SIZE } from "./Maze";

const DIRS = [
  { name: 'ArrowUp', x: 0, y: -1 },
  { name: 'ArrowDown', x: 0, y: 1 },
  { name: 'ArrowLeft', x: -1, y: 0 },
  { name: 'ArrowRight', x: 1, y: 0 }
];

export default class Ghost {
  constructor(startRow, startCol, id, personality) {
    this.row = startRow;
    this.col = startCol;
    this.startRow = startRow;
    this.startCol = startCol;
    this.x = startCol * TILE_SIZE + TILE_SIZE / 2;
    this.y = startRow * TILE_SIZE + TILE_SIZE / 2;
    this.dir = 'ArrowLeft';
    this.id = id;
    this.personality = personality;
    this.mode = 'scatter';
    this.frightened = false;
    this.frightenedTimer = 0;
    this.speed = 2;
    this.colors = {
      blinky: '#ff0000',
      pinky: '#ffb8ff',
      inky: '#00ffff',
      clyde: '#ffb852'
    };
  }

  update(maze, pacman, blinky) {
    // Mode switching logic (simplified)
    if (Math.floor(Date.now() / 1000) % 20 < 7) {
      this.mode = 'scatter';
    } else {
      this.mode = 'chase';
    }

    let target;
    if (this.frightened) {
      // Random movement when frightened
      target = {
        row: Math.floor(Math.random() * maze.length),
        col: Math.floor(Math.random() * maze[0].length)
      };
    } else if (this.mode === 'scatter') {
      // Go to corners based on personality
      switch (this.personality) {
        case 'blinky': target = { row: 0, col: maze[0].length - 1 }; break;
        case 'pinky': target = { row: 0, col: 0 }; break;
        case 'inky': target = { row: maze.length - 1, col: maze[0].length - 1 }; break;
        case 'clyde': target = { row: maze.length - 1, col: 0 }; break;
      }
    } else {
      target = this.calculateTarget(pacman, blinky);
    }

    // Get possible directions (not reversing)
    const possibleDirs = DIRS.filter(dir => 
      dir.name !== this.getOppositeDir(this.dir) && 
      this.canMove(maze, dir.name, this.speed)
    );

    if (possibleDirs.length > 0) {
      // Choose direction that gets closest to target
      const bestDir = possibleDirs.reduce((best, dir) => {
        const newCol = Math.floor((this.x + dir.x * this.speed) / TILE_SIZE);
        const newRow = Math.floor((this.y + dir.y * this.speed) / TILE_SIZE);
        const dist = Math.pow(newRow - target.row, 2) + Math.pow(newCol - target.col, 2);
        
        if (!best || dist < best.dist) {
          return { dir: dir.name, dist };
        }
        return best;
      }, null)?.dir || this.dir;

      this.dir = bestDir;
    }

    // Move ghost
    if (this.canMove(maze, this.dir, this.speed)) {
      const vec = DIRS.find(d => d.name === this.dir);
      this.x += vec.x * this.speed;
      this.y += vec.y * this.speed;

      // Portal wraparound
      const cols = maze[0].length;
      if (this.x < 0) this.x = cols * TILE_SIZE + this.x;
      if (this.x >= cols * TILE_SIZE) this.x = this.x - cols * TILE_SIZE;

      this.col = Math.floor(this.x / TILE_SIZE);
      this.row = Math.floor(this.y / TILE_SIZE);
    }

    // Update frightened timer
    if (this.frightened) {
      this.frightenedTimer--;
      if (this.frightenedTimer <= 0) {
        this.frightened = false;
      }
    }
  }

  calculateTarget(pacman, blinky) {
    switch (this.personality) {
      case 'blinky': // Red - chases directly
        return { row: pacman.row, col: pacman.col };
      case 'pinky': // Pink - targets 4 tiles ahead
        const vec = DIRS.find(d => d.name === pacman.dir);
        return {
          row: pacman.row + (vec?.y || 0) * 4,
          col: pacman.col + (vec?.x || 0) * 4
        };
      case 'inky': // Blue - uses blinky's position
        const pacVec = DIRS.find(d => d.name === pacman.dir);
        const pacmanLead = {
          row: pacman.row + (pacVec?.y || 0) * 2,
          col: pacman.col + (pacVec?.x || 0) * 2
        };
        return {
          row: pacmanLead.row * 2 - blinky.row,
          col: pacmanLead.col * 2 - blinky.col
        };
      case 'clyde': // Orange - chases unless close
        const distance = Math.sqrt(
          Math.pow(this.row - pacman.row, 2) + 
          Math.pow(this.col - pacman.col, 2)
        );
        return distance > 8 
          ? { row: pacman.row, col: pacman.col }
          : { row: 0, col: 0 }; // Scatter target
      default:
        return { row: pacman.row, col: pacman.col };
    }
  }

  getOppositeDir(dir) {
    switch (dir) {
      case 'ArrowUp': return 'ArrowDown';
      case 'ArrowDown': return 'ArrowUp';
      case 'ArrowLeft': return 'ArrowRight';
      case 'ArrowRight': return 'ArrowLeft';
      default: return dir;
    }
  }

  canMove(maze, dir, speed) {
    const vec = DIRS.find(d => d.name === dir);
    const nextCol = Math.floor((this.x + vec.x * speed) / TILE_SIZE);
    const nextRow = Math.floor((this.y + vec.y * speed) / TILE_SIZE);
    const cols = maze[0].length;
    
    // Portal wraparound check
    const col = (nextCol + cols) % cols;
    if (nextRow < 0 || nextRow >= maze.length) return false;
    return maze[nextRow][col] !== 0;
  }

  draw(ctx, tick = 0) {
    ctx.save();
    
    // Body
    const bodyRadius = TILE_SIZE / 2 - 2;
    const bottom = this.y + bodyRadius;
    
    if (this.frightened) {
      const flashPhase = Math.floor(tick / 10) % 2;
      ctx.fillStyle = flashPhase ? '#2121ff' : '#ffffff';
    } else {
      ctx.fillStyle = this.colors[this.personality] || '#ff0000';
    }
    
    // Draw ghost body
    ctx.beginPath();
    ctx.arc(this.x, this.y, bodyRadius, Math.PI, 0, false);
    ctx.lineTo(this.x + bodyRadius, bottom);
    
    // Draw ghost feet
    const footWidth = bodyRadius * 0.5;
    for (let i = 0; i < 3; i++) {
      ctx.lineTo(this.x + bodyRadius - i * footWidth, bottom);
      ctx.lineTo(this.x + bodyRadius - (i + 0.5) * footWidth, bottom - footWidth);
    }
    
    ctx.lineTo(this.x - bodyRadius, bottom);
    ctx.closePath();
    ctx.fill();
    
    // Eyes
    const eyeRadius = bodyRadius * 0.2;
    const leftEyeX = this.x - bodyRadius * 0.3;
    const rightEyeX = this.x + bodyRadius * 0.3;
    const eyeY = this.y - bodyRadius * 0.2;
    
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(leftEyeX, eyeY, eyeRadius, 0, Math.PI * 2);
    ctx.arc(rightEyeX, eyeY, eyeRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Pupils
    const pupilRadius = eyeRadius * 0.5;
    const pupilOffset = eyeRadius * 0.5;
    let pupilLX = leftEyeX, pupilRX = rightEyeX, pupilY = eyeY;
    
    if (!this.frightened) {
      switch (this.dir) {
        case 'ArrowUp':
          pupilY = eyeY - pupilOffset;
          break;
        case 'ArrowDown':
          pupilY = eyeY + pupilOffset;
          break;
        case 'ArrowLeft':
          pupilLX = leftEyeX - pupilOffset;
          pupilRX = rightEyeX - pupilOffset;
          break;
        case 'ArrowRight':
          pupilLX = leftEyeX + pupilOffset;
          pupilRX = rightEyeX + pupilOffset;
          break;
      }
    }
    
    ctx.fillStyle = this.frightened ? 'white' : 'black';
    ctx.beginPath();
    ctx.arc(pupilLX, pupilY, pupilRadius, 0, Math.PI * 2);
    ctx.arc(pupilRX, pupilY, pupilRadius, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }
}