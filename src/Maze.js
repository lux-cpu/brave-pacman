export const TILE_SIZE = 24; // pixels

// Colors
const COLORS = {
  wall: "#0011a8",
  pellet: "#fff",
  powerPellet: "#ff0",
  empty: "#000",
};

export function drawMaze(ctx, maze) {
  for (let row = 0; row < maze.length; row++) {
    for (let col = 0; col < maze[row].length; col++) {
      const tile = maze[row][col];
      const x = col * TILE_SIZE;
      const y = row * TILE_SIZE;

      if (tile === 0) {
        // Wall
        ctx.fillStyle = COLORS.wall;
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        
        // Add wall decorations
        ctx.fillStyle = "#1a1aff";
        if (row > 0 && maze[row-1][col] !== 0) {
          ctx.fillRect(x + 2, y, TILE_SIZE - 4, 2);
        }
        if (row < maze.length - 1 && maze[row+1][col] !== 0) {
          ctx.fillRect(x + 2, y + TILE_SIZE - 2, TILE_SIZE - 4, 2);
        }
        if (col > 0 && maze[row][col-1] !== 0) {
          ctx.fillRect(x, y + 2, 2, TILE_SIZE - 4);
        }
        if (col < maze[row].length - 1 && maze[row][col+1] !== 0) {
          ctx.fillRect(x + TILE_SIZE - 2, y + 2, 2, TILE_SIZE - 4);
        }
      } else {
        // Floor
        ctx.fillStyle = COLORS.empty;
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

        if (tile === 1) {
          // Pellet
          ctx.beginPath();
          ctx.arc(
            x + TILE_SIZE / 2,
            y + TILE_SIZE / 2,
            TILE_SIZE / 8,
            0,
            2 * Math.PI
          );
          ctx.fillStyle = COLORS.pellet;
          ctx.fill();
        } else if (tile === 2) {
          // Power Pellet
          ctx.beginPath();
          ctx.arc(
            x + TILE_SIZE / 2,
            y + TILE_SIZE / 2,
            TILE_SIZE / 4,
            0,
            2 * Math.PI
          );
          ctx.fillStyle = COLORS.powerPellet;
          ctx.fill();
        }
      }
    }
  }
}