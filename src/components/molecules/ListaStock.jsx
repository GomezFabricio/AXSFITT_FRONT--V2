import React, { useState, useEffect } from 'react';
import tienePermiso from '../../utils/tienePermiso';

const ListaStock = ({ productos, handleActualizarStockMinimoMaximo }) => {
  const [expandedProducts, setExpandedProducts] = useState({});
  const [activeProducts, setActiveProducts] = useState([]);

  useEffect(() => {
    // Filter products and variants to only include those with an "activo" state
    const filteredProducts = productos.filter(item => {
      if (item.tipo === 'producto' && item.producto_estado === 'activo') {
        return true;
      }
      if (item.tipo === 'variante' && item.variante_estado === 'activo') {
        return true;
      }
      return false;
    });

    setActiveProducts(filteredProducts);
  }, [productos]);

  const toggleProductVariants = (productoId) => {
    setExpandedProducts(prev => ({
      ...prev,
      [productoId]: !prev[productoId]
    }));
  };

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
          {activeProducts
            .filter(item => item.tipo === 'producto')
            .map(producto => (
              <React.Fragment key={producto.producto_id}>
                <tr
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => toggleProductVariants(producto.producto_id)}
                >
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
                        <p className="text-gray-900 whitespace-no-wrap">{producto.nombre}</p>
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
                        onChange={e =>
                          handleActualizarStockMinimoMaximo(
                            producto.producto_id,
                            e.target.value,
                            producto.stock_maximo
                          )
                        }
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
                        onChange={e =>
                          handleActualizarStockMinimoMaximo(
                            producto.producto_id,
                            producto.stock_minimo,
                            e.target.value
                          )
                        }
                      />
                    ) : (
                      <p className="text-gray-900 whitespace-no-wrap">{producto.stock_maximo || 'Sin límite'}</p>
                    )}
                  </td>
                </tr>
                {/* Variant Rows */}
                {expandedProducts[producto.producto_id] &&
                  activeProducts
                    .filter(
                      item =>
                        item.tipo === 'variante' && item.producto_id === producto.producto_id
                    )
                    .map(variante => (
                      <tr key={variante.variante_id} className="bg-gray-50">
                        <td
                          className="px-5 py-3 border-b border-gray-200 bg-gray-50 text-sm"
                          colSpan="1"
                        >
                          <div className="flex items-center pl-8">
                            <div className="flex-shrink-0">
                              <img
                                className="w-6 h-6 rounded-full"
                                src={variante.imagen_url}
                                alt={variante.variante_sku}
                              />
                            </div>
                            <div className="ml-3">
                              <p className="text-gray-700 whitespace-no-wrap">
                                {variante.atributo_nombre}: {variante.valor_nombre || ''}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 border-b border-gray-200 bg-gray-50 text-sm">
                          <p className="text-gray-700 whitespace-no-wrap">{variante.stock_total}</p>
                        </td>
                        <td className="px-5 py-3 border-b border-gray-200 bg-gray-50 text-sm">
                          {tienePermiso('Gestionar Stock') ? (
                            <input
                              type="number"
                              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-24 sm:text-sm border-gray-300 rounded-md"
                              defaultValue={variante.stock_minimo || 0}
                              onChange={e =>
                                handleActualizarStockMinimoMaximo(
                                  variante.variante_id,
                                  e.target.value,
                                  variante.stock_maximo,
                                  true
                                )
                              }
                            />
                          ) : (
                            <p className="text-gray-700 whitespace-no-wrap">{variante.stock_minimo || 0}</p>
                          )}
                        </td>
                        <td className="px-5 py-3 border-b border-gray-200 bg-gray-50 text-sm">
                          {tienePermiso('Gestionar Stock') ? (
                            <input
                              type="number"
                              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-24 sm:text-sm border-gray-300 rounded-md"
                              defaultValue={variante.stock_maximo || ''}
                              placeholder="Sin límite"
                              onChange={e =>
                                handleActualizarStockMinimoMaximo(
                                  variante.variante_id,
                                  variante.stock_minimo,
                                  e.target.value,
                                  true
                                )
                              }
                            />
                          ) : (
                            <p className="text-gray-700 whitespace-no-wrap">{variante.stock_maximo || 'Sin límite'}</p>
                          )}
                        </td>
                      </tr>
                    ))}
              </React.Fragment>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default ListaStock;