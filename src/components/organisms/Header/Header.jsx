import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-gradient-to-r from-black via-gray-900 to-black shadow-md border-b border-gray-800">
      <div className="w-full flex justify-between items-center py-3 px-4">
        {/* Logo y título del Header */}
        <div className='flex justify-between items-center gap-2'>
          <img
            src="/img/logo_axsfitt.svg"
            alt="AXSFITT Logo"
            className="h-10 w-10 rounded-full"
          />
          <span className="text-lg font-semibold text-white">AXSFITT</span>
        </div>

        {/* Sección derecha */}
        <div className="flex items-center space-x-4">
          <button
            type="button"
            className="text-gray-400 hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
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