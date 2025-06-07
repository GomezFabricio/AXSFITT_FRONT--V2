import React from 'react';
import config from '../../config/config';

const GaleriaImagenesProducto = ({ imagenes, onMoverImagen, onEliminarImagen, onImagenChange }) => {
  return (
    <div className="flex space-x-4">
      {/* Mostrar las imágenes actuales */}
      {imagenes.map((imagen, index) => (
        <div key={imagen.id} className="relative w-32 h-32 border-2 border-gray-400 rounded-md overflow-hidden">
          <img
            src={`${config.backendUrl}${imagen.url}`} // Concatenar la URL base con la ruta relativa
            alt={`Imagen ${index + 1}`}
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={() => onEliminarImagen(index)}
            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700"
          >
            X
          </button>
          {index > 0 && (
            <button
              type="button"
              onClick={() => onMoverImagen(index, index - 1)}
              className="absolute bottom-1 left-1 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-blue-700"
            >
              ↑
            </button>
          )}
          {index < imagenes.length - 1 && (
            <button
              type="button"
              onClick={() => onMoverImagen(index, index + 1)}
              className="absolute bottom-1 right-1 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-blue-700"
            >
              ↓
            </button>
          )}
        </div>
      ))}

      {imagenes.length < 6 && (
        <div className="relative w-32 h-32 border-2 border-dashed border-gray-400 rounded-md flex items-center justify-center">
          <label htmlFor="imagen-upload" className="cursor-pointer flex flex-col items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
            </svg>
            <span className="text-sm text-gray-500">Agregar</span>
            <input
              type="file"
              id="imagen-upload"
              accept="image/*"
              multiple
              onChange={onImagenChange}
              className="hidden"
            />
          </label>
        </div>
      )}
    </div>
  );
};

export default GaleriaImagenesProducto;