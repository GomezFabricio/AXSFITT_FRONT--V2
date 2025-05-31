import React, { useState } from 'react';
import Aside from '../../organisms/Aside/Aside';
import Footer from '../../organisms/Footer/Footer';
import Header from '../../organisms/Header/Header';
import { FaBars } from 'react-icons/fa';

const Layout = ({ children }) => {
  const [isAsideOpen, setIsAsideOpen] = useState(true);

  const toggleAside = () => {
    setIsAsideOpen(!isAsideOpen);
  };

  return (
    <div className="grid grid-rows-[auto_1fr_auto] min-h-screen">
      {/* Header */}
      <header className="w-full z-10 relative">
        <Header />
      </header>

      {/* Contenedor principal (Aside + Botón + Main) */}
      <div className="flex flex-1 relative">
        {/* Aside con transición */}
        <div
          className={`
            transition-all duration-300
            h-full
            ${isAsideOpen ? 'w-72 min-w-[18rem] max-w-[18rem]' : 'w-0 min-w-0 max-w-0'}
            overflow-hidden
            z-20
          `}
        >
          <Aside isAsideOpen={isAsideOpen} />
        </div>

        {/* Botón hamburguesa */}
        <button
          onClick={toggleAside}
          className="absolute top-4 z-30 text-black p-3 rounded-r hover:cursor-pointer shadow-md transition-all duration-300 bg-white"
          style={{ left: isAsideOpen ? '18rem' : '0.5rem' }}
        >
          <FaBars />
        </button>

        {/* Contenido central con transición de margen */}
        <main
          className="flex-1 pt-12 transition-all duration-300"
          style={{
            marginLeft: isAsideOpen ? '0' : '0', // Puedes ajustar si quieres que el contenido se desplace
          }}
        >
          <div className="px-4">
            {children}
          </div>
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