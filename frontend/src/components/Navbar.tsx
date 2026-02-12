import { useNavigate } from 'react-router-dom';
import { FaHeartbeat, FaSignOutAlt, FaUserCircle } from 'react-icons/fa';

interface NavbarProps {
  title?: string;
  username?: string;
  onLogout?: () => void;
}

const Navbar = ({ title, username, onLogout }: NavbarProps) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem('jwt');
      localStorage.removeItem('username');
      localStorage.removeItem('mspId');
      navigate('/login');
    }
  };

  return (
    <nav className="navbar-glass py-3 px-4 mb-4">
      <div className="d-flex align-items-center justify-content-between w-100">
        <div className="d-flex align-items-center gap-3">
          <div className="icon-box mb-0 shadow-sm" style={{ width: '2.5rem', height: '2.5rem', background: 'var(--primary-600)', color: 'white' }}>
            <FaHeartbeat size={18} />
          </div>
          <div>
            <h5 className="fw-bold mb-0 text-dark" style={{ fontFamily: 'var(--font-display)' }}>WellNest</h5>
            <small className="text-muted d-none d-md-block" style={{ fontSize: '0.75rem' }}>{title || 'Dashboard'}</small>
          </div>
        </div>

        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center gap-2 px-3 py-2 rounded-pill bg-white border shadow-sm">
            <div className="bg-light rounded-circle p-1 d-flex align-items-center justify-content-center" style={{ width: '24px', height: '24px' }}>
              <FaUserCircle className="text-secondary" />
            </div>
            <span className="small fw-semibold text-secondary">{username || localStorage.getItem('username') || 'User'}</span>
          </div>

          <button
            onClick={handleLogout}
            className="btn btn-outline-danger btn-sm d-flex align-items-center gap-2 rounded-pill px-3"
            style={{ border: '1px solid var(--surface-200)', color: 'var(--surface-600)' }}
          >
            <FaSignOutAlt />
            <span className="d-none d-md-inline">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
