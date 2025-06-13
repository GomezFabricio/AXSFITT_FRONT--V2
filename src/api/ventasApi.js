import axios from 'axios';
import config from '../config/config';

// Obtener todas las ventas
export const getVentas = async (token) => {
  try {
    const response = await axios.get(`${config.backendUrl}/api/ventas`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Error al obtener ventas');
  }
};

// Obtener una venta específica por ID
export const getVentaPorId = async (ventaId, token) => {
  try {
    const response = await axios.get(`${config.backendUrl}/api/ventas/${ventaId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Error al obtener detalles de la venta');
  }
};

// Crear una nueva venta
export const crearVenta = async (datosVenta, token) => {
  try {
    const response = await axios.post(
      `${config.backendUrl}/api/ventas`,
      datosVenta,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Error al crear la venta');
  }
};

// Actualizar estado de pago de una venta
export const actualizarEstadoPago = async (ventaId, estadoPago, token) => {
  try {
    const response = await axios.patch(
      `${config.backendUrl}/api/ventas/${ventaId}/estado-pago`,
      { estado_pago: estadoPago },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Error al actualizar el estado de pago');
  }
};

// Actualizar estado de envío de una venta
export const actualizarEstadoEnvio = async (ventaId, estadoEnvio, token) => {
  try {
    const response = await axios.patch(
      `${config.backendUrl}/api/ventas/${ventaId}/estado-envio`,
      { estado_envio: estadoEnvio },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Error al actualizar el estado de envío');
  }
};

// Buscar productos para agregar a una venta
export const buscarProductosParaVenta = async (termino = '', token) => {
  try {
    const response = await axios.get(`${config.backendUrl}/api/ventas/productos/buscar`, {
      params: { termino },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Error al buscar productos');
  }
};

// Obtener variantes de un producto
export const obtenerVariantesProducto = async (productoId, token) => {
  try {
    const response = await axios.get(
      `${config.backendUrl}/api/ventas/productos/${productoId}/variantes`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Error al obtener variantes del producto');
  }
};

// Verificar stock disponible antes de confirmar venta
export const verificarStock = async (productos, token) => {
  try {
    const response = await axios.post(
      `${config.backendUrl}/api/ventas/verificar-stock`,
      { productos },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Error al verificar stock');
  }
};

export const origenesVenta = [
  { value: 'Venta Manual', label: 'Venta Manual' },
  { value: 'Redes Sociales', label: 'Redes Sociales' },
  { value: 'Whatsapp', label: 'Whatsapp' },
  { value: 'Presencial', label: 'Presencial' }
];