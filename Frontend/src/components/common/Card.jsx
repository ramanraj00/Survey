import React from 'react';

export default function Card({ children, className = '', padding = '2rem', ...props }) {
  const style = {
    padding: padding,
  };

  return (
    <div 
      className={`glass-card ${className}`} 
      style={style}
      {...props}
    >
      {children}
    </div>
  );
}
