import React from 'react';

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyle = "px-8 py-3 rounded-full font-medium transition-all duration-300 transform hover:-translate-y-1 shadow-md";
  
  const variants = {
    primary: "bg-brand-primary text-white hover:bg-opacity-90 shadow-brand-primary/20",
    outline: "bg-transparent border border-brand-accent text-brand-primary hover:bg-brand-light"
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;