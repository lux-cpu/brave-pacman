import React, { useState } from 'react';
import './maze-editor.css';

export default function MazeEditor({ maze, onSave, onCancel }) {
  const [editMaze, setEditMaze] = useState(maze);

  const toggleCell = (row, col) => {
    setEditMaze(m =>
      m.map((r, rIdx) =>
        rIdx !== row
          ? r
          : r.map((cell, cIdx) =>
              cIdx === col ? (cell + 1) % 5 : cell // cycle between 0-4
            )
      )
    );
  };

  return (
    <div className="editor-overlay">
      <div className="editor-modal">
        <h2>Edit Maze</h2>
        <p>Click cells to cycle: Wall (0) | Pellet (1) | Power (2) | Empty (3) | Ghost Start (4)</p>
        
        <div className="maze-grid">
          {editMaze.map((row, rIdx) =>
            <div key={rIdx} className="maze-row">
              {row.map((cell, cIdx) =>
                <div
                  key={cIdx}
                  className={`maze-cell cell-${cell}`}
                  onClick={() => toggleCell(rIdx, cIdx)}
                  title={`Current: ${cell} (Click to cycle)`}
                >
                  {cell === 0 ? '🟦' : 
                   cell === 1 ? '•' : 
                   cell === 2 ? '◉' : 
                   cell === 4 ? '👻' : ''}
                </div>
              )}
            </div>
          )}
        </div>
        
        <button onClick={() => onSave(editMaze)}>Save Maze</button>
        <button onClick={onCancel} style={{ marginLeft: "1rem" }}>Cancel</button>
      </div>
    </div>
  );
}