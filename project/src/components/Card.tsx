import React from 'react';
import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div
      className={clsx(
        'bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700',
        className
      )}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div className={clsx('px-6 py-4 border-b border-gray-200 dark:border-gray-700', className)}>
      {children}
    </div>
  );
};

export const CardBody: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div className={clsx('px-6 py-4', className)}>
      {children}
    </div>
  );
};