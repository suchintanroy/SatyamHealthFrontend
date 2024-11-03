import React, { useState, useEffect } from 'react';
import { Plus, Edit, ArrowLeft } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';

const AppointmentsPage = () => {
  const [showNewAppointmentForm, setShowNewAppointmentForm] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [doctorMap, setDoctorMap] = useState({});
  const [newAppointment, setNewAppointment] = useState({
    patientId: '',
    doctorId: '',
    appointmentDate: '',
    appointmentTime: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState('');
  const [editingAppointmentId, setEditingAppointmentId] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      toast.error('Unauthorized! Please login.');
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const doctorResponse = await fetch('https://localhost:7166/api/doctors', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!doctorResponse.ok) {
          throw new Error('Failed to fetch doctors');
        }

        const doctorData = await doctorResponse.json();
        console.log('Doctors fetched:', doctorData);
        setDoctors(doctorData);

        const map = {};
        doctorData.forEach((doc) => {
          if (doc.doctorId) {
            map[doc.doctorId] = doc.fullName;
          }
        });
        setDoctorMap(map);

        const appointmentResponse = await fetch('https://localhost:7166/api/appointments', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!appointmentResponse.ok) {
          throw new Error('Failed to fetch appointments');
        }

        const appointmentData = await appointmentResponse.json();
        console.log('Appointments fetched:', appointmentData);
        setAppointments(appointmentData);
      } catch (error) {
        toast.error('Failed to load data');
        console.error(error);
      }
    };

    fetchData();
  }, [token, navigate]);

  const getDoctorNameById = (doctorId) => {
    const doctorName = doctorMap[doctorId];
    if (doctorName) {
      return doctorName;
    }
    console.error(`Doctor not found for ID: ${doctorId}`);
    return 'Unknown Doctor';
  };

  const handleInputChange = (e) => {
    setNewAppointment({ ...newAppointment, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newAppointment.patientId || !newAppointment.doctorId || !newAppointment.appointmentDate || !newAppointment.appointmentTime) {
      setNotification('Please fill in all required fields.');
      return;
    }

    const payload = {
      ...newAppointment,
      appointmentTime: `${newAppointment.appointmentTime}:00`, 
      status: 'Pending', 
    };

    console.log('Submitting appointment:', payload);

    try {
      const response = editingAppointmentId
        ? await fetch(`https://localhost:7166/api/appointments/${editingAppointmentId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          })
        : await fetch('https://localhost:7166/api/appointments', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          });

      if (!response.ok) {
        throw new Error('Failed to create/update appointment');
      }

      const data = await response.json();
      if (editingAppointmentId) {
        setAppointments(appointments.map((appointment) =>
          appointment.appointmentId === editingAppointmentId ? data : appointment
        ));
        setNotification('Appointment updated successfully!');
      } else {
        setAppointments([...appointments, data]);
        setNotification('Appointment added successfully!');
      }

      resetForm();
    } catch (error) {
      toast.error('Failed to add/update appointment');
      console.error(error);
    }
  };

  const resetForm = () => {
    setNewAppointment({
      patientId: '',
      doctorId: '',
      appointmentDate: '',
      appointmentTime: '',
    });
    setShowNewAppointmentForm(false);
    setEditingAppointmentId(null);
  };

  const handleEditClick = (appointment) => {
    setNewAppointment({
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      appointmentDate: appointment.appointmentDate.split('T')[0],
      appointmentTime: appointment.appointmentDate.split('T')[1].substring(0, 5),
    });
    setEditingAppointmentId(appointment.appointmentId);
    setShowNewAppointmentForm(true);
  };

  const handleDelete = async (appointmentId) => {
    const confirmDelete = window.confirm("Are you sure you want to cancel this appointment?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`https://localhost:7166/api/appointments/${appointmentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to cancel appointment');
      }

      setAppointments(appointments.map(appointment =>
        appointment.appointmentId === appointmentId
          ? { ...appointment, status: 'Cancelled' }
          : appointment
      ));

      toast.success('Appointment cancelled successfully!');
    } catch (error) {
      toast.error('Failed to cancel appointment');
      console.error(error);
    }
  };

  const handleAppointmentClick = (appointment) => {
    if (selectedAppointment && selectedAppointment.appointmentId === appointment.appointmentId) {
      setSelectedAppointment(null); 
    } else {
      setSelectedAppointment(appointment); 
    }
  };

  const filteredAppointments = appointments.filter(appointment =>
    (appointment.patientId?.toString().includes(searchTerm) || appointment.patientId?.toString() === undefined) ||
    (getDoctorNameById(appointment.doctorId)?.toLowerCase().includes(searchTerm.toLowerCase()) || getDoctorNameById(appointment.doctorId) === undefined)
  );
  const handleBackClick = () => {
    navigate('/admin');  
  };

  return (
    <div className="p-6">
      <button
        onClick={handleBackClick}
        style={{ 
          marginBottom: '20px', 
          padding: '10px 20px', 
          display: 'flex', 
          alignItems: 'center',
          backgroundColor: '#f0f0f0', 
          border: '1px solid #ccc', 
          borderRadius: '5px'
        }}
      >
        <ArrowLeft size={20} style={{ marginRight: '10px' }} />
        Back
      </button>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Appointments Management</h1>
      </div>

      {notification && <div className="mb-4 text-green-600">{notification}</div>}

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search doctor name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border rounded-lg"
        />
      </div>

      <div className="bg-white p-4 rounded-lg shadow-lg">
  {filteredAppointments.map((appointment) => (
    <div
      key={appointment.appointmentId}
      className="flex items-center justify-between p-4 border-b border-gray-300 mb-4 rounded-lg bg-gray-50"
    >
      {/* Appointment Details */}
      <div className="flex space-x-8">
        <span className="text-gray-700 font-semibold">Patient ID: {appointment.patientId}</span>
        <span className="text-gray-700">Doctor Name: {getDoctorNameById(appointment.doctorId)}</span>
        <span className="text-gray-700">Appointment Date: {new Date(appointment.appointmentDate).toLocaleDateString()}</span>
        <span className="text-gray-700">Time: {new Date(appointment.appointmentDate).toLocaleTimeString()}</span>
        <span className="text-gray-700">Status: {appointment.status}</span>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={() => handleDelete(appointment.appointmentId)}
          className={`text-red-500 hover:text-red-600 ${appointment.status === 'Cancelled' ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={appointment.status === 'Cancelled'}
        >
          Delete
        </button>
      </div>
    </div>
  ))}
</div>


      {selectedAppointment && (
        <div className="mt-6 p-6 bg-gray-100 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Appointment Details</h2>
          <p><strong>Appointment ID:</strong> {selectedAppointment.appointmentId}</p>
          <p><strong>Patient Name:</strong> {selectedAppointment.patientName}</p>
          <p><strong>Symptoms:</strong> {selectedAppointment.symptoms}</p> 
          <p><strong>Doctor Name:</strong> {getDoctorNameById(selectedAppointment.doctorId)}</p>
          <p><strong>Appointment Date:</strong> {new Date(selectedAppointment.appointmentDate).toLocaleDateString()}</p>
          <p><strong>Appointment Time:</strong> {new Date(selectedAppointment.appointmentDate).toLocaleTimeString()}</p>
          <p><strong>Status:</strong> {selectedAppointment.status}</p>
        </div>
      )}

      {showNewAppointmentForm && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-800 bg-opacity-75 z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-6">{editingAppointmentId ? 'Edit Appointment' : 'Add New Appointment'}</h2>
            <form onSubmit={handleSubmit}>
              {/* Form fields */}
            </form>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default AppointmentsPage;
