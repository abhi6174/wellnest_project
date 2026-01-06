/**
 * Authentication utility functions for WellNest
 */

// Store user authentication data
export const setAuth = (token, username, mspId) => {
  localStorage.setItem('jwt', token);
  localStorage.setItem('username', username);
  localStorage.setItem('mspId', mspId);
};

// Get authentication token
export const getToken = () => {
  const token = localStorage.getItem('jwt');
  if (!token || token.split('.').length !== 3) {
    throw new Error('Invalid or missing JWT token');
  }
  return token;
};

// Get current user details
export const getCurrentUser = () => {
  return {
    username: localStorage.getItem('username'),
    mspId: localStorage.getItem('mspId'),
  };
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!localStorage.getItem('jwt');
};

// Get user role based on username and mspId
export const getUserRole = () => {
  const username = localStorage.getItem('username');
  const mspId = localStorage.getItem('mspId');
  
  if (username === 'admin') return 'admin';
  if (mspId === 'Org1MSP') return 'doctor';
  if (mspId === 'Org2MSP') return 'patient';
  return null;
};

// Logout user by clearing storage
export const logout = () => {
  localStorage.removeItem('jwt');
  localStorage.removeItem('username');
  localStorage.removeItem('mspId');
  localStorage.removeItem('patientId');
  localStorage.removeItem('doctorId');
  localStorage.removeItem('historyData');
  
  // Always use direct redirect for reliability
  window.location.href = '/login';
};

// Helper for making authenticated API requests
export const fetchWithAuth = async (url, options = {}) => {
  const token = getToken(); // Ensure token is valid

  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  const response = await fetch(url, mergedOptions);

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'API request failed');
  }

  // Check if response is JSON
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }

  return response.text();
};
