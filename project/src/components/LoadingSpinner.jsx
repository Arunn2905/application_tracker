import React from 'react';
import { clsx } from 'clsx';

export const LoadingSpinner = ({ 
  size = 'md', 
  className 
}) => {
  return (
    <div
      className={clsx(
        'animate-spin rounded-full border-2 border-gray-300 border-t-blue-600',
        {
          'h-4 w-4': size === 'sm',
          'h-6 w-6': size === 'md',
          'h-8 w-8': size === 'lg',
        },
        className
      )}
    />
  );
};