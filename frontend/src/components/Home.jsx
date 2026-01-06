import React from 'react';
import { Link } from 'react-router-dom';
import { FaShieldAlt, FaLock, FaTabletAlt, FaHeartbeat, FaCheckCircle, FaUserPlus, FaExchangeAlt } from 'react-icons/fa';
    import { IconButton } from '@mui/material';
import { Brightness4 as DarkModeIcon, Brightness7 as LightModeIcon } from '@mui/icons-material';

const Home = ({ darkMode, toggleDarkMode }) => {
  const features = [
    {
      title: 'Secure Data Management',
      description: 'Blockchain ensures tamper-proof medical records with comprehensive audit trails.',
      icon: <FaShieldAlt className="text-primary" style={{ fontSize: '1.5rem' }} />
    },
    {
      title: 'Enhanced Privacy',
      description: 'Patients retain complete ownership and granular control over their medical data.',
      icon: <FaLock className="text-primary" style={{ fontSize: '1.5rem' }} />
    },
    {
      title: 'Seamless Access',
      description: 'Healthcare providers access records with patient consent through a streamlined process.',
      icon: <FaTabletAlt className="text-primary" style={{ fontSize: '1.5rem' }} />
    }
  ];

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Navigation */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark py-3" style={{ width: '100%' }}>
        <div className="container">
          <Link className="navbar-brand d-flex align-items-center" to="/">
            <FaHeartbeat className="me-2" style={{ fontSize: '1.5rem' }} />
            <span className="fw-bold" style={{ fontSize: '1.25rem' }}>WellNest</span>
          </Link>
          <IconButton color="inherit" onClick={toggleDarkMode} className="ms-auto">
            {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </div>
      </nav>

      {/* Hero Section */}
      {/* 1st part with get started*/}
      <header className="py-5 text-white" style={{ background: 'linear-gradient(120deg, #2C3E50 30%, #3498DB 90%)' }}>
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-lg-7">
              <h1 className="fw-bold mb-3" style={{ fontSize: '2.25rem' }}>Secure Health Records on Blockchain</h1>
              <p className="mb-4" style={{ fontSize: '1.125rem' }}>
                WellNest provides a decentralized platform for managing Electronic Health Records (EHR)
                with security, privacy, and patient control.
              </p>
              <Link to="/login" className="btn btn-success px-4 py-3" style={{ fontSize: '1.125rem' }}>
                Get Started
              </Link>
            </div>
            <div className="col-lg-5">
              <img
                src="https://cdn.pixabay.com/photo/2017/10/04/09/56/laboratory-2815640_1280.jpg"
                className="img-fluid rounded shadow-sm"
                alt="Healthcare"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-4 bg-light">
        <div className="container">
          <div className="text-center mb-4">
            <h2 className="fw-bold" style={{ fontSize: '2rem' }}>Key Features</h2>
            <p className="text-muted" style={{ fontSize: '1.125rem' }}>Built on Hyperledger Fabric for enterprise-grade security and performance</p>
          </div>

          <div className="row g-3">
            {features.map((feature, index) => (
              <div className="col-md-4" key={index}>
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body text-center p-3">
                    <div className="mb-2">
                      {feature.icon}
                    </div>
                    <h4 className="fw-bold mb-2" style={{ fontSize: '1.125rem' }}>{feature.title}</h4>
                    <p className="text-muted mb-0" style={{ fontSize: '1rem' }}>{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-4">
        <div className="container">
          <div className="text-center mb-4">
            <h2 className="fw-bold" style={{ fontSize: '2rem' }}>How It Works</h2>
            <p className="text-muted" style={{ fontSize: '1.125rem' }}>A seamless workflow for managing healthcare data</p>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-body p-3">
              <div className="row g-3">
                <div className="col-md-4 text-center">
                  <div className="p-2">
                    <h3 className="text-primary fw-bold mb-2" style={{ fontSize: '1.25rem' }}>01</h3>
                    <h5 className="fw-bold mb-1" style={{ fontSize: '1rem' }}>Patient Registers</h5>
                    <p className="text-muted mb-2" style={{ fontSize: '0.875rem' }}>
                      Patients create an account and maintain control of their medical records.
                    </p>
                    <FaUserPlus className="text-primary" style={{ fontSize: '1.25rem' }} />
                  </div>
                </div>
                <div className="col-md-4 text-center">
                  <div className="p-2">
                    <h3 className="text-primary fw-bold mb-2" style={{ fontSize: '1.25rem' }}>02</h3>
                    <h5 className="fw-bold mb-1" style={{ fontSize: '1rem' }}>Doctor Requests Access</h5>
                    <p className="text-muted mb-2" style={{ fontSize: '0.875rem' }}>
                      Healthcare providers request permission to view patient records.
                    </p>
                    <FaExchangeAlt className="text-primary" style={{ fontSize: '1.25rem' }} />
                  </div>
                </div>
                <div className="col-md-4 text-center">
                  <div className="p-2">
                    <h3 className="text-primary fw-bold mb-2" style={{ fontSize: '1.25rem' }}>03</h3>
                    <h5 className="fw-bold mb-1" style={{ fontSize: '1rem' }}>Secure Collaboration</h5>
                    <p className="text-muted mb-2" style={{ fontSize: '0.875rem' }}>
                      Permissioned access allows healthcare coordination with full auditability.
                    </p>
                    <FaCheckCircle className="text-primary" style={{ fontSize: '1.25rem' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-white py-3 mt-auto">
        <div className="container">
          <div className="row g-3">
            <div className="col-md-6">
              <div className="d-flex align-items-center mb-1">
                <FaHeartbeat className="me-1" style={{ fontSize: '0.875rem' }} />
                <h5 className="mb-0 fw-bold" style={{ fontSize: '0.9375rem' }}>WellNest</h5>
              </div>
              <p className="small opacity-75 mb-2" style={{ fontSize: '0.75rem' }}>
                Revolutionizing healthcare data management through blockchain technology.
                Secure, private, and patient-centered.
              </p>
            </div>
            <div className="col-md-6 text-md-end">
              <h6 className="fw-bold mb-1" style={{ fontSize: '0.875rem' }}>Contact Us</h6>
              <p className="small opacity-75 mb-0" style={{ fontSize: '0.75rem' }}>support@WellNest.com</p>
            </div>
          </div>
          <hr className="my-2 opacity-25" />
          <div className="text-center">
            <p className="small opacity-75 mb-0" style={{ fontSize: '0.75rem' }}>© 2025 WellNest. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
