import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  CircularProgress,
  Alert,
  Snackbar,
  Paper,
  Grid,
  Chip,
  Fade,
  useTheme,
  useMediaQuery,
  Avatar,
  Button
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Logout as LogoutIcon,
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Description as DescriptionIcon,
  HealthAndSafety as HealthAndSafetyIcon,
  Medication as MedicationIcon,
  Vaccines as VaccinesIcon,
  Assessment as AssessmentIcon,
  Healing as HealingIcon,
  MedicalServices as MedicalServicesIcon,
  Dashboard as DashboardIcon,
  AccountCircle as AccountCircleIcon
} from '@mui/icons-material';

const EHRView = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [ehrData, setEhrData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  // Define categories for the EHR fields with enhanced icons
  const categories = [
    { id: 'all', label: 'All Records', icon: <DescriptionIcon />, color: '#0B8A67' },
    { id: 'diagnosis', label: 'Diagnosis & Treatment', icon: <MedicalServicesIcon />, color: '#0B8A67' },
    { id: 'history', label: 'Patient History', icon: <PersonIcon />, color: '#0B8A67' }
  ];

  // Define EHR fields with user-friendly labels, categories, and icons
  const ehrFields = [
    { id: 'diagnosis', label: 'Diagnosis', category: 'diagnosis', icon: <HealingIcon /> },
    { id: 'treatment', label: 'Treatment Plan', category: 'diagnosis', icon: <MedicalServicesIcon /> },
    { id: 'medications', label: 'Medications', category: 'diagnosis', icon: <MedicationIcon /> },
    { id: 'doctorNotes', label: 'Doctor Notes', category: 'diagnosis', icon: <DescriptionIcon /> },
    { id: 'patientHistory', label: 'Patient History', category: 'history', icon: <PersonIcon /> },
    { id: 'allergies', label: 'Allergies', category: 'history', icon: <HealthAndSafetyIcon /> },
    { id: 'labResults', label: 'Laboratory Results', category: 'diagnosis', icon: <AssessmentIcon /> },
    { id: 'imagingReports', label: 'Imaging Reports', category: 'diagnosis', icon: <AssessmentIcon /> },
    { id: 'vitalSigns', label: 'Vital Signs', category: 'diagnosis', icon: <HealthAndSafetyIcon /> },
    { id: 'familyHistory', label: 'Family History', category: 'history', icon: <PersonIcon /> },
    { id: 'lifestyleFactors', label: 'Lifestyle Factors', category: 'history', icon: <PersonIcon /> },
    { id: 'immunizations', label: 'Immunizations', category: 'history', icon: <VaccinesIcon /> },
    { id: 'carePlan', label: 'Care Plan', category: 'diagnosis', icon: <MedicalServicesIcon /> },
    { id: 'followUpInstructions', label: 'Follow-up Instructions', category: 'diagnosis', icon: <DescriptionIcon /> }
  ];

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
      fetchEHR(storedUsername);
    }
  }, []);

  const fetchEHR = async (username) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/fabric/patient/view-ehr?username=${username}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch EHR data');
      
      const data = await response.json();
      setEhrData(data);
    } catch (error) {
      console.error('Error fetching EHR:', error);
      setError('Failed to load your health records. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    localStorage.removeItem('username');
    localStorage.removeItem('mspId');
    localStorage.removeItem('patientId');
    localStorage.removeItem('doctorId');
    localStorage.removeItem('historyData');
    localStorage.removeItem('ehrData');
    window.location.href = '/login';
  };

  const handleGoBack = () => {
    navigate('/patient');
  };

  const handleCloseAlert = () => {
    setError('');
  };

  // Filter fields based on active category
  const filteredFields = ehrFields.filter(field => 
    activeCategory === 'all' || field.category === activeCategory
  );

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      bgcolor: theme.palette.mode === 'light' ? '#f8fafc' : '#121212'
    }}>
      <AppBar 
        position="fixed" 
        color="primary" 
        elevation={4}
        sx={{
          background: '#0A5741'
        }}
      >
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <DashboardIcon sx={{ fontSize: 28, mr: 1 }} />
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
              Your Health Record
            </Typography>
          </Box>
          
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
            onClick={handleGoBack}
            startIcon={<ArrowBackIcon />}
            sx={{ 
              borderRadius: 2,
              mr: 1,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            Back
          </Button>
          
          <IconButton 
            color="inherit" 
            onClick={handleLogout}
            sx={{ 
              borderRadius: 2,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ flexGrow: 1, pt: 10, pb: 4 }}>
        <Container maxWidth="lg">
          <Paper 
            elevation={4} 
            sx={{ 
              p: 3, 
              mb: 3, 
              borderRadius: 3,
              background: 'linear-gradient(135deg, #0B8A67 0%, #09B135 100%)',
              color: 'white',
              boxShadow: '0 4px 20px rgba(11, 138, 103, 0.15)'
            }}
          >
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar sx={{ bgcolor: 'white', color: '#0B8A67', mr: 2 }}>
                    <PersonIcon />
                  </Avatar>
                  <Typography variant="h5" component="h1" fontWeight={700}>
                    Your Electronic Health Record
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ opacity: 0.9, ml: 6 }}>
                  Last updated: {new Date().toLocaleDateString()}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          <Paper 
            elevation={0} 
            sx={{ 
              p: 1.5, 
              mb: 3, 
              display: 'flex', 
              overflowX: 'auto',
              borderRadius: 2,
              bgcolor: 'white',
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
              '&::-webkit-scrollbar': { height: '4px' },
              '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '4px' }
            }}
          >
            <Box sx={{ display: 'flex', gap: 1.5, px: 1 }}>
              {categories.map((category) => (
                <Chip
                  key={category.id}
                  icon={category.icon}
                  label={category.label}
                  onClick={() => setActiveCategory(category.id)}
                  color={activeCategory === category.id ? "primary" : "default"}
                  variant={activeCategory === category.id ? "filled" : "outlined"}
                  sx={{ 
                    px: 1,
                    py: 2.5,
                    borderRadius: '16px',
                    fontWeight: 500,
                    '& .MuiChip-icon': { 
                      color: activeCategory === category.id ? 'inherit' : category.color 
                    },
                    transition: 'all 0.2s ease'
                  }}
                />
              ))}
            </Box>
          </Paper>

          {loading ? (
            <Paper sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              flexDirection: 'column',
              p: 8, 
              borderRadius: 2,
              bgcolor: 'white',
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            }}>
              <CircularProgress sx={{ color: '#0B8A67' }} />
              <Typography sx={{ mt: 2, color: 'text.secondary' }}>Loading your health records...</Typography>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {filteredFields.map((field) => (
                <Grid item xs={12} md={6} key={field.id}>
                  <Fade in={true} style={{ transitionDelay: '100ms' }}>
                    <Paper 
                      elevation={3} 
                      sx={{ 
                        height: '100%', 
                        borderRadius: 3,
                        bgcolor: 'white',
                        transition: 'all 0.3s',
                        '&:hover': {
                          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                          transform: 'translateY(-3px)'
                        }
                      }}
                    >
                      <Box sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            width: 40, 
                            height: 40, 
                            borderRadius: '50%',
                            bgcolor: '#0B8A67',
                            color: 'white',
                            mr: 2
                          }}>
                            {field.icon}
                          </Box>
                          <Typography variant="h6" fontWeight={600}>
                            {field.label}
                          </Typography>
                        </Box>
                        <Typography 
                          variant="body1" 
                          color="text.secondary"
                          sx={{ 
                            whiteSpace: 'pre-wrap',
                            minHeight: '100px',
                            p: 2,
                            borderRadius: 2,
                            bgcolor: 'grey.50'
                          }}
                        >
                          {ehrData[field.id] || 'No data available'}
                        </Typography>
                      </Box>
                    </Paper>
                  </Fade>
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </Box>

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
          sx={{ width: '100%', boxShadow: 3, borderRadius: 2 }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EHRView;