import React, { useState, useEffect } from 'react';

const testimonials = [
  {
    name: 'Nadim Kamal',
    role: 'Patient',
    content: 'Thank you for your Service',
    image: '/images/MalePatient.jpg'
  },
  {
    name: 'Dr. John Martin',
    role: 'NEUROLOGY',
    content: 'Working in the field of neurology requires precision and empathy, both of which are exemplified by the team at this clinic. I am proud to contribute to their efforts in diagnosing and treating neurological disorders with the latest advancements in medical science.',
    image: '/images/MaleDoc1.jpg'
  },
  {
    name: 'Sarah Johnson',
    role: 'Patient',
    content: 'I am extremely grateful to the clinic for their exceptional care and support during my treatment. The medical staff were knowledgeable, compassionate, and always made me feel comfortable.',
    image: '/images/FemalePatient.jpg'
  },
  {
    name: 'Dr. Emily Carter',
    role: 'Cardiologist',
    content: 'Working at this clinic has been a fulfilling experience. We are dedicated to providing the best cardiovascular care, and I am proud to be part of such a committed team.',
    image: '/images/FemaleDoc1.jpg'
  },
  {
    name: 'James Anderson',
    role: 'Patient',
    content: 'The doctors here went above and beyond to ensure my recovery was smooth. Their expertise and care made a significant difference in my life, and I highly recommend this clinic to everyone.',
    image: '/images/MaleDoc2.jpg'
  },
  {
    name: 'Dr. Sophia Lee',
    role: 'Pediatrician',
    content: 'Being a pediatrician here allows me to make a positive impact on children\'s lives every day. The clinic\'s commitment to child health and well-being is unmatched, and I am honored to be part of it.',
    image: '/images/FemaleDoc2.jpg'
  }
];

const FeedbackCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };

  useEffect(() => {
    const interval = setInterval(nextTestimonial, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-blue-100 py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-extrabold text-gray-900 text-center mb-12">
          What Our Clients Say
        </h2>
        <div className="relative">
          <div className="overflow-hidden">
            <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
              {testimonials.map((testimonial, index) => (
                <div key={index} className="w-full flex-shrink-0 px-8">
                  <div className="bg-white p-12 rounded-lg shadow-lg">
                    <p className="text-gray-700 text-xl mb-8">{testimonial.content}</p>
                    <div className="flex items-center">
                      <img className="h-20 w-20 rounded-full mr-6" src={testimonial.image} alt={testimonial.name} />
                      <div>
                        <h3 className="text-2xl font-semibold text-gray-900">{testimonial.name}</h3>
                        <p className="text-lg text-blue-600">{testimonial.role}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-center mt-6">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-4 w-4 rounded-full mx-2 ${index === currentIndex ? 'bg-blue-600' : 'bg-gray-400'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeedbackCarousel;
