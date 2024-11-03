import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ConfirmationModel from './ConfirmModel';
import RescheduleModal from './RescheduleModal';
import PrescriptionPDFGenerator from './PrescriptionPdfGenerator';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
} from '@mui/material';

const AppointmentHistory = () => {
  const [appointments, setAppointments] = useState([]);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [appointmentToReschedule, setAppointmentToReschedule] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const times = ['10:00 AM', '11:00 AM', '12:00 PM', '01:30 PM', '02:15 PM', '03:00 PM', '04:30 PM', '05:00 PM', '06:15 PM'];

  useEffect(() => {
    fetchAppointmentHistory();
  }, []);

  const handleCancelClick = (appointmentId) => {
    setAppointmentToCancel(appointmentId);
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    try {
      const response = await fetch(`https://localhost:7166/api/Appointments/${appointmentToCancel}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to cancel appointment');
      
      const result = await response.json();
      toast.success(result.message || 'Appointment canceled successfully!');
      fetchAppointmentHistory();
      setShowCancelModal(false);
    } catch (error) {
      toast.error(`Error: ${error.message}`);
      setShowCancelModal(false);
    }
  };

  const handleRescheduleClick = (appointment) => {
    setAppointmentToReschedule(appointment);
    setShowRescheduleModal(true);
  };

  const handleConfirmReschedule = async () => {
    if (!newDate || !newTime) {
      toast.warn('Please select a new date and time');
      return;
    }

    try {
      const rescheduleData = {
        AppointmentId: appointmentToReschedule.appointmentId,
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

      toast.success('Appointment rescheduled successfully!');
      fetchAppointmentHistory();
      setShowRescheduleModal(false);
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    }
  };

  const fetchAppointmentHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('https://localhost:7166/api/Appointments/patient/appointments', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch appointment history');
      
      const data = await response.json();
      setAppointments(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const convertTo24Hour = (timeString) => {
    const [time, modifier] = timeString.split(' ');
    let [hours, minutes] = time.split(':');
    if (modifier === 'PM' && hours !== '12') hours = parseInt(hours, 10) + 12;
    if (modifier === 'AM' && hours === '12') hours = '00';
    return `${hours}:${minutes}:00`;
  };

  return (
    <div style={{ padding: '16px' }}>
      <Typography variant="h5" gutterBottom>
        Appointment History
      </Typography>
      {isLoading ? (
        <Typography variant="body1" align="center">Loading...</Typography>
      ) : error ? (
        <Typography variant="body1" color="error" align="center">{error}</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Doctor</TableCell>
                <TableCell>Status</TableCell>
                <TableCell style={{ paddingRight: '32px' }}>Action</TableCell>
                <TableCell>Prescription</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appointments.map((appointment, index) => (
                <TableRow key={index}>
                  <TableCell>{appointment.appointmentDate}</TableCell>
                  <TableCell>{appointment.appointmentTime}</TableCell>
                  <TableCell>{appointment.doctorName}</TableCell>
                  <TableCell>{appointment.status}</TableCell>
                  <TableCell>
                    {appointment.status === 'Pending' && (
                      <>
                        <Button
                          variant="contained"
                          color="error"
                          style={{ marginRight: '8px' }}
                          onClick={() => handleCancelClick(appointment.appointmentId)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleRescheduleClick(appointment)}
                        >
                          Reschedule
                        </Button>
                        <ConfirmationModel
                          show={showCancelModal}
                          onClose={() => setShowCancelModal(false)}
                          onConfirm={handleConfirmCancel}
                        />
                      </>
                    )}
                  </TableCell>
                  <TableCell>
                    {appointment.status === 'Completed' && (
                      <PrescriptionPDFGenerator appointmentId={appointment.appointmentId} />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <RescheduleModal
        isOpen={showRescheduleModal}
        onClose={() => setShowRescheduleModal(false)}
        onReschedule={handleConfirmReschedule}
        times={times}
        newDate={newDate}
        newTime={newTime}
        setNewDate={setNewDate}
        setNewTime={setNewTime}
      />
      <ToastContainer />
    </div>
  );
};

export default AppointmentHistory;
