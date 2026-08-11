import React, { useMemo } from 'react';
import './IsometricCubes.css';

export default function IsometricCubes() {
  const gridSize = 25; // 25x25 grid for better screen coverage

  const cubes = useMemo(() => {
    const temp = [];
    for (let i = 0; i < gridSize * gridSize; i++) {
      const x = i % gridSize;
      const y = Math.floor(i / gridSize);
      
      // Create a clean corner pyramid (like the image)
      // Only elevate blocks near the center/corner
      // Let's make a pyramid in the center of the grid
      const cx = 12;
      const cy = 12;
      const dist = Math.max(Math.abs(x - cx), Math.abs(y - cy));
      
      // 6 steps high, flat otherwise
      const steps = Math.max(0, 6 - dist);
      const height = steps * 80; 
      
      temp.push({
        id: i,
        baseZ: `${height}px`
      });
    }
    return temp;
  }, []);

  return (
    <div className="isometric-container">
      <div className="cube-grid">
        {cubes.map((c) => (
          <div 
            key={c.id} 
            className="cube-wrapper"
            style={{ 
              transform: `translateZ(${c.baseZ})`
            }}
          >
            <div className="face top"></div>
            <div className="face front"></div>
            <div className="face right"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
