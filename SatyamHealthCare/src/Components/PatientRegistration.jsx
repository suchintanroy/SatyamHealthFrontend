import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PatientRegistration = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    contactNumber: '',
    email: '',
    address: '',
    pincode: '',
    city: '',
    state: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('https://localhost:7166/api/Patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const data = await response.json();
      console.log(data);
      toast.success('Registration Successful!', {
        
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      navigate("/login");
    } catch (err) {
      console.error('Error during registration:', err);
      toast.error(err.message || 'Registration failed', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      setError(err.message || 'Registration failed');
    }
  };

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent";
  const labelClass = "block text-gray-700 text-sm font-semibold mb-2";

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-md p-8">
        <h2 className="text-3xl font-bold text-center text-indigo-600 mb-8">Patient Registration</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className={labelClass} htmlFor="fullName">Full Name</label>
                <input id="fullName" name="fullName" type="text" value={formData.fullName} onChange={handleChange} className={inputClass} required />
              </div>
              <div>
                <label className={labelClass} htmlFor="dateOfBirth">Date of Birth</label>
                <input id="dateOfBirth" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} className={inputClass} required />
              </div>
              <div>
                <label className={labelClass} htmlFor="gender">Gender</label>
                <select id="gender" name="gender" value={formData.gender} onChange={handleChange} className={inputClass} required>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className={labelClass} htmlFor="bloodGroup">Blood Group</label>
                <input id="bloodGroup" name="bloodGroup" type="text" value={formData.bloodGroup} onChange={handleChange} className={inputClass} required />
              </div>
              <div>
                <label className={labelClass} htmlFor="contactNumber">Contact Number</label>
                <input id="contactNumber" name="contactNumber" type="tel" value={formData.contactNumber} onChange={handleChange} className={inputClass} required />
              </div>
              <div>
                <label className={labelClass} htmlFor="email">Email</label>
                <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} className={inputClass} required />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className={labelClass} htmlFor="address">Address</label>
                <textarea id="address" name="address" value={formData.address} onChange={handleChange} className={`${inputClass} h-24`} required />
              </div>
              <div>
                <label className={labelClass} htmlFor="pincode">Pincode</label>
                <input id="pincode" name="pincode" type="text" value={formData.pincode} onChange={handleChange} className={inputClass} required />
              </div>
              <div>
                <label className={labelClass} htmlFor="city">City</label>
                <input id="city" name="city" type="text" value={formData.city} onChange={handleChange} className={inputClass} required />
              </div>
              <div>
                <label className={labelClass} htmlFor="state">State</label>
                <input id="state" name="state" type="text" value={formData.state} onChange={handleChange} className={inputClass} required />
              </div>
              <div>
                <label className={labelClass} htmlFor="password">Password</label>
                <input id="password" name="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={handleChange} className={inputClass} required />
              </div>
              <div className="flex items-center">
                <input type="checkbox" id="showPassword" checked={showPassword} onChange={() => setShowPassword(!showPassword)} className="mr-2" />
                <label htmlFor="showPassword" className="text-sm text-gray-600">Show Password</label>
              </div>
            </div>
          </div>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          <div className="flex justify-between items-center mt-6">
            <button type="submit" className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition duration-300">
              Register
            </button>
            <Link to="/login" className="text-sm text-indigo-600 hover:text-indigo-800 transition duration-300">
              Already have an account? Login here
            </Link>
          </div>
        </form>
      </div>
      <button
        onClick={() => navigate('/')}
        className="mt-4 bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition duration-300"
      >
        Go Back to Home
      </button>
      <ToastContainer />
    </div>
  );
};

export default PatientRegistration;
