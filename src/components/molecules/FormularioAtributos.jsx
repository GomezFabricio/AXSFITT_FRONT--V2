import React from 'react';

const FormularioAtributos = ({
  usarAtributos,
  setUsarAtributos,
  atributosConfigurados,
  setAtributosConfigurados,
  formulariosVariantes,
  setFormulariosVariantes,
  handleFormularioChange,
  handleAgregarFormulario,
  handleEliminarVariante,
  imagenes,
  errores,
}) => {
  return (
    <div>
      {/* Activar atributos */}
      <div>
        <label className="block text-sm font-medium text-gray-700">¿Usar Atributos?</label>
        <select
          value={usarAtributos}
          onChange={(e) => setUsarAtributos(e.target.value === 'true')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="false">No</option>
          <option value="true">Sí</option>
        </select>
      </div>

      {/* Configuración de atributos */}
      {usarAtributos && (
        <>
          <button
            type="button"
            onClick={() => setAtributosConfigurados({ ...atributosConfigurados })}
            className="px-4 py-2 border border-purple-600 text-purple-600 rounded-md text-sm hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500 mt-4"
          >
            Configurar Atributos
          </button>

          {formulariosVariantes.map((formulario, index) => (
            <div key={index} className="mt-4 border p-4 rounded">
              <h4 className="text-md font-semibold">Variante {index + 1}</h4>

              {/* Campos de atributos */}
              {atributosConfigurados.atributos.map((atributo) => (
                <div key={atributo.atributo_nombre} className="mb-2">
                  <label className="block text-sm font-medium text-gray-700">{atributo.atributo_nombre}:</label>
                  <input
                    type="text"
                    value={formulario[atributo.atributo_nombre] || ''}
                    onChange={(e) => handleFormularioChange(index, atributo.atributo_nombre, e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              ))}

              {/* Campos adicionales */}
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700">Precio Costo:</label>
                <input
                  type="number"
                  value={formulario.precioCosto || ''}
                  onChange={(e) => handleFormularioChange(index, 'precioCosto', e.target.value)}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                    errores[`formulario_${index}_precioCosto`] ? 'border-red-500' : ''
                  }`}
                />
                {errores[`formulario_${index}_precioCosto`] && (
                  <p className="text-sm text-red-500 mt-1">{errores[`formulario_${index}_precioCosto`]}</p>
                )}
              </div>

              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700">Precio Venta:</label>
                <input
                  type="number"
                  value={formulario.precioVenta || ''}
                  onChange={(e) => handleFormularioChange(index, 'precioVenta', e.target.value)}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                    errores[`formulario_${index}_precioVenta`] ? 'border-red-500' : ''
                  }`}
                />
                {errores[`formulario_${index}_precioVenta`] && (
                  <p className="text-sm text-red-500 mt-1">{errores[`formulario_${index}_precioVenta`]}</p>
                )}
              </div>

              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700">Precio Oferta:</label>
                <input
                  type="number"
                  value={formulario.precioOferta || ''}
                  onChange={(e) => handleFormularioChange(index, 'precioOferta', e.target.value)}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                    errores[`formulario_${index}_precioOferta`] ? 'border-red-500' : ''
                  }`}
                />
                {errores[`formulario_${index}_precioOferta`] && (
                  <p className="text-sm text-red-500 mt-1">{errores[`formulario_${index}_precioOferta`]}</p>
                )}
              </div>

              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700">Stock:</label>
                <input
                  type="number"
                  value={formulario.stock || ''}
                  onChange={(e) => handleFormularioChange(index, 'stock', e.target.value)}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                    errores[`formulario_${index}_stock`] ? 'border-red-500' : ''
                  }`}
                />
                {errores[`formulario_${index}_stock`] && (
                  <p className="text-sm text-red-500 mt-1">{errores[`formulario_${index}_stock`]}</p>
                )}
              </div>

              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700">SKU:</label>
                <input
                  type="text"
                  value={formulario.sku || ''}
                  onChange={(e) => handleFormularioChange(index, 'sku', e.target.value)}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                    errores[`formulario_${index}_sku`] ? 'border-red-500' : ''
                  }`}
                />
                {errores[`formulario_${index}_sku`] && (
                  <p className="text-sm text-red-500 mt-1">{errores[`formulario_${index}_sku`]}</p>
                )}
              </div>

              {/* Selección de imagen */}
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700">Imagen:</label>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  {imagenes.map((imagen) => (
                    <div
                      key={imagen.id}
                      className={`cursor-pointer border rounded-md p-1 ${
                        formulario.imagen_url === imagen.url ? 'border-blue-500' : 'border-gray-300'
                      }`}
                      onClick={() => handleFormularioChange(index, 'imagen_url', imagen.url)}
                      style={{ width: '100px', height: '100px' }}
                    >
                      <img
                        src={imagen.url}
                        alt={`Imagen ${imagen.id}`}
                        className="w-full h-full object-cover rounded-md"
                      />
                    </div>
                  ))}
                </div>
                {formulario.imagen_url && (
                  <p className="text-sm text-gray-600 mt-2">Imagen seleccionada: {formulario.imagen_url}</p>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleEliminarVariante(index)}
                className="px-2 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Eliminar Variante
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={handleAgregarFormulario}
            className="px-4 py-2 border border-green-500 text-green-500 rounded-md text-sm hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-300 mt-2"
          >
            Agregar Variante
          </button>
        </>
      )}
    </div>
  );
};

export default FormularioAtributos;