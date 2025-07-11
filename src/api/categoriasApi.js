import axios from 'axios';
import config from '../config/config';

// Crear instancia de axios con configuración base para el backend refactorizado
const categoriasApi = axios.create({
  baseURL: `${config.backendUrl}/api/categorias-v2`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para agregar token de autorización automáticamente
categoriasApi.interceptors.request.use(
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
categoriasApi.interceptors.response.use(
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
    
    throw error;
  }
);

// Obtener todas las categorías (usando API refactorizada)
export const getCategorias = async (token) => {
  try {
    return await categoriasApi.get('/');
  } catch (error) {
    throw error;
  }
};

// Crear una nueva categoría (usando API refactorizada)
export const crearCategoria = async (categoria, token) => {
  try {
    return await categoriasApi.post('/', categoria);
  } catch (error) {
    throw error;
  }
};

// Agregar una subcategoría (usando API refactorizada)
export const agregarSubcategoria = async (categoria_padre_id, subcategoria, token) => {
  try {
    const subcategoriaConPadre = {
      ...subcategoria,
      categoria_padre_id: categoria_padre_id
    };
    return await categoriasApi.post('/', subcategoriaConPadre);
  } catch (error) {
    throw error;
  }
};

// Modificar una categoría (usando API refactorizada)
export const modificarCategoria = async (categoria_id, categoria, token) => {
  try {
    return await categoriasApi.put(`/${categoria_id}`, categoria);
  } catch (error) {
    throw error;
  }
};

// Eliminar una categoría (usando API refactorizada)
export const eliminarCategoria = async (categoria_id, token) => {
  try {
    return await categoriasApi.delete(`/${categoria_id}`);
  } catch (error) {
    throw error;
  }
};