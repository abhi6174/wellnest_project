import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  AppBar,
  Toolbar,
  Container,
  Card,
  CardContent,
  Button,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  Tooltip
} from '@mui/material';
import {
  Logout as LogoutIcon,
  ArrowBack as ArrowBackIcon,
  History as HistoryIcon,
  AccountCircle as AccountCircleIcon
} from '@mui/icons-material';
import { logout } from '../utils/auth';

const DoctorHistory = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHistory();
  }, [doctorId]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const storedDoctorId = doctorId || localStorage.getItem('doctorId');
      if (!storedDoctorId) {
        throw new Error('No doctor ID provided');
      }

      const response = await fetch(`http://localhost:8080/fabric/patient/history/${storedDoctorId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch history data');
      
      const data = await response.json();
      setHistoryData(data);
      
      // Store in localStorage for persistence
      localStorage.setItem('historyData', JSON.stringify(data));
      localStorage.setItem('doctorId', storedDoctorId);
    } catch (error) {
      console.error('Error fetching history:', error);
      
      // Try to get history from localStorage if fetch fails
      const storedHistoryData = JSON.parse(localStorage.getItem('historyData'));
      if (storedHistoryData) {
        setHistoryData(storedHistoryData);
      } else {
        setError('Failed to load history data. Please try again.');
      }
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
    window.location.href = '/patient';
  };

  // Helper function to format timestamps
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch (e) {
      return timestamp;
    }
  };

  // Generate color based on access type
  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'view':
        return 'info';
      case 'update':
        return 'warning';
      case 'add':
        return 'success';
      case 'delete':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="fixed" color="primary" sx={{
          background: '#0A5741'    
        }}>
        <Toolbar>
          <HistoryIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Access History - Doctor {doctorId || localStorage.getItem('doctorId')}
          </Typography>
          <Button 
            color="inherit" 
            onClick={handleGoBack}
            startIcon={<ArrowBackIcon />}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Button 
            color="inherit" 
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 10, mb: 4, flex: 1 }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 ,color : '#09B135'}}>
              <AccountCircleIcon sx={{ mr: 1, color: '#09B135' }} />
              <Typography variant="h5" component="h2">
                Doctor Access History
              </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : historyData.length === 0 ? (
              <Box sx={{ textAlign: 'center', p: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  No history records found for this doctor.
                </Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} elevation={0} variant="outlined">
                <Table sx={{ minWidth: 650 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Timestamp</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Transaction Hash</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {historyData.map((record, index) => (
                      <TableRow 
                        key={index}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell>
                          <Chip 
                            label={record.type || 'Unknown'} 
                            color={getTypeColor(record.type)}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>{formatTimestamp(record.timestamp)}</TableCell>
                        <TableCell>
                          <Tooltip title={record.hash} arrow placement="top">
                            <Typography variant="body2" sx={{ 
                              fontFamily: 'monospace', 
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              maxWidth: '300px',
                              whiteSpace: 'nowrap'
                            }}>
                              {record.hash}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {error && (
              <Alert severity="error" sx={{ mt: 3 }}>
                {error}
              </Alert>
            )}
          </CardContent>
        </Card>
      </Container>

      {/* Footer */}
      <Box 
        component="footer" 
        sx={{ 
          py: 2, 
          bgcolor: 'background.paper', 
          borderTop: '1px solid', 
          borderColor: 'divider',
          mt: 'auto'
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center">
            &copy; 2025 WellNest. All Rights Reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default DoctorHistory;
