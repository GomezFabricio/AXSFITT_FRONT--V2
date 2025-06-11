import React from 'react';
import tienePermiso from '../../utils/tienePermiso';

const ListaStock = ({ productos, handleActualizarStockMinimoMaximo }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full leading-normal">
        <thead>
          <tr>
            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Producto
            </th>
            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Stock Total
            </th>
            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Stock Mínimo
            </th>
            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Stock Máximo
            </th>
          </tr>
        </thead>
        <tbody>
          {productos.map(producto => (
            <tr key={producto.producto_id}>
              <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <img
                      className="w-8 h-8 rounded-full"
                      src={producto.imagen_url}
                      alt={producto.nombre}
                    />
                  </div>
                  <div className="ml-3">
                    <p className="text-gray-900 whitespace-no-wrap">
                      {producto.nombre}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                <p className="text-gray-900 whitespace-no-wrap">{producto.stock_total}</p>
              </td>
              <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                {tienePermiso('Gestionar Stock') ? (
                  <input
                    type="number"
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-24 sm:text-sm border-gray-300 rounded-md"
                    defaultValue={producto.stock_minimo || 0}
                    onChange={e => handleActualizarStockMinimoMaximo(producto.producto_id, e.target.value, producto.stock_maximo)}
                  />
                ) : (
                  <p className="text-gray-900 whitespace-no-wrap">{producto.stock_minimo || 0}</p>
                )}
              </td>
              <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                {tienePermiso('Gestionar Stock') ? (
                  <input
                    type="number"
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-24 sm:text-sm border-gray-300 rounded-md"
                    defaultValue={producto.stock_maximo || ''}
                    placeholder="Sin límite"
                    onChange={e => handleActualizarStockMinimoMaximo(producto.producto_id, producto.stock_minimo, e.target.value)}
                  />
                ) : (
                  <p className="text-gray-900 whitespace-no-wrap">{producto.stock_maximo || 'Sin límite'}</p>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ListaStock;