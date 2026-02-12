import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Container,
  CircularProgress,
  Alert,
  Snackbar,
  InputAdornment,
  useTheme,
  alpha,
  IconButton
} from '@mui/material';
import {
  Logout as LogoutIcon,
  PersonAdd as PersonAddIcon,
  Security as SecurityIcon,
  Person as PersonIcon,
  Key as KeyIcon,
  Close as CloseIcon
} from '@mui/icons-material';

const AdminDashboard = () => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [adminOrg, setAdminOrg] = useState('');
  const navigate = useNavigate();

  // Simulate fetching registered users and determine admin's organization
  useEffect(() => {
    const savedUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    setRegisteredUsers(savedUsers);

    // Get admin's organization from localStorage
    const orgId = localStorage.getItem('mspId');
    setAdminOrg(orgId || '');
  }, []);

  // colours
  const orgColors = {
    primary: theme.palette.primary.main, // Header & primary buttons
    secondary: theme.palette.secondary.main, // Footer & secondary elements
    accent: theme.palette.primary.dark, // Accents & highlights
  };

  const handleLogout = () => {
    // Clear all authentication data
    localStorage.removeItem('jwt');
    localStorage.removeItem('username');
    localStorage.removeItem('mspId');
    localStorage.removeItem('patientId');
    localStorage.removeItem('doctorId');
    localStorage.removeItem('historyData');

    // Force immediate navigation to login
    window.location.href = '/login';
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Validate form data
      if (!formData.username || !formData.password) {
        throw new Error('Please fill in all required fields');
      }

      // Create FormData object (backend expects multipart/form-data currently)
      const requestFormData = new FormData();
      requestFormData.append("username", formData.username);
      requestFormData.append("password", formData.password);

      // Ensure JWT is sent as a header
      const jwt = localStorage.getItem('jwt');
      console.log(jwt);
      if (!jwt || jwt.split('.').length !== 3) {
        throw new Error('Invalid or missing JWT token. Please log in again.');
      }

      // Make the actual API request to register user
      const response = await fetch("http://localhost:8080/fabric/register", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${jwt}`,
        },
        body: requestFormData,
      });

      if (!response.ok) {
        throw new Error("Registration failed. Server returned an error.");
      }

      // Handle successful response
      const responseData = await response.text();
      console.log("Registration successful:", responseData);

      // Save to local storage for UI demonstration
      const newUser = {
        id: Date.now(),
        username: formData.username,
        mspId: adminOrg, // Use admin's organization
        createdAt: new Date().toISOString()
      };

      const updatedUsers: any = [...registeredUsers, newUser];
      setRegisteredUsers(updatedUsers);
      localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));

      // Reset form
      setFormData({
        username: '',
        password: ''
      });
      setSuccess('User registered successfully!');

    } catch (error: any) {
      console.error('Registration Error:', error);
      setError(error.message || 'Failed to register user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSuccess('');
    setError('');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#E1E2E4' }}>
      <Navbar title={`Admin - ${adminOrg === 'Org1MSP' ? 'Doctor Org' : 'Patient Org'}`} username={formData.username || 'Admin'} onLogout={handleLogout} />

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flex: 1 }}>
        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            border: `1px solid ${alpha(orgColors.accent, 0.1)}`,
          }}
        >
          <Box
            sx={{
              py: 3,
              px: 4,
              bgcolor: orgColors.accent,
              color: '#fff'
            }}
          >
            <Typography
              variant="h5"
              component="h2"
              sx={{
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <PersonAddIcon />
              Register New {adminOrg === 'Org1MSP' ? 'Doctor' : 'Patient'}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, opacity: 0.85 }}>
              Complete the form below to add a new user to the {adminOrg === 'Org1MSP' ? 'Doctor' : 'Patient'} organization.
            </Typography>
          </Box>

          <CardContent sx={{ p: 4 }}>
            {/* Organization Info */}
            <Alert
              severity="info"
              variant="outlined"
              icon={<SecurityIcon />}
              sx={{
                mb: 4,
                borderRadius: 2,
                '& .MuiAlert-message': { py: 1 },
                borderColor: orgColors.accent,
                color: 'black',
                '& .MuiAlert-icon': {
                  color: orgColors.accent
                }
              }}
            >
              You are registered as an admin for <strong>{adminOrg === 'Org1MSP' ? 'Doctor Organization (Org1MSP)' : 'Patient Organization (Org2MSP)'}</strong>.
              You can only add users to your organization.
            </Alert>

            {error && (
              <Alert
                severity="error"
                variant="filled"
                sx={{
                  mb: 4,
                  borderRadius: 2,
                  '& .MuiAlert-message': { py: 1 }
                }}
              >
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    variant="outlined"
                    placeholder="Enter username"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon sx={{ color: orgColors.accent }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&.Mui-focused fieldset': {
                          borderWidth: 2,
                          borderColor: orgColors.accent
                        }
                      },
                      '& .MuiFormLabel-root.Mui-focused': {
                        color: orgColors.accent
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    variant="outlined"
                    placeholder="Enter strong password"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <KeyIcon sx={{ color: orgColors.accent }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&.Mui-focused fieldset': {
                          borderWidth: 2,
                          borderColor: orgColors.accent
                        }
                      },
                      '& .MuiFormLabel-root.Mui-focused': {
                        color: orgColors.accent
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    fullWidth
                    disabled={loading}
                    sx={{
                      py: 1.8,
                      mt: 2,
                      borderRadius: 2,
                      fontWeight: 600,
                      textTransform: 'none',
                      fontSize: '1rem',
                      bgcolor: orgColors.accent,
                      boxShadow: `0 8px 16px ${alpha(orgColors.accent, 0.2)}`,
                      '&:hover': {
                        bgcolor: alpha(orgColors.accent, 0.8)
                      }
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      `Register ${adminOrg === 'Org1MSP' ? 'Doctor' : 'Patient'}`
                    )}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 3,
          bgcolor: orgColors.secondary,
          borderTop: '1px solid',
          borderColor: theme.palette.divider,
          mt: 'auto'
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" color="white" align="center">
            &copy; 2025 WellNest. All Rights Reserved.
          </Typography>
        </Container>
      </Box>

      {/* Success Notification */}
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          variant="filled"
          sx={{
            width: '100%',
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}
          action={
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={handleCloseSnackbar}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        >
          {success}
        </Alert>
      </Snackbar>

      {/* Error Notification (for snackbar errors, not form validation) */}
      <Snackbar
        open={!!error && !error.includes('Please fill')}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="error"
          variant="filled"
          sx={{
            width: '100%',
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}
          action={
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={handleCloseSnackbar}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminDashboard;