import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { useTheme } from '@mui/material/styles';

// Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LogoutIcon from '@mui/icons-material/ExitToApp';
//import PersonIcon from '@mui/icons-material/Person';
import AssignmentIcon from '@mui/icons-material/Assignment';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';

const drawerWidth = 240;

const DoctorDashboard = () => {
  const [doctorName, setDoctorName] = useState("");
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [pendingAppointments, setPendingAppointments] = useState(0);
  const [completedAppointments, setCompletedAppointments] = useState(0);
  const [medicalHistory, setMedicalHistory] = useState(null);
  const [rescheduledAppointments, setRescheduledAppointments] = useState(0);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    const fetchDoctorData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await fetch(
          "https://localhost:7166/api/Doctors/GetLoggedInDoctorName",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();
        setDoctorName(data.fullName);
      } catch (error) {
        console.error("Error fetching doctor data:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctorData();
  }, []);

  useEffect(() => {
    const fetchAppointmentCounts = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await fetch("https://localhost:7166/api/Doctors/GetDoctorAppointmentCounts",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();
        setTotalAppointments(data.totalAppointments);
        setPendingAppointments(data.pendingAppointments);
        setRescheduledAppointments(data.rescheduledAppointments);
        setCompletedAppointments(data.completedAppointments);
      } catch (error) {
        console.error("Error fetching appointment counts:", error);
        setError(error.message);
      }
    };

    fetchAppointmentCounts();
  }, []);

  useEffect(() => {
    const fetchTodayAppointments = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await fetch("https://localhost:7166/api/Doctors/GetTodayAppointments",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();
        console.log(data);
        const sortedAppointments = data.sort((a, b) => {
          const timeA = new Date(a.appointmentTime);
          const timeB = new Date(b.appointmentTime);
          return timeA - timeB;
        });
  
        setTodayAppointments(sortedAppointments);
      } catch (error) {
        console.error("Error fetching today's appointments:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTodayAppointments();
  }, []);

  const fetchSymptomsForAppointment = async (appointmentId) => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`https://localhost:7166/api/Appointments/${appointmentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log(data);  
      return data.symptoms;
     
    } catch (error) {
      console.error('Error fetching symptoms:', error);
      setError(error.message);
      return [];  
    } finally {
      setIsLoading(false);
    }
  };

  const handlePatientClick = async (appointment) => {
    console.log('Selected patient:', appointment);  
    console.log('Patient ID:', appointment.patientId);
    setSelectedPatient(appointment);
    
    const symptoms = await fetchSymptomsForAppointment(appointment.appointmentId);
    setSelectedPatient((prev) => ({
      ...prev,
      symptoms: symptoms,
    }));
    await fetchMedicalHistory(appointment.patientId);
  };
 
  const handleAddPrescription = () => {
    if (selectedPatient) {
      navigate('/prescription', {
        state: {
          patientName: selectedPatient.patientName,
          symptoms: selectedPatient.symptoms,
          doctorName: doctorName,
          medicalHistory: medicalHistory,
          appointmentId: selectedPatient.appointmentId
          
        }
      });
    } else {
      console.log("No patient selected");
    }
  };
  const fetchMedicalHistory = async (patientId) => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
  
      const url = `https://localhost:7166/api/MedicalHistoryFiles/patient/${patientId}`;
      console.log('Fetching medical history from:', url);
      console.log('Token:', token);
  
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', response.status, errorText);
        throw new Error(`Network response was not ok: ${response.status} ${errorText}`);
      }
  
      const data = await response.json();
      console.log('Received medical history:', data);
      setMedicalHistory(data);
    } catch (error) {
      console.error('Error fetching medical history:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout =() => {
localStorage.removeItem('token');
navigate('/login');

  };
  const StatCard = ({ title, value, color }) => (
    <Card sx={{ height: '100%', backgroundColor: color }}>
      <CardContent>
        <Typography variant="h3" component="div" sx={{ mb: 2, color: 'white' }}>
          {value}
        </Typography>
        <Typography variant="h6" sx={{ color: 'white' }}>
          {title}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* App Bar */}
      <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
        <Toolbar>
        <MedicalServicesIcon sx={{ mr: 2 }} />
                  <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Medical Dashboard
          </Typography>
          <IconButton color="inherit" onClick={() => {
            localStorage.removeItem('token');
            navigate('/login');
          }}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', mt: 2 }}>
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
              {doctorName?.charAt(0) || 'D'}
            </Avatar>
            <Typography variant="h6">Dr. {doctorName}</Typography>
          </Box>
          <Divider sx={{ my: 2 }} />
          <List>
            <ListItem button selected>
              <ListItemIcon><DashboardIcon /></ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItem>
            <ListItem button onClick={() => navigate('/doctorAppointment')}>
            <ListItemIcon><CalendarTodayIcon /></ListItemIcon>
              <ListItemText primary="Appointments" />
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        
        {/* Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Appointments"
              value={totalAppointments}
              color={theme.palette.primary.main}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Pending Appointments"
              value={pendingAppointments}
              color={theme.palette.warning.main}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Completed Appointments"
              value={completedAppointments}
              color={theme.palette.success.main}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Rescheduled Appointments"
              value={rescheduledAppointments}
              color={theme.palette.info.main}
            />
          </Grid>
        </Grid>

        {/* Today's Appointments and Patient Details */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Today's Appointments
              </Typography>
              {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Alert severity="error">{error}</Alert>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Patient Name</TableCell>
                        <TableCell>Time</TableCell>
                        <TableCell>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {todayAppointments
                        .filter(appointment => appointment.status === "Pending")
                        .map((appointment) => (
                          <TableRow key={appointment.appointmentId}>
                            <TableCell>{appointment.patientName}</TableCell>
                            <TableCell>{appointment.appointmentTime}</TableCell>
                            <TableCell>
                              <Button
                                variant="contained"
                                size="small"
                                onClick={() => handlePatientClick(appointment)}
                              >
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Patient Details
              </Typography>
              {selectedPatient ? (
                <Box>
                  <Typography variant="h5" sx={{ mb: 2 }}>
                    {selectedPatient.patientName}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    Symptoms: {selectedPatient.symptoms || 'No symptoms recorded'}
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={handleAddPrescription}
                    startIcon={<AssignmentIcon />}
                  >
                    Add Prescription
                  </Button>
                </Box>
              ) : (
                <Typography color="textSecondary">
                  Select a patient to view details
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Medical History Section */}
        {selectedPatient && medicalHistory && (
          <Paper sx={{ mt: 3, p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Medical History
            </Typography>
            <Grid container spacing={2}>
              {Object.entries({
                'Chronic Conditions': medicalHistory.HasChronicConditions ? medicalHistory.ChronicConditions : 'None',
                'Allergies': medicalHistory.HasAllergies ? medicalHistory.Allergies : 'None',
                'Medications': medicalHistory.TakesMedications ? medicalHistory.Medications : 'None',
                'Surgeries': medicalHistory.HadSurgeries ? medicalHistory.Surgeries : 'None',
                'Family History': medicalHistory.HasFamilyHistory ? medicalHistory.FamilyHistory : 'None',
                'Lifestyle Factors': medicalHistory.HasLifestyleFactors ? medicalHistory.LifestyleFactors : 'None',
                'Vaccination Records': medicalHistory.VaccinationRecords || 'Not available'
              }).map(([key, value]) => (
                <Grid item xs={12} sm={6} key={key}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="subtitle1" color="primary" gutterBottom>
                        {key}
                      </Typography>
                      <Typography variant="body2">
                        {value}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default DoctorDashboard;