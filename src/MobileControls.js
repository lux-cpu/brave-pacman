import React, { useRef } from 'react';
import './mobile-controls.css';

export default function MobileControls({ onDirection }) {
  const touchStartRef = useRef(null);

  const handleTouchStart = (e) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const handleTouchEnd = (e) => {
    if (!touchStartRef.current) return;
    
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const startX = touchStartRef.current.x;
    const startY = touchStartRef.current.y;
    
    const dx = endX - startX;
    const dy = endY - startY;
    
    // Determine primary direction
    if (Math.abs(dx) > Math.abs(dy)) {
      onDirection(dx > 0 ? 'ArrowRight' : 'ArrowLeft');
    } else {
      onDirection(dy > 0 ? 'ArrowDown' : 'ArrowUp');
    }
    
    touchStartRef.current = null;
  };

  return (
    <div 
      className="mobile-controls"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <button className="mobile-btn up" onTouchStart={() => onDirection("ArrowUp")}>▲</button>
      <div className="middle-row">
        <button className="mobile-btn left" onTouchStart={() => onDirection("ArrowLeft")}>◀</button>
        <button className="mobile-btn right" onTouchStart={() => onDirection("ArrowRight")}>▶</button>
      </div>
      <button className="mobile-btn down" onTouchStart={() => onDirection("ArrowDown")}>▼</button>
    </div>
  );
}