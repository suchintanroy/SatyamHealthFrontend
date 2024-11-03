import React from "react";
import { useNavigate } from "react-router-dom";
const HeroSection = () => {
  const navigate = useNavigate();

  const handleBookAppointment = () => {
    navigate('/appointment');
  };
  return (
    <div className="relative min-h-screen flex items-center justify-center pt-16">
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{
          backgroundImage: "url('images/HeroImage2.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          filter: "brightness(50%)",
        }}
      ></div>

      <div className="z-10 text-center text-white px-4">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome</h1>
        <p className="text-lg md:text-xl mb-8">
          Happiness Is The Highest Form Of Health
        </p>
        <button
          className="bg-[#4461F2] text-white font-semibold py-3 px-8 rounded-full hover:bg-blue-600 transition-colors duration-300"
          onClick={handleBookAppointment}
        >
          Book Appointment
        </button>
      </div>
    </div>
  );
};

export default HeroSection;