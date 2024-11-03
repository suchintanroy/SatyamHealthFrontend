import React, { useState, useEffect } from 'react';
import { Calendar, Bell, User, LogOut, Users, CheckSquare, Menu } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Admin = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [totalPatients, setTotalPatients] = useState(0);
  const [totalDoctors, setTotalDoctors] = useState(0);
  const [topAppointments, setTopAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointmentCountsByStatus, setAppointmentCountsByStatus] = useState({});
  const [showTooltip, setShowTooltip] = useState(false);

  const navigate = useNavigate();

  const toggleDarkMode = () => setDarkMode(!darkMode);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token found. Please log in.');
        }

        const appointmentResponse = await fetch('https://localhost:7166/api/Appointments', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!appointmentResponse.ok) {
          const errorText = await appointmentResponse.text();
          throw new Error(`Failed to fetch appointments: ${appointmentResponse.statusText} - ${errorText}`);
        }
        const appointmentData = await appointmentResponse.json();
        setTotalAppointments(appointmentData.length);

        const counts = appointmentData.reduce((acc, appointment) => {
          const status = appointment.status || 'Unknown';
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {});
        setAppointmentCountsByStatus(counts);

        const today = new Date().toISOString().split('T')[0];
        const todayAppointments = appointmentData.filter(appointment => {
          return appointment.appointmentDate && appointment.appointmentDate.split('T')[0] === today;
        }).slice(0, 3);
        setTopAppointments(todayAppointments);

        const patientResponse = await fetch('https://localhost:7166/api/Patients', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!patientResponse.ok) {
          const errorText = await patientResponse.text();
          throw new Error(`Failed to fetch patients: ${patientResponse.statusText} - ${errorText}`);
        }
        const patientData = await patientResponse.json();
        setTotalPatients(patientData.length);
        setPatients(patientData);

        const doctorResponse = await fetch('https://localhost:7166/api/Doctors', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!doctorResponse.ok) {
          const errorText = await doctorResponse.text();
          throw new Error(`Failed to fetch doctors: ${doctorResponse.statusText} - ${errorText}`);
        }
        const doctorData = await doctorResponse.json();
        setTotalDoctors(doctorData.length);
        setDoctors(doctorData);

      } catch (error) {
        console.error(error);
        if (error.message.includes('No token found')) {
          navigate('/login');
        } else if (error.message.includes('Unauthorized')) {
          navigate('/login');
        }
      }
    };

    fetchData();
  }, [navigate]);

  const navItems = [
    { icon: <Calendar size={20} />, label: 'Dashboard', link: '/admin' },
    { icon: <Users size={20} />, label: 'Doctors', link: '/doctors' },
    { icon: <User size={20} />, label: 'Patients', link: '/pat' },
    { icon: <Calendar size={20} />, label: 'Appointments', link: '/appointmentPage' },
    { icon: <CheckSquare size={20} />, label: 'Medical Records', link: '/medicalrecords' },
    { icon: <LogOut size={20} />, label: 'Logout', onClick: handleLogout }, // Added onClick
  ];

  return (
    <div className={`flex flex-col lg:flex-row h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100'}`}>
      <div className={`lg:w-64 bg-blue-800 text-white p-6 ${sidebarOpen ? 'block' : 'hidden'} lg:block`}>
        <h1 className="text-2xl font-bold mb-8">Satyam</h1>
        <nav>
          {navItems.map((item) => (
            <div key={item.label} onClick={item.onClick} className="cursor-pointer">
              <Link to={item.link || '#'}>
                <div className="flex items-center mb-4 hover:bg-blue-700 p-2 rounded" onClick={() => setSidebarOpen(false)}>
                  {item.icon}
                  <span className="ml-2">{item.label}</span>
                </div>
              </Link>
            </div>
          ))}
        </nav>
      </div>

      <div className="flex-1 p-4 lg:p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <button className="lg:hidden" onClick={toggleSidebar}>
            <Menu size={24} />
          </button>
          <h2 className="text-2xl font-bold">Welcome, Admin!</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <div
            className="bg-[#ecf39e] p-6 rounded-lg shadow relative cursor-pointer"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <div className="flex justify-between items-center">
              <Calendar size={24} />
              <span className="text-2xl font-bold">{totalAppointments}</span>
            </div>
            <div className="mt-2">Total Appointments</div>

            {showTooltip && (
              <div className="absolute top-full left-0 w-full bg-white shadow-lg rounded-md p-2 text-black mt-2">
                {Object.entries(appointmentCountsByStatus).map(([status, count]) => (
                  <div key={status} className="flex justify-between">
                    <span>{status}:</span>
                    <span>{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-[#9dd9d2] text-gray-800 p-6 rounded-lg shadow">
            <div className="flex justify-between items-center">
              <User size={24} />
              <span className="text-2xl font-bold">{totalPatients}</span>
            </div>
            <div className="mt-2">Total Patients</div>
          </div>

          <div className="bg-[#faedcd] text-gray-800 p-6 rounded-lg shadow">
            <div className="flex justify-between items-center">
              <Users size={24} />
              <span className="text-2xl font-bold">{totalDoctors}</span>
            </div>
            <div className="mt-2">Total Doctors</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Manage Appointments</h3>
              <Link to="/appointmentPage">
                <button className="text-blue-500 hover:underline">See All</button>
              </Link>
            </div>
            <ul>
              {topAppointments.length > 0 ? (
                topAppointments.map((appointment, index) => (
                  <li key={index} className="flex justify-between mb-2">
                    <span>{appointment.patientName} - {appointment.appointmentDate} {appointment.appointmentTime}</span>
                    <span className={`font-bold ${appointment.status === 'cancelled' ? 'text-red-500' : 'text-green-500'}`}>
                      {appointment.status}
                    </span>
                  </li>
                ))
              ) : (
                <li>No appointments for today.</li>
              )}
            </ul>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Manage Patients</h3>
              <Link to="/pat">
                <button className="text-blue-500 hover:underline">See All</button>
              </Link>
            </div>
            <ul>
              {patients.length > 0 ? (
                patients.slice(0, 3).map((patient, index) => (
                  <li key={index} className="flex justify-between mb-2">
                    <span>{patient.fullName}</span>
                    <span className="">{patient.email}</span>
                  </li>
                ))
              ) : (
                <li>No patients available.</li>
              )}
            </ul>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Manage Doctors</h3>
              <Link to="/doctors">
                <button className="text-blue-500 hover:underline">See All</button>
              </Link>
            </div>
            <ul>
              {doctors.length > 0 ? (
                doctors.slice(0, 3).map((doctor, index) => (
                  <li key={index} className="flex justify-between mb-2">
                    <span>{doctor.fullName}</span>
                    <span className="font-bold">{doctor.email}</span>
                  </li>
                ))
              ) : (
                <li>No doctors available.</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
