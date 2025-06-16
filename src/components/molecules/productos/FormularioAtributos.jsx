import React from 'react';
import config from '../../../config/config';
import PropTypes from 'prop-types';

const FormularioAtributos = ({
  atributosConfigurados,
  formulariosVariantes,
  handleFormularioChange,
  handleAgregarFormulario,
  handleEliminarVariante,
  imagenes,
  errores,
  tienePermiso,
}) => {
  // Verificar si el usuario tiene permiso para definir precios
  const puedeDefinirPrecios = tienePermiso("Definir Precio Producto");

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-medium text-gray-800 mb-4">Configuración de Variantes</h3>
      
      {formulariosVariantes.map((formulario, index) => (
        <div key={index} className="mb-6 bg-gray-50 rounded-lg p-5 border border-gray-100 transition-all duration-300 hover:shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-md font-semibold text-violet-700">Variante {index + 1}</h4>
            <button
              type="button"
              onClick={() => handleEliminarVariante(index)}
              className="px-2 py-1 bg-white text-red-500 border border-red-200 text-sm rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-200 transition-colors"
            >
              Eliminar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Campos de atributos dinámicos */}
            {atributosConfigurados.atributos.map((atributo) => (
              <div key={atributo.atributo_nombre}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {atributo.atributo_nombre}
                </label>
                <input
                  type="text"
                  value={formulario[atributo.atributo_nombre] || ''}
                  onChange={(e) => handleFormularioChange(index, atributo.atributo_nombre, e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-400 transition-colors"
                  placeholder={`Valor de ${atributo.atributo_nombre}`}
                />
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-4 mb-4">
            <h5 className="text-sm font-medium text-gray-500 mb-3">Información de Precios</h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Precio Costo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  Precio Costo
                  {!puedeDefinirPrecios && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                      Sin permiso
                    </span>
                  )}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    value={formulario.precioCosto || ''}
                    onChange={(e) => handleFormularioChange(index, 'precioCosto', e.target.value)}
                    className={`w-full pl-7 pr-3 py-2 bg-white border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                      !puedeDefinirPrecios ? 'bg-gray-50 text-gray-500' : ''
                    } ${
                      errores[`formulario_${index}_precioCosto`] ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-violet-400'
                    }`}
                    disabled={!puedeDefinirPrecios}
                    title={!puedeDefinirPrecios ? "No tienes permiso para definir precios" : ""}
                    placeholder="0.00"
                  />
                </div>
                {errores[`formulario_${index}_precioCosto`] && (
                  <p className="text-xs text-red-500 mt-1">{errores[`formulario_${index}_precioCosto`]}</p>
                )}
              </div>

              {/* Precio Venta */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  Precio Venta
                  {!puedeDefinirPrecios && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                      Sin permiso
                    </span>
                  )}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    value={formulario.precioVenta || ''}
                    onChange={(e) => handleFormularioChange(index, 'precioVenta', e.target.value)}
                    className={`w-full pl-7 pr-3 py-2 bg-white border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                      !puedeDefinirPrecios ? 'bg-gray-50 text-gray-500' : ''
                    } ${
                      errores[`formulario_${index}_precioVenta`] ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-violet-400'
                    }`}
                    disabled={!puedeDefinirPrecios}
                    title={!puedeDefinirPrecios ? "No tienes permiso para definir precios" : ""}
                    placeholder="0.00"
                  />
                </div>
                {errores[`formulario_${index}_precioVenta`] && (
                  <p className="text-xs text-red-500 mt-1">{errores[`formulario_${index}_precioVenta`]}</p>
                )}
              </div>

              {/* Precio Oferta */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  Precio Oferta
                  {!puedeDefinirPrecios && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                      Sin permiso
                    </span>
                  )}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    value={formulario.precioOferta || ''}
                    onChange={(e) => handleFormularioChange(index, 'precioOferta', e.target.value)}
                    className={`w-full pl-7 pr-3 py-2 bg-white border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                      !puedeDefinirPrecios ? 'bg-gray-50 text-gray-500' : ''
                    } ${
                      errores[`formulario_${index}_precioOferta`] ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-violet-400'
                    }`}
                    disabled={!puedeDefinirPrecios}
                    title={!puedeDefinirPrecios ? "No tienes permiso para definir precios" : ""}
                    placeholder="0.00"
                  />
                </div>
                {errores[`formulario_${index}_precioOferta`] && (
                  <p className="text-xs text-red-500 mt-1">{errores[`formulario_${index}_precioOferta`]}</p>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4 mb-4">
            <h5 className="text-sm font-medium text-gray-500 mb-3">Información de Inventario</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Stock */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                <input
                  type="number"
                  value={formulario.stock || ''}
                  onChange={(e) => handleFormularioChange(index, 'stock', e.target.value)}
                  className={`w-full px-3 py-2 bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-violet-400 transition-colors ${
                    errores[`formulario_${index}_stock`] ? 'border-red-300' : 'border-gray-200'
                  }`}
                  placeholder="0"
                />
                {errores[`formulario_${index}_stock`] && (
                  <p className="text-xs text-red-500 mt-1">{errores[`formulario_${index}_stock`]}</p>
                )}
              </div>

              {/* SKU */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                <input
                  type="text"
                  value={formulario.sku || ''}
                  onChange={(e) => handleFormularioChange(index, 'sku', e.target.value)}
                  className={`w-full px-3 py-2 bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-violet-400 transition-colors ${
                    errores[`formulario_${index}_sku`] ? 'border-red-300' : 'border-gray-200'
                  }`}
                  placeholder="SKU-XXXXX"
                />
                {errores[`formulario_${index}_sku`] && (
                  <p className="text-xs text-red-500 mt-1">{errores[`formulario_${index}_sku`]}</p>
                )}
              </div>
            </div>
          </div>

          {/* Selección de imagen */}
          <div className="border-t border-gray-100 pt-4">
            <h5 className="text-sm font-medium text-gray-500 mb-3">Imagen de la Variante</h5>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {imagenes.map((imagen) => (
                <div
                  key={imagen.id}
                  onClick={() => handleFormularioChange(index, 'imagen_url', imagen.url)}
                  className={`cursor-pointer transition-all duration-200 rounded-lg overflow-hidden ${
                    formulario.imagen_url === imagen.url 
                      ? 'ring-2 ring-violet-500 transform scale-105' 
                      : 'border border-gray-200 hover:border-violet-300'
                  }`}
                  style={{ aspectRatio: '1/1' }}
                >
                  <img
                    src={`${imagen.url.startsWith('http') ? '' : config.backendUrl}${imagen.url}`}
                    alt={`Imagen ${imagen.id}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            {formulario.imagen_url && (
              <p className="text-xs text-gray-500 mt-2 truncate">
                Imagen seleccionada: {formulario.imagen_url.split('/').pop()}
              </p>
            )}
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={handleAgregarFormulario}
        className="mt-2 flex items-center justify-center w-full sm:w-auto px-4 py-2 bg-violet-50 border border-violet-200 text-violet-700 rounded-md hover:bg-violet-100 focus:outline-none focus:ring-2 focus:ring-violet-300 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Agregar Nueva Variante
      </button>
    </div>
  );
};

FormularioAtributos.propTypes = {
  atributosConfigurados: PropTypes.object.isRequired,
  formulariosVariantes: PropTypes.array.isRequired,
  handleFormularioChange: PropTypes.func.isRequired,
  handleAgregarFormulario: PropTypes.func.isRequired,
  handleEliminarVariante: PropTypes.func.isRequired,
  imagenes: PropTypes.array.isRequired,
  errores: PropTypes.object,
  tienePermiso: PropTypes.func.isRequired,
};

export default FormularioAtributos;