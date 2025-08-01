
import axios from 'axios';
import config from '../config/config';

// Crear instancia de axios con configuración base para el backend refactorizado
const pedidosApi = axios.create({
  baseURL: `${config.backendUrl}/api/pedidos-v2`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autorización automáticamente
pedidosApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar respuestas del backend refactorizado
pedidosApi.interceptors.response.use(
  (response) => {
    if (response.data && response.data.success) {
      return response.data.data;
    }
    return response.data;
  },
  (error) => {
    if (error.response?.data) {
      const errorData = error.response.data;
      if (errorData.errors) {
        throw {
          message: errorData.message,
          errors: errorData.errors,
          status: error.response.status,
        };
      }
      throw errorData;
    }
    throw error;
  }
);

// Obtener todos los pedidos
export const getPedidos = async () => {
  try {
    return await pedidosApi.get('/');
  } catch (error) {
    throw error;
  }
};

// Obtener pedido por ID
export const getPedidoPorId = async (pedido_id) => {
  try {
    return await pedidosApi.get(`/${pedido_id}`);
  } catch (error) {
    throw error;
  }
};

// Crear pedido
export const crearPedido = async (pedido) => {
  try {
    return await pedidosApi.post('/', pedido);
  } catch (error) {
    throw error;
  }
};

// Modificar pedido
export const modificarPedido = async (modificacion) => {
  try {
    return await pedidosApi.post('/modificar', modificacion);
  } catch (error) {
    throw error;
  }
};

// Cancelar pedido
export const cancelarPedido = async (cancelacion) => {
  try {
    return await pedidosApi.post('/cancelar', cancelacion);
  } catch (error) {
    throw error;
  }
};

// Recepcionar pedido
export const recepcionarPedido = async (recepcion) => {
  try {
    return await pedidosApi.post('/recepcionar', recepcion);
  } catch (error) {
    throw error;
  }
};

// Precargar producto sin registrar
export const precargarProductoSinRegistrar = async (producto) => {
  try {
    return await pedidosApi.post('/precargar-producto', producto);
  } catch (error) {
    throw error;
  }
};

// Obtener historial de modificaciones de un pedido
export const getHistorialModificaciones = async (pedido_id) => {
  try {
    return await pedidosApi.get(`/${pedido_id}/historial`);
  } catch (error) {
    throw error;
  }
};

export default pedidosApi;
