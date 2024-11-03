import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, X, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
//import logo from '/public/images/Logo2.png';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const DoctorsPage = () => {
  const [showNewDoctorForm, setShowNewDoctorForm] = useState(false);
  const [showEditDoctorForm, setShowEditDoctorForm] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [newDoctor, setNewDoctor] = useState({
    fullName: '',
    phoneNo: '',
    email: '',
    password: '',
    designation: '',
    experience: '',
    specializationID: '',
    specializationName: '',
    qualification: '',
    adminId: '' // Added adminId
  });
  const [editDoctor, setEditDoctor] = useState({
    doctorId: '',
    fullName: '',
    phoneNo: '',
    email: '',
    designation: '',
    experience: '',
    specializationID: '',
    specializationName: '',
    qualification: '',
    adminId: '' // Added adminId
  });
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState(''); // State for search term
  const [specializationFilter, setSpecializationFilter] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctors = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch('https://localhost:7166/api/Doctors', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Error fetching doctors: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Fetched doctors:', data);
        setDoctors(data);
        setFilteredDoctors(data);
      } catch (error) {
        console.error(error);
        setErrorMessage('Failed to fetch doctors. Please try again later.');
      }
    };

    const fetchSpecializations = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch('https://localhost:7166/api/Specializations', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Error fetching specializations: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Fetched specializations:', data);
        setSpecializations(data);
      } catch (error) {
        console.error(error);
        setErrorMessage('Failed to fetch specializations. Please try again later.');
      }
    };

    fetchDoctors();
    fetchSpecializations();
  }, [navigate]);

  const handleInputChange = (e) => {
    setNewDoctor({ ...newDoctor, [e.target.name]: e.target.value });
  };

  const handleEditInputChange = (e) => {
    setEditDoctor({ ...editDoctor, [e.target.name]: e.target.value });
  };

  const handleBackClick = () => {
    navigate('/admin');  
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    setErrorMessage('');
  
    const doctorData = {
      doctorId: 0,
      fullName: newDoctor.fullName,
      phoneNo: newDoctor.phoneNo,
      email: newDoctor.email,
      password: newDoctor.password,
      designation: newDoctor.designation,
      experience: parseInt(newDoctor.experience) || 0,
      specializationID: parseInt(newDoctor.specializationID) || 0,
      specializationName: newDoctor.specializationName,
      qualification: newDoctor.qualification,
      adminId: parseInt(newDoctor.adminId) || 0, // Ensure adminId is a number
    };
  
    try {
      const response = await fetch('https://localhost:7166/api/Doctors', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(doctorData),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error adding doctor');
      }
  
      const addedDoctor = await response.json();
      console.log('Added doctor:', addedDoctor);
      setDoctors([...doctors, addedDoctor]);
      setFilteredDoctors([...filteredDoctors, addedDoctor]);
      setNewDoctor({
        fullName: '',
        phoneNo: '',
        email: '',
        password: '',
        designation: '',
        experience: '',
        specializationID: '',
        specializationName: '',
        qualification: '',
        adminId: '' // Reset adminId
      });
      setShowNewDoctorForm(false);
      window.location.reload();
    } catch (error) {
      console.error('Error adding doctor:', error);
      setErrorMessage(error.message || 'Failed to add doctor. Please try again.');
    }
  };
  
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    setErrorMessage('');
  
    // Ensure doctorId is retrieved from the form input
    if (!editDoctor.doctorId) {
      setErrorMessage('Doctor ID is required for editing.');
      return;
    }
  
    const doctorData = {
      // Use the correct doctorId from the editDoctor state
      doctorId: parseInt(editDoctor.doctorId) || 0,
      fullName: editDoctor.fullName,
      phoneNo: editDoctor.phoneNo,
      email: editDoctor.email,
      designation: editDoctor.designation,
      experience: parseInt(editDoctor.experience) || 0,
      specializationID: parseInt(editDoctor.specializationID) || 0,
      specializationName: editDoctor.specializationName, 
      qualification: editDoctor.qualification,
      adminId: parseInt(editDoctor.adminId) || 0,
      password: editDoctor.password || '', // Send password if provided
    };
  
    try {
      // Send PUT request with the doctorId in the URL
      const response = await fetch(`https://localhost:7166/api/Doctors/${editDoctor.doctorId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(doctorData),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error updating doctor');
      }
  
      // Update the local state with the edited doctor
      setDoctors(
        doctors.map((doc) =>
          doc.doctorId === editDoctor.doctorId ? { ...doc, ...doctorData } : doc
        )
      );
      setFilteredDoctors(
        filteredDoctors.map((doc) =>
          doc.doctorId === editDoctor.doctorId ? { ...doc, ...doctorData } : doc
        )
      );
      setShowEditDoctorForm(false);
      setEditDoctor({
        doctorId: '',
        fullName: '',
        phoneNo: '',
        email: '',
        designation: '',
        experience: '',
        specializationID: '',
        specializationName: '',
        qualification: '',
        adminId: '',
        password: '' // Reset password in edit form
      });
    } catch (error) {
      console.error('Error updating doctor:', error.message); 
      setErrorMessage(error.message || 'Failed to update doctor. Please try again.');
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    // Log the entered search term and specialization filter
    console.log("Search Term:", value);
    console.log("Specialization Filter:", specializationFilter);

    const filtered = doctors.filter(doctor => {
        // Log each doctor's specialization for debugging
        console.log("Doctor Specialization:", doctor.specialization?.specializationName);

        // Log each doctor's other details for comparison
        console.log("Doctor Full Name:", doctor.fullName);
        console.log("Doctor Phone No:", doctor.phoneNo);
        console.log("Doctor Email:", doctor.email);
        
        // Perform the filtering logic
        const isMatchingSearch = doctor.fullName.toLowerCase().includes(value.toLowerCase()) ||
                                 doctor.phoneNo.includes(value) ||
                                 doctor.email.toLowerCase().includes(value.toLowerCase());

        const isMatchingSpecialization = specializationFilter ? doctor.specialization?.specializationName === specializationFilter : true;

        // Log whether the doctor matches the search term and specialization
        console.log("Matches Search Term:", isMatchingSearch);
        console.log("Matches Specialization:", isMatchingSpecialization);

        // Return the final filter result
        return isMatchingSearch && isMatchingSpecialization;
    });

    // Log the final filtered list
    console.log("Filtered Doctors:", filtered);

    setFilteredDoctors(filtered);
};

  
  const handleSpecializationFilterChange = (event) => {
    setSpecializationFilter(event.target.value);
  
    // Trigger the search filter again based on updated specialization
    const filtered = doctors.filter(doctor => 
      (doctor.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
       doctor.phoneNo.includes(searchTerm) ||
       doctor.email.toLowerCase().includes(searchTerm)) &&
      (event.target.value 
        ? doctor.specializationID === parseInt(event.target.value) // Correctly compare specializationID
        : true)
    );
  
    setFilteredDoctors(filtered);
  };
  
  

  const handleDelete = async (id) => {
    console.log('Attempting to delete doctor with ID:', id);
    const token = localStorage.getItem('token');
    setErrorMessage('');

    try {
      const response = await fetch(`https://localhost:7166/api/Doctors/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Delete error response:', errorData);
        throw new Error(errorData.message || 'Error deleting doctor');
      }

      setDoctors(doctors.filter((doctor) => doctor.doctorId !== id));
      setFilteredDoctors(filteredDoctors.filter((doctor) => doctor.doctorId !== id));
    } catch (error) {
      console.error('Error deleting doctor:', error);
      setErrorMessage(error.message || 'Failed to delete doctor. Please try again.');
    }
  };
  const generatePDF = () => {
    const doc = new jsPDF();

    // Helper function to add a blue header with the logo and title
    const addHeader = (doc, title, img) => {
        // Blue header background
        doc.setFillColor(0, 122, 255);
        doc.rect(0, 0, 210, 30, 'F');
        doc.addImage(img, 'PNG', 10, 5, 20, 20); // Place the logo (X, Y, Width, Height)
        doc.setFontSize(18);
        doc.setTextColor(255, 255, 255); // White text color for title
        doc.text(title, 40, 20); // Title next to the logo
        doc.setTextColor(0, 0, 0); // Reset text color for the rest of the document
    };

    // Helper function to add contact information
    const addContactInfo = (doc) => {
        doc.setTextColor(100);
        doc.setFontSize(10);
        doc.text('123 Medical Drive, Healthville, HV 12345', 10, 35);
        doc.text('Phone: (555) 123-4567 | Email: info@satyamhospital.com', 10, 40);
        
        // Add horizontal line
        doc.setDrawColor(0, 122, 255);
        doc.setLineWidth(0.5);
        doc.line(10, 45, 200, 45);
    };

    // Load the hospital logo from the public folder
    const logoUrl = 'images/logo.png'; // Path to your logo in the public folder

    // Create an image element to load the logo
    const img = new Image();
    img.src = logoUrl;

    // Once the image is loaded, add it to the PDF
    img.onload = () => {
        // Add header with logo and title
        addHeader(doc, 'Doctors List', img);
        
        // Add contact information below the header
        addContactInfo(doc);

        // Draw a border around the whole page
        doc.setLineWidth(1); // Border thickness
        doc.rect(5, 5, 200, 287); // Border (5mm padding from edges of A4 sheet)

        // Define the table columns
        const columns = ['Doctor ID', 'Full Name', 'Phone No', 'Email', 'Designation', 'Experience', 'Specialization ID', 'Specialization Name', 'Qualification', 'Admin ID'];

        // Map the data to rows, fetching specialization name from specializationID
        const rows = doctors.map((doctor) => {
            const specialization = specializations.find(s => s.specializationID === doctor.specializationID);
            return [
                doctor.doctorId,
                doctor.fullName,
                doctor.phoneNo,
                doctor.email,
                doctor.designation,
                doctor.experience,
                doctor.specializationID,
                specialization ? specialization.specializationName : 'Not available', // Fetch specialization name
                doctor.qualification,
                doctor.adminId,
            ];
        });

        // Add the table to the document
        doc.autoTable({
            head: [columns],
            body: rows,
            startY: 50, // Start the table after the header and contact info
            margin: { left: 10, right: 10 },
            theme: 'grid', // Apply a grid theme
            styles: { lineColor: [0, 122, 255], lineWidth: 0.1 }, // Blue grid lines
            headStyles: { fillColor: [0, 122, 255] }, // Blue header background
        });

        // Save the PDF
        doc.save('doctors_list.pdf');
    };

    img.onerror = () => {
        console.error('Error loading logo image');
    };
};



  
  const handleEditClick = (doctor) => {
    setEditDoctor({ 
      doctorId: doctor.doctorId, 
      fullName: doctor.fullName,
      phoneNo: doctor.phoneNo,
      email: doctor.email,
      designation: doctor.designation,
      experience: doctor.experience,
      specializationID: doctor.specialization ? doctor.specialization.specializationID : '', 
      qualification: doctor.qualification,
      adminId: doctor.adminId || '', 
    });
    setShowEditDoctorForm(true);
  };
  

  const handleDoctorClick = (doctorId) => {
    if (selectedDoctorId === doctorId) {
      setSelectedDoctorId(null); 
    } else {
      setSelectedDoctorId(doctorId); 
    }
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
        <h1 className="text-2xl font-bold">Doctors Management</h1>
        <button
          onClick={() => setShowNewDoctorForm(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <Plus size={20} className="mr-2" />
          Add New Doctor
        </button>
        <button
      onClick={generatePDF}
      className="ml-4 bg-green-500 text-white px-4 py-2 rounded-lg flex items-center"
    >
      Download PDF
    </button>
      </div>
      

      {errorMessage && (
        <div className="bg-red-200 text-red-800 p-4 rounded mb-4">
          {errorMessage}
        </div>
      )}

<div className="filters mb-4">
        <input 
          type="text" 
          placeholder="Search by name, phone, or email" 
          value={searchTerm} 
          onChange={handleSearchChange} // Use the defined handler here
          className="border rounded-lg w-full px-3 py-2"
        />
      </div>

{showNewDoctorForm && (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
    <div className="bg-white p-8 rounded-lg shadow-xl w-96">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Add New Doctor</h2>
        <button onClick={() => setShowNewDoctorForm(false)}>
          <X size={24} />
        </button>
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="fullName"
          placeholder="Full Name"
          value={newDoctor.fullName}
          onChange={handleInputChange}
          required
          className="border p-2 rounded w-full mb-4"
        />
        <input
          type="text"
          name="phoneNo"
          placeholder="Phone No"
          value={newDoctor.phoneNo}
          onChange={handleInputChange}
          required
          className="border p-2 rounded w-full mb-4"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={newDoctor.email}
          onChange={handleInputChange}
          required
          className="border p-2 rounded w-full mb-4"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={newDoctor.password}
          onChange={handleInputChange}
          required
          className="border p-2 rounded w-full mb-4"
        />
        <input
          type="text"
          name="designation"
          placeholder="Designation"
          value={newDoctor.designation}
          onChange={handleInputChange}
          required
          className="border p-2 rounded w-full mb-4"
        />
        <input
          type="number"
          name="experience"
          placeholder="Experience (years)"
          value={newDoctor.experience}
          onChange={handleInputChange}
          required
          className="border p-2 rounded w-full mb-4"
        />
        <select
          name="specializationID"
          onChange={handleInputChange}
          required
          className="border p-2 rounded w-full mb-4"
        >
          <option value="">Select Specialization</option>
          {specializations.map((spec) => (
            <option key={spec.specializationID} value={spec.specializationID}>
              {spec.specializationName} (ID: {spec.specializationID})
            </option>
          ))}
        </select>
        <input
          type="text"
          name="qualification"
          placeholder="Qualification"
          value={newDoctor.qualification}
          onChange={handleInputChange}
          required
          className="border p-2 rounded w-full mb-4"
        />
        <input
          type="number"
          name="adminId"
          placeholder="Admin ID"
          value={newDoctor.adminId}
          onChange={handleInputChange}
          required
          className="border p-2 rounded w-full mb-4"
        />
        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded-lg"
        >
          Add Doctor
        </button>
      </form>
    </div>
  </div>
)}

{filteredDoctors.length > 0 ? ( 
  <div className="bg-white p-4 rounded-lg shadow-lg">
  {filteredDoctors.map((doctor) => (
    <div
      key={doctor.doctorId}
      className="flex flex-col md:flex-row justify-between p-4 border-b border-gray-300 mb-4 rounded-lg bg-gray-50"
    >
      {/* Doctor Details */}
      <div className="flex flex-col md:flex-row space-y-2 md:space-x-8">
        <span className="text-gray-700 font-semibold cursor-pointer" onClick={() => handleDoctorClick(doctor.doctorId)}>
          {doctor.fullName}
        </span>
        <span className="text-gray-700">Phone: {doctor.phoneNo}</span>
        <span className="text-gray-700">Email: {doctor.email}</span>
        <span className="text-gray-700">Designation: {doctor.designation}</span>
        <span className="text-gray-700">Experience: {doctor.experience}</span>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4 mt-4 md:mt-0">
        <button onClick={() => handleEditClick(doctor)} className="text-blue-500">
          <Edit size={24} />
        </button>
        <button onClick={() => handleDelete(doctor.doctorId)} className="text-red-500">
          <Trash2 size={24} />
        </button>
      </div>

      {/* Detailed View for Selected Doctor */}
      {selectedDoctorId === doctor.doctorId && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg w-full">
          <div><strong>Doctor ID:</strong> {doctor.doctorId}</div>
          <div><strong>Phone No:</strong> {doctor.phoneNo}</div>
          <div><strong>Email:</strong> {doctor.email}</div>
          <div><strong>Designation:</strong> {doctor.designation}</div>
          <div><strong>Experience:</strong> {doctor.experience}</div>
          <div><strong>Specialization:</strong> 
            {specializations.find(s => s.specializationID === doctor.specializationID)?.specializationName || 'Not available'}
          </div>
          <div><strong>Qualification:</strong> {doctor.qualification}</div>
          <div><strong>Admin ID:</strong> {doctor.adminId}</div>
        </div>
      )}
    </div>
  ))}
</div>

) : (
  <p>No doctors found.</p>
)}

      
      {showEditDoctorForm && (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
    <div className="bg-white p-8 rounded-lg shadow-xl w-96">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Edit Doctor</h2>
        <button onClick={() => setShowEditDoctorForm(false)}>
          <X size={24} />
        </button>
      </div>
      <form onSubmit={handleEditSubmit}>
        <input
          type="text"
          id="doctorId"
          name="doctorId"
          value={editDoctor.doctorId}
          readOnly 
        />
        <input
          type="text"
          name="fullName"
          placeholder="Full Name"
          value={editDoctor.fullName}
          onChange={handleEditInputChange}
          required
          className="border p-2 rounded w-full mb-4"
        />
        <input
          type="text"
          name="phoneNo"
          placeholder="Phone No"
          value={editDoctor.phoneNo}
          onChange={handleEditInputChange}
          required
          className="border p-2 rounded w-full mb-4"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={editDoctor.email}
          onChange={handleEditInputChange}
          required
          className="border p-2 rounded w-full mb-4"
        />
        <input
          type="text"
          name="designation"
          placeholder="Designation"
          value={editDoctor.designation}
          onChange={handleEditInputChange}
          required
          className="border p-2 rounded w-full mb-4"
        />
        <input
          type="number"
          name="experience"
          placeholder="Experience (years)"
          value={editDoctor.experience}
          onChange={handleEditInputChange}
          required
          className="border p-2 rounded w-full mb-4"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={editDoctor.password} // Include this in the editDoctor state
          onChange={handleEditInputChange}
          className="border p-2 rounded w-full mb-4"
        />
        <select
          name="specializationID"
          value={editDoctor.specializationID} // Set the current value
          onChange={handleEditInputChange}
          required
          className="border p-2 rounded w-full mb-4"
        >
          <option value="">Select Specialization</option>
          {specializations.map((spec) => (
            <option key={spec.specializationID} value={spec.specializationID}>
              {spec.specializationName} (ID: {spec.specializationID})
            </option>
          ))}
        </select>
        <input
          type="text"
          name="qualification"
          placeholder="Qualification"
          value={editDoctor.qualification}
          onChange={handleEditInputChange}
          required
          className="border p-2 rounded w-full mb-4"
        />
        <input
          type="number"
          name="adminId"
          placeholder="Admin ID"
          value={editDoctor.adminId}
          onChange={handleEditInputChange}
          required
          className="border p-2 rounded w-full mb-4"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-lg"
        >
          Update Doctor
        </button>
      </form>
    </div>
  </div>
)}

    </div>
  );
};

export default DoctorsPage;
