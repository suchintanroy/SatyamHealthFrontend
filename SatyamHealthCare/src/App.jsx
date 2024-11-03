import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './Components/NavBar/Navbar';
import Footer from './Components/Footer/Footer';
import { AuthProvider } from './Components/AuthContext';
import Home from './Components/Home/Home';
import About from './Components/About';
import Terms from './Components/Terms';
import Department from './Components/Home/Department';
import Appointment from './Components/Appointment';
import AppointmentsPage from './Components/AdminPart/AppointmentsPage';
import DoctorsPage from './Components/AdminPart/Doctorspage';
import MedicalRecordPage from './Components/AdminPart/medicalrecordpage';
import PatientPage from './Components/AdminPart/PatientPage';
import PatientRegistration from './Components/PatientRegistration';
import UserProfile from './Components/UserProfile';
import Login from './Components/Login';
import DoctorDashBoard from './Components/DoctorPart/DoctorDashBoard';
import Admin from './Components/AdminPart/Admin';
import DoctorAppointment from './Components/DoctorPart/DoctorAppointment';
import Prescription from './Components/DoctorPart/Prescription';
import MedicalHistory from './Components/MedicalHistory';
import ForgotPassword from './Components/ForgotPassword';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(userRole)) {
    toast.error("You don't have permission to access this page", {
      position: 'top-right',
      autoClose: 3000,
    });
    return <Navigate to="/" replace />;
  }

  return children;
};

// Layout Component (unchanged)
const Layout = ({ children }) => {
  const location = useLocation();
  const noNavbarRoutes = ['/appointment', '/login'];
  const noFooterRoutes = ['/appointment', '/login'];

  const showNavbar = !noNavbarRoutes.includes(location.pathname);
  const showFooter = !noFooterRoutes.includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen">
      {showNavbar && <Navbar />}
      <main className="flex-grow">{children}</main>
      {showFooter && <Footer />}
    </div>
  );
};

const App = () => {
  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/patient-registration" element={<PatientRegistration />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Protected Doctor Routes */}
        <Route path="/doctorDashBoard" element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <DoctorDashBoard />
          </ProtectedRoute>
        } />
        <Route path="/doctorAppointment" element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <DoctorAppointment />
          </ProtectedRoute>
        } />
        <Route path="/prescription" element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <Prescription />
          </ProtectedRoute>
        } />

        {/* Protected Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Admin />
          </ProtectedRoute>
        } />
        <Route path="/appointmentPage" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AppointmentsPage />
          </ProtectedRoute>
        } />
        <Route path="/pat" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <PatientPage />
          </ProtectedRoute>
        } />
        <Route path="/medicalrecords" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <MedicalRecordPage />
          </ProtectedRoute>
        } />
        <Route path="/doctors" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DoctorsPage />
          </ProtectedRoute>
        } />

        {/* Protected Patient Routes */}
        <Route path="/appointment" element={
          <ProtectedRoute allowedRoles={['patient']}>
            <Appointment />
          </ProtectedRoute>
        } />
        <Route path="/medicalhistory" element={
          <ProtectedRoute allowedRoles={['patient']}>
            <MedicalHistory />
          </ProtectedRoute>
        } />
        <Route path="/myprofile" element={
          <ProtectedRoute allowedRoles={['patient', 'doctor', 'admin']}>
            <UserProfile />
          </ProtectedRoute>
        } />

        {/* Routes with Layout */}
        <Route
          path="*"
          element={
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/department" element={<Department />} />
                <Route path="/terms" element={<Terms />} />
              </Routes>
            </Layout>
          }
        />
      </Routes>
      <ToastContainer />
    </>
  );
};

const WrappedApp = () => (
  <Router>
    <AuthProvider>
      <App />
    </AuthProvider>
  </Router>
);

export default WrappedApp;