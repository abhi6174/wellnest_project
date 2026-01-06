import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaBuilding, FaEye, FaEyeSlash, FaHeartbeat } from 'react-icons/fa';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    mspId: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate form data
      if (!formData.username || !formData.password || !formData.mspId) {
        throw new Error('Please fill in all fields');
      }

      // Make API request
      const response = await fetch('http://localhost:8080/fabric/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      // Extract token and store in localStorage
      const token = await response.text();
      if (!token.includes('.')) {
        throw new Error('Invalid token format received from server');
      }
      localStorage.setItem('jwt', token);
      localStorage.setItem('username', formData.username);
      localStorage.setItem('mspId', formData.mspId);

      // Navigate based on organization
      if (formData.mspId === 'Org1MSP') {
        window.location.href = '/doctor';
      } else if (formData.mspId === 'Org2MSP') {
        window.location.href = '/patient';
      } else if (formData.username === 'admin') {
        window.location.href = '/admin';
      } else {
        setError('Unknown organization');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid vh-100 d-flex align-items-center justify-content-center" 
      style={{ background: 'linear-gradient(135deg,rgb(4, 23, 42) 30%,rgb(24, 155, 243) 90%)', fontFamily: 'Roboto, sans-serif', fontSize: '1rem', overflow: 'hidden' }}>
      <div className="row w-100 justify-content-center">
        {/* Left Side - Branding */}
        <div className="col-md-6 d-none d-md-flex flex-column align-items-center justify-content-center text-white p-4">
          <div className="text-center">
            <FaHeartbeat className="mb-3" style={{ fontSize: '3rem' }} />
            <h1 className="fw-bold mb-2" style={{ fontSize: '2rem' }}>WellNest</h1>
            <h4 className="mb-2" style={{ fontSize: '1.3rem', fontWeight: 500 }}>Secure blockchain-based EHR system</h4>
            
            <p className="mb-3 opacity-75" style={{ fontSize: '1.1rem' }}>
              Empowering patients with control over their health data while enabling 
              secure collaboration between healthcare providers.
            </p>
            
            <div className="p-2 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
              <div className="row g-0 text-center">
                <div className="col-4 p-2">
                  <h5 className="fw-bold mb-0" style={{ fontSize: '1.1rem' }}>100%</h5>
                  <small style={{ fontSize: '0.9rem' }}>Secure</small>
                </div>
                <div className="col-4 p-2 border-start border-end" style={{ borderColor: 'rgba(255,255,255,0.3)' }}>
                  <h5 className="fw-bold mb-0" style={{ fontSize: '1.1rem' }}>Private</h5>
                  <small style={{ fontSize: '0.9rem' }}>Control</small>
                </div>
                <div className="col-4 p-2">
                  <h5 className="fw-bold mb-0" style={{ fontSize: '1.1rem' }}>Trusted</h5>
                  <small style={{ fontSize: '0.9rem' }}>Blockchain</small>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Side - Login Form */}
        <div className="col-12 col-md-6 col-lg-4 col-xl-3">
        <div 
            className="card shadow-sm border-0  mt-5" 
            style={{ borderRadius: '1.2rem', overflow: 'hidden' }}
          >
            <div className="card-body p-4 bg-white " style={{ minHeight: '400px' }}>
              {/* Mobile logo */}
              <div className="text-center d-md-none mb-2">
                <FaHeartbeat style={{ fontSize: '2rem', color: '#3498DB' }} />
                <h2 className="fw-bold" style={{ fontSize: '1.5rem', color: '#3498DB' }}>WellNest</h2>
              </div>
              
              <h2 className="fw-bold mb-2 text-dark" style={{ fontSize: '2rem' }}>Sign In</h2>
              <p className="text-muted mb-3" style={{ fontSize: '1.1rem' }}>Enter your credentials to access your account</p>
              
              {error && (
                <div className="alert alert-danger py-1 px-2 mb-2" role="alert" style={{ fontSize: '0.85rem' }}>
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="username" className="form-label text-dark mb-1" style={{ fontSize: '0.9rem' }}>Username</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light py-1">
                      <FaUser className="text-primary" style={{ fontSize: '0.9rem' }} />
                    </span>
                    <input
                      type="text"
                      className="form-control py-1"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Enter username"
                      style={{ fontSize: '0.9rem' }}
                    />
                  </div>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="password" className="form-label text-dark mb-1" style={{ fontSize: '0.9rem' }}>Password</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light py-1">
                      <FaLock className="text-primary" style={{ fontSize: '0.9rem' }} />
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control py-1"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter password"
                      style={{ fontSize: '0.9rem' }}
                    />
                    <button 
                      className="input-group-text bg-light py-1" 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? 
                        <FaEyeSlash className="text-secondary" style={{ fontSize: '0.9rem' }} /> : 
                        <FaEye className="text-secondary" style={{ fontSize: '0.9rem' }} />
                      }
                    </button>
                  </div>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="mspId" className="form-label text-dark mb-1" style={{ fontSize: '0.9rem' }}>Organization</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light py-1">
                      <FaBuilding className="text-primary" style={{ fontSize: '0.9rem' }} />
                    </span>
                    <select
                      className="form-select py-1"
                      id="mspId"
                      name="mspId"
                      value={formData.mspId}
                      onChange={handleChange}
                      style={{ fontSize: '0.9rem' }}
                    >
                      <option value="">Select Organization</option>
                      <option value="Org1MSP">Org1MSP (Doctor)</option>
                      <option value="Org2MSP">Org2MSP (Patient)</option>
                    </select>
                  </div>
                </div>
                
                <div className="d-grid">
                  <button
                    type="submit"
                    className="btn btn-primary py-1"
                    disabled={loading}
                    style={{ 
                      backgroundColor: '#3498DB', 
                      borderColor: '#3498DB',
                      boxShadow: '0 2px 4px rgba(52, 152, 219, 0.2)',
                      fontSize: '0.9rem',
                      fontWeight: 500
                    }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" style={{ width: '0.8rem', height: '0.8rem' }}></span>
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </button>
                </div>
              </form>
              
              <div className="text-center mt-3">
                <small className="text-muted" style={{ fontSize: '0.8rem' }}>
                  For demo: Use "admin" as username for Admin access
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;