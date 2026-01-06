import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  AppBar,
  Toolbar,
  Container,
  Grid,
  Card,
  CardContent,
  Button,
  Tabs,
  Tab,
  Divider,
  Avatar,
  Paper,
  CircularProgress,
  Alert,
  Snackbar,
  IconButton,
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Logout as LogoutIcon,
  Person as PersonIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  History as HistoryIcon,
  PersonOutline as DoctorIcon,
  Refresh as RefreshIcon,
  AccessTime as PendingIcon,
  CheckCircleOutline as AcceptedIcon,
  Dashboard as DashboardIcon,
  AccountCircle as AccountCircleIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import { logout } from '../utils/auth';

const PatientDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [acceptedDoctors, setAcceptedDoctors] = useState([]);
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [username, setUsername] = useState('');
  const [ehrLoading, setEhrLoading] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    fetchDoctorData();
    // Get username from localStorage
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const fetchDoctorData = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Fetch accepted doctors
      const acceptedResponse = await fetch('http://localhost:8080/fabric/patient/accepted', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`
        }
      });

      if (!acceptedResponse.ok) throw new Error("Failed to fetch accepted doctors");
      const acceptedData = await acceptedResponse.json();
      setAcceptedDoctors(acceptedData);

      // Fetch pending requests
      const pendingResponse = await fetch('http://localhost:8080/fabric/patient/request', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`
        }
      });

      if (!pendingResponse.ok) throw new Error("Failed to fetch pending requests");
      const pendingData = await pendingResponse.json();
      setPendingDoctors(pendingData);
      
    } catch (error) {
      console.error(error);
      setError('Failed to load doctor data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDoctorData();
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
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

  const handleViewEHR = async () => {
    try {
      setEhrLoading(true);
      const username = localStorage.getItem('username');
      if (!username) {
        setError('Username not found. Please log in again.');
        return;
      }
      navigate('/ehr', { replace: true });
    } catch (error) {
      console.error(error);
      setError('Failed to load EHR data. Please try again.');
    } finally {
      setEhrLoading(false);
    }
  };

  const handleAction = async (action, doctorId, isPending = false) => {
    if (!doctorId) {
      setError('Doctor ID is missing. Please try again.');
      return;
    }

    setActionLoading(doctorId);
    try {
      const status = isPending ? 'Accepted' : action; // Use 'Accept' for pending requests, otherwise use the provided action
      const response = await fetch(`http://localhost:8080/fabric/patient/request/${doctorId}?status=${status}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`
        }
      });

      if (!response.ok) throw new Error(`Failed to ${status.toLowerCase()} doctor`);
      
      setSuccess(`Doctor ${
        status === 'Accept'
          ? 'accepted'
          : status === 'Rejected'
          ? 'rejected'
          : status === 'Revoked'
          ? 'revoked'
          : status === 'Activate'
          ? 'activated'
          : 'updated'
      } successfully!`);
      fetchDoctorData();
    } catch (error) {
      console.error(error);
      setError(`Failed to ${action.toLowerCase()} doctor. Please try again.`);
    } finally {
      setActionLoading(null);
    }
  };

  const viewHistory = (doctorId) => {
    navigate(`/history/${doctorId}`);
  };

  const handleCloseAlert = () => {
    setError('');
    setSuccess('');
  };

  // Render doctor list items
  const renderDoctorList = (doctors, isPending = false) => {
    // if (doctors.length === 0) {
    //   return (
    //     <Box sx={{ 
    //       width: '100%', 
    //       display: 'flex', 
    //       flexDirection: 'column',
    //       justifyContent: 'center', 
    //       alignItems: 'center', 
    //       height: '200px', 
    //       bgcolor: 'background.grey', 
    //       borderRadius: 2,
    //       border: '1px dashed',
    //       borderColor: 'divider'
    //     }}>
    //       <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
    //         No {isPending ? 'pending' : 'accepted'} doctors found.
    //       </Typography>
    //     </Box>
    //   );
    // }

    return doctors.map((doctor, index) => (
      <Grid item xs={12} key={`${doctor.requestId || doctor.did}-${isPending ? 'pending' : 'accepted'}-${index}`}>
        <Paper 
          elevation={3}
          sx={{ 
            p: 2.5,
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'flex-start' : 'center',
            justifyContent: 'space-between',
            borderRadius: 2,
            transition: 'all 0.2s ease',
            '&:hover': {
              boxShadow: 6,
              transform: 'translateY(-3px)',
              bgcolor: 'background.paper'
            },
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: isMobile ? 2 : 0,
            width: isMobile ? '100%' : 'auto'
          }}>
            <Avatar 
              sx={{ 
                bgcolor:'#0B8A67', // Changed colors
                mr: 2,
                width: 50,
                height: 50,
                boxShadow: 1
              }}
            >
              <DoctorIcon fontSize="large" />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={600} sx={{ lineHeight: 1.2 }}>
                Doctor ID: {doctor.did}
              </Typography>
              <Chip 
                size="small" 
                label={doctor.status === 'active' ? "Accepted & Active" : "Pending Approval"} 
                color={doctor.status === 'active' ? "success" : "warning"} 
                icon={doctor.status === 'active' ? <AcceptedIcon /> : <PendingIcon />}
                sx={{ mt: 1, borderRadius: 1, fontWeight: 500 }}
              />
            </Box>
          </Box>
          
          <Box sx={{ 
            display: 'flex', 
            gap: 1.5,
            width: isMobile ? '100%' : 'auto',
            justifyContent: isMobile ? 'space-between' : 'flex-end',
            mt: isMobile ? 1 : 0,
            flexWrap: isMobile ? 'wrap' : 'nowrap'
          }}>
            <Button
              variant="outlined"
              color="primary"
              size={isMobile ? "medium" : "small"}
              startIcon={<HistoryIcon />}
              onClick={() => viewHistory(doctor.did)}
              fullWidth={isMobile}
              sx={{ 
                borderRadius: 1.5,
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                minWidth: isMobile ? '100%' : 'auto',
                mb: isMobile ? 1 : 0
              }}
            >
              View History
            </Button>
            {doctor.status === 'active' ? (
              <Button
                variant="contained"
                color="error"
                size={isMobile ? "medium" : "small"}
                startIcon={actionLoading === doctor.did ? <CircularProgress size={20} color="inherit" /> : <CloseIcon />}
                onClick={() => handleAction('Revoked', doctor.did)}
                disabled={!!actionLoading}
                fullWidth={isMobile}
                sx={{ 
                  borderRadius: 1.5,
                  boxShadow: '0 2px 5px rgba(211, 47, 47, 0.3)',
                  bgcolor: '#FF6B6B', // Changed color
                  minWidth: isMobile ? '100%' : 'auto'
                }}
              >
                Revoke Access
              </Button>
            ) : (
              <Button
                variant="contained"
                color="success"
                size={isMobile ? "medium" : "small"}
                startIcon={actionLoading === doctor.did ? <CircularProgress size={20} color="inherit" /> : <CheckIcon />}
                onClick={() => handleAction('Accepted', doctor.did, isPending)}
                disabled={!!actionLoading}
                fullWidth={isMobile}
                sx={{ 
                  borderRadius: 1.5,
                  boxShadow: '0 2px 5px rgba(46, 125, 50, 0.3)',
                  bgcolor: '#4CAF50', // Changed color
                  minWidth: isMobile ? '100%' : 'auto'
                }}
              >
                {isPending ? 'Accept Request' : 'Activate Access'}
              </Button>
            )}
          </Box>
        </Paper>
      </Grid>
    ));
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      bgcolor: theme.palette.mode === 'light' ? '#fff' : '#121212'
    }}>
      {/* Changed header color */}
      <AppBar 
        position="fixed" 
        color="primary" 
        elevation={4}
        sx={{
          background: '#0A5741' // Changed from #0A5741 to Steel Blue
        }}
      >
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <DoctorIcon sx={{ fontSize: 28, mr: 1 }} />
            <Typography variant="h5" component="div" fontWeight="600">
              WellNest
            </Typography>
          </Box>
       
          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                fontWeight: 500,
                display: { xs: 'none', md: 'block' } 
              }}
            >
              Patient Dashboard
            </Typography>
          </Box>
          
          {/* Username display */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            mr: 2,
            px: 2,
            py: 0.5,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.common.white, 0.1)
          }}>
            <AccountCircleIcon sx={{ mr: 1, fontSize: 20 }} />
            <Typography variant="body2" fontWeight="500">
              {username || 'Patient'}
            </Typography>
          </Box>
          
          <Button 
            color="inherit" 
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
            sx={{ 
              borderRadius: 2,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="lg" sx={{ mt: 12, mb: 6, flex: 1 }}>
        {/*user ehr viewing option */}
        <Card 
          elevation={4} 
          sx={{ 
            borderRadius: 3, 
            mb: 3, 
            background: 'linear-gradient(135deg, #0B8A67 0%, #09B135 100%)',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ 
            p: 3, 
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Box sx={{ mb: isMobile ? 2 : 0 }}>
              <Typography variant="h5" component="h2" fontWeight={600} color="white">
                Your Electronic Health Record
              </Typography>
              <Typography variant="body1" color="white" sx={{ mt: 1, opacity: 0.9 }}>
                View your complete medical information and health history
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleViewEHR}
              disabled={ehrLoading}
              startIcon={ehrLoading ? <CircularProgress size={24} color="inherit" /> : <DescriptionIcon />}
              sx={{
                borderRadius: 2,
                bgcolor: 'white',
                color: '#0B8A67',
                fontWeight: 600,
                boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
                px: 4,
                py: 1.5,
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.9)',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.25)'
                }
              }}
            >
              View EHR
            </Button>
          </Box>
        </Card>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Card elevation={4} sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Box sx={{ 
              p: 2, 
              background: 'linear-gradient(135deg, #0B8A67 0%, #09B135 100%)',
              borderBottom: '1px solid',
              borderColor: 'divider'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PersonIcon sx={{ mr: 1.5, color: 'white', fontSize: 28 }} />
                  <Typography variant="h5" component="h1" fontWeight={600} color="white">
                    Doctor Access Management
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{
                background: theme.palette.background.paper,
                '& .MuiTab-root': {
                  py: 2,
                  fontWeight: 500,
                  fontSize: '1rem',
                  transition: 'all 0.2s',
                  '&.Mui-selected': {
                    fontWeight: 600,
                    color: '#0B8A67' // Changed tab selection color
                  }
                }
              }}
              TabIndicatorProps={{
                sx: { height: 3, borderRadius: '3px 3px 0 0', backgroundColor: '#09B135' } // Changed indicator color
              }}
            >
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AcceptedIcon fontSize="small" />
                    <Typography component="span">
                      Accepted Doctors
                      {acceptedDoctors.length > 0 && 
                        <Chip 
                          label={acceptedDoctors.length} 
                          size="small" 
                          color="success" 
                          sx={{ ml: 1, height: 20, minWidth: 20, fontSize: '0.7rem', background: 'linear-gradient(135deg, #0B8A67 0%, #09B135 100%)'}} // Changed chip color
                        />
                      }
                    </Typography>
                  </Box>
                } 
              />
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PendingIcon fontSize="small" />
                    <Typography component="span">
                      Pending Requests
                      {pendingDoctors.length > 0 && 
                        <Chip 
                          label={pendingDoctors.length} 
                          size="small" 
                          color="warning" 
                          sx={{ ml: 1, height: 20, minWidth: 20, fontSize: '0.7rem', bgcolor: '#09B135' }} // Changed chip color
                        />
                      }
                    </Typography>
                  </Box>
                }
              />
            </Tabs>
          </Card>
          
          {loading && !refreshing ? (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              p: 6,
              height: '300px',
              borderRadius: 3,
              bgcolor: 'background.paper',
              flexDirection: 'column',
              gap: 2,
              boxShadow: 2
            }}>
              <CircularProgress size={50} sx={{ color: '#4682B4' }} /> {/* Changed color */}
              <Typography variant="h6" color="text.secondary">
                Loading doctor information...
              </Typography>
            </Box>
          ) : (
            <Box sx={{ mt: 1 }}>
              {tabValue === 0 && (
                <Card elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                  <CardContent sx={{ p: 0 }}>
                    <Box sx={{ 
                      p: 3, 
                      background: 'linear-gradient(135deg, #0B8A67 0%, #09B135 100%)',
                      color: 'primary.contrastText',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5
                    }}>
                      <AcceptedIcon />
                      <Typography variant="h6" fontWeight={600}>
                        Accepted Doctors ({acceptedDoctors.length})
                      </Typography>
                    </Box>
                    <Box sx={{ p: 3 }}>
                      <Grid container spacing={2.5}>
                        {renderDoctorList(acceptedDoctors)}
                      </Grid>
                    </Box>
                  </CardContent>
                </Card>
              )}
              
              {tabValue === 1 && (
                <Card elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                  <CardContent sx={{ p: 0 }}>
                    <Box sx={{ 
                      p: 3, 
                      background: 'linear-gradient(90deg, #FDB159 0%, #FFD9A0 100%)',
                      color: 'warning.contrastText',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5
                    }}>
                      <PendingIcon />
                      <Typography variant="h6" fontWeight={600}>
                        Pending Requests ({pendingDoctors.length})
                      </Typography>
                    </Box>
                    <Box sx={{ p: 3 }}>
                      <Grid container spacing={2.5}>
                        {renderDoctorList(pendingDoctors, true)}
                      </Grid>
                    </Box>
                  </CardContent>
                </Card>
              )}
            </Box>
          )}
        </Box>
      </Container>
      
      {/* Footer with changed color */}
      <Box 
        component="footer" 
        sx={{ 
          py: 1, 
          bgcolor: '#0B8A67', // Changed from #0B8A67 to Steel Blue
          borderTop: '1px solid', 
          borderColor: 'divider',
          mt: 'auto'
        }}
      >
        <Container maxWidth="lg">
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'center',
              height: '100%',
              color: '#043B89',
              textAlign: 'center'
            }}
          >
            <Typography 
              variant="subtitle1" 
              color="white" 
              fontWeight={600}
            >
              WellNest
            </Typography>
            <Typography 
              variant="body2" 
              color="white"
            >
              &copy; 2025 WellNest. All Rights Reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
      
      {/* Alerts */}
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseAlert} 
          severity="error" 
          variant="filled"
          sx={{ width: '100%', boxShadow: 3, borderRadius: 2, bgcolor: '#FF6B6B' }} // Changed color
        >
          {error}
        </Alert>
      </Snackbar>
      
      <Snackbar 
        open={!!success} 
        autoHideDuration={6000} 
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseAlert} 
          severity="success" 
          variant="filled"
          sx={{ width: '100%', boxShadow: 3, borderRadius: 2, bgcolor: '#4CAF50' }} // Changed color
        >
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PatientDashboard;