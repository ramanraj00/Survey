import React, { useEffect, useRef } from 'react';

export default function PixelWaveBg() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // 640x360 allows 4x4 pixel blocks to be a perfect visual size on 1080p screens
    const width = 640;
    const height = 360;
    canvas.width = width;
    canvas.height = height;

    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;
    
    // Color: Warm mauve to blend with the Morning Haze background
    const r = 80, g = 40, b = 70, a = 30;

    // Clustered-dot Halftone Matrix (4x4)
    // Unlike Bayer (which scatters pixels like static), this grows a single circular dot 
    // in the center of the block! This perfectly mimics classic print halftone patterns (Clerk/Vercel style).
    const halftone4 = [
      [14, 10, 11, 15],
      [ 9,  3,  2,  6],
      [ 5,  0,  1,  7],
      [13,  8,  4, 12]
    ];

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        
        // Normalized coordinates (-1 to 1) for math
        const nx = (x / width) * 2 - 1; 
        const ny = (y / height) * 2 - 1;
        
        // Create organic waves that naturally bulge in different places.
        // We use Math.cos(ny * freq + phase) to make sure it bulges outwards near the top half (ny < 0)
        // where the SURVEY title is located.
        const waveLeft = Math.cos(ny * 2.5 + 1) * 0.15 + Math.cos(ny * 1.5 - 0.5) * 0.15;
        const waveRight = Math.sin(ny * 2.5 - 0.5) * 0.15 + Math.cos(ny * 2 + 1) * 0.15;

        // Base distance from edges
        const leftDist = x / width; 
        const rightDist = (width - x) / width;

        // Calculate dynamic multiplier based on screen width.
        // For desktop (wider screens), we use 2.15 so it comes very close to the text (~46.5% inward).
        // For mobile, we use 2.8 so it stays further away and leaves room for the login card.
        const distanceMultiplier = window.innerWidth >= 768 ? 2.15 : 2.8;

        // Calculate density using the responsive multiplier.
        const leftDensity = Math.max(0, 1 - (leftDist * distanceMultiplier) + waveLeft);
        const rightDensity = Math.max(0, 1 - (rightDist * distanceMultiplier) + waveRight);

        // Total density at this pixel
        let density = leftDensity + rightDensity;
        
        // Smooth scaling: We don't clamp it aggressively like before.
        // We want a smooth gradient of dot sizes from the edges to the center.
        density = density * 0.8;
        // Only cap at 0.95 so it never becomes a 100% solid, featureless block
        density = Math.min(0.95, density);

        // Apply Halftone Matrix Threshold
        const threshold = (halftone4[y % 4][x % 4] + 0.5) / 16;
        
        if (density > threshold) {
          const idx = (y * width + x) * 4;
          data[idx] = r;
          data[idx+1] = g;
          data[idx+2] = b;
          data[idx+3] = a;
        }
      }
    }
    
    ctx.putImageData(imgData, 0, 0);
  }, []);

  return (
    <canvas 
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1, 
        pointerEvents: 'none',
        imageRendering: 'pixelated'
      }}
    />
  );
}
