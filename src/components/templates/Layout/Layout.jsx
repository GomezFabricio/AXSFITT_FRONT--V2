import React, { useState, useEffect } from 'react';
import Aside from '../../organisms/Aside/Aside';
import Footer from '../../organisms/Footer/Footer';
import Header from '../../organisms/Header/Header';
import { FaBars } from 'react-icons/fa';

const Layout = ({ children }) => {
  const [isAsideOpen, setIsAsideOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const toggleAside = () => {
    setIsAsideOpen(!isAsideOpen);
  };

  // Detectar si es pantalla móvil
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="grid grid-rows-[auto_1fr_auto] min-h-screen bg-gray-100">
      {/* Header */}
      <header className="w-full z-20 relative">
        <Header />
      </header>

      {/* Contenido principal y Aside */}
      <div className="flex flex-1 relative overflow-x-hidden">
        {/* Aside */}
        <div
          className={`
            transition-all duration-300 ease-in-out
            ${isMobile
              ? `fixed top-0 left-0 h-full z-40 bg-white shadow-lg w-72 ${isAsideOpen ? 'translate-x-0' : '-translate-x-full'}` // Cambiado de w-64 a w-72
              : `relative h-full bg-white shadow-lg ${isAsideOpen ? 'w-72' : 'w-0'}`
            }
            overflow-hidden
          `}
        >
          <Aside isAsideOpen={isAsideOpen} />
        </div>

        {/* Botón hamburguesa */}
        <button
          onClick={toggleAside}
          className={`fixed top-20 z-50 text-gray-700 p-3 rounded-r-md hover:cursor-pointer shadow-md transition-all duration-300 bg-white hover:bg-gray-200
            ${isMobile ? (isAsideOpen ? 'left-72' : 'left-0') : (isAsideOpen ? 'left-72' : 'left-0')} 
          `} // Ajustado left-64 a left-72 para móvil
          aria-label="Toggle menu"
        >
          <FaBars />
        </button>

        {/* Contenido principal */}
        <main className={`flex-1 pt-16 pb-8 px-4 md:px-8 transition-all duration-300 ease-in-out overflow-y-auto
          ${isMobile ? '' : (isAsideOpen ? 'ml-0' : 'ml-0')} 
        `}>
          {children}
        </main>
      </div>

      {/* Footer */}
      <footer className="w-full text-white relative z-10">
        <Footer />
      </footer>
    </div>
  );
};

export default Layout;