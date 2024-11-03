import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ForgotPassword from './ForgotPassword';
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const loginData = {
      email: email,
      password: password
    };

    try {
      const response = await fetch('https://localhost:7166/api/Auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      
      // Determine user role based on email
      let userRole = 'patient'; // default role
      if (email.includes('doctor')) {
        userRole = 'doctor';
      } else if (email.includes('admin')) {
        userRole = 'admin';
      }

      // Store the token, email initial, and user role
      localStorage.setItem('token', data.token);
      localStorage.setItem('userInitial', data.emailInitial || email.charAt(0).toUpperCase());
      localStorage.setItem('userRole', userRole);

      // Determine navigation and message based on role
      const roleConfig = {
        doctor: {
          path: '/doctorDashBoard',
          message: 'Login Successful as Doctor!'
        },
        admin: {
          path: '/admin',
          message: 'Login Successful as Admin!'
        },
        patient: {
          path: '/',
          message: 'Login Successful!'
        }
      };

      const { path, message } = roleConfig[userRole];

      toast.success(message, {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

      navigate(path);
    } catch (err) {
      console.error('Error during login:', err);
      toast.error(err.message || 'Invalid credentials', {
        position: 'top-right',
        autoClose: 3000,
      });
      setError(err.message || 'Invalid credentials');
    }
  };
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-semibold text-center text-gray-700 mb-6">Login</h2>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email:
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password:
            </label>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="showPassword"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
              className="mr-2"
            />
            <label htmlFor="showPassword" className="text-sm text-gray-600">Show Password</label>
          </div>
          <div className="mt-4 text-center">
  <p className="text-sm text-gray-600">
    <Link to="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
      Forgot Password?
    </Link>
  </p>
</div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" className="w-full bg-indigo-500 text-white font-bold py-2 px-4 rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50">
            Login
          </button>
        </form>
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            New user? <Link to="/patient-registration" className="font-medium text-indigo-600 hover:text-indigo-500">Register here</Link>
          </p>
        </div>
      </div>
      <button
        onClick={() => navigate('/')}
        className="mt-4 bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
      >
        Go Back to Home
      </button>
      <ToastContainer />
    </div>
  );
};

export default Login;