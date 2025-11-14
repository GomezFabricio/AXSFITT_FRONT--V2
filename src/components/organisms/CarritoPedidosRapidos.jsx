import React, { useState, useEffect } from 'react';
import { FiShoppingCart, FiX, FiPlus, FiMinus, FiCheck, FiPackage, FiTrash2 } from 'react-icons/fi';

const CarritoPedidosRapidos = ({ isOpen, onClose, onPedidoCreado }) => {
  const [carrito, setCarrito] = useState({ items: [], proveedor_id: null });
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [creandoPedido, setCreandoPedido] = useState(false);

  // Obtener carrito y proveedores al abrir el modal
  useEffect(() => {
    if (isOpen) {
      cargarDatos();
    }
  }, [isOpen]);

  const cargarDatos = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = sessionStorage.getItem('token');
      
      // Cargar carrito actual
      const responseCarrito = await fetch('/api/carrito-pedidos/carrito', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (responseCarrito.ok) {
        const dataCarrito = await responseCarrito.json();
        setCarrito(dataCarrito.data || { items: [], proveedor_id: null });
      }

      // Cargar proveedores
      const responseProveedores = await fetch('/api/carrito-pedidos/proveedores', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (responseProveedores.ok) {
        const dataProveedores = await responseProveedores.json();
        setProveedores(dataProveedores.data || []);
      }

    } catch (error) {
      console.error('Error al cargar datos:', error);
      setError('Error al cargar datos del carrito');
    } finally {
      setLoading(false);
    }
  };

  const actualizarCantidad = async (itemKey, nuevaCantidad) => {
    if (nuevaCantidad <= 0) return;
    
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch('/api/carrito-pedidos/carrito/cantidad', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          item_key: itemKey,
          cantidad: nuevaCantidad
        })
      });

      if (response.ok) {
        const data = await response.json();
        setCarrito(data.data);
      } else {
        throw new Error('Error al actualizar cantidad');
      }
    } catch (error) {
      console.error('Error al actualizar cantidad:', error);
      setError('Error al actualizar cantidad');
    }
  };

  const quitarItem = async (itemKey) => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch('/api/carrito-pedidos/carrito/quitar', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ item_key: itemKey })
      });

      if (response.ok) {
        const data = await response.json();
        setCarrito(data.data);
      } else {
        throw new Error('Error al quitar item');
      }
    } catch (error) {
      console.error('Error al quitar item:', error);
      setError('Error al quitar item del carrito');
    }
  };

  const seleccionarProveedor = async (proveedorId) => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch('/api/carrito-pedidos/carrito/proveedor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ proveedor_id: proveedorId })
      });

      if (response.ok) {
        const data = await response.json();
        setCarrito(data.data);
      } else {
        throw new Error('Error al seleccionar proveedor');
      }
    } catch (error) {
      console.error('Error al seleccionar proveedor:', error);
      setError('Error al seleccionar proveedor');
    }
  };

  const vaciarCarrito = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch('/api/carrito-pedidos/carrito/vaciar', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCarrito(data.data);
      } else {
        throw new Error('Error al vaciar carrito');
      }
    } catch (error) {
      console.error('Error al vaciar carrito:', error);
      setError('Error al vaciar carrito');
    }
  };

  const confirmarPedido = async () => {
    if (!carrito.proveedor_id) {
      setError('Debe seleccionar un proveedor');
      return;
    }

    if (!carrito.items.length) {
      setError('El carrito está vacío');
      return;
    }

    setCreandoPedido(true);
    setError(null);

    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch('/api/carrito-pedidos/carrito/confirmar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Mostrar mensaje de éxito
        alert(`✅ Pedido #${data.data.pedido_id} creado exitosamente!\n${data.data.items_procesados} productos agregados.`);
        
        // Limpiar carrito y cerrar modal
        setCarrito({ items: [], proveedor_id: null });
        
        // Notificar al componente padre
        if (onPedidoCreado) {
          onPedidoCreado(data.data);
        }
        
        onClose();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear pedido');
      }
    } catch (error) {
      console.error('Error al crear pedido:', error);
      setError(error.message || 'Error al crear pedido');
    } finally {
      setCreandoPedido(false);
    }
  };

  const calcularTotal = () => {
    return carrito.items.reduce((total, item) => {
      return total + (item.cantidad * (item.precio_estimado || 0));
    }, 0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <FiShoppingCart className="text-blue-600 text-xl" />
            <h2 className="text-xl font-bold text-gray-800">Carrito de Pedido Rápido</h2>
            {carrito.items.length > 0 && (
              <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full">
                {carrito.items.length} item{carrito.items.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando carrito...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Error */}
              {error && (
                <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {/* Items del carrito */}
              <div className="flex-1 overflow-y-auto p-4">
                {carrito.items.length === 0 ? (
                  <div className="text-center py-12">
                    <FiPackage className="text-gray-400 text-4xl mx-auto mb-4" />
                    <p className="text-gray-600 text-lg mb-2">El carrito está vacío</p>
                    <p className="text-gray-500 text-sm">
                      Ve a la vista de faltantes y agrega productos usando los botones "Pedir"
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {carrito.items.map((item) => (
                      <div key={item.key} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-start justify-between">
                          
                          {/* Info del producto */}
                          <div className="flex items-center space-x-3 flex-1">
                            <div className="w-12 h-12 rounded-lg bg-gray-200 flex-shrink-0 overflow-hidden">
                              {item.imagen_url ? (
                                <img 
                                  src={item.imagen_url} 
                                  alt={item.producto_nombre}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  <FiPackage size={20} />
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 truncate">
                                {item.producto_nombre}
                              </h4>
                              {item.tipo === 'variante' && (
                                <p className="text-sm text-gray-600">
                                  SKU: {item.variante_sku} • {item.atributos}
                                </p>
                              )}
                              <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                                <span>Stock: {item.stock_actual}</span>
                                <span>Mín: {item.stock_minimo}</span>
                                {item.stock_actual === 0 && (
                                  <span className="text-red-600 font-medium">⚠️ SIN STOCK</span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Controles de cantidad */}
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => actualizarCantidad(item.key, item.cantidad - 1)}
                              disabled={item.cantidad <= 1}
                              className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                              <FiMinus size={14} />
                            </button>
                            
                            <span className="w-12 text-center font-medium">
                              {item.cantidad}
                            </span>
                            
                            <button
                              onClick={() => actualizarCantidad(item.key, item.cantidad + 1)}
                              className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                            >
                              <FiPlus size={14} />
                            </button>

                            {/* Botón eliminar */}
                            <button
                              onClick={() => quitarItem(item.key)}
                              className="w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center ml-2"
                              title="Eliminar del carrito"
                            >
                              <FiTrash2 size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Precio */}
                        {item.precio_estimado > 0 && (
                          <div className="mt-2 text-right text-sm text-gray-600">
                            Subtotal: ${(item.cantidad * item.precio_estimado).toFixed(2)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer - Selección de proveedor y confirmación */}
              {carrito.items.length > 0 && (
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                  
                  {/* Selector de proveedor */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Proveedor
                    </label>
                    <select
                      value={carrito.proveedor_id || ''}
                      onChange={(e) => seleccionarProveedor(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Seleccionar proveedor...</option>
                      {proveedores.map((proveedor) => (
                        <option key={proveedor.proveedor_id} value={proveedor.proveedor_id}>
                          {proveedor.proveedor_nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Total estimado */}
                  {calcularTotal() > 0 && (
                    <div className="mb-4 text-right">
                      <span className="text-lg font-semibold text-gray-800">
                        Total estimado: ${calcularTotal().toFixed(2)}
                      </span>
                    </div>
                  )}

                  {/* Botones de acción */}
                  <div className="flex justify-between">
                    <button
                      onClick={vaciarCarrito}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      Vaciar carrito
                    </button>

                    <div className="space-x-2">
                      <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={confirmarPedido}
                        disabled={!carrito.proveedor_id || creandoPedido || carrito.items.length === 0}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center space-x-2"
                      >
                        {creandoPedido ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Creando...</span>
                          </>
                        ) : (
                          <>
                            <FiCheck size={16} />
                            <span>Confirmar Pedido</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CarritoPedidosRapidos;