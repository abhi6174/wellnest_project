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
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
} from '@mui/material';
import {
  Logout as LogoutIcon,
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Add as AddIcon,
  LocalHospital as LocalHospitalIcon,
  MedicalServices as MedicalServicesIcon,
  Person as PersonIcon,
  Description as DescriptionIcon,
  HealthAndSafety as HealthAndSafetyIcon,
  Medication as MedicationIcon,
  Vaccines as VaccinesIcon,
  Assessment as AssessmentIcon,
  Healing as HealingIcon,
  EventNote as EventNoteIcon
} from '@mui/icons-material';

interface IEhrRecord {
  recordId: string;
  timestamp: string;
  doctorId: string;
  diagnosis?: string;
  treatment?: string;
  medications?: string;
  doctorNotes?: string;
  patientHistory?: string;
  allergies?: string;
  labResults?: string;
  imagingReports?: string;
  vitalSigns?: string;
  familyHistory?: string;
  lifestyleFactors?: string;
  immunizations?: string;
  carePlan?: string;
  followUpInstructions?: string;
  hash?: string;
  [key: string]: any;
}

const EHRViewer = () => {
  const { patientId } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [records, setRecords] = useState<IEhrRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<Partial<IEhrRecord>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<IEhrRecord>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  // Define categories (same as before)
  const categories = [
    { id: 'all', label: 'All Records', icon: <DescriptionIcon />, color: '#2196f3' },
    { id: 'diagnosis', label: 'Diagnosis & Treatment', icon: <MedicalServicesIcon />, color: '#00bcd4' },
    { id: 'history', label: 'Patient History', icon: <PersonIcon />, color: '#4caf50' }
  ];

  // Define EHR fields (same as before)
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

      if (response.status === 404) {
        // No records found is not an error here, just empty list
        setRecords([]);
        setSelectedRecord({});
        setLoading(false);
        return;
      }

      if (!response.ok) throw new Error('Failed to fetch EHR data');

      const data = await response.json();

      // Data should be an array of records
      if (Array.isArray(data)) {
        setRecords(data);
        // Select the latest record by default if exists
        if (data.length > 0) {
          setSelectedRecord(data[data.length - 1]);
        } else {
          setSelectedRecord({});
        }
      } else {
        // Handle legacy single object if backend returns it (though we changed it)
        setRecords([data]);
        setSelectedRecord(data);
      }

    } catch (error) {
      console.error('Error fetching EHR:', error);
      setError('Failed to load EHR data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  const handleGoBack = () => {
    window.location.href = '/doctor';
  };

  const handleAddRecord = () => {
    setIsAdding(true);
    setFormData({}); // Clear form for new entry
    setSelectedRecord({}); // Clear view
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
    // Re-select latest record
    if (records.length > 0) {
      setSelectedRecord(records[records.length - 1]);
    }
  };

  const handleSelectRecord = (record: IEhrRecord) => {
    setSelectedRecord(record);
    setIsAdding(false);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const storedPatientId = patientId || localStorage.getItem('patientId');

      const response = await fetch(`http://localhost:8080/fabric/doctor/add-record?patientId=${storedPatientId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to save record');

      setSuccess('New EHR record added successfully!');
      setIsAdding(false);
      fetchEHR(); // Refresh list
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to save record. Please try again.');
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
              color: '#fff',
              letterSpacing: '0.5px'
            }}>
              {isMobile ? 'EHR' : 'WellNest EHR System'}
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton color="inherit" onClick={handleGoBack} sx={{ mr: 1, bgcolor: 'rgba(255,255,255,0.1)' }}>
            <ArrowBackIcon />
          </IconButton>
          <IconButton color="inherit" onClick={handleLogout} sx={{ bgcolor: 'rgba(255,255,255,0.1)' }}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ flexGrow: 1, pt: 10, pb: 4, px: 2 }}>
        <Container maxWidth="xl">
          <Grid container spacing={3}>
            {/* Left Sidebar: History List */}
            <Grid item xs={12} md={3}>
              <Paper elevation={0} sx={{ height: '100%', borderRadius: 2, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.08)' }}>
                <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderBottom: '1px solid rgba(0,0,0,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" fontWeight={600} color="primary">History</Typography>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={handleAddRecord}
                    disabled={isAdding}
                    sx={{ borderRadius: 4, textTransform: 'none' }}
                  >
                    New
                  </Button>
                </Box>
                <List sx={{ overflowY: 'auto', maxHeight: 'calc(100vh - 200px)' }}>
                  {records.length === 0 ? (
                    <Typography sx={{ p: 2, color: 'text.secondary', textAlign: 'center' }}>No history found.</Typography>
                  ) : (
                    records.slice().reverse().map((record, index) => (
                      <React.Fragment key={record.recordId || index}>
                        <ListItem
                          button
                          selected={selectedRecord.recordId === record.recordId && !isAdding}
                          onClick={() => handleSelectRecord(record)}
                          sx={{
                            '&.Mui-selected': { bgcolor: 'rgba(13, 71, 161, 0.08)', borderLeft: '4px solid #0d47a1' },
                            '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' }
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: '#e3f2fd', color: '#0d47a1' }}>
                              <EventNoteIcon fontSize="small" />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={new Date(record.timestamp).toLocaleDateString()}
                            secondary={`Dr. ${record.doctorId}`}
                            primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem' }}
                          />
                        </ListItem>
                        <Divider component="li" />
                      </React.Fragment>
                    ))
                  )}
                </List>
              </Paper>
            </Grid>

            {/* Right Side: Detail View / Add Form */}
            <Grid item xs={12} md={9}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  mb: 3,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #043B89 0%, #0d47a1 100%)',
                  color: '#fff',
                  boxShadow: '0 4px 20px rgba(13, 71, 161, 0.15)'
                }}
              >
                <Grid container alignItems="center">
                  <Grid item xs={8}>
                    <Typography variant="h5" fontWeight={700}>
                      {isAdding ? 'New Medical Entry' : `Visit Details: ${selectedRecord.timestamp ? new Date(selectedRecord.timestamp!).toLocaleDateString() : 'Select a record'}`}
                    </Typography>
                    {!isAdding && selectedRecord.doctorId && (
                      <Typography variant="subtitle2" sx={{ opacity: 0.8, mt: 0.5 }}>
                        Recorded by: Dr. {selectedRecord.doctorId}
                      </Typography>
                    )}
                  </Grid>
                  <Grid item xs={4} sx={{ textAlign: 'right' }}>
                    {isAdding && (
                      <Box>
                        <Button
                          variant="outlined"
                          color="inherit"
                          onClick={handleCancelAdd}
                          sx={{ mr: 1, borderRadius: 4 }}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="contained"
                          color="success"
                          startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                          onClick={handleSave}
                          disabled={saving}
                          sx={{ borderRadius: 4, bgcolor: '#4caf50', '&:hover': { bgcolor: '#43a047' } }}
                        >
                          Save
                        </Button>
                      </Box>
                    )}
                  </Grid>
                </Grid>
              </Paper>

              {/* Categories */}
              <Paper sx={{ p: 1.5, mb: 3, display: 'flex', overflowX: 'auto', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  {categories.map((category) => (
                    <Chip
                      key={category.id}
                      icon={category.icon}
                      label={category.label}
                      onClick={() => setActiveCategory(category.id)}
                      color={activeCategory === category.id ? "primary" : "default"}
                      variant={activeCategory === category.id ? "filled" : "outlined"}
                    />
                  ))}
                </Box>
              </Paper>

              {/* Content */}
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}><CircularProgress /></Box>
              ) : (
                <Grid container spacing={3}>
                  {filteredFields.map((field) => (
                    <Grid item xs={12} md={6} key={field.id}>
                      <Fade in={true}>
                        <Paper elevation={0} sx={{ height: '100%', borderRadius: 2, border: '1px solid rgba(0,0,0,0.05)' }}>
                          <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, borderBottom: '1px solid rgba(0,0,0,0.08)', pb: 1 }}>
                              <Avatar sx={{ bgcolor: 'rgba(13, 71, 161, 0.1)', color: '#0d47a1', mr: 1.5, width: 32, height: 32 }}>
                                {field.icon}
                              </Avatar>
                              <Typography variant="subtitle1" fontWeight={600} color="#0d47a1">
                                {field.label}
                              </Typography>
                            </Box>

                            {isAdding ? (
                              <TextField
                                fullWidth
                                multiline
                                rows={4}
                                value={formData[field.id] || ''}
                                onChange={(e) => handleChange(field.id, e.target.value)}
                                placeholder={`Enter ${field.label.toLowerCase()}...`}
                                variant="outlined"
                              />
                            ) : (
                              <Typography
                                variant="body1"
                                sx={{
                                  whiteSpace: 'pre-line',
                                  color: selectedRecord[field.id] ? 'text.primary' : 'text.disabled',
                                  minHeight: '60px'
                                }}
                              >
                                {selectedRecord[field.id] || 'No data recorded.'}
                              </Typography>
                            )}
                          </CardContent>
                        </Paper>
                      </Fade>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box component="footer" sx={{ py: 3, bgcolor: 'white', borderTop: '1px solid rgba(0,0,0,0.08)' }}>
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center">
            &copy; 2025 WellNest. All Rights Reserved.
          </Typography>
        </Container>
      </Box>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseAlert}>
        <Alert severity="error" onClose={handleCloseAlert}>{error}</Alert>
      </Snackbar>
      <Snackbar open={!!success} autoHideDuration={6000} onClose={handleCloseAlert}>
        <Alert severity="success" onClose={handleCloseAlert}>{success}</Alert>
      </Snackbar>
    </Box>
  );
};

export default EHRViewer;