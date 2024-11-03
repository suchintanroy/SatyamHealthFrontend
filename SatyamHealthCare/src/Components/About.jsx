import React, { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { ChevronDown, ChevronUp } from 'lucide-react';

const sortStats = (stats) => {
  const order = {
    "Years of Experience": 1,
    "Medical Awards": 2,
    "Doctors on Staff": 3,
    "Happy Patients": 4
  };
  return stats.slice().sort((a, b) => order[a.label] - order[b.label]);
};

const Counter = ({ value, label }) => {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView({
    triggerOnce: true, 
    threshold: 0.1, 
  });

  useEffect(() => {
    if (inView) {
      const targetValue = parseInt(value.replace(/[,+]/g, '')); 
      const duration = 2000; 
      const stepTime = 50; 
      const steps = duration / stepTime;
      const increment = Math.ceil(targetValue / steps);

      const interval = setInterval(() => {
        setCount(prev => {
          const newCount = Math.min(prev + increment, targetValue);
          if (newCount >= targetValue) {
            clearInterval(interval);
            return targetValue;
          }
          return newCount;
        });
      }, stepTime);

      return () => clearInterval(interval);
    }
  }, [inView, value]);

  return (
    <div ref={ref} className="text-center">
      <p className="text-3xl font-bold text-blue-600">{count}+</p>
      <p className="text-sm text-gray-600">{label}</p>
    </div>
  );
};

const FeatureCard = ({ feature }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <div 
      ref={ref} 
      className={`bg-white rounded-lg shadow-md p-4 transition-all duration-500 ${
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className="flex items-start">
        <span className="text-2xl mr-4">{feature.icon}</span>
        <div className="flex-grow">
          <h3 className="font-semibold text-lg mb-1">{feature.title}</h3>
          <p className={`text-sm text-gray-600 ${isExpanded ? '' : 'line-clamp-2'}`}>
            {feature.description}
          </p>
        </div>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="ml-2 text-blue-500 hover:text-blue-700 focus:outline-none"
        >
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>
    </div>
  );
};

const About = () => {
  const features = [
    {
      title: "24 Hour Healthcare Services",
      description: "Our clinic provides round-the-clock medical care, ensuring that you have access to health services whenever you need them. Our dedicated team of healthcare professionals is available 24/7 to address your medical concerns, whether it's an emergency or a routine check-up scheduled at your convenience.",
      icon: "🏥"
    },
    {
      title: "International Standards",
      description: "We adhere to global healthcare standards, offering you world-class medical treatments and procedures. Our facilities are equipped with state-of-the-art technology, and our medical practices are regularly updated to align with the latest international guidelines, ensuring you receive the highest quality of care.",
      icon: "🌎"
    },
    {
      title: "Center of Excellence",
      description: "Our facility is recognized as a center of excellence, known for pioneering treatments and exceptional patient care. We continuously invest in research and development, collaborate with leading medical institutions worldwide, and attract top medical talent to provide innovative and effective treatments for our patients.",
      icon: "🏅"
    }
  ];

  const initialStats = [
    { value: "20+", label: "Years of Experience" },
    { value: "8,450+", label: "Happy Patients" },
    { value: "1,250+", label: "Doctors on Staff" },
    { value: "50+", label: "Medical Awards" }
  ];

  const [stats, setStats] = useState(sortStats(initialStats));

  useEffect(() => {
    setStats(sortStats(initialStats));
  }, []);

  return (
    <div id="about" className=" mx-auto flex flex-col px-4 py-8 min-h-screen bg-blue-100 items-center justify-center">
      <div className=" container  flex flex-row ">
        <div className="md:w-1/2 mb-6 md:mb-0">
          <h2 className="text-3xl font-bold mb-4">Medical Clinic that you can trust</h2>
          <p className="text-gray-600 mb-6">
            Caring for all people's health can be one of the most rewarding and challenging tasks. Our clinic has been helping people to resolve all of their medical needs for years.
          </p>
          <div className="space-y-4">
            {features.map((feature, index) => (
              <FeatureCard key={index} feature={feature} />
            ))}
          </div>
        </div>
        <div className="md:w-1/2 md:pl-8">
          <img  className="rounded-lg shadow-lg w-full h-auto" src="images/Doctor.jpg" alt="Doctor" />
        </div>
      </div>

      <div className=" container bg-blue-50 p-8 rounded-lg mt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Counter key={index} value={stat.value} label={stat.label} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default About;