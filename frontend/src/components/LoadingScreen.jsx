import React from 'react';
import { FaHeartbeat } from 'react-icons/fa';

const LoadingScreen = () => {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center min-vh-100 bg-light">
      <FaHeartbeat className="text-primary mb-3" style={{ fontSize: '2.5rem' }} />
      <div className="spinner-border text-primary mb-3" role="status" style={{ width: '1.5rem', height: '1.5rem' }}>
        <span className="visually-hidden">Loading...</span>
      </div>
      <h4 className="fw-bold text-secondary" style={{ fontSize: '1.125rem' }}>Loading WellNest....</h4>
    </div>
  );
};

export default LoadingScreen;
