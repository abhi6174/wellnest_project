import React, { useState, useEffect } from 'react';
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
  Divider,
  AppBar,
  Toolbar,
  Container,
  CircularProgress,
  Alert,
  Snackbar,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  InputAdornment,
  useTheme,
  alpha,
  IconButton
} from '@mui/material';
import {
  Upload as UploadIcon,
  Logout as LogoutIcon,
  PersonAdd as PersonAddIcon,
  AdminPanelSettings as AdminIcon,
  Security as SecurityIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  Key as KeyIcon,
  Business as BusinessIcon,
  CloudDownload as CloudDownloadIcon,
  Close as CloseIcon
} from '@mui/icons-material';

const AdminDashboard = () => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    file: null
  });
  const [fileName, setFileName] = useState('');
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
    setAdminOrg(orgId);
  }, []);

  // colours
  const orgColors = {
    primary: adminOrg === 'Org1MSP' ? '#3C4A51' : '#3C4A51', // Header & primary buttons
    secondary: adminOrg === 'Org1MSP' ? '#000' : '#000', // Footer & secondary elements
    accent: adminOrg === 'Org1MSP' ? '#732121' : '#732121', // Accents & highlights
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    if (e.target.files?.length) {
      setFormData({ ...formData, file: e.target.files[0] });
      setFileName(e.target.files[0].name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Validate form data
      if (!formData.username || !formData.password) {
        throw new Error('Please fill in all required fields');
      }
      
      // Only require file for patient registration (Org2MSP)
      if (adminOrg === 'Org2MSP' && !formData.file && !fileName) {
        throw new Error('Please upload a JSON file for patient record');
      }

      // Create FormData object for the file upload
      const requestFormData = new FormData();
      requestFormData.append("username", formData.username);
      requestFormData.append("password", formData.password);
      
      // Only append file for patient organization
      if (adminOrg === 'Org2MSP' && formData.file) {
        requestFormData.append("file", formData.file);
      }

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
        createdAt: new Date().toISOString(),
        fileAttached: adminOrg === 'Org2MSP' && (!!formData.file || !!fileName)
      };
      
      const updatedUsers = [...registeredUsers, newUser];
      setRegisteredUsers(updatedUsers);
      localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
      
      // Reset form
      setFormData({
        username: '',
        password: '',
        file: null
      });
      setFileName('');
      setSuccess('User registered successfully!');
      
    } catch (error) {
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

  const handleDownloadSamplePDF = () => {
    // In a real app, this would download a sample PDF
    alert('In a real app, this would download a sample PDF');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#E1E2E4' }}>
      <AppBar 
        position="fixed" 
        elevation={0} 
        sx={{ 
          bgcolor: orgColors.primary, 
          borderBottom: `1px solid ${theme.palette.divider}` 
        }}
      >
        <Toolbar>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              color: orgColors.accent 
            }}
          >
            <AdminIcon sx={{ mr: 1, fontSize: 28,color :'#fff' }} />
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                fontWeight: 600, 
                color: '#FFFFFF'
              }}
            >
              WellNest Admin
            </Typography>
          </Box>
          
          <Box sx={{ flexGrow: 1 }} />
          
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            '& .MuiButton-root': {
              borderRadius: '50px',
              px: 3
            }
          }}>
            <Chip 
              icon={<BusinessIcon/>} 
              label={adminOrg === 'Org1MSP' ? 'Doctor Organization' : 'Patient Organization'} 
              sx={{ 
                mr: 2, 
                height: 40, 
                px: 1,
                color: 'white',
                bgcolor: orgColors.accent,
                '& .MuiChip-icon': {
                  color: 'white',
                },
              }}
            />
            <Button 
              variant="contained"
              onClick={handleLogout}
              startIcon={<LogoutIcon />}
              sx={{ 
                boxShadow: 'none',
                fontWeight: 500,
                bgcolor: alpha('#ffffff', 0.2),
                '&:hover': {
                  bgcolor: alpha('#ffffff', 0.3),
                }
              }}
            >
              Sign Out
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="lg" sx={{ mt: 12, mb: 4, flex: 1 }}>
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
                
                {/* Only show file upload for patient organization admins */}
                {adminOrg === 'Org2MSP' && (
                  <Grid item xs={12}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 4,
                        textAlign: 'center',
                        borderStyle: 'dashed',
                        borderWidth: 2,
                        borderColor: fileName ? orgColors.accent : theme.palette.divider,
                        bgcolor: fileName ? alpha(orgColors.accent, 0.05) : 'transparent',
                        borderRadius: 3,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderColor: orgColors.accent,
                          bgcolor: alpha(orgColors.accent, 0.05)
                        }
                      }}
                    >
                      <input
                        accept=".json"
                        id="file-upload"
                        type="file"
                        hidden
                        onChange={handleFileChange}
                      />
                      
                      {!fileName ? (
                        <>
                          <Box sx={{ mb: 2 }}>
                            <UploadIcon sx={{ fontSize: 48, color: theme.palette.text.secondary }} />
                          </Box>
                          <Typography variant="h6" color="text.primary" gutterBottom>
                            Upload Patient Health Record
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Drag and drop a JSON file here, or click to browse
                          </Typography>
                          
                          <label htmlFor="file-upload">
                            <Button
                              variant="contained"
                              component="span"
                              startIcon={<UploadIcon />}
                              sx={{ 
                                px: 4, 
                                py: 1.5, 
                                borderRadius: 50,
                                boxShadow: 'none',
                                bgcolor: orgColors.accent,
                                '&:hover': {
                                  bgcolor: alpha(orgColors.accent, 0.8)
                                }
                              }}
                            >
                              Browse Files
                            </Button>
                          </label>
                          
                          <Typography 
                            variant="caption" 
                            display="block" 
                            color="text.secondary" 
                            sx={{ mt: 2 }}
                          >
                            JSON files only, max 10MB
                          </Typography>
                        </>
                      ) : (
                        <Box sx={{ 
                          py: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center'
                        }}>
                          <Box sx={{ 
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            bgcolor: alpha(orgColors.accent, 0.1),
                            mb: 2
                          }}>
                            <AssignmentIcon 
                              sx={{ 
                                fontSize: 36, 
                                color: orgColors.accent 
                              }} 
                            />
                          </Box>
                          
                          <Typography variant="h6" gutterBottom>
                            File Selected
                          </Typography>
                          
                          <Chip 
                            label={fileName}
                            sx={{ 
                              px: 1,
                              mt: 1,
                              mb: 2,
                              borderRadius: 3,
                              bgcolor: orgColors.accent,
                              color: 'white',
                              '& .MuiChip-deleteIcon': {
                                color: 'white',
                                opacity: 0.8,
                                '&:hover': {
                                  opacity: 1
                                }
                              }
                            }}
                            onDelete={() => {
                              setFileName('');
                              setFormData({...formData, file: null});
                            }}
                          />
                          
                          <label htmlFor="file-upload">
                            <Button
                              variant="outlined"
                              component="span"
                              size="small"
                              sx={{ 
                                borderRadius: 50, 
                                borderColor: orgColors.accent, 
                                color: orgColors.accent,
                                '&:hover': {
                                  borderColor: orgColors.accent,
                                  bgcolor: alpha(orgColors.accent, 0.05)
                                }
                              }}
                            >
                              Change File
                            </Button>
                          </label>
                        </Box>
                      )}

                    </Paper>
                  </Grid>
                )}
                
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