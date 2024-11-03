import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, X, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PatientPage = () => {
  const [showNewPatientForm, setShowNewPatientForm] = useState(false);
  const [showEditPatientForm, setShowEditPatientForm] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showPatientDetails, setShowPatientDetails] = useState(false);
  const [patients, setPatients] = useState([]);
  const [newPatient, setNewPatient] = useState({
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
    password: ''
  });
  const [editPatient, setEditPatient] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState('');
  const navigate = useNavigate();

  // Fetch patients data from the database
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const token = localStorage.getItem('token'); // Retrieve the token from localStorage
        const response = await fetch('https://localhost:7166/api/Patients', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Include the token in the request headers
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch patients');
        }

        const data = await response.json();
        setPatients(data);
      } catch (error) {
        console.error('Error fetching patients:', error);
        setNotification('Error fetching patients: ' + error.message);
      }
    };

    fetchPatients();
  }, []);

  const handleInputChange = (e) => {
    setNewPatient({ ...newPatient, [e.target.name]: e.target.value });
  };

  const handleEditInputChange = (e) => {
    setEditPatient({ ...editPatient, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPatient.fullName || !newPatient.dateOfBirth || !newPatient.gender || !newPatient.bloodGroup || 
        !newPatient.contactNumber || !newPatient.password) {
      setNotification('Please fill in all required fields.');
      return;
    }
    const response = await fetch('https://localhost:7166/api/Patients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPatient)
    });

    if (response.ok) {
      const addedPatient = await response.json();
      // Update local state with the new patient
      setPatients([...patients, addedPatient]);
      setNewPatient({
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
        password: ''
      });
      setShowNewPatientForm(false);
      setNotification('Patient added successfully!');
    } else {
      setNotification('Error adding patient: ' + (await response.text()));
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editPatient.fullName || !editPatient.dateOfBirth || !editPatient.gender || !editPatient.bloodGroup || 
        !editPatient.contactNumber || !editPatient.password) {
      setNotification('Please fill in all required fields.');
      return;
    }

    const response = await fetch(`https://localhost:7166/api/Patients/${editPatient.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editPatient)
    });

    if (response.ok) {
      const updatedPatient = await response.json();
      // Update local state with the updated patient
      setPatients(
        patients.map((patient) =>
          patient.id === updatedPatient.id ? updatedPatient : patient
        )
      );
      setShowEditPatientForm(false);
      setEditPatient(null);
      setNotification('Patient details updated successfully!');
    } else {
      setNotification('Error updating patient: ' + (await response.text()));
    }
  };

  const handleDeleteClick = (patient) => {
    setSelectedPatient(patient);
    setShowDeleteConfirmation(true);
  };

  const handleDelete = async () => {
    if (selectedPatient && selectedPatient.patientID) {
      const token = localStorage.getItem('token'); // Retrieve the token from localStorage
      try {
        const response = await fetch(`https://localhost:7166/api/Patients/${selectedPatient.patientID}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Include the token in the request headers
          }
        });
        if (response.ok) {
          // Update local state to remove deleted patient
          setPatients(patients.filter((patient) => patient.patientID !== selectedPatient.patientID));
          setNotification('Patient deleted successfully!');
        } else {
          setNotification('Error deleting patient: ' + (await response.text()));
        }
      } catch (error) {
        console.error('Error deleting patient:', error);
        setNotification('Error deleting patient: ' + error.message);
      } finally {
        setShowDeleteConfirmation(false);
        setSelectedPatient(null);
      }
    } else {
      console.error('No patient selected for deletion.');
      setNotification('No patient selected for deletion.');
    }
  };
  
  const filteredPatients = patients.filter(patient => 
    (patient.fullName && patient.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (patient.email && patient.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Function to handle displaying patient details
  const handlePatientClick = (patient) => {
    setSelectedPatient(patient);
    setShowPatientDetails(true);
  };
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
        <h1 className="text-2xl font-bold">Patients Management</h1>
        <button
          onClick={() => setShowNewPatientForm(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <Plus size={20} className="mr-2" />
          Add New Patient
        </button>
      </div>

      {notification && <div className="mb-4 text-green-600">{notification}</div>}

      {showNewPatientForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-xl w-96">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add New Patient</h2>
              <button onClick={() => setShowNewPatientForm(false)}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              {/* Input fields for new patient */}
              <input type="text" name="fullName" value={newPatient.fullName} onChange={handleInputChange} placeholder="Full Name" className="w-full p-2 mb-4 border rounded" required />
              <input type="date" name="dateOfBirth" value={newPatient.dateOfBirth} onChange={handleInputChange} className="w-full p-2 mb-4 border rounded" required />
              <input type="text" name="gender" value={newPatient.gender} onChange={handleInputChange} placeholder="Gender" className="w-full p-2 mb-4 border rounded" required />
              <input type="text" name="bloodGroup" value={newPatient.bloodGroup} onChange={handleInputChange} placeholder="Blood Group" className="w-full p-2 mb-4 border rounded" required />
              <input type="text" name="contactNumber" value={newPatient.contactNumber} onChange={handleInputChange} placeholder="Contact Number" className="w-full p-2 mb-4 border rounded" required />
              <input type="email" name="email" value={newPatient.email} onChange={handleInputChange} placeholder="Email" className="w-full p-2 mb-4 border rounded" />
              <input type="text" name="address" value={newPatient.address} onChange={handleInputChange} placeholder="Address" className="w-full p-2 mb-4 border rounded" />
              <input type="text" name="pincode" value={newPatient.pincode} onChange={handleInputChange} placeholder="Pincode" className="w-full p-2 mb-4 border rounded" />
              <input type="text" name="city" value={newPatient.city} onChange={handleInputChange} placeholder="City" className="w-full p-2 mb-4 border rounded" />
              <input type="text" name="state" value={newPatient.state} onChange={handleInputChange} placeholder="State" className="w-full p-2 mb-4 border rounded" />
              <input type="password" name="password" value={newPatient.password} onChange={handleInputChange} placeholder="Password" className="w-full p-2 mb-4 border rounded" required />
              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg">Add Patient</button>
            </form>
          </div>
        </div>
      )}

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name or email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="bg-white p-4 rounded-lg shadow-lg">
  {filteredPatients.map((patient) => (
    <div
      key={patient.patientID}
      className="flex items-center justify-between p-4 border-b border-gray-300 mb-4 rounded-lg bg-gray-50"
    >
      {/* Patient Details */}
      <div className="flex space-x-8">
        <span className="font-semibold text-lg cursor-pointer text-blue-500" onClick={() => handlePatientClick(patient)}>
          {patient.fullName}
        </span>
        <span className="text-gray-500">DOB: {patient.dateOfBirth}</span>
        <span className="text-gray-500">Gender: {patient.gender}</span>
        <span className="text-gray-500">Contact: {patient.contactNumber}</span>
        <span className="text-gray-500">Email: {patient.email}</span>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button onClick={() => { setEditPatient(patient); setShowEditPatientForm(true); }} className="text-blue-500">
          <Edit size={24} />
        </button>
        <button onClick={() => handleDeleteClick(patient)} className="text-red-500">
          <Trash2 size={24} />
        </button>
      </div>
    </div>
  ))}
</div>



      {showEditPatientForm && editPatient && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-xl w-96">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit Patient</h2>
              <button onClick={() => { setShowEditPatientForm(false); setEditPatient(null); }}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit}>
              {/* Input fields for editing patient */}
              <input type="text" name="fullName" value={editPatient.fullName} onChange={handleEditInputChange} className="w-full p-2 mb-4 border rounded" required />
              <input type="date" name="dateOfBirth" value={editPatient.dateOfBirth} onChange={handleEditInputChange} className="w-full p-2 mb-4 border rounded" required />
              <input type="text" name="gender" value={editPatient.gender} onChange={handleEditInputChange} className="w-full p-2 mb-4 border rounded" required />
              <input type="text" name="bloodGroup" value={editPatient.bloodGroup} onChange={handleEditInputChange} className="w-full p-2 mb-4 border rounded" required />
              <input type="text" name="contactNumber" value={editPatient.contactNumber} onChange={handleEditInputChange} className="w-full p-2 mb-4 border rounded" required />
              <input type="email" name="email" value={editPatient.email} onChange={handleEditInputChange} className="w-full p-2 mb-4 border rounded" />
              <input type="text" name="address" value={editPatient.address} onChange={handleEditInputChange} className="w-full p-2 mb-4 border rounded" />
              <input type="text" name="pincode" value={editPatient.pincode} onChange={handleEditInputChange} className="w-full p-2 mb-4 border rounded" />
              <input type="text" name="city" value={editPatient.city} onChange={handleEditInputChange} className="w-full p-2 mb-4 border rounded" />
              <input type="text" name="state" value={editPatient.state} onChange={handleEditInputChange} className="w-full p-2 mb-4 border rounded" />
              <input type="password" name="password" value={editPatient.password} onChange={handleEditInputChange} className="w-full p-2 mb-4 border rounded" required />
              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg">Update Patient</button>
            </form>
          </div>
        </div>
      )}

      {showDeleteConfirmation && selectedPatient && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-xl w-96">
            <h2 className="text-xl font-bold mb-4">Delete Confirmation</h2>
            <p>Are you sure you want to delete {selectedPatient.fullName}?</p>
            <div className="flex justify-between mt-6">
              <button onClick={handleDelete} className="bg-red-500 text-white px-4 py-2 rounded-lg">Delete</button>
              <button onClick={() => setShowDeleteConfirmation(false)} className="bg-gray-300 px-4 py-2 rounded-lg">Cancel</button>
            </div>
          </div>
        </div>
      )}

{showPatientDetails && selectedPatient && (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
    <div className="bg-white p-8 rounded-lg shadow-xl w-96">
      <h2 className="text-xl font-bold mb-4">Patient Details</h2>
      <p><strong>Patient ID:</strong> {selectedPatient.patientID}</p> {/* Display Patient ID */}
      <p><strong>Full Name:</strong> {selectedPatient.fullName}</p>
      <p><strong>Date of Birth:</strong> {selectedPatient.dateOfBirth}</p>
      <p><strong>Gender:</strong> {selectedPatient.gender}</p>
      <p><strong>Blood Group:</strong> {selectedPatient.bloodGroup}</p>
      <p><strong>Contact Number:</strong> {selectedPatient.contactNumber}</p>
      <p><strong>Email:</strong> {selectedPatient.email}</p>
      <p><strong>Address:</strong> {selectedPatient.address}</p>
      <p><strong>Pincode:</strong> {selectedPatient.pincode}</p>
      <p><strong>City:</strong> {selectedPatient.city}</p>
      <p><strong>State:</strong> {selectedPatient.state}</p>
      <div className="flex justify-between mt-6">
        <button onClick={() => setShowPatientDetails(false)} className="bg-gray-300 px-4 py-2 rounded-lg">Close</button>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default PatientPage;
