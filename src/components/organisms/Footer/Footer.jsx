import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-purple-900 text-white py-4">
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center px-4">
        <span className="text-sm text-center sm:text-left">
          &copy; {new Date().getFullYear()} <strong>aXsFitt</strong>. Todos los derechos reservados.
        </span>
        <div className="text-sm mt-2 sm:mt-0 text-center sm:text-right">
          <span>Desarrollado por el equipo de aXsFitt</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;