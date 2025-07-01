import axios from 'axios';
import config from '../config/config';

// Crear instancia de axios con configuración base para el backend refactorizado
const clientesApi = axios.create({
  baseURL: `${config.backendUrl}/api/clientes-v2`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para agregar token de autorización automáticamente
clientesApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas del backend refactorizado
clientesApi.interceptors.response.use(
  (response) => {
    // El backend refactorizado devuelve { success: true, data: ..., message: ... }
    if (response.data && response.data.success) {
      return response.data.data; // Devolver solo los datos para mantener compatibilidad
    }
    return response.data;
  },
  (error) => {
    // Manejo mejorado de errores con la nueva estructura
    if (error.response?.data) {
      const errorData = error.response.data;
      
      // Si hay errores específicos de validación
      if (errorData.errors) {
        throw {
          message: errorData.message,
          errors: errorData.errors,
          status: error.response.status
        };
      }
      
      // Error general
      throw errorData;
    }
    
    throw error.response?.data || new Error('Error de conexión con el servidor');
  }
);

// Obtener todos los clientes
export const obtenerClientes = async (token) => {
  try {
    const response = await clientesApi.get('/');
    return response;
  } catch (error) {
    throw error;
  }
};

// Buscar clientes
export const buscarClientes = async (termino, token) => {
  try {
    const response = await clientesApi.get(`/buscar?termino=${encodeURIComponent(termino)}`);
    return response;
  } catch (error) {
    throw error;
  }
};

// Obtener un cliente por ID
export const obtenerClientePorId = async (id, token) => {
  try {
    const response = await clientesApi.get(`/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};

// Crear un nuevo cliente
export const crearCliente = async (clienteData, token) => {
  try {
    const response = await clientesApi.post('/', clienteData);
    return response;
  } catch (error) {
    throw error;
  }
};

// Actualizar un cliente existente
export const actualizarCliente = async (id, clienteData, token) => {
  try {
    const response = await clientesApi.put(`/${id}`, clienteData);
    return response;
  } catch (error) {
    throw error;
  }
};

// Eliminar un cliente
export const eliminarCliente = async (id, token) => {
  try {
    const response = await clientesApi.delete(`/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};

// Obtener clientes eliminados
export const obtenerClientesEliminados = async (token) => {
  try {
    const response = await clientesApi.get('/eliminados/lista');
    return response;
  } catch (error) {
    throw error;
  }
};

// Reactivar un cliente
export const reactivarCliente = async (id, token) => {
  try {
    const response = await clientesApi.patch(`/reactivar/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};