import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-purple-900 shadow-md">
      <div className="w-full flex justify-between items-center py-3 px-4">
        {/* Logo y título del Header */}
        <div className='flex justify-between items-center gap-2'>
          <img
            src="/img/logo_axsfitt.svg"
            alt="AXSFITT Logo"
            className="h-8 w-8 rounded-full"
          />
          <span className="text-lg font-semibold text-white">AXSFITT</span>
        </div>

        {/* Sección derecha */}
        <div className="flex items-center space-x-4">
          <span className="hidden sm:block text-sm text-white">Bienvenido, Usuario</span>
          <button
            type="button"
            className="text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300"
            aria-label="Notifications"
          >
            <i className="fas fa-bell text-lg"></i>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;