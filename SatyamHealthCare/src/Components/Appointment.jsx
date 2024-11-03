import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import { ToastContainer, toast } from 'react-toastify';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-toastify/dist/ReactToastify.css';

// Material-UI imports
import {
  Container,
  Paper,
  Typography,
  TextField,
  Select,
  MenuItem,
  Button,
  Grid,
  Box,
  InputLabel,
  FormControl,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Alert,
  styled
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Custom styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
}));

const TimeButton = styled(Button)(({ theme, selected, isBooked }) => ({
  width: '100%',
  padding: theme.spacing(1.5),
  backgroundColor: selected 
    ? theme.palette.success.light 
    : isBooked 
      ? theme.palette.grey[300]
      : theme.palette.background.paper,
  color: selected 
    ? theme.palette.common.white 
    : isBooked 
      ? theme.palette.text.disabled 
      : theme.palette.text.primary,
  '&:hover': {
    backgroundColor: isBooked 
      ? theme.palette.grey[300] 
      : selected 
        ? theme.palette.success.main 
        : theme.palette.primary.light,
  },
  '&.Mui-disabled': {
    backgroundColor: theme.palette.grey[300],
    color: theme.palette.text.disabled,
  }
}));

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#2196f3',
    },
  },
});

const Appointment = () => {
  // Existing state declarations remain the same
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [bookedTimes, setBookedTimes] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [symptoms, setSymptoms] = useState('');
  const navigate = useNavigate();
  const searchRef = useRef(null);

  // Your existing constants
  const times = ['10:00 AM', '11:00 AM', '12:00 PM', '01:30 PM', '02:15 PM', '03:00 PM', '04:30 PM', '05:00 PM', '06:15 PM'];
  const specializations = [
    'Dental',
    'Cardiology',
    'Pediatric',
    'Nephrology',
    'Neurology',
    'Cancer',
    'Radiology',
    'Orthopedic'
  ];


  useEffect(() => {
    fetchDoctors();
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    filterDoctors();
  }, [searchTerm, selectedDepartment, doctors]);

  const handleClickOutside = (event) => {
    if (searchRef.current && !searchRef.current.contains(event.target)) {
      setShowSuggestions(false);
    }
  };

  const fetchDoctors = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://localhost:7166/api/Doctors/Getting All Doctors', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch doctors');
      }
      const data = await response.json();
      
      setDoctors(data);
    } catch (err) {
    setError('Failed to fetch doctors. Please try again.');
      toast.error('Failed to fetch doctors. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };  

  const filterDoctors = () => {
    console.log('Filtering doctors. Selected department:', selectedDepartment);
    console.log('All doctors:', doctors); 
    let filtered = doctors;

    if (selectedDepartment) {
        filtered = filtered.filter(doctor => {
           
            
            return doctor.specialization && doctor.specialization.specializationName === selectedDepartment;
        });
    }

    if (searchTerm) {
        filtered = filtered.filter(doctor =>
            doctor.fullName.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

   
    setFilteredDoctors(filtered);
};


  const handleBack = () => {
    navigate('/'); 
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    setSearchTerm(doctor.fullName);
    setShowSuggestions(false);
  };
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setShowSuggestions(true);
    setSelectedDoctor(null);
  };
  const handleDepartmentChange = (e) => {
    const department = e.target.value;
    setSelectedDepartment(department);
  };
  const isTimeBooked = (date, time) => {
    const dateString = date.toDateString();
    return bookedTimes[dateString] && bookedTimes[dateString].includes(time);
  };

  const convertTo24Hour = (time12h) => {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    hours = Number(hours);
    if (modifier === 'AM' && hours === 12) {
      hours = 0;
    }
    if (modifier === 'PM' && hours < 12) {
      hours += 12;
    }
    return `${String(hours).padStart(2, '0')}:${minutes}:00`;
  };

  const getPatientIdFromToken = (token) => {
    if (!token) return null;
    try {
      const base64Payload = token.split('.')[1];
      const payload = atob(base64Payload);
      const decodedPayload = JSON.parse(payload);
      const currentTime = Math.floor(Date.now() / 1000);
      if (decodedPayload.exp && decodedPayload.exp < currentTime) {
        console.warn('Token has expired');
        return null;
      }
      return decodedPayload.PatientId || null;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  const bookAppointment = async () => {
    if (!selectedDate || !selectedTime || !selectedDoctor || !symptoms) {
      alert('Please select a date, time, doctor and fill the symptoms field');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const appointmentDate = new Date(Date.UTC(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate()
    ));

      const appointmentTime = convertTo24Hour(selectedTime);
      const token = localStorage.getItem('token');
      const patientId = getPatientIdFromToken(token);
      const appointmentData = {
        appointmentDate: appointmentDate.toISOString().split('T')[0],
        appointmentTime: appointmentTime,
        doctorId: selectedDoctor.doctorId,
        patientId: parseInt(patientId),
        symptoms :symptoms,
        status: 0
      };
      console.log('Sending appointment data:', appointmentData);

      const response = await fetch('https://localhost:7166/api/Appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(appointmentData),
      });

      if (!response.ok) {
        throw new Error('Failed to book appointment');
      }

      setBookedTimes(prev => {
        const dateString = selectedDate.toDateString();
        return {
          ...prev,
          [dateString]: [...(prev[dateString] || []), selectedTime]
        };
      });
      toast.success('Appointment booked successfully!');
      setSelectedTime(null);
      setSelectedDoctor(null);
    } catch (err) {
      setError(err.message);
      toast.error('Slot is already booked. Please select another time slot.');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <StyledPaper elevation={3}>
          <Typography variant="h4" component="h1" gutterBottom align="center" color="primary">
            Book an Appointment
          </Typography>

          <Box sx={{ mb: 4 }} ref={searchRef}>
            <TextField
              fullWidth
              label="Search for doctors"
              variant="outlined"
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={() => setShowSuggestions(true)}
            />
            {showSuggestions && filteredDoctors.length > 0 && (
              <Paper sx={{ mt: 1, maxHeight: 200, overflow: 'auto' }}>
                <List>
                  {filteredDoctors.map((doctor) => (
                    <ListItem
                      button
                      key={doctor.doctorId}
                      onClick={() => handleDoctorSelect(doctor)}
                    >
                      <ListItemText 
                        primary={doctor.fullName}
                        secondary={doctor.specialization ? doctor.specialization.name : 'Unknown'}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            )}
          </Box>

          <FormControl fullWidth sx={{ mb: 4 }}>
            <InputLabel>Department</InputLabel>
            <Select
              value={selectedDepartment}
              onChange={handleDepartmentChange}
              label="Department"
            >
              <MenuItem value="">All Departments</MenuItem>
              {specializations.map((spec) => (
                <MenuItem key={spec} value={spec}>{spec}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              dateFormat="yyyy-MM-dd"
              minDate={new Date()}
              customInput={
                <TextField
                  label="Select Date"
                  variant="outlined"
                  fullWidth
                />
              }
            />
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 4 }}>
              {error}
            </Alert>
          )}

          {selectedDate && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom align="center">
                Available Time Slots
              </Typography>
              <Grid container spacing={2}>
                {times.map((time) => (
                  <Grid item xs={12} sm={4} key={time}>
                    <TimeButton
                      variant="contained"
                      selected={selectedTime === time}
                      isBooked={isTimeBooked(selectedDate, time)}
                      onClick={() => !isTimeBooked(selectedDate, time) && handleTimeSelect(time)}
                      disabled={isTimeBooked(selectedDate, time)}
                    >
                      {time}
                    </TimeButton>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Symptoms"
            variant="outlined"
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            sx={{ mb: 4 }}
          />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={bookAppointment}
              disabled={isLoading || !selectedDate || !selectedTime || !selectedDoctor}
              startIcon={isLoading && <CircularProgress size={20} color="inherit" />}
            >
              {isLoading ? 'Booking...' : 'Confirm Appointment'}
            </Button>

            <Button
              variant="outlined"
              color="secondary"
              size="large"
              onClick={handleBack}
            >
              Go Back
            </Button>
          </Box>
        </StyledPaper>
        <ToastContainer />
      </Container>
    </ThemeProvider>
  );
};

export default Appointment;