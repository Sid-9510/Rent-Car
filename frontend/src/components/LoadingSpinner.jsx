import React from 'react';

const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5 my-4">
      <div
        className="spinner-border text-primary mb-3"
        style={{ width: '2.75rem', height: '2.75rem' }}
        role="status"
      >
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="text-muted fw-medium mb-0">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
