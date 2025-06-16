import React from 'react';
import config from '../../../config/config';

const GaleriaImagenesProducto = ({ imagenes, onMoverImagen, onEliminarImagen, onImagenChange }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {/* Mostrar las imágenes actuales */}
      {imagenes.map((imagen, index) => (
        <div 
          key={imagen.id} 
          className="relative aspect-square border border-gray-200 rounded-lg overflow-hidden shadow-sm transition-all duration-200 hover:shadow-md group"
        >
          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-200"></div>
          
          <img
            src={`${config.backendUrl}${imagen.url}`}
            alt={`Imagen ${index + 1}`}
            className="w-full h-full object-cover"
          />
          
          {/* Distintivo de imagen principal */}
          {index === 0 && (
            <div className="absolute top-2 left-2 bg-violet-500 text-white text-xs px-2 py-0.5 rounded-full shadow-sm">
              Principal
            </div>
          )}
          
          {/* Botón para eliminar */}
          <button
            type="button"
            onClick={() => onEliminarImagen(index)}
            className="absolute top-2 right-2 bg-white bg-opacity-80 hover:bg-red-500 text-gray-700 hover:text-white rounded-full w-7 h-7 flex items-center justify-center transition-colors duration-200 shadow-sm"
            aria-label="Eliminar imagen"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          {/* Controles de navegación */}
          <div className="absolute bottom-2 inset-x-2 flex justify-between">
            {/* Botón para mover hacia arriba */}
            {index > 0 && (
              <button
                type="button"
                onClick={() => onMoverImagen(index, index - 1)}
                className="bg-white bg-opacity-80 hover:bg-violet-500 text-gray-700 hover:text-white rounded-full w-7 h-7 flex items-center justify-center transition-colors duration-200 shadow-sm"
                aria-label="Mover hacia arriba"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11l5-5 5 5M7 17l5-5 5 5" />
                </svg>
              </button>
            )}
            
            {/* Espacio vacío si solo hay un botón */}
            {(index === 0 || index === imagenes.length - 1) && <div className="w-7"></div>}
            
            {/* Botón para mover hacia abajo */}
            {index < imagenes.length - 1 && (
              <button
                type="button"
                onClick={() => onMoverImagen(index, index + 1)}
                className="bg-white bg-opacity-80 hover:bg-violet-500 text-gray-700 hover:text-white rounded-full w-7 h-7 flex items-center justify-center transition-colors duration-200 shadow-sm"
                aria-label="Mover hacia abajo"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 13l-5 5-5-5M17 7l-5 5-5-5" />
                </svg>
              </button>
            )}
          </div>
          
          {/* Indicador de orden */}
          <div className="absolute top-2 right-10 bg-gray-800 bg-opacity-70 text-white text-xs px-2 py-0.5 rounded-full">
            {index + 1}/{imagenes.length}
          </div>
        </div>
      ))}

      {/* Botón para agregar imágenes */}
      {imagenes.length < 6 && (
        <div className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
          <label 
            htmlFor="imagen-upload" 
            className="cursor-pointer flex flex-col items-center justify-center w-full h-full p-4 text-center"
          >
            <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center mb-2">
              <svg
                className="w-6 h-6 text-violet-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-700">Agregar imagen</span>
            <span className="text-xs text-gray-500 mt-1">{6 - imagenes.length} restantes</span>
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