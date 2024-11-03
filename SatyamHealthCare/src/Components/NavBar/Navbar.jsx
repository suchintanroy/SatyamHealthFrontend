import React, { useState, useEffect, useRef } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { Link as ScrollLink, animateScroll as scroll } from "react-scroll";
import { UserCircleIcon, LogoutIcon } from '@heroicons/react/solid';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userInitial, setUserInitial] = useState('');
  const navigate = useNavigate();
  const userMenuRef = useRef(null);

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleUserMenu = () => setShowUserMenu(!showUserMenu);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    
    if (token) {
      const initial = localStorage.getItem('userInitial');
      if (initial) {
        setUserInitial(initial);
      }
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    
    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInitial');
    setIsLoggedIn(false);
    setShowUserMenu(false);
    setUserInitial('');
    navigate('/');
  };

  const NavLink = ({ to, children, onClick }) => {
    if (to === "home") {
      return (
        <button
          onClick={() => {
            scroll.scrollToTop({ duration: 400 });
            if (onClick) onClick();
          }}
          className="w-full text-left py-2 px-4 Licorice text-lg font-semibold no-underline hover:bg-blue-100 transition-all duration-300"
        >
          {children}
        </button>
      );
    }
   
    return (
      <ScrollLink
        to={to}
        smooth={true}
        duration={400}
        offset={-70}
        className="block w-full text-left py-2 px-4 Licorice text-lg font-semibold no-underline hover:bg-blue-100 transition-all duration-300"
        onClick={onClick}
      >
        {children}
      </ScrollLink>
    );
  };

  const UserMenu = ({ isMobile }) => (
    <div ref={userMenuRef} className={isMobile ? "mt-4" : "relative"}>
      {!isMobile && (
        <button
          onClick={toggleUserMenu}
          className="flex items-center justify-center Licorice text-lg font-semibold no-underline transition-all duration-300 bg-white text-blue-500 w-10 h-10 rounded-full shadow-md hover:bg-blue-50 hover:shadow-lg"
        >
          {userInitial || 'U'}
        </button>
      )}
      {(showUserMenu || isMobile) && (
        <div className={isMobile ? "space-y-2" : "absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10"}>
          <RouterLink to="/myprofile" className="flex items-center px-4 py-2 text-sm text-gray-700 font-bold hover:bg-gray-100">
            <UserCircleIcon className="h-5 w-5 mr-2" />
            My Profile
          </RouterLink>
        
          <button onClick={handleLogout} className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 font-bold hover:bg-gray-100">
            <LogoutIcon className="h-5 w-5 mr-2" />
            Logout
          </button>
        </div>
      )}
    </div>
  );

  return (
    <nav className="bg-blue-500 fixed top-0 left-0 right-0 z-20 py-4">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <button onClick={() => scroll.scrollToTop({ duration: 400 })} className="bg-transparent border-none p-0">
              <img className="h-10 object-cover" src="images/Logo2.png" alt="logo" />
            </button>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-8">
            <NavLink to="home">Home</NavLink>
            <NavLink to="about">About</NavLink>
            <NavLink to="contact">Contact</NavLink>
            <NavLink to="department">Department</NavLink>
          </div>

          <div className="hidden lg:flex items-center">
            {isLoggedIn ? (
              <UserMenu />
            ) : (
              <RouterLink 
                to="/Login" 
                className="flex items-center justify-center Licorice text-lg font-semibold no-underline transition-all duration-300 bg-white text-blue-500 px-6 py-2 rounded-md shadow-md hover:bg-blue-50 hover:shadow-lg"
              >
                Login
              </RouterLink>
            )}
          </div>

          <div className="lg:hidden">
            <button
              onClick={toggleMenu}
              className="Licorice hover:text-blue-500 focus:outline-none"
            >
              <img src="/images/hamburger.png" alt="menu" className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-gray-800 opacity-75" onClick={toggleMenu}></div>
            <div className="absolute right-0 top-0 bottom-0 w-64 bg-white shadow-xl overflow-y-auto">
              <div className="p-6 flex flex-col h-full">
                <div className="flex justify-end mb-6">
                  <button onClick={toggleMenu} className="text-gray-500 hover:text-gray-600">
                    <svg className="h-6 w-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
                <div className="flex flex-col space-y-4">
                  <NavLink to="home" onClick={toggleMenu}>Home</NavLink>
                  <NavLink to="about" onClick={toggleMenu}>About</NavLink>
                  <NavLink to="contact" onClick={toggleMenu}>Contact</NavLink>
                  <NavLink to="department" onClick={toggleMenu}>Department</NavLink>
                </div>
                <div className="mt-auto">
                  {isLoggedIn ? (
                    <UserMenu isMobile={true} />
                  ) : (
                    <RouterLink 
                      to="/Login" 
                      className="block w-full py-2 px-4 mt-4 Licorice text-lg font-semibold no-underline transition-all duration-300 text-center text-white bg-blue-500 rounded-md hover:bg-blue-600"
                      onClick={toggleMenu}
                    >
                      Login
                    </RouterLink>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;