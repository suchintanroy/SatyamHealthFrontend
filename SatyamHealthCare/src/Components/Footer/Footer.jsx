import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer id="contact" className="bg-blue-900 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start">
          {/* Logo and Description */}
          <div className="mb-8 md:mb-0 md:w-1/2">
            <div className="flex items-center mb-4">
              <h2 className="text-2xl font-bold">Satyam HealthCare</h2>
            </div>
            <p className="text-sm mb-4 max-w-md">
                Gods Plan            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-white hover:text-blue-300"><Facebook size={20} /></a>
              <a href="#" className="text-white hover:text-blue-300"><Twitter size={20} /></a>
              <a href="#" className="text-white hover:text-blue-300"><Instagram size={20} /></a>
              <a href="#" className="text-white hover:text-blue-300"><Linkedin size={20} /></a>
            </div>
          </div>

          {/* Contact Us */}
          <div className="md:w-1/3">
            <h3 className="text-xl font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-center">
                <span className="mr-2">📞</span>
                <a href="tel:+1800001658" className="text-sm hover:text-blue-300">+1800-001-658</a>
              </li>
              <li className="flex items-center">
                <span className="mr-2">✉️</span>
                <a href="mailto:info@peacefulthemes.com" className="text-sm hover:text-blue-300">Satyam@gmail.com</a>
              </li>
              <li className="flex items-start">
                <span className="mr-2">📍</span>
                <p className="text-sm">Chennai Tamil Nadu, India</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="mt-8 border-t border-blue-800 pt-4">
        <div className="container mx-auto px-4 text-center text-sm">
          Copyright 2024 SatyamHealthCare All Rights Reserved
        </div>
      </div>
    </footer>
  );
};

export default Footer;