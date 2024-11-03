import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import Select from 'react-select';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Prescription = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { patientName, symptoms, doctorName, medicalHistory, appointmentId } = location.state || {};

  const [prescriptionData, setPrescriptionData] = useState({
    date: new Date().toISOString().split('T')[0],
    clinic: 'Satyam Hospital',
    patient: patientName || '',
    doctor: doctorName || '',
    selectedMedicines: [],
    selectedTests: [],
    remark: symptoms || '',
    appointmentId: appointmentId || 0,
  });

  const [medicines, setMedicines] = useState([]);
  const [tests, setTests] = useState([]);
  const token = localStorage.getItem('token');
  const componentRef = useRef();

  const frequencyOptions = [
    { value: 'Once a Day', label: 'Once a day' },
    { value: 'Twice a Day', label: 'Twice a day' },
    { value: 'Thrice a Day', label: 'Three times a day' },
    { value: 'Four times a Day', label: 'Four times a day' },
  ];

  const unitOptions = [
    { value: 'mg', label: 'mg' },
    { value: 'ml', label: 'ml' },
    { value: 'tablet', label: 'tablet(s)' },
  ];

  const beforeAfterFoodOptions = [
    { value: 'before Food', label: 'Before Food' },
    { value: 'after Food', label: 'After Food' },
    { value: 'with Food', label: 'With Food' },
  ];

  useEffect(() => {
    const fetchData = async (url, setter) => {
      try {
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch from ${url}`);
        }
        const data = await response.json();
        const formattedData = data.map(item => ({
          value: item.medicineID || item.testID,
          label: item.medicineName || item.testName
        }));
        setter(formattedData);
      } catch (error) {
        console.error(`Error fetching from ${url}:`, error);
        toast.error(`Failed to load ${url.includes('Medicines') ? 'medicines' : 'tests'}. Please try again.`);
      }
    };

    fetchData('https://localhost:7166/api/Medicines', setMedicines);
    fetchData('https://localhost:7166/api/Tests', setTests);
  }, [token]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setPrescriptionData(prevData => ({
      ...prevData,
      [id]: value
    }));
  };

  const handleMedicineChange = (selectedOptions) => {
    const updatedMedicines = selectedOptions.map(option => {
      const existingMedicine = prescriptionData.selectedMedicines.find(med => med.value === option.value);
      return existingMedicine ? existingMedicine : {
        ...option,
        medicineID: option.value,
        noOfDays: '',
        dosageFrequency: '',
        dosageAmount: '',
        dosageUnit: '',
        beforeAfterFood: '',
      };
    });

    setPrescriptionData(prevData => ({
      ...prevData,
      selectedMedicines: updatedMedicines,
    }));
  };

  const handleMedicineDetailChange = (index, field, value) => {
    setPrescriptionData(prevData => {
      const updatedMedicines = [...prevData.selectedMedicines];
      updatedMedicines[index] = {
        ...updatedMedicines[index],
        [field]: value
      };
      return { ...prevData, selectedMedicines: updatedMedicines };
    });
  };

  const handleTestChange = (selectedOptions) => {
    setPrescriptionData(prevData => ({
      ...prevData,
      selectedTests: selectedOptions || []
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error("Credentials are missing");
      return;
    }

    const apiData = {
      remark: prescriptionData.remark,
      appointmentId: prescriptionData.appointmentId,
      medicines: prescriptionData.selectedMedicines.map(med => ({
        medicineID: med.medicineID,
        dosage: `${med.dosageAmount}`,
        dosageUnit: med.dosageUnit,
        noOfDays: parseInt(med.noOfDays),
        dosageFrequency: med.dosageFrequency,
        beforeAfterFood: med.beforeAfterFood,
      })),
      testIDs: prescriptionData.selectedTests.map(test => test.value),
      patientName: prescriptionData.patient,
      doctorName: prescriptionData.doctor,
    };
    console.log("Submitting the following prescription data:", apiData);
    try {
      const response = await fetch('https://localhost:7166/api/Prescriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(apiData)
      });

      if (!response.ok) {
        throw new Error('Failed to post prescription');
      }

      const data = await response.json();
      toast.success("Prescription generated Successfully");
      
      const updateStatusResponse = await fetch(`https://localhost:7166/api/appointments/${appointmentId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'Completed' })
      });

      if (!updateStatusResponse.ok) {
        throw new Error('Failed to update appointment status');
      }
      
      navigate('/doctorDashboard');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to save prescription or update appointment status. Please try again.');
    }
  };

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const goBack = () => {
    navigate('/doctorDashboard');
  };

  const PrintablePrescription = React.forwardRef((props, ref) => (
    <div ref={ref} className="p-8 bg-white border-2 border-gray-300 rounded-lg shadow-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-indigo-700 border-b-2 border-indigo-700 pb-2">Prescription</h2>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="font-semibold">Patient Name:</p>
          <p>{prescriptionData.patient}</p>
        </div>
        <div>
          <p className="font-semibold">Doctor Name:</p>
          <p>{prescriptionData.doctor}</p>
        </div>
        <div>
          <p className="font-semibold">Clinic Name:</p>
          <p>{prescriptionData.clinic}</p>
        </div>
        <div>
          <p className="font-semibold">Date:</p>
          <p>{prescriptionData.date}</p>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2 text-indigo-600">Medicines</h3>
        {prescriptionData.selectedMedicines.length > 0 ? (
          <ul className="list-disc pl-5">
            {prescriptionData.selectedMedicines.map((med, index) => (
              <li key={index} className="mb-2">
                <span className="font-medium">{med.label}:</span> {med.dosageAmount} {med.dosageUnit}, 
                {med.dosageFrequency}, for {med.noOfDays} days, {med.beforeAfterFood}
              </li>
            ))}
          </ul>
        ) : (
          <p>No medicines prescribed</p>
        )}
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2 text-indigo-600">Tests</h3>
        {prescriptionData.selectedTests.length > 0 ? (
          <ul className="list-disc pl-5">
            {prescriptionData.selectedTests.map((test, index) => (
              <li key={index}>{test.label}</li>
            ))}
          </ul>
        ) : (
          <p>No tests ordered</p>
        )}
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2 text-indigo-600">Remarks</h3>
        <p>{prescriptionData.remark}</p>
      </div>
    </div>
  ));

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6 text-indigo-700">Prescription</h1>
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="mb-4">
            <label htmlFor="remark" className="block font-semibold mb-1">Remarks:</label>
            <textarea
              id="remark"
              value={prescriptionData.remark}
              onChange={handleInputChange}
              className="border border-gray-300 rounded p-2 w-full"
              rows={4}
            />
          </div>

          <div className="mb-4">
            <label className="block font-semibold mb-1">Select Medicines:</label>
            <Select
              isMulti
              options={medicines}
              onChange={handleMedicineChange}
            />
          </div>

          {prescriptionData.selectedMedicines.map((med, index) => (
            <div key={index} className="border border-gray-300 rounded p-4 mb-4">
              <h4 className="font-semibold mb-2">{med.label}</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block mb-1">Dosage Amount:</label>
                  <input
                    type="number"
                    value={med.dosageAmount}
                    onChange={(e) => handleMedicineDetailChange(index, 'dosageAmount', e.target.value)}
                    className="border border-gray-300 rounded p-1 w-full"
                  />
                </div>
                <div>
                  <label className="block mb-1">Dosage Unit:</label>
                  <Select
                    options={unitOptions}
                    onChange={(option) => handleMedicineDetailChange(index, 'dosageUnit', option.value)}
                  />
                </div>
                <div>
                  <label className="block mb-1">No of Days:</label>
                  <input
                    type="number"
                    value={med.noOfDays}
                    onChange={(e) => handleMedicineDetailChange(index, 'noOfDays', e.target.value)}
                    className="border border-gray-300 rounded p-1 w-full"
                  />
                </div>
                <div>
                  <label className="block mb-1">Dosage Frequency:</label>
                  <Select
                    options={frequencyOptions}
                    onChange={(option) => handleMedicineDetailChange(index, 'dosageFrequency', option.value)}
                  />
                </div>
                <div>
                  <label className="block mb-1">Before/After Food:</label>
                  <Select
                    options={beforeAfterFoodOptions}
                    onChange={(option) => handleMedicineDetailChange(index, 'beforeAfterFood', option.value)}
                  />
                </div>
              </div>
            </div>
          ))}

          <div className="mb-4">
            <label className="block font-semibold mb-1">Select Tests:</label>
            <Select
              isMulti
              options={tests}
              onChange={handleTestChange}
            />
          </div>

          <div className="flex justify-between mb-4">
            <button type="button" onClick={goBack} className="bg-red-500 text-white rounded px-4 py-2">Cancel</button>
            <button type="submit" className="bg-blue-500 text-white rounded px-4 py-2">Submit</button>
          </div>
        </form>

        <div>
          <h3 className="text-xl font-semibold mb-2 text-indigo-600">Preview Prescription:</h3>
          <button onClick={handlePrint} className="bg-green-500 text-white rounded px-4 py-2 mb-4">Print Prescription</button>
          <PrintablePrescription ref={componentRef} />
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Prescription;
