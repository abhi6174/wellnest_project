import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  AppBar,
  Toolbar,
  Button,
  CardContent,
  Grid,
  TextField,
  CircularProgress,
  Alert,
  Snackbar,
  Paper,
  IconButton,
  Chip,
  Fade,
  useTheme,
  useMediaQuery,
  Avatar
} from '@mui/material';
import {
  Logout as LogoutIcon,
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Edit as EditIcon,
  LocalHospital as LocalHospitalIcon,
  MedicalServices as MedicalServicesIcon,
  Person as PersonIcon,
  Description as DescriptionIcon,
  HealthAndSafety as HealthAndSafetyIcon,
  Medication as MedicationIcon,
  Vaccines as VaccinesIcon,
  Assessment as AssessmentIcon,
  Healing as HealingIcon
} from '@mui/icons-material';

const EHRViewer = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [ehrData, setEhrData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  // Define categories for the EHR fields with enhanced icons
  const categories = [
    { id: 'all', label: 'All Records', icon: <DescriptionIcon />, color: '#2196f3' },
    { id: 'diagnosis', label: 'Diagnosis & Treatment', icon: <MedicalServicesIcon />, color: '#00bcd4' },
    { id: 'history', label: 'Patient History', icon: <PersonIcon />, color: '#4caf50' }
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
    fetchEHR();
  }, [patientId]);

  const fetchEHR = async () => {
    setLoading(true);
    try {
      const storedPatientId = patientId || localStorage.getItem('patientId');
      
      const response = await fetch(`http://localhost:8080/fabric/doctor/view-ehr?patientId=${storedPatientId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch EHR data');
      
      const data = await response.json();
      setEhrData(data);
    } catch (error) {
      console.error('Error fetching EHR:', error);
      setError('Failed to load EHR data. Please try again.');
    } finally {
      setLoading(false);
    }
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

  const handleGoBack = () => {
    window.location.href = '/doctor';
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleChange = (field, value) => {
    setEhrData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const storedPatientId = patientId || localStorage.getItem('patientId');
      
      const response = await fetch(`http://localhost:8080/fabric/doctor/update-ehr?patientId=${storedPatientId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`
        },
        body: JSON.stringify({
          patientId: storedPatientId,
          ...ehrData
        })
      });

      if (!response.ok) throw new Error('Failed to update EHR');
      
      setSuccess('EHR updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to update EHR data. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCloseAlert = () => {
    setError('');
    setSuccess('');
  };

  // Filter fields based on active category
  const filteredFields = ehrFields.filter(field => 
    activeCategory === 'all' || field.category === activeCategory
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <AppBar position="fixed" elevation={2} sx={{ 
        background: 'linear-gradient(135deg, #0d47a1 0%, #1565c0 100%)',
      }}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: 'white', color: '#0d47a1', mr: 2 }}>
              <LocalHospitalIcon />
            </Avatar>
            <Typography variant="h6" component="div" sx={{ 
              flexGrow: 1, 
              fontWeight: 700, 
              color:'#fff',
              letterSpacing: '0.5px'
            }}>
              {isMobile ? 'EHR' : 'WellNest EHR System'}
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          <Typography variant="body2" sx={{ 
            mr: 2, 
            color: 'rgba(255, 255, 255, 0.85)',
            display: { xs: 'none', sm: 'block' }
          }}>
            Patient ID: {patientId || localStorage.getItem('patientId')}
          </Typography>

          <IconButton 
            color="inherit" 
            onClick={handleGoBack}
            sx={{ 
              mr: 1, 
              bgcolor: 'rgba(255,255,255,0.1)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
            }}
            aria-label="Go back"
          >
            <ArrowBackIcon />
          </IconButton>
          <IconButton 
            color="inherit" 
            onClick={handleLogout}
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.1)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
            }}
            aria-label="Logout"
          >
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ flexGrow: 1, pt: 10, pb: 4 }}>
        <Container maxWidth="lg">
          {/* Header with patient info */}
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              mb: 3, 
              borderRadius: 2,
              background: 'linear-gradient(135deg, #043B89 0%, #0d47a1 100%)',
              color:'#fff',
              boxShadow: '0 4px 20px rgba(13, 71, 161, 0.15)'
            }}
          >
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={isMobile ? 12 : 8}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar sx={{ bgcolor: 'white', color: '#0d47a1', mr: 2 }}>
                    <PersonIcon />
                  </Avatar>
                  <Typography variant="h5" component="h1" fontWeight={700}>
                    Patient Health Record
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ opacity: 0.9, ml: 6 }}>
                  Last updated: {new Date().toLocaleDateString()}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={isMobile ? 12 : 4} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' }, mt: { xs: 2, sm: 0 }, ml: { xs: 6, sm: 0 } }}>
                {!isEditing ? (
                  <Button
                    variant="contained"
                    startIcon={<EditIcon />}
                    onClick={handleEdit}
                    disableElevation
                    sx={{ 
                      borderRadius: 8, 
                      px: 3, 
                      py: 1,
                      bgcolor: 'white',
                      color: '#0d47a1',
                      fontWeight: 600,
                      '&:hover': { 
                        bgcolor: 'rgba(255,255,255,0.9)',
                      }
                    }}
                  >
                    Edit Record
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon/>}
                    onClick={handleSave}
                    disabled={saving}
                    disableElevation
                    sx={{ 
                      borderRadius: 8, 
                      px: 3, 
                      py: 1,
                      bgcolor: '#4caf50',
                      fontWeight: 600, 
                      '&:hover': { 
                        bgcolor: '#43a047' 
                      }
                    }}
                  >
                    Save Changes
                  </Button>
                )}
              </Grid>
            </Grid>
          </Paper>

          {/* Categories navigation */}
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

          {/* EHR content */}
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
              <CircularProgress sx={{ color: '#0d47a1' }} />
              <Typography sx={{ mt: 2, color: 'text.secondary' }}>Loading patient records...</Typography>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {filteredFields.map((field) => (
                <Grid item xs={12} md={6} key={field.id}>
                  <Fade in={true} style={{ transitionDelay: '100ms' }}>
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        height: '100%', 
                        borderRadius: 2,
                        bgcolor: 'white',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                        transition: 'all 0.3s',
                        border: '1px solid rgba(0,0,0,0.05)',
                        '&:hover': {
                          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                          borderColor: 'rgba(13, 71, 161, 0.2)',
                        }
                      }}
                    >
                      <CardContent sx={{ height: '100%' }}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          mb: 2,
                          pb: 1.5,
                          borderBottom: '1px solid',
                          borderColor: 'rgba(0,0,0,0.08)'
                        }}>
                          <Avatar 
                            sx={{ 
                              bgcolor: 'rgba(13, 71, 161, 0.1)', 
                              color: '#0d47a1',
                              mr: 1.5,
                              width: 32,
                              height: 32
                            }}
                          >
                            {field.icon}
                          </Avatar>
                          <Typography 
                            variant="subtitle1" 
                            fontWeight={600} 
                            color="#0d47a1"
                          >
                            {field.label}
                          </Typography>
                        </Box>
                        
                        {isEditing ? (
                          <TextField
                            fullWidth
                            multiline
                            rows={4}
                            value={ehrData[field.id] || ''}
                            onChange={(e) => handleChange(field.id, e.target.value)}
                            variant="outlined"
                            placeholder={`Add ${field.label.toLowerCase()} details here...`}
                            sx={{ 
                              mt: 1,
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                fontSize: '0.95rem'
                              }
                            }}
                          />
                        ) : (
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              mt: 1, 
                              minHeight: '80px',
                              color: ehrData[field.id] ? 'text.primary' : 'text.disabled',
                              whiteSpace: 'pre-line',
                              fontSize: '0.95rem',
                              lineHeight: 1.7
                            }}
                          >
                            {ehrData[field.id] || 'No data available'}
                          </Typography>
                        )}
                      </CardContent>
                    </Paper>
                  </Fade>
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </Box>

      {/* Footer */}
      <Box 
        component="footer" 
        sx={{ 
          py: 3, 
          bgcolor: 'white', 
          borderTop: '1px solid',
          borderColor: 'rgba(0,0,0,0.08)'
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <LocalHospitalIcon sx={{ color: '#0d47a1', mr: 1, fontSize: 20 }} />
            <Typography variant="body2" color="text.secondary" align="center" fontWeight={500}>
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
          sx={{ width: '100%', borderRadius: 8 }}
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
          sx={{ width: '100%', borderRadius: 8 }}
        >
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EHRViewer;