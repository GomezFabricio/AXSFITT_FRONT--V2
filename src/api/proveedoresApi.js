import axios from 'axios';
import config from '../config/config';

// Instancia de axios para proveedores, siguiendo el patrón de clientesApi
const proveedoresApi = axios.create({
  baseURL: `${config.backendUrl}/api/proveedores-v2`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autorización automáticamente
proveedoresApi.interceptors.request.use(
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
proveedoresApi.interceptors.response.use(
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
    throw error.response?.data || new Error('Error de conexión con el servidor');
  }
);

// CRUD de proveedores
export const obtenerProveedores = async () => {
  return await proveedoresApi.get('/');
};

export const obtenerProveedorPorId = async (id) => {
  return await proveedoresApi.get(`/${id}`);
};

export const crearProveedor = async (proveedorData) => {
  return await proveedoresApi.post('/', proveedorData);
};

export const actualizarProveedor = async (id, proveedorData) => {
  return await proveedoresApi.put(`/${id}`, proveedorData);
};

export const eliminarProveedor = async (id) => {
  return await proveedoresApi.delete(`/${id}`);
};

export const reactivarProveedor = async (id) => {
  return await proveedoresApi.put(`/${id}/reactivar`);
};