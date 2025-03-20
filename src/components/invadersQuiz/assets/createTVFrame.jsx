// This is just a React component to create a simple TV frame SVG
// You should export this as an actual image file

import React from 'react';

function TVFrameSVG() {
  return (
    <svg width="1000" height="800" viewBox="0 0 1000 800">
      {/* TV Frame Outer */}
      <rect x="0" y="0" width="1000" height="800" rx="40" ry="40" fill="#333" />
      
      {/* TV Frame Inner */}
      <rect x="50" y="50" width="900" height="700" rx="20" ry="20" fill="#222" />
      
      {/* TV Screen (transparent center) */}
      <rect x="100" y="80" width="800" height="600" rx="10" ry="10" fill="transparent" />
      
      {/* TV Controls */}
      <circle cx="500" cy="720" r="20" fill="#444" />
      <circle cx="550" cy="720" r="15" fill="#444" />
      <circle cx="600" cy="720" r="15" fill="#444" />
      <circle cx="650" cy="720" r="15" fill="#444" />
      
      {/* TV Logo */}
      <text x="100" y="740" fill="#666" font-family="Arial" font-size="24">RETRO TV</text>
    </svg>
  );
}

export default TVFrameSVG;