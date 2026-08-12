import React from 'react';

export default function Card({ children, className = '', padding = '2rem', ...props }) {
  const style = {
    padding: padding,
  };

  return (
    <div 
      className={`glass-card ${className}`} 
      {...props}
      style={{ ...style, ...(props.style || {}) }}
    >
      {children}
    </div>
  );
}
