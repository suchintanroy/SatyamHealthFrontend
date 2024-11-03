import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, X, ArrowLeft } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import jsPDF from 'jspdf';
import 'jspdf-autotable';


const MedicalRecordPage = () => {
  const [showNewRecordForm, setShowNewRecordForm] = useState(false);
  const [showEditRecordForm, setShowEditRecordForm] = useState(false);
  const [showRecordDetails, setShowRecordDetails] = useState(false);
  const [records, setRecords] = useState([]);
  const [newRecord, setNewRecord] = useState({
    patientID: '',
    doctorID: '',
    diagnosis: '',
    prescriptionID: '',
    medicalHistoryId: '',
  });
  const [editRecord, setEditRecord] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // New state variables for details
  const [patientDetails, setPatientDetails] = useState(null);
  const [doctorDetails, setDoctorDetails] = useState(null);
  const [prescriptionDetails, setPrescriptionDetails] = useState(null);
  const [medicalHistoryDetails, setMedicalHistoryDetails] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecords = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('You are not authorized. Please log in.');
        return;
      }
      try {
        const response = await fetch('https://localhost:7166/api/MedicalRecords', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch records');
        }
        const data = await response.json();
        setRecords(data);
      } catch (error) {
        toast.error(error.message);
      }
    };
    fetchRecords();
  }, []);

  

  const handleBackClick = () => {
    navigate('/admin');  
  };

  const handleInputChange = (e) => {
    setNewRecord({ ...newRecord, [e.target.name]: e.target.value });
  };

  const handleEditInputChange = (e) => {
    setEditRecord({ ...editRecord, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newRecord.patientID || !newRecord.doctorID || !newRecord.diagnosis || !newRecord.prescriptionID || !newRecord.medicalHistoryId) {
      toast.error('Please fill in all required fields.');
      return;
    }
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('https://localhost:7166/api/MedicalRecords', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newRecord),
      });
      if (!response.ok) {
        throw new Error('Failed to add medical record');
      }
      const addedRecord = await response.json();
      setRecords([...records, addedRecord]);
      setNewRecord({
        patientID: '',
        doctorID: '',
        diagnosis: '',
        prescriptionID: '',
        medicalHistoryId: '',
      });
      setShowNewRecordForm(false);
      toast.success('Medical record added successfully!');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editRecord.patientID || !editRecord.doctorID || !editRecord.diagnosis || !editRecord.prescriptionID || !editRecord.medicalHistoryId) {
      toast.error('Please fill in all required fields.');
      return;
    }
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`https://localhost:7166/api/MedicalRecords/${editRecord.recordID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(editRecord),
      });
      if (!response.ok) {
        throw new Error('Failed to update medical record');
      }
      setRecords((prevRecords) =>
        prevRecords.map((record) =>
          record.recordID === editRecord.recordID ? { ...record, ...editRecord } : record
        )
      );
      setShowEditRecordForm(false);
      setEditRecord(null);
      toast.success('Medical record updated successfully!');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`https://localhost:7166/api/MedicalRecords/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to delete medical record');
      }
      setRecords(records.filter((record) => record.recordID !== id));
      toast.success('Medical record deleted successfully!');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleEditClick = (record) => {
    setEditRecord({ ...record });
    setShowEditRecordForm(true);
  };

  const handleRecordClick = (record) => {
    setSelectedRecord(record);
    fetchAdditionalDetails(record);
    setShowRecordDetails(true);
  };

  const handleCloseDetails = () => {
    setShowRecordDetails(false);
    setSelectedRecord(null);
    setPatientDetails(null);
    setDoctorDetails(null);
    setPrescriptionDetails(null);
    setMedicalHistoryDetails(null);
  };

  const handleDownload = () => {
    console.log("Patient Details:", patientDetails);
    console.log("Doctor Details:", doctorDetails);
    console.log("Prescription Details:", prescriptionDetails);
    console.log("Medical History Details:", medicalHistoryDetails);
    downloadPDF(patientDetails, doctorDetails, prescriptionDetails, medicalHistoryDetails);
};

  
const downloadPDF = (patientDetails, doctorDetails, prescriptionDetails, medicalHistoryDetails) => {
  const doc = new jsPDF();

  // Helper function to add a blue header with the logo and title
  const addHeader = (doc, title, img) => {
    // Blue letterhead background
    doc.setFillColor(63, 81, 181);
    doc.rect(0, 0, 210, 20, 'F');
    doc.addImage(img, 'PNG', 10, 0, 20, 20); // Logo
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255); // White text color for title
    doc.text(title, 40, 13); // Title next to the logo
    doc.setTextColor(0, 0, 0); // Reset text color to black
  };

  // Helper function to add contact information
  const addContactInfo = (doc) => {
    doc.setTextColor(100);
    doc.setFontSize(10);
    doc.text('123 Medical Drive, Healthville, HV 12345', 10, 25);
    doc.text('Phone: (555) 123-4567 | Email: info@satyamhospital.com', 10, 30);
    
    // Add horizontal line
    doc.setDrawColor(63, 81, 181);
    doc.setLineWidth(0.5);
    doc.line(10, 40, 200, 40);
  };

  // Helper function to draw a border around the page
  const addBorder = (doc) => {
    doc.setLineWidth(0.5); // Border thickness
    doc.rect(5, 0, 200, 287); // Border with 5mm padding from the edges
  };

  // Load the hospital logo
  const logoUrl = 'images/logo.png';
  const img = new Image();
  img.src = logoUrl;

  img.onload = () => {
    // First page: Patient Details
    addHeader(doc, 'Patient Details', img);
    addContactInfo(doc);
    addBorder(doc);

    if (patientDetails) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Patient Information:', 10, 50);

      doc.setFont('helvetica', 'normal');
      doc.text(`Patient ID: ${patientDetails.patientID}`, 10, 60);
      doc.text(`Full Name: ${patientDetails.fullName}`, 10, 70);
      doc.text(`Date of Birth: ${patientDetails.dateOfBirth}`, 10, 80);
      doc.text(`Gender: ${patientDetails.gender}`, 10, 90);
      doc.text(`Blood Group: ${patientDetails.bloodGroup}`, 10, 100);
      doc.text(`Contact Number: ${patientDetails.contactNumber}`, 10, 110);
      doc.text(`Email: ${patientDetails.email}`, 10, 120);
      doc.text(`Address: ${patientDetails.address}`, 10, 130);
      doc.text(`Pincode: ${patientDetails.pincode}`, 10, 140);
      doc.text(`City: ${patientDetails.city}`, 10, 150);
      doc.text(`State: ${patientDetails.state}`, 10, 160);
    } else {
      doc.text('No patient details available.', 10, 50);
    }

    // Second page: Doctor Details
    doc.addPage();
    addHeader(doc, 'Doctor Details', img);
    addContactInfo(doc);
    addBorder(doc);

    if (doctorDetails) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Doctor Information:', 10, 50);

      doc.setFont('helvetica', 'normal');
      doc.text(`Doctor ID: ${doctorDetails.doctorId}`, 10, 60);
      doc.text(`Name: ${doctorDetails.fullName}`, 10, 70);
      doc.text(`Specialization: ${doctorDetails.specialization.specializationName}`, 10, 80);
      doc.text(`Designation: ${doctorDetails.designation}`, 10, 90);
      doc.text(`Email: ${doctorDetails.email}`, 10, 110);
    } else {
      doc.text('No doctor details available.', 10, 50);
    }

    // Third page: Prescription Details
    doc.addPage();
    addHeader(doc, 'Prescription Details', img);
    addContactInfo(doc);
    addBorder(doc);

    if (prescriptionDetails) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Prescription Information:', 10, 50);

      doc.setFont('helvetica', 'normal');
      doc.text(`Prescription ID: ${prescriptionDetails.prescriptionID}`, 10, 60);
      
      // Loop through the medicines array to display details
      let yOffset = 70;
      prescriptionDetails.medicines.forEach((medicine, index) => {
        doc.text(`Medicine ${index + 1}:`, 10, yOffset);
        doc.text(`  - Medicine ID: ${medicine.medicineID}`, 10, yOffset + 10);
        doc.text(`  - Dosage: ${medicine.dosage} ${medicine.dosageUnit}`, 10, yOffset + 20);
        doc.text(`  - Frequency: ${medicine.dosageFrequency}`, 10, yOffset + 30);
        doc.text(`  - Duration (Days): ${medicine.noOfDays}`, 10, yOffset + 40);
        doc.text(`  - Before/After Food: ${medicine.beforeAfterFood}`, 10, yOffset + 50);
        yOffset += 60; // Move down for the next medicine
      });

      // Add remark/notes
      doc.text(`Notes: ${prescriptionDetails.remark || 'No remarks'}`, 10, yOffset);
    } else {
      doc.text('No prescription details available.', 10, 50);
    }

    // Fourth page: Medical History Details
    doc.addPage();
    addHeader(doc, 'Medical History Details', img);
    addContactInfo(doc);
    addBorder(doc);

    if (medicalHistoryDetails) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Medical History:', 10, 50);

      doc.setFont('helvetica', 'normal');
      doc.text(`Medical History ID: ${medicalHistoryDetails.medicalHistoryId}`, 10, 60);
      doc.text(`Chronic Conditions: ${medicalHistoryDetails.chronicConditions}`, 10, 70);
      doc.text(`Medications: ${medicalHistoryDetails.medications}`, 10, 80);
      doc.text(`Surgeries: ${medicalHistoryDetails.surgeries}`, 10, 90);
      doc.text(`Allergies: ${medicalHistoryDetails.allergies}`, 10, 100);
      doc.text(`Family History: ${medicalHistoryDetails.familyHistory}`, 10, 110);
      doc.text(`Lifestyle Factors: ${medicalHistoryDetails.lifestyleFactors}`, 10, 120);
      doc.text(`Vaccination Records: ${medicalHistoryDetails.vaccinationRecords}`, 10, 130);
    } else {
      doc.text('No medical history details available.', 10, 50);
    }

    // Save the PDF
    doc.save('patient-details.pdf');
  };

  img.onerror = () => {
    console.error('Error loading logo image');
  };
};






  const fetchAdditionalDetails = async (record) => {
    const token = localStorage.getItem('token');
    console.log('Token:', token);
    try {
      const patientResponse = await fetch(`https://localhost:7166/api/Patients/admin/${record.patientID}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      console.log('Patient response:', patientResponse);
      if (patientResponse.ok) {
        const patientData = await patientResponse.json();
        setPatientDetails(patientData);
      }

      const doctorResponse = await fetch(`https://localhost:7166/api/Doctors/${record.doctorID}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (doctorResponse.ok) {
        const doctorData = await doctorResponse.json();
        setDoctorDetails(doctorData);
      }

      const prescriptionResponse = await fetch(`https://localhost:7166/api/Prescriptions/${record.prescriptionID}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (prescriptionResponse.ok) {
        const prescriptionData = await prescriptionResponse.json();
        setPrescriptionDetails(prescriptionData);
      }

      const medicalHistoryResponse = await fetch(`https://localhost:7166/api/MedicalHistoryFiles/${record.medicalHistoryId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (medicalHistoryResponse.ok) {
        const medicalHistoryData = await medicalHistoryResponse.json();
        setMedicalHistoryDetails(medicalHistoryData);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const filteredRecords = records.filter(record =>
    (record.patientID?.toString().includes(searchTerm) || searchTerm === '') ||
    (record.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) || searchTerm === '')
  );
  

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
        <h1 className="text-2xl font-bold">Medical Records Management</h1>
        <button
          onClick={() => setShowNewRecordForm(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <Plus size={20} className="mr-2" />
          Add New Record
        </button>
      </div>

      <ToastContainer />

      {showNewRecordForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-xl w-96">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add Medical Record</h2>
              <button onClick={() => setShowNewRecordForm(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="patientID" className="block text-gray-700">Patient ID</label>
                <input
                  type="text"
                  name="patientID"
                  value={newRecord.patientID}
                  onChange={handleInputChange}
                  className="border rounded-lg w-full px-3 py-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="doctorID" className="block text-gray-700">Doctor ID</label>
                <input
                  type="text"
                  name="doctorID"
                  value={newRecord.doctorID}
                  onChange={handleInputChange}
                  className="border rounded-lg w-full px-3 py-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="diagnosis" className="block text-gray-700">Diagnosis</label>
                <input
                  type="text"
                  name="diagnosis"
                  value={newRecord.diagnosis}
                  onChange={handleInputChange}
                  className="border rounded-lg w-full px-3 py-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="prescriptionID" className="block text-gray-700">Prescription ID</label>
                <input
                  type="text"
                  name="prescriptionID"
                  value={newRecord.prescriptionID}
                  onChange={handleInputChange}
                  className="border rounded-lg w-full px-3 py-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="medicalHistoryId" className="block text-gray-700">Medical History ID</label>
                <input
                  type="text"
                  name="medicalHistoryId"
                  value={newRecord.medicalHistoryId}
                  onChange={handleInputChange}
                  className="border rounded-lg w-full px-3 py-2"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-lg w-full"
              >
                Add Record
              </button>
            </form>
          </div>
        </div>
      )}

      {showEditRecordForm && editRecord && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-xl w-96">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit Medical Record</h2>
              <button onClick={() => setShowEditRecordForm(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="mb-4">
                <label htmlFor="patientID" className="block text-gray-700">Patient ID</label>
                <input
                  type="text"
                  name="patientID"
                  value={editRecord.patientID}
                  onChange={handleEditInputChange}
                  className="border rounded-lg w-full px-3 py-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="doctorID" className="block text-gray-700">Doctor ID</label>
                <input
                  type="text"
                  name="doctorID"
                  value={editRecord.doctorID}
                  onChange={handleEditInputChange}
                  className="border rounded-lg w-full px-3 py-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="diagnosis" className="block text-gray-700">Diagnosis</label>
                <input
                  type="text"
                  name="diagnosis"
                  value={editRecord.diagnosis}
                  onChange={handleEditInputChange}
                  className="border rounded-lg w-full px-3 py-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="prescriptionID" className="block text-gray-700">Prescription ID</label>
                <input
                  type="text"
                  name="prescriptionID"
                  value={editRecord.prescriptionID}
                  onChange={handleEditInputChange}
                  className="border rounded-lg w-full px-3 py-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="medicalHistoryId" className="block text-gray-700">Medical History ID</label>
                <input
                  type="text"
                  name="medicalHistoryId"
                  value={editRecord.medicalHistoryId}
                  onChange={handleEditInputChange}
                  className="border rounded-lg w-full px-3 py-2"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-lg w-full"
              >
                Update Record
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by Patient ID or Diagnosis"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border rounded-lg w-full px-3 py-2"
        />
      </div>

      <div className="bg-white p-4 rounded-lg shadow-lg">
  {filteredRecords.map((record) => (
    <div
      key={record.recordID}
      className="flex items-center justify-between p-4 border-b border-gray-300 mb-4 rounded-lg bg-gray-50"
    >
      {/* Record Details */}
      <div className="flex space-x-8">
        <span className="text-gray-700 font-semibold">Patient ID: {record.patientID}</span>
        <span className="text-gray-700">Doctor ID: {record.doctorID}</span>
        <span className="text-gray-700">Diagnosis: {record.diagnosis}</span>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={() => handleRecordClick(record)}
          className="text-blue-500 hover:underline"
        >
          View
        </button>
        <button
          onClick={() => handleEditClick(record)}
          className="text-yellow-500 hover:underline"
        >
          Edit
        </button>
        <button
          onClick={() => handleDelete(record.recordID)}
          className="text-red-500 hover:underline"
        >
          Delete
        </button>
      </div>
    </div>
  ))}
</div>


      {showRecordDetails && selectedRecord && (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
    <div className="bg-white p-8 rounded-lg shadow-xl w-[80vw]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Record Details</h2>
        <button onClick={handleCloseDetails}>
          <X size={20} />
        </button>
      </div>
      <div className="flex flex-wrap justify-between text-sm">
        <div className="w-1/4 mb-4">
          <h3 className="font-semibold">Patient Details</h3>
          {patientDetails ? (
  <div className="border p-2 rounded-lg">
    <p className="text-sm"><strong>Patient ID:</strong> {patientDetails.patientID}</p>
    <p className="text-sm"><strong>Full Name:</strong> {patientDetails.fullName}</p>
    <p className="text-sm"><strong>Date of Birth:</strong> {patientDetails.dateOfBirth}</p>
    <p className="text-sm"><strong>Gender:</strong> {patientDetails.gender}</p>
    <p className="text-sm"><strong>Blood Group:</strong> {patientDetails.bloodGroup}</p>
    <p className="text-sm"><strong>Contact Number:</strong> {patientDetails.contactNumber}</p>
    <p className="text-sm"><strong>Email:</strong> {patientDetails.email}</p>
    <p className="text-sm"><strong>Address:</strong> {patientDetails.address}</p>
    <p className="text-sm"><strong>Pincode:</strong> {patientDetails.pincode}</p>
    <p className="text-sm"><strong>City:</strong> {patientDetails.city}</p>
    <p className="text-sm"><strong>State:</strong> {patientDetails.state}</p>
  </div>
) : (
  <p className="text-sm">No patient details available.</p>
)}
        </div>
        <div className="w-1/4 mb-4">
          <h3 className="font-semibold">Doctor Details</h3>
          {doctorDetails ? (
    <div className="border p-2 rounded-lg">
      <p className="text-sm"><strong>Doctor ID:</strong> {doctorDetails.doctorId}</p>
      <p className="text-sm"><strong>Full Name:</strong> {doctorDetails.fullName}</p>
      <p className="text-sm"><strong>Email:</strong> {doctorDetails.email}</p>
      <p className="text-sm"><strong>Designation:</strong> {doctorDetails.designation}</p>
      <p className="text-sm"><strong>Specialization:</strong> {doctorDetails.specialization.specializationName}</p>
    </div>
  ) : (
    <p className="text-sm">No doctor details available.</p>
  )}
        </div>
<div className="w-1/4 mb-4">
  <h3 className="font-semibold">Prescription Details</h3>
  {prescriptionDetails ? (
    <div className="border p-2 rounded-lg">
      <p className="text-sm"><strong>Prescription ID:</strong> {prescriptionDetails.prescriptionID}</p>
      <p className="text-sm"><strong>Number of Days:</strong> {prescriptionDetails.medicines[0]?.noOfDays || 'N/A'}</p>
      <p className="text-sm"><strong>Dosage:</strong> {prescriptionDetails.medicines[0]?.dosage || 'N/A'}</p>
      <p className="text-sm"><strong>Before/After Food:</strong> {prescriptionDetails.medicines[0]?.beforeAfterFood || 'N/A'}</p>
      <p className="text-sm"><strong>Remark:</strong> {prescriptionDetails.remark}</p>

      <p className="text-sm"><strong>Medicines:</strong> 
        {prescriptionDetails.medicines.length > 0 ? (
          prescriptionDetails.medicines.map((med, index) => (
            <span key={index}>
              {`MedicineID: ${med.medicineID}, Dosage: ${med.dosage} ${med.dosageUnit}, Frequency: ${med.dosageFrequency}, Days: ${med.noOfDays}, Before/After Food: ${med.beforeAfterFood}`}
              <br />
            </span>
          ))
        ) : 'None'}
      </p>

      <p className="text-sm"><strong>Tests:</strong> 
        {prescriptionDetails.testIDs.length > 0 ? prescriptionDetails.testIDs.join(', ') : 'None'}
      </p>
    </div>
  ) : (
    <p className="text-sm">No prescription details available.</p>
  )}
</div>

        <div className="w-1/4 mb-4">
          <h3 className="font-semibold">Medical History Details</h3>
          {medicalHistoryDetails ? (
  <div className="border p-2 rounded-lg">
    <p className="text-sm"><strong>Medical History ID:</strong> {medicalHistoryDetails.medicalHistoryId}</p>
      
    <p className="text-sm"><strong>Has Chronic Conditions:</strong> {medicalHistoryDetails.hasChronicConditions ? 'Yes' : 'No'}</p>
    {medicalHistoryDetails.hasChronicConditions && (
      <p className="text-sm"><strong>Chronic Conditions:</strong> {medicalHistoryDetails.chronicConditions}</p>
    )}

    <p className="text-sm"><strong>Has Allergies:</strong> {medicalHistoryDetails.hasAllergies ? 'Yes' : 'No'}</p>
    {medicalHistoryDetails.hasAllergies && (
      <p className="text-sm"><strong>Allergies:</strong> {medicalHistoryDetails.allergies}</p>
    )}

    <p className="text-sm"><strong>Takes Medications:</strong> {medicalHistoryDetails.takesMedications ? 'Yes' : 'No'}</p>
    {medicalHistoryDetails.takesMedications && (
      <p className="text-sm"><strong>Medications:</strong> {medicalHistoryDetails.medications}</p>
    )}

    <p className="text-sm"><strong>Had Surgeries:</strong> {medicalHistoryDetails.hadSurgeries ? 'Yes' : 'No'}</p>
    {medicalHistoryDetails.hadSurgeries && (
      <p className="text-sm"><strong>Surgeries:</strong> {medicalHistoryDetails.surgeries}</p>
    )}

    <p className="text-sm"><strong>Has Family History:</strong> {medicalHistoryDetails.hasFamilyHistory ? 'Yes' : 'No'}</p>
    {medicalHistoryDetails.hasFamilyHistory && (
      <p className="text-sm"><strong>Family History:</strong> {medicalHistoryDetails.familyHistory}</p>
    )}

    <p className="text-sm"><strong>Has Lifestyle Factors:</strong> {medicalHistoryDetails.hasLifestyleFactors ? 'Yes' : 'No'}</p>
    {medicalHistoryDetails.hasLifestyleFactors && (
      <p className="text-sm"><strong>Lifestyle Factors:</strong> {medicalHistoryDetails.lifestyleFactors}</p>
    )}

    <p className="text-sm"><strong>Vaccination Records:</strong> {medicalHistoryDetails.vaccinationRecords}</p>
  </div>
) : (
  <p className="text-sm">No medical history available.</p>
)}

<button
    onClick={handleDownload}
    style={{
        padding: '10px 20px',
        backgroundColor: '#007bff', 
        color: '#ffffff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '16px',
        transition: 'background-color 0.3s ease'
    }}
    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#0056b3')}
    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#007bff')}
>
    Download PDF
</button>

        </div>
      </div>
    </div>
  </div>
)}


    </div>
  );
};

export default MedicalRecordPage;
