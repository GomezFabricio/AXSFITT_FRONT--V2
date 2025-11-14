/**
 * API hooks para Carrito de Pedidos Rápidos
 * Funciones para interactuar con el backend del carrito
 */

const API_BASE = '/api/carrito-pedidos';

// Función helper para hacer requests autenticadas
const makeAuthenticatedRequest = async (url, options = {}) => {
  const token = sessionStorage.getItem('token');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    },
    ...options
  };

  const response = await fetch(url, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Error de conexión' }));
    throw new Error(errorData.message || `Error ${response.status}`);
  }
  
  return response.json();
};

// ==================== GESTIÓN DEL CARRITO ====================

/**
 * Obtener el carrito actual del usuario
 * @returns {Promise<Object>} Datos del carrito
 */
export const obtenerCarrito = async () => {
  return makeAuthenticatedRequest(`${API_BASE}/carrito`);
};

/**
 * Agregar un faltante al carrito
 * @param {Object} datos - { faltante_id?, producto_id?, variante_id?, cantidad_necesaria? }
 * @returns {Promise<Object>} Carrito actualizado
 */
export const agregarAlCarrito = async (datos) => {
  return makeAuthenticatedRequest(`${API_BASE}/carrito/agregar`, {
    method: 'POST',
    body: JSON.stringify(datos)
  });
};

/**
 * Quitar un item del carrito
 * @param {string} itemKey - Clave del item a eliminar
 * @returns {Promise<Object>} Carrito actualizado
 */
export const quitarDelCarrito = async (itemKey) => {
  return makeAuthenticatedRequest(`${API_BASE}/carrito/quitar`, {
    method: 'DELETE',
    body: JSON.stringify({ item_key: itemKey })
  });
};

/**
 * Actualizar cantidad de un item en el carrito
 * @param {string} itemKey - Clave del item
 * @param {number} cantidad - Nueva cantidad
 * @returns {Promise<Object>} Carrito actualizado
 */
export const actualizarCantidadCarrito = async (itemKey, cantidad) => {
  return makeAuthenticatedRequest(`${API_BASE}/carrito/cantidad`, {
    method: 'PUT',
    body: JSON.stringify({ item_key: itemKey, cantidad })
  });
};

/**
 * Agregar todos los faltantes pendientes al carrito
 * @returns {Promise<Object>} Resultado de la operación
 */
export const agregarTodosFaltantes = async () => {
  return makeAuthenticatedRequest(`${API_BASE}/carrito/agregar-todos`, {
    method: 'POST'
  });
};

/**
 * Vaciar completamente el carrito
 * @returns {Promise<Object>} Carrito vacío
 */
export const vaciarCarrito = async () => {
  return makeAuthenticatedRequest(`${API_BASE}/carrito/vaciar`, {
    method: 'DELETE'
  });
};

// ==================== GESTIÓN DE PROVEEDORES ====================

/**
 * Obtener lista de proveedores activos
 * @returns {Promise<Array>} Lista de proveedores
 */
export const obtenerProveedores = async () => {
  return makeAuthenticatedRequest(`${API_BASE}/proveedores`);
};

/**
 * Seleccionar proveedor para el carrito
 * @param {number} proveedorId - ID del proveedor
 * @returns {Promise<Object>} Carrito actualizado
 */
export const seleccionarProveedor = async (proveedorId) => {
  return makeAuthenticatedRequest(`${API_BASE}/carrito/proveedor`, {
    method: 'POST',
    body: JSON.stringify({ proveedor_id: proveedorId })
  });
};

// ==================== CONFIRMACIÓN DE PEDIDO ====================

/**
 * Crear pedido real desde el carrito
 * @returns {Promise<Object>} Resultado del pedido creado
 */
export const crearPedidoDesdeCarrito = async () => {
  return makeAuthenticatedRequest(`${API_BASE}/carrito/confirmar`, {
    method: 'POST'
  });
};

// ==================== HOOKS PERSONALIZADOS ====================

import { useState, useEffect, useCallback } from 'react';

/**
 * Hook personalizado para gestionar el carrito de pedidos
 * @returns {Object} Estado y funciones del carrito
 */
export const useCarritoPedidos = () => {
  const [carrito, setCarrito] = useState({ items: [], proveedor_id: null });
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar carrito y proveedores
  const cargarDatos = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [carritoData, proveedoresData] = await Promise.all([
        obtenerCarrito(),
        obtenerProveedores()
      ]);
      
      setCarrito(carritoData.data || { items: [], proveedor_id: null });
      setProveedores(proveedoresData.data || []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Agregar producto al carrito
  const agregar = useCallback(async (datos) => {
    try {
      setError(null);
      const response = await agregarAlCarrito(datos);
      setCarrito(response.data);
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, []);

  // Quitar producto del carrito
  const quitar = useCallback(async (itemKey) => {
    try {
      setError(null);
      const response = await quitarDelCarrito(itemKey);
      setCarrito(response.data);
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, []);

  // Actualizar cantidad
  const actualizarCantidad = useCallback(async (itemKey, cantidad) => {
    try {
      setError(null);
      const response = await actualizarCantidadCarrito(itemKey, cantidad);
      setCarrito(response.data);
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, []);

  // Seleccionar proveedor
  const seleccionar = useCallback(async (proveedorId) => {
    try {
      setError(null);
      const response = await seleccionarProveedor(proveedorId);
      setCarrito(response.data);
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, []);

  // Vaciar carrito
  const vaciar = useCallback(async () => {
    try {
      setError(null);
      const response = await vaciarCarrito();
      setCarrito(response.data);
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, []);

  // Agregar todos los faltantes
  const agregarTodos = useCallback(async () => {
    try {
      setError(null);
      const response = await agregarTodosFaltantes();
      if (response.data?.carrito) {
        setCarrito(response.data.carrito);
      }
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, []);

  // Confirmar pedido
  const confirmar = useCallback(async () => {
    try {
      setError(null);
      const response = await crearPedidoDesdeCarrito();
      // Limpiar carrito después de crear pedido
      setCarrito({ items: [], proveedor_id: null });
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, []);

  // Estadísticas del carrito
  const estadisticas = {
    totalItems: carrito.items?.length || 0,
    totalCantidad: carrito.items?.reduce((sum, item) => sum + item.cantidad, 0) || 0,
    totalEstimado: carrito.items?.reduce((sum, item) => sum + (item.cantidad * (item.precio_estimado || 0)), 0) || 0,
    itemsCriticos: carrito.items?.filter(item => item.stock_actual === 0).length || 0,
    tieneProveedor: !!carrito.proveedor_id
  };

  return {
    // Estado
    carrito,
    proveedores,
    loading,
    error,
    estadisticas,
    
    // Acciones
    cargarDatos,
    agregar,
    quitar,
    actualizarCantidad,
    seleccionar,
    vaciar,
    agregarTodos,
    confirmar,
    
    // Helpers
    setError
  };
};