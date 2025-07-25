import React from 'react';

const Spinner = () => {
  return (
    <div className="flex justify-center items-center my-10">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      <span className="ml-3 text-gray-700">Cargando...</span>
    </div>
  );
};

export default Spinner;