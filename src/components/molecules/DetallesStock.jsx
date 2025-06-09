import React from 'react';
import PropTypes from 'prop-types';

const DetallesStock = ({ detallesStock, onClose }) => {
  if (!detallesStock) return null;

  return (
    <div className="mt-8 bg-gray-100 p-4 rounded-md shadow-md">
      <h3 className="text-xl font-semibold mb-4">Detalles de Stock</h3>
      <div className="flex flex-col gap-6">
        {/* Información del producto */}
        <div className="flex items-center gap-4 border p-3 rounded-md bg-white shadow-sm">
          <img
            src={detallesStock.producto.imagen_url}
            alt={detallesStock.producto.nombre}
            className="w-16 h-16 object-cover rounded-md"
          />
          <div className="flex flex-col">
            <p className="font-semibold">{detallesStock.producto.nombre}</p>
            <p>SKU: {detallesStock.producto.producto_sku}</p>
            <p>
              Precio: {detallesStock.producto.producto_precio_oferta ? (
                <>
                  <span className="line-through text-red-500">{detallesStock.producto.producto_precio_venta}</span>{' '}
                  {detallesStock.producto.producto_precio_oferta}
                </>
              ) : (
                detallesStock.producto.producto_precio_venta
              )}
            </p>
            <p>Stock Total: {detallesStock.producto.stock_total}</p>
          </div>
        </div>

        {/* Información de las variantes */}
        {detallesStock.variantes.length > 0 && (
          <div>
            <h4 className="text-lg font-semibold mb-2">Variantes:</h4>
            <div className="flex flex-wrap gap-4">
              {detallesStock.variantes.map((variante) => (
                <div key={variante.variante_id} className="flex items-center gap-4 border p-3 rounded-md bg-white shadow-sm">
                  <img
                    src={variante.imagen_url}
                    alt={variante.variante_sku}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                  <div className="flex flex-col">
                    <p className="font-semibold">{variante.variante_sku}</p>
                    <p>
                      Precio: {variante.variante_precio_oferta ? (
                        <>
                          <span className="line-through text-red-500">{variante.variante_precio_venta}</span>{' '}
                          {variante.variante_precio_oferta}
                        </>
                      ) : (
                        variante.variante_precio_venta
                      )}
                    </p>
                    <p>Stock: {variante.stock_total}</p>
                    <p>Atributos: {variante.atributos}</p>
                  </div>
                </div>
              ))}
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
      producto_sku: PropTypes.string.isRequired,
      producto_precio_venta: PropTypes.number,
      producto_precio_oferta: PropTypes.number,
      stock_total: PropTypes.number.isRequired,
    }).isRequired,
    variantes: PropTypes.arrayOf(
      PropTypes.shape({
        variante_id: PropTypes.number.isRequired,
        imagen_url: PropTypes.string,
        variante_sku: PropTypes.string.isRequired,
        variante_precio_venta: PropTypes.number,
        variante_precio_oferta: PropTypes.number,
        stock_total: PropTypes.number.isRequired,
        atributos: PropTypes.string,
      })
    ).isRequired,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default DetallesStock;