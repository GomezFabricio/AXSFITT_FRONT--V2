import React from 'react';

const Error403Page = () => {
  return (
    <div className="flex items-start justify-center min-h-screen bg-gray-100 pt-20">
      <div className="bg-white shadow-lg rounded-lg p-6 max-w-md w-full text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">403</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Acceso Denegado</h2>
        <p className="text-gray-600 mb-4">
          No tienes permiso para acceder a esta página.
        </p>
        <button
          onClick={() => window.history.back()}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
        >
          Volver
        </button>
      </div>
    </div>
  );
};

export default Error403Page;