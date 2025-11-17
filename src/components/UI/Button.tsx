import React from 'react';

interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export function Button({ onClick, children, variant = 'primary', disabled = false }: ButtonProps) {
  const baseStyle: React.CSSProperties = {
    padding: '15px 30px',
    fontSize: '18px',
    fontWeight: 'bold',
    color: 'white',
    background: variant === 'primary'
      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    border: 'none',
    borderRadius: '8px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    opacity: disabled ? 0.6 : 1
  };

  return (
    <button
      style={baseStyle}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {children}
    </button>
  );
}
