import React, { useState } from 'react';
import tienePermiso from '../../utils/tienePermiso';
import { actualizarStockMinimoMaximo } from '../../api/stockApi';

const ListaStock = ({ productos }) => {
  // Estado para el modo de edición
  const [editingId, setEditingId] = useState(null);
  const [stockMinimo, setStockMinimo] = useState('');
  const [stockMaximo, setStockMaximo] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Agrupar los productos por su ID
  const productosAgrupados = {};
  
  productos.forEach(item => {
    if (item.tipo === 'producto') {
      if (!productosAgrupados[item.producto_id]) {
        productosAgrupados[item.producto_id] = {
          producto: item,
          variantes: []
        };
      } else {
        productosAgrupados[item.producto_id].producto = item;
      }
    } else if (item.tipo === 'variante') {
      if (!productosAgrupados[item.producto_id]) {
        productosAgrupados[item.producto_id] = {
          producto: null,
          variantes: [item]
        };
      } else {
        productosAgrupados[item.producto_id].variantes.push(item);
      }
    }
  });

  // Función para iniciar la edición
  const handleEditStart = (id, currentMin, currentMax, tipo) => {
    setEditingId({ id, tipo });
    setStockMinimo(currentMin !== null ? currentMin : '0');
    setStockMaximo(currentMax !== null ? currentMax : '');
  };

  // Función para guardar los cambios
  const handleSaveChanges = async () => {
    if (!editingId) return;
    
    try {
      setIsUpdating(true);
      const token = sessionStorage.getItem('token');
      await actualizarStockMinimoMaximo(
        editingId.id, 
        stockMinimo,
        stockMaximo,
        editingId.tipo,
        token
      );
      
      // Actualizar la UI después de guardar (mejor sería recargar los datos)
      setIsUpdating(false);
      setEditingId(null);
      // Recargar la página para ver los cambios
      window.location.reload();
    } catch (error) {
      console.error("Error al actualizar stock:", error);
      setIsUpdating(false);
      alert("Error al actualizar el stock. Inténtelo de nuevo.");
    }
  };

  // Función para cancelar la edición
  const handleCancelEdit = () => {
    setEditingId(null);
    setStockMinimo('');
    setStockMaximo('');
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Producto</th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">SKU</th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Stock Actual</th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Stock Mínimo</th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Stock Máximo</th>
            {tienePermiso('Establecer Stock') && (
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Acciones</th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {Object.values(productosAgrupados).map(({ producto, variantes }) => {
            // Si tiene variantes, mostrar solo las variantes
            if (variantes.length > 0) {
              return variantes.map(variante => (
                <tr key={`variante-${variante.variante_id}`} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img 
                          className="h-10 w-10 rounded-full object-cover" 
                          src={variante.imagen_url || 'https://via.placeholder.com/40'} 
                          alt={variante.producto_nombre}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {variante.producto_nombre}
                        </div>
                        <div className="text-sm text-gray-500">
                          {variante.atributo_nombre}: {variante.valor_nombre}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700">
                    {variante.variante_sku || 'N/A'}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700">
                    {variante.stock_total}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700">
                    {editingId && editingId.id === variante.variante_id ? (
                      <input 
                        type="number" 
                        min="0"
                        className="w-20 p-1 border rounded"
                        value={stockMinimo}
                        onChange={e => setStockMinimo(e.target.value)}
                      />
                    ) : (
                      variante.stock_minimo !== null ? variante.stock_minimo : 0
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700">
                    {editingId && editingId.id === variante.variante_id ? (
                      <input 
                        type="number" 
                        min="0"
                        className="w-20 p-1 border rounded"
                        value={stockMaximo}
                        onChange={e => setStockMaximo(e.target.value)}
                      />
                    ) : (
                      variante.stock_maximo !== null ? variante.stock_maximo : 0
                    )}
                  </td>
                  {tienePermiso('Establecer Stock') && (
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {editingId && editingId.id === variante.variante_id ? (
                        <>
                          <button 
                            onClick={handleSaveChanges}
                            disabled={isUpdating}
                            className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded mr-2"
                          >
                            {isUpdating ? 'Guardando...' : 'Guardar'}
                          </button>
                          <button 
                            onClick={handleCancelEdit}
                            className="bg-gray-500 hover:bg-gray-600 text-white py-1 px-3 rounded"
                          >
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <button 
                          onClick={() => handleEditStart(variante.variante_id, variante.stock_minimo, variante.stock_maximo, 'variante')}
                          className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded"
                        >
                          Modificar
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ));
            } 
            // Si no tiene variantes, mostrar el producto
            else if (producto) {
              return (
                <tr key={`producto-${producto.producto_id}`} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img 
                          className="h-10 w-10 rounded-full object-cover" 
                          src={producto.imagen_url || 'https://via.placeholder.com/40'} 
                          alt={producto.nombre}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {producto.nombre}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700">
                    {producto.producto_sku || 'N/A'}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700">
                    {producto.stock_total}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700">
                    {editingId && editingId.id === producto.producto_id ? (
                      <input 
                        type="number" 
                        min="0"
                        className="w-20 p-1 border rounded"
                        value={stockMinimo}
                        onChange={e => setStockMinimo(e.target.value)}
                      />
                    ) : (
                      producto.stock_minimo !== null ? producto.stock_minimo : 0
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700">
                    {editingId && editingId.id === producto.producto_id ? (
                      <input 
                        type="number" 
                        min="0"
                        className="w-20 p-1 border rounded"
                        value={stockMaximo}
                        onChange={e => setStockMaximo(e.target.value)}
                      />
                    ) : (
                      producto.stock_maximo !== null ? producto.stock_maximo : 0
                    )}
                  </td>
                  {tienePermiso('Establecer Stock') && (
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {editingId && editingId.id === producto.producto_id ? (
                        <>
                          <button 
                            onClick={handleSaveChanges}
                            disabled={isUpdating}
                            className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded mr-2"
                          >
                            {isUpdating ? 'Guardando...' : 'Guardar'}
                          </button>
                          <button 
                            onClick={handleCancelEdit}
                            className="bg-gray-500 hover:bg-gray-600 text-white py-1 px-3 rounded"
                          >
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <button 
                          onClick={() => handleEditStart(producto.producto_id, producto.stock_minimo, producto.stock_maximo, 'producto')}
                          className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded"
                        >
                          Modificar
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              );
            }
            return null;
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ListaStock;