import React, { useState, useRef, useEffect, useMemo, memo } from 'react';
import { ChevronDown } from 'lucide-react';

const Select = memo(function Select({ 
  name, 
  value, 
  onChange, 
  options = [], 
  children,
  style, 
  disabled,
  className,
  ...props 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  
  // Extract options from children if provided (to support <option> tags)
  const parsedOptions = useMemo(() => {
    if (options && options.length > 0) return options;
    if (!children) return [];
    
    const opts = [];
    React.Children.toArray(children).forEach(child => {
      if (React.isValidElement(child)) {
        const val = child.props.value !== undefined ? child.props.value : child.props.children;
        const label = child.props.children;
        opts.push({ value: val, label: label });
      }
    });
    return opts;
  }, [options, children]);

  const selectedOption = parsedOptions.find(o => String(o.value) === String(value)) || parsedOptions.find(o => String(o.value) === '');

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (val) => {
    if (disabled) return;
    setIsOpen(false);
    if (onChange) {
      // Mock event object to maintain compatibility with existing onChange(e)
      onChange({ target: { name, value: val } });
    }
  };

  const { width, flex, margin, marginTop, marginBottom, marginLeft, marginRight, position, ...triggerStyle } = style || {};

  return (
    <div 
      ref={containerRef} 
      style={{ position: position || 'relative', zIndex: isOpen ? 50 : 1, width: width || '100%', flex, margin, marginTop, marginBottom, marginLeft, marginRight }} 
      className={`custom-select-container ${disabled ? 'disabled' : ''}`}
      data-open={isOpen}
    >
      <style>{`
        .custom-select-trigger-default {
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md, 8px);
          background: #FFFFFF;
          border: 1px solid var(--border-glass, #E2E8F0);
          color: var(--text-primary, #0F172A);
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          min-height: 42px;
          user-select: none;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
          box-sizing: border-box;
        }
        .custom-select-trigger-default.disabled {
          background: rgba(15, 23, 42, 0.05);
          color: var(--text-secondary, #64748B);
          cursor: not-allowed;
          box-shadow: none;
        }
      `}</style>
      <div 
        className={`custom-select-trigger custom-select-trigger-default ${disabled ? 'disabled' : ''} ${className || ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        style={{ ...triggerStyle }}
        {...props}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selectedOption ? selectedOption.label : '-- Select --'}
        </span>
        <ChevronDown size={16} style={{ 
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease',
          opacity: disabled ? 0.5 : 1,
          flexShrink: 0
        }} />
      </div>

      {isOpen && !disabled && (
        <div 
          className="custom-select-dropdown"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            background: '#FFFFFF',
            border: '1px solid var(--border-glass)',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            maxHeight: '250px',
            overflowY: 'auto',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            padding: '0.5rem'
          }}
        >
          {parsedOptions.map((opt, i) => (
            <div
              key={`${opt.value}-${i}`}
              onClick={() => handleSelect(opt.value)}
              style={{
                padding: '0.75rem 1rem',
                cursor: 'pointer',
                borderRadius: 'var(--radius-sm)',
                background: String(opt.value) === String(value) ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                color: String(opt.value) === String(value) ? '#60A5FA' : 'var(--text-primary)',
                transition: 'background 0.2s ease',
                fontSize: '0.9rem'
              }}
              onMouseEnter={(e) => {
                if (String(opt.value) !== String(value)) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              }}
              onMouseLeave={(e) => {
                if (String(opt.value) !== String(value)) e.currentTarget.style.background = 'transparent';
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

export default Select;
