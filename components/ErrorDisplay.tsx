import React from 'react';

interface ErrorDisplayProps {
  error: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => {
  if (!error) return null;

  return (
    <div className="bg-red-50 text-red-500 p-3 rounded mb-4">
      {error}
    </div>
  );
};

export default ErrorDisplay;
