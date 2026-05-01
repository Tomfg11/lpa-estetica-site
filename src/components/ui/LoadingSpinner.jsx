import React from 'react';

/**
 * LoadingSpinner — Indicador de carregamento com cores da marca.
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {string} message - Texto opcional abaixo do spinner
 */
const LoadingSpinner = ({ size = 'md', message = '' }) => {
  const sizes = {
    sm: 'h-6 w-6 border-2',
    md: 'h-10 w-10 border-3',
    lg: 'h-14 w-14 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`animate-spin rounded-full border-brand-primary border-t-transparent ${sizes[size]}`}
      />
      {message && (
        <p className="text-brand-text text-sm text-center animate-pulse">{message}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;
