import React from 'react';
import PropTypes from 'prop-types';

const DetallesStock = ({ detallesStock, onClose, onToggleEstadoVariante, tienePermiso }) => {
  if (!detallesStock) return null;

  const { producto, variantes } = detallesStock;

  return (
    <div className="mt-8 bg-gray-100 p-4 rounded-md shadow-md">
      <h3 className="text-xl font-semibold mb-4">Detalles de Stock</h3>
      <div className="flex flex-col gap-6">
        {/* Mostrar solo variantes si existen */}
        {variantes.length > 0 ? (
          <div>
            <h4 className="text-lg font-semibold mb-2">Variantes:</h4>
            <div className="flex flex-wrap gap-4">
              {variantes.map((variante) => (
                <div key={variante.variante_id} className="flex items-center gap-4 border p-3 rounded-md bg-white shadow-sm">
                  <img
                    src={variante.imagen_url}
                    alt={variante.variante_sku}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                  <div className="flex flex-col">
                    <p className="font-semibold">{variante.variante_sku}</p>
                    <p>
                      Precio:{' '}
                      {variante.variante_precio_oferta ? (
                        <>
                          <span className="line-through text-red-500">{variante.variante_precio_venta}</span>{' '}
                          {variante.variante_precio_oferta}
                        </>
                      ) : (
                        variante.variante_precio_venta
                      )}
                    </p>
                    <p>Stock: {variante.stock_total}</p>
                    {/* Mostrar atributos */}
                    {variante.atributos && (
                      <p>Atributos: {variante.atributos}</p>
                    )}
                    {/* Botón de alternar estado */}
                    {tienePermiso('Modificar Producto') && (
                      <button
                        onClick={() => onToggleEstadoVariante(variante.variante_id, variante.variante_estado === 'activo' ? 'inactivo' : 'activo')}
                        className={`px-3 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium
                          ${variante.variante_estado === 'activo'
                            ? 'border-2 border-red-500 text-red-600 hover:bg-red-500 hover:text-white'
                            : 'border-2 border-green-500 text-green-600 hover:bg-green-500 hover:text-white'
                          } transition-colors duration-200`}
                      >
                        {variante.variante_estado === 'activo' ? 'Deshabilitar' : 'Habilitar'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // Mostrar información del producto si no tiene variantes
          <div className="flex items-center gap-4 border p-3 rounded-md bg-white shadow-sm">
            <img
              src={producto.imagen_url}
              alt={producto.nombre}
              className="w-16 h-16 object-cover rounded-md"
            />
            <div className="flex flex-col">
              <p className="font-semibold">{producto.nombre}</p>
              <p>SKU: {producto.producto_sku}</p>
              <p>
                Precio:{' '}
                {producto.producto_precio_oferta ? (
                  <>
                    <span className="line-through text-red-500">{producto.producto_precio_venta}</span>{' '}
                    {producto.producto_precio_oferta}
                  </>
                ) : (
                  producto.producto_precio_venta
                )}
              </p>
              <p>Stock Total: {producto.stock_total}</p>
            </div>
          </div>
        )}
      </div>
      <button
        onClick={onClose}
        className="mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-700"
      >
        Cerrar
      </button>
    </div>
  );
};

DetallesStock.propTypes = {
  detallesStock: PropTypes.shape({
    producto: PropTypes.shape({
      imagen_url: PropTypes.string.isRequired,
      nombre: PropTypes.string.isRequired,
      producto_sku: PropTypes.string,
      producto_precio_venta: PropTypes.number,
      producto_precio_oferta: PropTypes.number,
      stock_total: PropTypes.number.isRequired,
    }).isRequired,
    variantes: PropTypes.arrayOf(
      PropTypes.shape({
        variante_id: PropTypes.number.isRequired,
        imagen_url: PropTypes.string,
        variante_sku: PropTypes.string, // Cambiar de `isRequired` a opcional
        variante_precio_venta: PropTypes.number,
        variante_precio_oferta: PropTypes.number,
        stock_total: PropTypes.number.isRequired,
        atributos: PropTypes.string,
        variante_estado: PropTypes.oneOf(['activo', 'inactivo']).isRequired, // Agregar validación para el estado
      })
    ).isRequired,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onToggleEstadoVariante: PropTypes.func.isRequired, // Agregar prop para la función de toggle
  tienePermiso: PropTypes.func.isRequired,
};

export default DetallesStock;