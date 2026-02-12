import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaUser, FaLock, FaBuilding, FaEye, FaEyeSlash, FaHeartbeat, FaArrowLeft } from 'react-icons/fa';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    mspId: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.username || !formData.password || !formData.mspId) {
        throw new Error('Please fill in all fields');
      }

      const response = await fetch('http://localhost:8080/fabric/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await response.json();
      const token = data.token;
      if (!token.includes('.')) {
        throw new Error('Invalid token format received from server');
      }
      localStorage.setItem('jwt', token);
      localStorage.setItem('username', formData.username);
      localStorage.setItem('mspId', formData.mspId);

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
      setError((error as Error).message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center position-relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, var(--primary-900) 0%, var(--primary-800) 100%)' }}>

      {/* Decorative Background Elements */}
      <div className="position-absolute rounded-circle" style={{ width: '40rem', height: '40rem', background: 'var(--primary-600)', opacity: '0.1', top: '-10%', right: '-10%', filter: 'blur(80px)' }}></div>
      <div className="position-absolute rounded-circle" style={{ width: '30rem', height: '30rem', background: 'var(--secondary-500)', opacity: '0.1', bottom: '-10%', left: '-10%', filter: 'blur(60px)' }}></div>

      <div className="container position-relative z-1">
        <div className="row justify-content-center">
          <div className="col-lg-5 col-md-8">
            <div className="glass-panel p-5 rounded-4 animate-fade-in shadow-2xl border-0">

              <div className="text-center mb-5">
                <Link to="/" className="d-inline-flex align-items-center gap-2 text-decoration-none mb-4 group">
                  <div className="icon-box mb-0 shadow-sm" style={{ width: '3rem', height: '3rem', background: 'white' }}>
                    <FaHeartbeat className="text-primary" size={24} />
                  </div>
                </Link>
                <h2 className="fw-bold mb-1" style={{ color: 'var(--surface-900)' }}>Welcome Back</h2>
                <p className="text-secondary small">Access your secure health dashboard</p>
              </div>

              {error && (
                <div className="alert alert-danger d-flex align-items-center mb-4 border-0 shadow-sm rounded-3 py-2 px-3" role="alert" style={{ fontSize: '0.9rem' }}>
                  <FaBuilding className="me-2" /> {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="form-label small fw-bold text-secondary text-uppercase ls-1">Username</label>
                  <div className="position-relative">
                    <span className="position-absolute top-50 translate-middle-y ps-3 text-secondary">
                      <FaUser size={14} />
                    </span>
                    <input
                      type="text"
                      className="form-control input-modern ps-5"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Enter your username"
                      autoComplete="username"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-bold text-secondary text-uppercase ls-1">Password</label>
                  <div className="position-relative">
                    <span className="position-absolute top-50 translate-middle-y ps-3 text-secondary">
                      <FaLock size={14} />
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control input-modern ps-5 pe-5"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="btn position-absolute top-50 end-0 translate-middle-y me-2 text-secondary p-1 border-0 bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="mb-5">
                  <label className="form-label small fw-bold text-secondary text-uppercase ls-1">Organization</label>
                  <div className="position-relative">
                    <span className="position-absolute top-50 translate-middle-y ps-3 text-secondary">
                      <FaBuilding size={14} />
                    </span>
                    <select
                      className="form-select input-modern ps-5"
                      name="mspId"
                      value={formData.mspId}
                      onChange={handleChange}
                      style={{ appearance: 'auto' }}
                    >
                      <option value="">Select Organization</option>
                      <option value="Org1MSP">Org1MSP (Hospital/Doctor)</option>
                      <option value="Org2MSP">Org2MSP (Patient)</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary-modern w-100 py-3 rounded-3"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Authenticating...
                    </>
                  ) : (
                    'Sign In to Dashboard'
                  )}
                </button>
              </form>

              <div className="text-center mt-5 pt-3 border-top border-light">
                <Link to="/" className="text-decoration-none small text-secondary d-inline-flex align-items-center gap-1 hover-primary transition-all">
                  <FaArrowLeft size={12} /> Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;