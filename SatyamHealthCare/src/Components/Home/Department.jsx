import React from 'react';

const departments = [
  { name: 'Dental', icon: '/images/floss.png' },
  { name: 'Cardiology', icon: '/images/cardiology.png' },
  { name: 'Pediatric', icon: '/images/pediatrics.png' },
  { name: 'Nephrology', icon: '/images/nephrology.png' },
  { name: 'Neurology', icon: '/images/neurology.png' },
  { name: 'Cancer', icon: '/images/ribbon.png' },
  { name: 'Radiology', icon: '/images/x-ray.png' },
  { name: 'Orthopedic', icon: '/images/orthopedics.png' }
];

const Department = () => {
  return (
    <div id="department" className="bg-blue-100 py-12  px-4">
      <h2 className="text-3xl font-bold text-center mb-8">Our Departments</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {departments.map((dept, index) => (
          <div
            key={index}
            className="bg-white rounded-lg p-4 flex flex-col items-center shadow-md transition-transform transform hover:scale-105"
          >
            <img
              src={dept.icon}
              alt={`${dept.name} icon`}
              className="w-16 h-16 mb-2"
            />
            <span className="text-sm font-medium">{dept.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Department;
