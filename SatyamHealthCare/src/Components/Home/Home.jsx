import React from 'react'
import HeroSection from './HeroSection'
import Department from './Department'
import About from '../About'
import FeedbackCarousel from './FeedbackCarousel'

const Home = () => {
  return (
    <div className='bg-blue-100'>
      <HeroSection/>
     <Department/>
     <About/>
     <FeedbackCarousel/>
    </div>
  )
}

export default Home
