import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiFilter, FiCalendar, FiClock, FiUser } from 'react-icons/fi';
// Material UI components
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import FormControl from '@mui/material/FormControl';
import Paper from '@mui/material/Paper';

// Material UI icons
import CalendarMonth from '@mui/icons-material/CalendarMonth';
import AccessTime from '@mui/icons-material/AccessTime';
import Person from '@mui/icons-material/Person';
import FilterList from '@mui/icons-material/FilterList';
import ArrowBack from '@mui/icons-material/ArrowBack';

// Styled components
import { styled } from '@mui/material/styles';
import RescheduleModal from '../RescheduleModal';
const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
  },
}));

const DoctorAppointment = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterOption, setFilterOption] = useState('all');
  const times = ['10:00 AM', '11:00 AM', '12:00 PM', '01:30 PM', '02:15 PM', '03:00 PM', '04:30 PM', '05:00 PM', '06:15 PM'];


  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    handleFilter();
  }, [filterOption]);

  const fetchAppointments = async () => {
    try {
      const response = await fetch('https://localhost:7166/api/Appointments', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }

      const data = await response.json();
      
      if (data.length === 0) {
        setAppointments([]);
        setFilteredAppointments([]);
        setError(null);
        setIsLoading(false);
        return;
      }

      setAppointments(data);
      setFilteredAppointments(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError(error.message);
      setIsLoading(false);
    }
  };

  const openRescheduleModal = (appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  const handleReschedule = async () => {
    if (!selectedAppointment || !newDate || !newTime) {
      alert('Please select a date and time to reschedule.');
      return;
    }
    
    try {
      await rescheduleAppointment(selectedAppointment.appointmentId, newDate, newTime);
      setIsModalOpen(false);
      setNewDate('');
      setNewTime('');
      await fetchAppointments();
    } catch (error) {
      console.error('Error during rescheduling:', error);
      alert('Failed to reschedule appointment. Please try again.');
    }
  };

  const rescheduleAppointment = async (appointmentId, newDate, newTime) => {
    setIsLoading(true);
    setError(null);
    try {
      const rescheduleData = {
        AppointmentId: appointmentId,
        NewAppointmentDate: newDate,
        NewAppointmentTime: convertTo24Hour(newTime),
      };

      const response = await fetch('https://localhost:7166/api/Appointments/reschedule', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(rescheduleData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error('Failed to reschedule appointment: ' + errorData.errors);
      }

      alert('Appointment rescheduled successfully!');
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const convertTo24Hour = (timeString) => {
    const [time, modifier] = timeString.split(' ');
    let [hours, minutes] = time.split(':');
    hours = parseInt(hours, 10);
    
    if (modifier === 'PM' && hours !== 12) {
      hours += 12;
    } else if (modifier === 'AM' && hours === 12) {
      hours = 0;
    }
    
    hours = hours.toString().padStart(2, '0');
    return `${hours}:${minutes}:00`;
  };

  const handleFilter = () => {
    let filtered = [...appointments];

    switch(filterOption) {
      case 'all':
        filtered = appointments;
        break;
      case 'date':
        if (startDate && endDate) {
          filtered = appointments.filter(appointment => {
            const appointmentDate = new Date(appointment.appointmentDate);
            const start = new Date(startDate);
            const end = new Date(endDate);
            appointmentDate.setHours(0, 0, 0, 0);
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
            return appointmentDate >= start && appointmentDate <= end;
          });
        }
        break;
      case 'Pending':
        filtered = appointments.filter(appointment => 
          appointment.status.toLowerCase() === 'pending'
        );
        break;
      case 'Rescheduled':
        filtered = appointments.filter(appointment => 
          appointment.status.toLowerCase() === 'rescheduled'
        );
        break;
      default:
        filtered = appointments;
    }

    setFilteredAppointments(filtered);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'sucess';
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'info';
      case 'rescheduled':
        return 'warning';
      default:
        return 'error';
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.100', py: 4 }}>
      <Container maxWidth="lg">
        <Paper elevation={3} sx={{ p: 4, bgcolor: 'background.paper' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h4" component="h1" color="primary">
              Appointments
            </Typography>
            <Button
              variant="contained"
              startIcon={<ArrowBack />}
              onClick={() => navigate('/doctorDashBoard')}
            >
              Go Back
            </Button>
          </Box>

          <Paper sx={{ p: 2, mb: 4 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel id="filter-label">Filter Appointments</InputLabel>
                <Select
                  labelId="filter-label"
                  value={filterOption}
                  label="Filter Appointments"
                  onChange={(e) => setFilterOption(e.target.value)}
                  startAdornment={<FilterList sx={{ mr: 1 }} />}
                >
                  <MenuItem value="all">Get All Appointments</MenuItem>
                  <MenuItem value="date">Sort by Date Range</MenuItem>
                  <MenuItem value="Pending">Pending Appointments</MenuItem>
                  <MenuItem value="Rescheduled">Rescheduled Appointments</MenuItem>
                </Select>
              </FormControl>

              {filterOption === 'date' && (
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                  <TextField
                    type="date"
                    label="Start Date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    type="date"
                    label="End Date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleFilter}
                  >
                    Filter
                  </Button>
                </Box>
              )}
            </Box>
          </Paper>

          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
          ) : filteredAppointments.length > 0 ? (
            <Grid container spacing={3}>
              {filteredAppointments.map((appointment) => (
                <Grid item xs={12} sm={6} md={4} key={appointment.appointmentId}>
                  <StyledCard>
                    <CardHeader
                      avatar={
                        <IconButton>
                          <Person />
                        </IconButton>
                      }
                      title={appointment.patientName}
                      sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}
                    />
                    <CardContent>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarMonth color="primary" />
                          <Typography>
                            {new Date(appointment.appointmentDate).toLocaleDateString()}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AccessTime color="primary" />
                          <Typography>{appointment.appointmentTime}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                          <Chip
                            label={appointment.status}
                            color={getStatusColor(appointment.status)}
                          />
                          {appointment.status.toLowerCase() === 'pending' && (
                            <Button
                              variant="contained"
                              onClick={() => openRescheduleModal(appointment)}
                            >
                              Reschedule
                            </Button>
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </StyledCard>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Alert severity="info" sx={{ my: 2 }}>
              No appointments found.
            </Alert>
          )}
        </Paper>
      </Container>

      {isModalOpen && (
        <RescheduleModal
          appointment={selectedAppointment}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onReschedule={handleReschedule}
          newDate={newDate}
          setNewDate={setNewDate}
          newTime={newTime}
          setNewTime={setNewTime}
          times={times}
        />
      )}
    </Box>
  );
};

export default DoctorAppointment;