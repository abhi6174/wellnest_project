import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
// Bootstrap components
import 'bootstrap/dist/css/bootstrap.min.css';
// MUI Theme Provider for consistent styling
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AppBar, Toolbar, Typography, IconButton } from '@mui/material';
import { Brightness4 as DarkModeIcon, Brightness7 as LightModeIcon } from '@mui/icons-material';

// Import components
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import DoctorDashboard from './components/DoctorDashboard';
import PatientDashboard from './components/PatientDashboard';
import EHRViewer from './components/EHRViewer';
import DoctorHistory from './components/DoctorHistory';
import Home from './components/Home';
import NotFound from './components/NotFound';
import LoadingScreen from './components/LoadingScreen';
import EHRView from './components/EHRViewerpat';
const App = () => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#0284c7', // primary-500
        light: '#38bdf8', // primary-300
        dark: '#0369a1', // primary-600
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#14b8a6', // secondary-500
        light: '#2dd4bf',
        dark: '#0f766e',
        contrastText: '#ffffff',
      },
      background: {
        default: darkMode ? '#0f172a' : '#f8fafc', // surface-900 : surface-50
        paper: darkMode ? '#1e293b' : '#ffffff', // surface-800 : white
      },
      text: {
        primary: darkMode ? '#f1f5f9' : '#334155', // surface-100 : surface-700
        secondary: darkMode ? '#94a3b8' : '#64748b', // surface-400 : surface-500
      },
    },
    typography: {
      fontFamily: "'Inter', sans-serif",
      h1: { fontFamily: "'Outfit', sans-serif", fontWeight: 700 },
      h2: { fontFamily: "'Outfit', sans-serif", fontWeight: 700 },
      h3: { fontFamily: "'Outfit', sans-serif", fontWeight: 600 },
      h4: { fontFamily: "'Outfit', sans-serif", fontWeight: 600 },
      h5: { fontFamily: "'Outfit', sans-serif", fontWeight: 600 },
      h6: { fontFamily: "'Outfit', sans-serif", fontWeight: 600 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
    },
  });

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  useEffect(() => {
    // Check authentication status on component mount
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('jwt');
    setLoading(true);

    if (token) {
      const username = localStorage.getItem('username');
      const mspId = localStorage.getItem('mspId');

      setAuthenticated(true);

      if (username === 'admin') {
        setUserRole('admin');
      } else if (mspId === 'Org1MSP') {
        setUserRole('doctor');
      } else if (mspId === 'Org2MSP') {
        setUserRole('patient');
      }
    } else {
      setAuthenticated(false);
      setUserRole(null);
    }

    setLoading(false);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>

        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route
            path="/login"
            element={
              authenticated ?
                <Navigate to={getRedirectPath(userRole)} replace /> :
                <Login />
            }
          />

          {/* Protected routes */}
          <Route
            path="/admin"
            element={
              authenticated && userRole === 'admin' ?
                <AdminDashboard /> :
                <Navigate to="/login" replace />
            }
          />
          <Route
            path="/doctor"
            element={
              authenticated && userRole === 'doctor' ?
                <DoctorDashboard /> :
                <Navigate to="/login" replace />
            }
          />
          <Route
            path="/ehr"
            element={
              authenticated ?
                <EHRView /> :
                <Navigate to="/login" replace />
            }
          />

          <Route
            path="/ehr/:patientId"
            element={
              authenticated && userRole === 'doctor' ?
                <EHRViewer /> :
                <Navigate to="/login" replace />
            }
          />
          <Route
            path="/patient"
            element={
              authenticated && userRole === 'patient' ?
                <PatientDashboard /> :
                <Navigate to="/login" replace />
            }
          />
          <Route
            path="/history/:doctorId"
            element={
              authenticated && userRole === 'patient' ?
                <DoctorHistory /> :
                <Navigate to="/login" replace />
            }
          />

          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

// Helper function to determine redirect path based on user role
function getRedirectPath(role) {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'doctor':
      return '/doctor';
    case 'patient':
      return '/patient';
    default:
      return '/login';
  }
}

export default App;
