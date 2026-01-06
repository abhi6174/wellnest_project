import React from 'react';
import { Link } from 'react-router-dom';
import { FaExclamationTriangle } from 'react-icons/fa';

const NotFound = () => {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center min-vh-100 bg-light text-center p-4">
      <FaExclamationTriangle className="text-danger mb-3" style={{ fontSize: '3rem' }} />
      <h1 className="fw-bold text-secondary mb-2" style={{ fontSize: '2.5rem' }}>404</h1>
      <h2 className="mb-3 text-secondary" style={{ fontSize: '1.5rem' }}>Page Not Found</h2>
      <p className="text-muted mb-3 col-md-6" style={{ fontSize: '0.875rem' }}>
        The page you are looking for might have been removed, had its name changed, 
        or is temporarily unavailable.
      </p>
      <Link to="/" className="btn btn-primary px-3 py-2" style={{ fontSize: '0.875rem' }}>Go to Homepage</Link>
    </div>
  );
};

export default NotFound;
