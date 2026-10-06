import React from 'react';

const ErrorMessage = ({ message, onRetry }) => {
  if (!message) return null;
  return (
    <div className="alert alert-danger d-flex align-items-center justify-content-between rounded-3 shadow-sm my-3" role="alert">
      <div className="d-flex align-items-center gap-2">
        <i className="bi bi-exclamation-triangle-fill fs-5"></i>
        <span>{message}</span>
      </div>
      {onRetry && (
        <button className="btn btn-sm btn-outline-danger fw-semibold" onClick={onRetry}>
          <i className="bi bi-arrow-clockwise me-1"></i> Retry
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
