import { TILE_SIZE } from "./Maze";

export const PACMAN_SPEED = 2;

const DIRS = {
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
};

export default class Pacman {
  constructor(startRow, startCol) {
    this.row = startRow;
    this.col = startCol;
    this.startRow = startRow;
    this.startCol = startCol;
    this.x = startCol * TILE_SIZE + TILE_SIZE / 2;
    this.y = startRow * TILE_SIZE + TILE_SIZE / 2;
    this.dir = "ArrowLeft";
    this.nextDir = null;
  }

  setDirection(dir) {
    if (DIRS[dir]) this.nextDir = dir;
  }

  update(maze) {
    const cols = maze[0].length;
    
    // Try to turn if possible
    if (this.nextDir && this.canMove(maze, this.nextDir)) {
      this.dir = this.nextDir;
      this.nextDir = null;
    }

    // Move in current direction if possible
    if (this.canMove(maze, this.dir)) {
      this.x += DIRS[this.dir].x * PACMAN_SPEED;
      this.y += DIRS[this.dir].y * PACMAN_SPEED;

      // Portal wraparound
      if (this.x < 0) this.x = cols * TILE_SIZE + this.x;
      if (this.x >= cols * TILE_SIZE) this.x = this.x - cols * TILE_SIZE;

      this.col = Math.floor(this.x / TILE_SIZE);
      this.row = Math.floor(this.y / TILE_SIZE);
    }
  }

  canMove(maze, dir) {
    const { x, y } = DIRS[dir];
    const nextCol = Math.floor((this.x + x * PACMAN_SPEED) / TILE_SIZE);
    const nextRow = Math.floor((this.y + y * PACMAN_SPEED) / TILE_SIZE);
    const cols = maze[0].length;
    
    // Portal wraparound check
    const col = (nextCol + cols) % cols;
    if (nextRow < 0 || nextRow >= maze.length) return false;
    return maze[nextRow][col] !== 0;
  }

  draw(ctx, tick = 0) {
    const mouthAngle = 0.25 + 0.15 * Math.sin(tick / 8);
    let start, end;
    
    switch (this.dir) {
      case "ArrowRight":
        start = mouthAngle;
        end = 2 * Math.PI - mouthAngle;
        break;
      case "ArrowLeft":
        start = Math.PI + mouthAngle;
        end = Math.PI - mouthAngle;
        break;
      case "ArrowUp":
        start = 1.5 * Math.PI + mouthAngle;
        end = 1.5 * Math.PI - mouthAngle;
        break;
      case "ArrowDown":
        start = 0.5 * Math.PI + mouthAngle;
        end = 0.5 * Math.PI - mouthAngle;
        break;
      default:
        start = mouthAngle;
        end = 2 * Math.PI - mouthAngle;
    }
    
    ctx.save();
    ctx.beginPath();
    ctx.arc(this.x, this.y, TILE_SIZE / 2 - 2, start, end, false);
    ctx.lineTo(this.x, this.y);
    ctx.closePath();
    ctx.fillStyle = "#ffe600";
    ctx.fill();
    ctx.restore();
  }
}