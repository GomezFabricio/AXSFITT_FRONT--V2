import React, { useState, useEffect } from 'react';
import { FiShoppingCart, FiX, FiPlus, FiMinus, FiCheck, FiPackage, FiTrash2, FiAlertCircle } from 'react-icons/fi';
import * as carritoApi from '../../api/carritoPedidosApi';

const CarritoPedidosRapidos = ({ isOpen, onClose, onPedidoCreado }) => {
  const [carrito, setCarrito] = useState({ items: [], proveedor_id: null });
  const [faltantes, setFaltantes] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [creandoPedido, setCreandoPedido] = useState(false);

  // Obtener carrito, faltantes y proveedores al abrir el modal
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
      if (!token) {
        setError('No se encontró token de autenticación');
        return;
      }
      
      console.log('🔄 [CARRITO] Cargando datos del carrito...');

      // Cargar todos los datos en paralelo usando las nuevas funciones de la API
      const [carritoResponse, faltantesResponse, proveedoresResponse] = await Promise.all([
        carritoApi.obtenerCarrito(token),
        carritoApi.obtenerFaltantesDisponibles(token),
        carritoApi.obtenerProveedores(token)
      ]);

      // Procesar respuestas (todas siguen el patrón estándar ahora)
      setCarrito(carritoResponse.data || { items: [], proveedor_id: null });
      setFaltantes(faltantesResponse.data || []);
      setProveedores(proveedoresResponse.data || []);

      console.log('✅ [CARRITO] Datos cargados exitosamente');
    } catch (error) {
      console.error('❌ [CARRITO] Error al cargar datos:', error);
      if (error.response?.status === 401) {
        setError('Sesión expirada. Por favor, inicia sesión nuevamente.');
      } else if (error.response?.status === 403) {
        setError('No tienes permisos para gestionar el carrito.');
      } else if (error.code === 'ECONNABORTED') {
        setError('Timeout de conexión - El servidor tardó demasiado en responder.');
      } else if (error.message?.includes('Network Error')) {
        setError('Error de conexión - Verifica que el servidor esté ejecutándose en http://localhost:3000');
      } else {
        setError('Error de configuración: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Función de diagnóstico para probar conectividad
  const probarConexion = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await carritoApi.probarConexion(token);
      console.log('✅ [DIAGNÓSTICO] Conexión exitosa:', response);
      alert('✅ Conexión exitosa! Verifique la consola para detalles.');
      return true;
    } catch (error) {
      console.error('❌ [DIAGNÓSTICO] Error de conexión:', error);
      alert('❌ Error de conexión. Verifique que el backend esté corriendo.');
      return false;
    }
  };

  // Agregar faltante al carrito
  const agregarFaltante = async (faltante) => {
    try {
      console.log('➕ [CARRITO] Agregando faltante:', faltante);
      
      const token = sessionStorage.getItem('token');
      if (!token) {
        setError('No se encontró token de autenticación');
        return;
      }

      const response = await carritoApi.agregarAlCarrito({
        faltante_id: faltante.faltante_id,
        variante_id: faltante.faltante_variante_id,
        cantidad: faltante.faltante_cantidad_faltante
      }, token);
      
      // Actualizar estado del carrito
      setCarrito(response.data || { items: [], proveedor_id: null });
      
      console.log('✅ [CARRITO] Faltante agregado exitosamente');
    } catch (error) {
      console.error('❌ [CARRITO] Error al agregar faltante:', error);
      setError('Error al agregar el faltante al carrito: ' + (error.response?.data?.message || error.message));
    }
  };

  // Actualizar cantidad de item en carrito
  const actualizarCantidad = async (itemKey, nuevaCantidad) => {
    if (nuevaCantidad <= 0) return;
    
    try {
      const token = sessionStorage.getItem('token');
      const response = await carritoApi.actualizarCantidadCarrito(itemKey, nuevaCantidad, token);
      setCarrito(response.data || { items: [], proveedor_id: null });
    } catch (error) {
      console.error('❌ [CARRITO] Error al actualizar cantidad:', error);
      setError('Error al actualizar la cantidad');
    }
  };

  // Quitar item del carrito
  const quitarDelCarrito = async (itemKey) => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await carritoApi.quitarDelCarrito(itemKey, token);
      setCarrito(response.data || { items: [], proveedor_id: null });
    } catch (error) {
      console.error('❌ [CARRITO] Error al quitar del carrito:', error);
      setError('Error al quitar el item del carrito');
    }
  };

  // Seleccionar proveedor
  const seleccionarProveedor = async (proveedorId) => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await carritoApi.seleccionarProveedor(proveedorId, token);
      setCarrito(response.data || { items: [], proveedor_id: null });
    } catch (error) {
      console.error('❌ [CARRITO] Error al seleccionar proveedor:', error);
      setError('Error al seleccionar el proveedor');
    }
  };

  // Vaciar carrito
  const vaciarCarrito = async () => {
    try {
      const token = sessionStorage.getItem('token');
      await carritoApi.vaciarCarrito(token);
      setCarrito({ items: [], proveedor_id: null });
    } catch (error) {
      console.error('❌ [CARRITO] Error al vaciar carrito:', error);
      setError('Error al vaciar el carrito');
    }
  };

  // Agregar todos los faltantes
  const agregarTodosFaltantes = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await carritoApi.agregarTodosFaltantes(token);
      setCarrito(response.data || { items: [], proveedor_id: null });
    } catch (error) {
      console.error('❌ [CARRITO] Error al agregar todos los faltantes:', error);
      setError('Error al agregar todos los faltantes');
    }
  };

  // Confirmar pedido
  const confirmarPedido = async () => {
    if (!carrito.items?.length) {
      setError('El carrito está vacío');
      return;
    }

    if (!carrito.proveedor_id) {
      setError('Debe seleccionar un proveedor antes de confirmar el pedido');
      return;
    }

    setCreandoPedido(true);
    setError(null);

    try {
      const token = sessionStorage.getItem('token');
      const response = await carritoApi.confirmarPedido(token);
      
      // Limpiar carrito y cerrar modal
      setCarrito({ items: [], proveedor_id: null });
      
      if (onPedidoCreado) {
        onPedidoCreado(response.data);
      }
      
      alert('✅ Pedido creado exitosamente');
      onClose();
    } catch (error) {
      console.error('❌ [CARRITO] Error al confirmar pedido:', error);
      setError('Error al confirmar el pedido: ' + (error.response?.data?.message || error.message));
    } finally {
      setCreandoPedido(false);
    }
  };

  // Manejar cierre del modal
  const handleClose = () => {
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-11/12 max-w-6xl h-5/6 flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-xl">
          <div className="flex items-center space-x-3">
            <FiShoppingCart className="h-6 w-6" />
            <h2 className="text-2xl font-bold">Carrito de Pedido Rápido</h2>
          </div>
          <button 
            onClick={handleClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors duration-200"
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Faltantes Disponibles - Panel Izquierdo */}
          <div className="w-1/2 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Faltantes Disponibles</h3>
              <div className="flex space-x-2">
                <button
                  onClick={cargarDatos}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors duration-200"
                >
                  {loading ? 'Cargando...' : 'Actualizar'}
                </button>
                <button
                  onClick={probarConexion}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200"
                >
                  Probar Conexión
                </button>
                <button
                  onClick={agregarTodosFaltantes}
                  disabled={!faltantes.length}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 transition-colors duration-200"
                >
                  Agregar Todos
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : faltantes.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <FiPackage className="h-16 w-16 mb-4" />
                  <p className="text-lg">No hay faltantes disponibles</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {faltantes.map((faltante, index) => (
                    <div key={`${faltante.faltante_id}-${index}`} 
                         className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow duration-200">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900 text-sm">
                          {faltante.producto_nombre || 'Producto desconocido'}
                        </h4>
                        <button
                          onClick={() => agregarFaltante(faltante)}
                          className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition-colors duration-200"
                        >
                          <FiPlus className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><span className="font-medium">SKU:</span> {faltante.variante_sku || 'N/A'}</p>
                        <p><span className="font-medium">Atributos:</span> {faltante.atributos || 'Sin atributos'}</p>
                        <p><span className="font-medium">Cantidad faltante:</span> {faltante.faltante_cantidad_faltante}</p>
                        <p><span className="font-medium">Precio estimado:</span> ${faltante.variante_precio_venta || 0}</p>
                        <p className="text-xs text-gray-500">
                          <span className="font-medium">Stock actual:</span> {faltante.stock_actual || 0}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Carrito - Panel Derecho */}
          <div className="w-1/2 flex flex-col">
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Carrito de Compra</h3>
              
              {/* Selector de Proveedor */}
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Proveedor:
                </label>
                <select
                  value={carrito.proveedor_id || ''}
                  onChange={(e) => seleccionarProveedor(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar proveedor...</option>
                  {proveedores.map(proveedor => (
                    <option key={proveedor.proveedor_id} value={proveedor.proveedor_id}>
                      {proveedor.proveedor_nombre}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={vaciarCarrito}
                  disabled={!carrito.items?.length}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors duration-200"
                >
                  <FiTrash2 className="h-4 w-4 inline mr-2" />
                  Vaciar
                </button>
                <button
                  onClick={confirmarPedido}
                  disabled={!carrito.items?.length || !carrito.proveedor_id || creandoPedido}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors duration-200"
                >
                  {creandoPedido ? 'Procesando...' : (
                    <>
                      <FiCheck className="h-4 w-4 inline mr-2" />
                      Confirmar Pedido
                    </>
                  )}
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {carrito.items?.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <FiShoppingCart className="h-16 w-16 mb-4" />
                  <p className="text-lg">El carrito está vacío</p>
                  <p className="text-sm">Agregue productos desde la lista de faltantes</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {carrito.items?.map((item, index) => (
                    <div key={`${item.item_key || index}`} 
                         className="border border-gray-200 rounded-lg p-4 bg-white">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900 text-sm">
                          {item.producto_nombre || 'Producto desconocido'}
                        </h4>
                        <button
                          onClick={() => quitarDelCarrito(item.item_key)}
                          className="text-red-500 hover:text-red-700 transition-colors duration-200"
                        >
                          <FiX className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1 mb-3">
                        <p><span className="font-medium">SKU:</span> {item.variante_sku || 'N/A'}</p>
                        <p><span className="font-medium">Atributos:</span> {item.atributos || 'Sin atributos'}</p>
                        <p><span className="font-medium">Precio:</span> ${item.precio || 0}</p>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => actualizarCantidad(item.item_key, (item.cantidad || 1) - 1)}
                            disabled={(item.cantidad || 0) <= 1}
                            className="bg-gray-200 text-gray-700 p-1 rounded hover:bg-gray-300 disabled:opacity-50 transition-colors duration-200"
                          >
                            <FiMinus className="h-3 w-3" />
                          </button>
                          <span className="px-3 py-1 bg-gray-100 rounded text-sm font-medium">
                            {item.cantidad || 0}
                          </span>
                          <button
                            onClick={() => actualizarCantidad(item.item_key, (item.cantidad || 0) + 1)}
                            className="bg-gray-200 text-gray-700 p-1 rounded hover:bg-gray-300 transition-colors duration-200"
                          >
                            <FiPlus className="h-3 w-3" />
                          </button>
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          Subtotal: ${((item.precio || 0) * (item.cantidad || 0)).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Resumen del pedido */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Resumen del Pedido</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Items:</span>
                          <span>{carrito.items?.length || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Cantidad total:</span>
                          <span>{carrito.items?.reduce((sum, item) => sum + (item.cantidad || 0), 0) || 0}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-gray-900 border-t pt-1">
                          <span>Total estimado:</span>
                          <span>${carrito.items?.reduce((sum, item) => sum + ((item.precio || 0) * (item.cantidad || 0)), 0).toFixed(2) || '0.00'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 border-t border-gray-200 bg-red-50">
            <div className="flex items-center space-x-2 text-red-800">
              <FiAlertCircle className="h-5 w-5" />
              <span className="text-sm font-medium">{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-600 hover:text-red-800 transition-colors duration-200"
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CarritoPedidosRapidos;