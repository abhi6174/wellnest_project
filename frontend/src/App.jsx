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
        main: '#4A90E2',
      },
      secondary: {
        main: '#34495E',
      },
      background: {
        default: darkMode ? '#121212' : '#F4F6F8',
        paper: darkMode ? '#1E1E1E' : '#FFFFFF',
      },
      text: {
        primary: darkMode ? '#FFFFFF' : '#2C3E50',
        secondary: darkMode ? '#B0BEC5' : '#7F8C8D',
      },
    },
    typography: {
      fontFamily: "'Roboto', sans-serif",
      fontSize: 18,
    },
    shape: {
      borderRadius: 10,
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
        <AppBar position="fixed" color="primary">
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              WellNest
            </Typography>
          </Toolbar>
        </AppBar>
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
