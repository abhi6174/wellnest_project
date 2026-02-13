import React from 'react';
import { Link } from 'react-router-dom';
import { FaShieldAlt, FaLock, FaTabletAlt, FaHeartbeat, FaCheckCircle, FaUserPlus, FaExchangeAlt } from 'react-icons/fa';
import { IconButton } from '@mui/material';
import { Brightness4 as DarkModeIcon, Brightness7 as LightModeIcon } from '@mui/icons-material';

interface HomeProps {
    darkMode: boolean;
    toggleDarkMode: () => void;
}

interface Feature {
    title: string;
    description: string;
    icon: React.ElementType;
}

const Home: React.FC<HomeProps> = ({ darkMode, toggleDarkMode }) => {
    const features: Feature[] = [
        {
            title: 'Secure Data Management',
            description: 'Blockchain ensures tamper-proof medical records with comprehensive audit trails.',
            icon: FaShieldAlt
        },
        {
            title: 'Enhanced Privacy',
            description: 'Patients retain complete ownership and granular control over their medical data.',
            icon: FaLock
        },
        {
            title: 'Seamless Access',
            description: 'Healthcare providers access records with patient consent through a streamlined process.',
            icon: FaTabletAlt
        }
    ];

    return (
        <div className="d-flex flex-column min-vh-100">
            {/* Search-friendly & Accessible Navigation */}
            <nav className="navbar-glass py-3">
                <div className="container d-flex align-items-center justify-content-between">
                    <Link className="d-flex align-items-center gap-2" to="/">
                        <div className="icon-box mb-0" style={{ background: 'var(--primary-600)', color: 'white', width: '2.5rem', height: '2.5rem' }}>
                            <FaHeartbeat size={20} />
                        </div>
                        <span className="fw-bold" style={{ fontSize: '1.5rem', fontFamily: 'var(--font-display)', color: 'var(--primary-900)' }}>
                            WellNest
                        </span>
                    </Link>

                    <div className="d-flex align-items-center gap-3">
                        <IconButton color="inherit" onClick={toggleDarkMode}>
                            {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
                        </IconButton>
                        <Link to="/login" className="btn-modern btn-primary-modern text-decoration-none">
                            Sign In
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Modern Hero Section */}
            <header className="py-5 overflow-hidden position-relative">
                <div className="container position-relative z-2">
                    <div className="row align-items-center g-5 py-5">
                        <div className="col-lg-6 animate-fade-in">
                            <div className="d-inline-block px-3 py-1 mb-3 rounded-pill bg-primary st-subtle" style={{ background: 'var(--primary-50)', color: 'var(--primary-700)', fontWeight: '600', fontSize: '0.875rem' }}>
                                Next Gen Healthcare
                            </div>
                            <h1 className="display-4 fw-bold mb-4 lh-1">
                                Your Health Records, <br />
                                <span className="gradient-text">Secure & in Your Control</span>
                            </h1>
                            <p className="lead mb-5 text-secondary" style={{ maxWidth: '500px' }}>
                                WellNest leverages blockchain technology to give you absolute ownership of your medical history while enabling secure, instant sharing with your doctors.
                            </p>
                            <div className="d-flex flex-wrap gap-3">
                                <Link to="/login" className="btn-modern btn-primary-modern text-decoration-none">
                                    Get Started Now
                                </Link>
                                <a href="#how-it-works" className="btn-modern btn-outline-modern text-decoration-none">
                                    Learn How
                                </a>
                            </div>
                        </div>
                        <div className="col-lg-6 position-relative animate-fade-in delay-200">
                            <div className="position-absolute top-50 start-50 translate-middle" style={{ width: '120%', height: '120%', background: 'radial-gradient(circle, var(--primary-100) 0%, rgba(255,255,255,0) 70%)', zIndex: -1 }}></div>
                            <img
                                src="../public/images/hero_ehr.png"
                                className="img-fluid rounded-4 shadow-xl border border-white"
                                alt="Digital Healthcare Dashboard"
                                style={{ transform: 'rotate(-2deg)' }}
                            />
                        </div>
                    </div>
                </div>
            </header>

            {/* Features Section */}
            <section className="py-5" style={{ background: 'var(--surface-50)' }}>
                <div className="container py-5">
                    <div className="text-center mb-5 animate-fade-in">
                        <h2 className="display-6 fw-bold mb-3">Why WellNest?</h2>
                        <p className="text-secondary mx-auto" style={{ maxWidth: '600px' }}>
                            Built on Hyperledger Fabric for enterprise-grade security, scalability, and performance in healthcare data management.
                        </p>
                    </div>

                    <div className="row g-4">
                        {features.map((feature, index) => (
                            <div className="col-md-4 animate-fade-in delay-100" key={index} style={{ animationDelay: `${index * 100}ms` }}>
                                <div className="feature-card h-100 d-flex flex-column align-items-center text-center">
                                    <div className="icon-box mb-4">
                                        <feature.icon size={24} />
                                    </div>
                                    <h4 className="fw-bold mb-3">{feature.title}</h4>
                                    <p className="text-secondary mb-0">{feature.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="py-5 bg-white">
                <div className="container py-5">
                    <div className="text-center mb-5">
                        <h2 className="display-6 fw-bold mb-3">Seamless Workflow</h2>
                        <p className="text-secondary">Experience healthcare coordination as it should be.</p>
                    </div>

                    <div className="glass-panel p-5 rounded-4 animate-fade-in">
                        <div className="row g-5 position-relative">
                            {/* Connecting Line (Desktop) */}
                            <div className="d-none d-md-block position-absolute top-50 start-0 w-100 border-top border-2 border-dashed" style={{ marginTop: '-20px', zIndex: -1, borderColor: 'var(--surface-300)' }}></div>

                            <div className="col-md-4 text-center bg-white p-3 rounded-3 shadow-sm position-relative">
                                <div className="icon-box mx-auto bg-white border border-primary-100 shadow-sm" style={{ width: '4rem', height: '4rem' }}>
                                    <FaUserPlus className="text-primary" size={24} />
                                </div>
                                <h5 className="fw-bold mt-3">1. Join</h5>
                                <p className="small text-secondary mb-0">Patient creates a secure identity and wallet.</p>
                            </div>

                            <div className="col-md-4 text-center bg-white p-3 rounded-3 shadow-sm position-relative">
                                <div className="icon-box mx-auto bg-white border border-primary-100 shadow-sm" style={{ width: '4rem', height: '4rem' }}>
                                    <FaExchangeAlt className="text-primary" size={24} />
                                </div>
                                <h5 className="fw-bold mt-3">2. Consent</h5>
                                <p className="small text-secondary mb-0">Doctors request access; you approve instantly.</p>
                            </div>

                            <div className="col-md-4 text-center bg-white p-3 rounded-3 shadow-sm position-relative">
                                <div className="icon-box mx-auto bg-white border border-primary-100 shadow-sm" style={{ width: '4rem', height: '4rem' }}>
                                    <FaCheckCircle className="text-primary" size={24} />
                                </div>
                                <h5 className="fw-bold mt-3">3. Care</h5>
                                <p className="small text-secondary mb-0">Secure data exchange for better treatment.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-4 mt-auto" style={{ background: 'var(--surface-900)', color: 'var(--surface-400)' }}>
                <div className="container">
                    <div className="row align-items-center gy-4">
                        <div className="col-md-6 order-2 order-md-1 text-center text-md-start">
                            <div className="d-flex align-items-center justify-content-center justify-content-md-start mb-2">
                                <FaHeartbeat className="me-2 text-primary" />
                                <span className="fw-bold text-white">WellNest</span>
                            </div>
                            <small>© 2025 WellNest Healthcare. All rights reserved.</small>
                        </div>
                        <div className="col-md-6 order-1 order-md-2 text-center text-md-end">
                            <div className="d-flex justify-content-center justify-content-md-end gap-4">
                                <Link to="#" className="text-decoration-none text-light small hover-opacity">Privacy</Link>
                                <Link to="#" className="text-decoration-none text-light small hover-opacity">Terms</Link>
                                <Link to="#" className="text-decoration-none text-light small hover-opacity">Support</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;
