import React, { useState, useEffect } from 'react';
import { 
  obtenerCarritoPedidos, 
  obtenerProveedoresCarrito, 
  crearPedidoDesdeCarrito 
} from '../../../api/carritoPedidosApi';
import { FaShoppingCart, FaTimes, FaPlus, FaMinus, FaTrash } from 'react-icons/fa';
import config from '../../../config/config';
import tienePermiso from '../../../utils/tienePermiso';

const CarritoPedidosRapidos = ({ isOpen, onClose, onPedidoCreado }) => {
  const [carritoItems, setCarritoItems] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [fechaEsperadaEntrega, setFechaEsperadaEntrega] = useState('');
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      cargarDatos();
    }
  }, [isOpen]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = sessionStorage.getItem('token');
      
      const [carritoResponse, proveedoresResponse] = await Promise.all([
        obtenerCarritoPedidos(token),
        obtenerProveedoresCarrito(token)
      ]);
      
      setCarritoItems(carritoResponse.data || []);
      setProveedores(proveedoresResponse.data || []);
      
      // Autoseleccionar proveedor si hay uno solo
      if (proveedoresResponse.data?.length === 1) {
        setProveedorSeleccionado(proveedoresResponse.data[0].proveedor_id);
      }
      
    } catch (error) {
      console.error('Error al cargar datos del carrito:', error);
      setError('Error al cargar los datos del carrito');
    } finally {
      setLoading(false);
    }
  };

  const actualizarCantidad = (faltanteId, nuevaCantidad) => {
    if (nuevaCantidad < 1) return;
    
    setCarritoItems(prev => 
      prev.map(item => 
        item.faltante_id === faltanteId 
          ? { ...item, cantidad_carrito: nuevaCantidad }
          : item
      )
    );
  };

  const removerItem = (faltanteId) => {
    setCarritoItems(prev => 
      prev.filter(item => item.faltante_id !== faltanteId)
    );
  };

  const calcularTotal = () => {
    return carritoItems.reduce((total, item) => {
      return total + (item.cantidad_carrito * (item.precio_unitario || 0));
    }, 0);
  };

  const manejarCrearPedido = async () => {
    if (!proveedorSeleccionado) {
      alert('Por favor selecciona un proveedor');
      return;
    }

    if (carritoItems.length === 0) {
      alert('No hay items en el carrito');
      return;
    }

    if (!window.confirm(`¿Crear pedido por $${calcularTotal().toLocaleString()} con ${carritoItems.length} items?`)) {
      return;
    }

    try {
      setProcesando(true);
      const token = sessionStorage.getItem('token');

      const pedidoData = {
        proveedor_id: parseInt(proveedorSeleccionado),
        items: carritoItems.map(item => ({
          faltante_id: item.faltante_id,
          producto_id: item.producto_id,
          variante_id: item.variante_id,
          cantidad: item.cantidad_carrito,
          precio_unitario: item.precio_unitario || 0
        })),
        observaciones,
        fecha_esperada_entrega: fechaEsperadaEntrega || null
      };

      const response = await crearPedidoDesdeCarrito(pedidoData, token);
      
      if (response.status === 'success') {
        alert(`Pedido creado exitosamente. ID: ${response.data.pedido_id}`);
        onPedidoCreado && onPedidoCreado(response.data);
        onClose();
      }
      
    } catch (error) {
      console.error('Error al crear pedido:', error);
      alert('Error al crear el pedido. Por favor inténtalo de nuevo.');
    } finally {
      setProcesando(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <FaShoppingCart />
            <h2 className="text-lg font-semibold">Carrito de Pedidos Rápidos</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-200px)]">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-red-600 text-center py-4">
              <p>{error}</p>
              <button 
                onClick={cargarDatos}
                className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Reintentar
              </button>
            </div>
          ) : carritoItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FaShoppingCart size={48} className="mx-auto mb-4 opacity-50" />
              <p>No hay faltantes disponibles para pedir</p>
              <p className="text-sm mt-2">Los faltantes detectados aparecerán aquí automáticamente</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Items del carrito */}
              <div className="border rounded-lg">
                <h3 className="font-medium p-3 bg-gray-50 border-b">
                  Items para Pedir ({carritoItems.length})
                </h3>
                <div className="divide-y max-h-64 overflow-y-auto">
                  {carritoItems.map((item) => (
                    <div key={item.faltante_id} className="p-3 flex items-center space-x-3">
                      {/* Imagen */}
                      <div className="w-12 h-12 bg-gray-200 rounded flex-shrink-0 overflow-hidden">
                        {item.imagen_url ? (
                          <img 
                            src={`${config.backendUrl}${item.imagen_url}`}
                            alt={item.nombre}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                            Sin imagen
                          </div>
                        )}
                      </div>

                      {/* Información del producto */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{item.nombre}</p>
                        {item.valores_variante && (
                          <p className="text-xs text-gray-500">{item.valores_variante}</p>
                        )}
                        <p className="text-xs text-gray-600">
                          Stock: {item.stock_actual} | Mín: {item.stock_minimo}
                        </p>
                        <p className="text-xs text-green-600">
                          Sugerido: {item.cantidad_sugerida} unidades
                        </p>
                      </div>

                      {/* Controles de cantidad */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => actualizarCantidad(item.faltante_id, item.cantidad_carrito - 1)}
                          className="bg-gray-200 hover:bg-gray-300 rounded px-2 py-1"
                        >
                          <FaMinus size={10} />
                        </button>
                        <span className="w-12 text-center font-medium">
                          {item.cantidad_carrito}
                        </span>
                        <button
                          onClick={() => actualizarCantidad(item.faltante_id, item.cantidad_carrito + 1)}
                          className="bg-gray-200 hover:bg-gray-300 rounded px-2 py-1"
                        >
                          <FaPlus size={10} />
                        </button>
                      </div>

                      {/* Precio y total */}
                      <div className="text-right min-w-0">
                        <p className="text-sm font-medium">
                          ${(item.precio_unitario || 0).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">c/u</p>
                        <p className="text-sm font-bold text-blue-600">
                          ${(item.cantidad_carrito * (item.precio_unitario || 0)).toLocaleString()}
                        </p>
                      </div>

                      {/* Botón eliminar */}
                      <button
                        onClick={() => removerItem(item.faltante_id)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Remover del carrito"
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Configuración del pedido */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Proveedor */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Proveedor *
                  </label>
                  <select
                    value={proveedorSeleccionado}
                    onChange={(e) => setProveedorSeleccionado(e.target.value)}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Seleccionar proveedor...</option>
                    {proveedores.map(proveedor => (
                      <option key={proveedor.proveedor_id} value={proveedor.proveedor_id}>
                        {proveedor.proveedor_nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Fecha esperada */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Fecha Esperada de Entrega
                  </label>
                  <input
                    type="date"
                    value={fechaEsperadaEntrega}
                    onChange={(e) => setFechaEsperadaEntrega(e.target.value)}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              {/* Observaciones */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Observaciones
                </label>
                <textarea
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  rows={3}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Observaciones adicionales para el pedido..."
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {carritoItems.length > 0 && (
          <div className="border-t bg-gray-50 p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="font-medium">Total del Pedido:</span>
              <span className="text-xl font-bold text-blue-600">
                ${calcularTotal().toLocaleString()}
              </span>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              
              {tienePermiso('Gestionar Stock') && (
                <button
                  onClick={manejarCrearPedido}
                  disabled={procesando || !proveedorSeleccionado}
                  className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {procesando ? 'Creando...' : 'Crear Pedido'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CarritoPedidosRapidos;