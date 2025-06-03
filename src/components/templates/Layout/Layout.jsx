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
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize(); // Llamar una vez al principio
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="grid grid-rows-[auto_1fr_auto] min-h-screen">
      {/* Header */}
      <header className="w-full z-10 relative">
        <Header />
      </header>

      {/* Contenido principal */}
      <div className="flex flex-1 relative">
        {/* Aside */}
        <div
          className={`
            transition-transform duration-300
            ${isMobile ? 'fixed top-0 left-0 h-full z-40 bg-white shadow-lg' : 'h-full'}
            ${isAsideOpen ? 'translate-x-0' : '-translate-x-full'}
            ${isMobile ? 'w-64' : 'w-72'}
            overflow-hidden
          `}
        >
          <Aside isAsideOpen={isAsideOpen} />
        </div>

        {/* Botón hamburguesa */}
        <button
          onClick={toggleAside}
          className="absolute top-4 z-50 text-black p-3 rounded-r hover:cursor-pointer shadow-md transition-all duration-300 bg-white"
          style={{
            left: isAsideOpen
              ? isMobile
                ? '16rem'
                : '18rem'
              : '0.5rem'
          }}
        >
          <FaBars />
        </button>

        {/* Contenido principal */}
        <main className="flex-1 pt-12 px-4 transition-all duration-300">
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
