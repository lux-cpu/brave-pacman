import React, { useState } from 'react';
import MazeEditor from './MazeEditor';
import './settings-menu.css';

const presetMazes = [
  { name: "Classic", layout: [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,0],
    [0,2,0,0,1,0,0,0,1,0,1,0,0,0,1,0,0,2,0],
    [0,1,0,0,1,0,0,0,1,0,1,0,0,0,1,0,0,1,0],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [0,1,0,0,1,0,1,0,0,0,0,0,1,0,1,0,0,1,0],
    [0,1,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,1,0],
    [0,0,0,0,1,0,0,0,1,0,1,0,0,0,1,0,0,0,0],
    [0,0,0,0,1,0,1,1,1,1,1,1,1,0,1,0,0,0,0],
    [0,0,0,0,1,0,1,0,0,3,0,0,1,0,1,0,0,0,0],
    [1,1,1,1,1,1,1,0,3,4,3,0,1,1,1,1,1,1,1],
    [0,0,0,0,1,0,1,0,0,0,0,0,1,0,1,0,0,0,0],
    [0,0,0,0,1,0,1,1,1,1,1,1,1,0,1,0,0,0,0],
    [0,0,0,0,1,0,1,0,0,0,0,0,1,0,1,0,0,0,0],
    [0,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,0],
    [0,1,0,0,1,0,0,0,1,0,1,0,0,0,1,0,0,1,0],
    [0,2,1,0,1,1,1,1,1,1,1,1,1,1,1,0,1,2,0],
    [0,0,1,0,1,0,1,0,0,0,0,0,1,0,1,0,1,0,0],
    [0,1,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,1,0],
    [0,1,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,1,0],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
  ]},
  // Add more preset mazes if needed
];

export default function SettingsMenu({ isOpen, onClose, settings, onUpdate, onCustomMaze }) {
  const [editorOpen, setEditorOpen] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="overlay">
      <div className="settings-modal">
        <h2>Game Settings</h2>
        
        <div className="setting-group">
          <label>
            <input
              type="checkbox"
              checked={settings.soundOn}
              onChange={(e) => onUpdate({ ...settings, soundOn: e.target.checked })}
            />
            Sound Effects
          </label>
        </div>
        
        <div className="setting-group">
          <label>Ghost Speed:</label>
          <select
            value={settings.ghostSpeed}
            onChange={(e) => onUpdate({ ...settings, ghostSpeed: Number(e.target.value) })}
          >
            <option value="1">Easy</option>
            <option value="2">Normal</option>
            <option value="3">Hard</option>
          </select>
        </div>
        
        <div className="maze-gallery">
          <h3>Preset Mazes:</h3>
          {presetMazes.map((maze, i) => (
            <button key={i} onClick={() => onCustomMaze(maze.layout)}>
              {maze.name}
            </button>
          ))}
        </div>
        
        <button onClick={() => setEditorOpen(true)}>Edit Current Maze</button>
        <button onClick={onClose} style={{ marginTop: '1rem' }}>Close</button>
        
        {editorOpen && (
          <MazeEditor
            maze={settings.customMaze || presetMazes[0].layout}
            onSave={(maze) => {
              onCustomMaze(maze);
              setEditorOpen(false);
            }}
            onCancel={() => setEditorOpen(false)}
          />
        )}
      </div>
    </div>
  );
}