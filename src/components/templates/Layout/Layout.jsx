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
        {/* Aside condicional */}
        {isAsideOpen && <Aside />}

        {/* Botón hamburguesa: parte superior, entre aside y contenido */}
        <button
          onClick={toggleAside}
          className="absolute top-4 z-20 text-black p-3 rounded-r hover:cursor-pointer shadow-md transition-all duration-300"
          style={{ left: isAsideOpen ? '18rem' : '0.5rem' }} // 18rem = w-72
        >
          <FaBars />
        </button>

        {/* Contenido central */}
        <main className="flex-1 pt-12 transition-all duration-300">
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
