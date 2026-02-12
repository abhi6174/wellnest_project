import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

const PatientHistory = () => {
    const navigate = useNavigate();
    const [historyData, setHistoryData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8080/fabric/patient/history', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('jwt')}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch history data');

            const data = await response.json();
            setHistoryData(data);
        } catch (error) {
            console.error('Error fetching history:', error);
            setError('Failed to load history data. Please try again.');
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
        navigate(-1);
    };

    // Helper function to format timestamps
    const formatTimestamp = (timestamp: string | number | Date) => {
        if (!timestamp) return 'N/A';

        try {
            const date = new Date(timestamp);
            return date.toLocaleString();
        } catch (e) {
            return String(timestamp);
        }
    };

    // Generate color based on access type
    const getTypeColor = (type: string) => {
        switch (type?.toLowerCase()) {
            case 'view':
            case 'access':
                return 'info';
            case 'update':
                return 'warning';
            case 'add':
            case 'create':
            case 'activate':
                return 'success';
            case 'delete':
            case 'revoke':
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
                        My Access History
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
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, color: '#09B135' }}>
                            <AccountCircleIcon sx={{ mr: 1, color: '#09B135' }} />
                            <Typography variant="h5" component="h2">
                                EHR Access Log
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
                                    No history records found.
                                </Typography>
                            </Box>
                        ) : (
                            <TableContainer component={Paper} elevation={0} variant="outlined">
                                <Table sx={{ minWidth: 650 }}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Doctor</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Timestamp</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Transaction Hash</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {historyData.map((record: any, index) => (
                                            <TableRow
                                                key={index}
                                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                            >
                                                <TableCell>
                                                    <Chip
                                                        label={record.type || 'Unknown'}
                                                        color={getTypeColor(record.type) as any}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                </TableCell>
                                                <TableCell>{record.doctorId || 'System'}</TableCell>
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

export default PatientHistory;
