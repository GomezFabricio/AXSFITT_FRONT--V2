/**
 * API hooks para Carrito de Pedidos Rápidos
 * Funciones para interactuar con el backend del carrito
 * Sigue el patrón estándar del sistema usando axios
 */

import axios from 'axios';
import config from '../config/config';

// ==================== GESTIÓN DEL CARRITO ====================

/**
 * Obtener el carrito actual del usuario
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Datos del carrito
 */
export const obtenerCarrito = async (token) => {
  try {
    const res = await axios.get(`${config.backendUrl}/api/carrito-pedidos/carrito`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return res.data;
  } catch (error) {
    console.error('Error al obtener carrito:', error);
    throw error;
  }
};

/**
 * Agregar un faltante al carrito
 * @param {Object} datos - { faltante_id, variante_id, cantidad? }
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Carrito actualizado
 */
export const agregarAlCarrito = async (datos, token) => {
  try {
    const res = await axios.post(`${config.backendUrl}/api/carrito-pedidos/carrito/agregar`, datos, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return res.data;
  } catch (error) {
    console.error('Error al agregar al carrito:', error);
    throw error;
  }
};

/**
 * Quitar un item del carrito
 * @param {string} itemKey - Clave del item a eliminar
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Carrito actualizado
 */
export const quitarDelCarrito = async (itemKey, token) => {
  try {
    const res = await axios.delete(`${config.backendUrl}/api/carrito-pedidos/carrito/quitar`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      data: { item_key: itemKey }
    });
    return res.data;
  } catch (error) {
    console.error('Error al quitar del carrito:', error);
    throw error;
  }
};

/**
 * Actualizar cantidad de un item en el carrito
 * @param {string} itemKey - Clave del item
 * @param {number} cantidad - Nueva cantidad
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Carrito actualizado
 */
export const actualizarCantidadCarrito = async (itemKey, cantidad, token) => {
  try {
    const res = await axios.put(`${config.backendUrl}/api/carrito-pedidos/carrito/cantidad`, {
      item_key: itemKey,
      cantidad
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return res.data;
  } catch (error) {
    console.error('Error al actualizar cantidad:', error);
    throw error;
  }
};

/**
 * Agregar todos los faltantes pendientes al carrito
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Resultado de la operación
 */
export const agregarTodosFaltantes = async (token) => {
  try {
    const res = await axios.post(`${config.backendUrl}/api/carrito-pedidos/carrito/agregar-todos`, {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return res.data;
  } catch (error) {
    console.error('Error al agregar todos los faltantes:', error);
    throw error;
  }
};

/**
 * Vaciar completamente el carrito
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Carrito vacío
 */
export const vaciarCarrito = async (token) => {
  try {
    const res = await axios.delete(`${config.backendUrl}/api/carrito-pedidos/carrito/vaciar`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return res.data;
  } catch (error) {
    console.error('Error al vaciar carrito:', error);
    throw error;
  }
};

// ==================== GESTIÓN DE PROVEEDORES ====================

/**
 * Obtener lista de proveedores activos
 * @param {string} token - Token de autenticación
 * @returns {Promise<Array>} Lista de proveedores
 */
export const obtenerProveedores = async (token) => {
  try {
    const res = await axios.get(`${config.backendUrl}/api/carrito-pedidos/proveedores`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return res.data;
  } catch (error) {
    console.error('Error al obtener proveedores:', error);
    throw error;
  }
};

/**
 * Seleccionar proveedor para el carrito
 * @param {number} proveedorId - ID del proveedor
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Carrito actualizado
 */
export const seleccionarProveedor = async (proveedorId, token) => {
  try {
    const res = await axios.post(`${config.backendUrl}/api/carrito-pedidos/carrito/proveedor`, {
      proveedor_id: proveedorId
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return res.data;
  } catch (error) {
    console.error('Error al seleccionar proveedor:', error);
    throw error;
  }
};

// ==================== CONFIRMACIÓN DE PEDIDO ====================

/**
 * Confirmar el pedido actual (convierte carrito en pedido)
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Resultado del pedido creado
 */
export const confirmarPedido = async (token) => {
  try {
    const res = await axios.post(`${config.backendUrl}/api/carrito-pedidos/carrito/confirmar`, {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return res.data;
  } catch (error) {
    console.error('Error al confirmar pedido:', error);
    throw error;
  }
};
// ==================== FALTANTES DISPONIBLES ====================

/**
 * Obtener lista de faltantes disponibles para agregar al carrito
 * @param {string} token - Token de autenticación
 * @returns {Promise<Array>} Lista de faltantes
 */
export const obtenerFaltantesDisponibles = async (token) => {
  try {
    const res = await axios.get(`${config.backendUrl}/api/carrito-pedidos/faltantes`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return res.data;
  } catch (error) {
    console.error('Error al obtener faltantes disponibles:', error);
    throw error;
  }
};

// ==================== DIAGNÓSTICOS Y PRUEBAS ====================

/**
 * Función de diagnóstico para probar conectividad
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Estado de la conexión
 */
export const probarConexion = async (token) => {
  try {
    const res = await axios.get(`${config.backendUrl}/api/carrito-pedidos/test`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return res.data;
  } catch (error) {
    console.error('Error en prueba de conexión:', error);
    throw error;
  }
};

/**
 * Obtener información completa del carrito con diagnósticos
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Información detallada del carrito
 */
export const obtenerInfoCarrito = async (token) => {
  try {
    const res = await axios.get(`${config.backendUrl}/api/carrito-pedidos/carrito/info`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return res.data;
  } catch (error) {
    console.error('Error al obtener información del carrito:', error);
    throw error;
  }
};