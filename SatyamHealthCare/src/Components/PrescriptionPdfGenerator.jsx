import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const PrescriptionPDFGenerator = ({ appointmentId }) => {
  const [prescription, setPrescription] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [tests, setTests] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prescriptionRes, medicineRes, testRes] = await Promise.all([
          fetch(`https://localhost:7166/api/Prescriptions/appointment/${appointmentId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json',
            },
          }),
          fetch('https://localhost:7166/api/Medicines', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
          }),
          fetch('https://localhost:7166/api/Tests', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
          })
        ]);

        const [prescriptionData, medicineData, testData] = await Promise.all([
          prescriptionRes.json(),
          medicineRes.json(),
          testRes.json()
        ]);

        const latestPrescription = prescriptionData.length > 0 ? prescriptionData[prescriptionData.length - 1] : null;
        
        setPrescription(latestPrescription);
        setMedicines(medicineData);
        setTests(testData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
      }
    };

    fetchData();
  }, [appointmentId]);

  const generatePDF = () => {
    if (!prescription) return;

    const doc = new jsPDF();

    // Set white background
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, 210, 297, 'F');

    // Add letterhead
    doc.setFillColor(63, 81, 181);
    doc.rect(0, 0, 210, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text('Satyam Hospital', 10, 13);

    // Add contact information
    doc.setTextColor(100);
    doc.setFontSize(10);
    doc.text('123 Medical Drive, Healthville, HV 12345', 10, 25);
    doc.text('Phone: (555) 123-4567 | Email: info@satyamhospital.com', 10, 30);

    // Add horizontal line
    doc.setDrawColor(63, 81, 181);
    doc.setLineWidth(0.5);
    doc.line(10, 35, 200, 35);

    // Title
    doc.setFontSize(24);
    doc.setTextColor(63, 81, 181);
    doc.text('Prescription', 10, 50);

    // Date
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text('Date:', 150, 65);
    doc.text(new Date().toLocaleDateString(), 170, 65);

    // Medicines Section
    doc.setTextColor(63, 81, 181);
    doc.setFontSize(14);
    doc.text('Prescribed Medications', 10, 80);

    const medicineData = prescription.medicines?.map(medicine => {
      const medicineName = medicines.find(m => m.medicineID === medicine.medicineID)?.medicineName || medicine.medicineID;
      return [
        medicineName,
        `${medicine.dosage} ${medicine.dosageUnit}`,
        medicine.dosageFrequency,
        `${medicine.noOfDays} days`,
        medicine.beforeAfterFood
      ];
    }) || [];

    doc.autoTable({
      startY: 85,
      head: [['Medicine', 'Dosage', 'Frequency', 'Duration', 'Instructions']],
      body: medicineData,
      theme: 'grid',
      headStyles: { fillColor: [63, 81, 181], textColor: 255 },
      styles: { fontSize: 10 },
    });

    // Tests Section
    const finalY = doc.lastAutoTable.finalY || 85;
    doc.setTextColor(63, 81, 181);
    doc.setFontSize(14);
    doc.text('Recommended Tests', 10, finalY + 15);

    const testData = prescription.testIDs?.map(testId => {
      const test = tests.find(t => t.testID === testId);
      return [test ? test.testName : testId];
    }) || [];

    doc.autoTable({
      startY: finalY + 20,
      head: [['Test Name']],
      body: testData,
      theme: 'grid',
      headStyles: { fillColor: [63, 81, 181], textColor: 255 },
      styles: { fontSize: 10 },
    });

    // Remarks Section
    const remarksY = doc.lastAutoTable.finalY || (finalY + 20);
    doc.setTextColor(63, 81, 181);
    doc.setFontSize(14);
    doc.text('Remarks', 10, remarksY + 15);

    doc.setTextColor(0);
    doc.setFontSize(12);
    const splitRemarks = doc.splitTextToSize(prescription.remark || 'No remarks', 180);
    doc.text(splitRemarks, 10, remarksY + 25);

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('This prescription is valid for 30 days from the date of issue.', 10, 280);
    doc.text('Please consult your doctor before making any changes to your medication.', 10, 285);

    // Doctor's Signature
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text("Doctor's Signature: ____________________", 130, 270);

    doc.save('prescription.pdf');
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="flex justify-center p-4">
      <button 
        onClick={generatePDF} 
        disabled={!prescription}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
      >
        Download Prescription
      </button>
    </div>
  );
};

export default PrescriptionPDFGenerator;