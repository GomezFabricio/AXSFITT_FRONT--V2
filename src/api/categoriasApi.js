import axios from 'axios';
import config from '../config/config';

// Obtener todas las categorías
export const getCategorias = async (token) => {
  try {
    const response = await axios.get(`${config.backendUrl}/api/categorias`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Error al obtener categorías');
  }
};

// Crear una nueva categoría
export const crearCategoria = async (categoria, token) => {
  try {
    const response = await axios.post(`${config.backendUrl}/api/categorias`, categoria, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Error al crear categoría');
  }
};

// Agregar una subcategoría
export const agregarSubcategoria = async (categoria_padre_id, subcategoria, token) => {
  try {
    const response = await axios.post(
      `${config.backendUrl}/api/categorias/${categoria_padre_id}/subcategoria`,
      subcategoria,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Error al agregar subcategoría');
  }
};

// Modificar una categoría
export const modificarCategoria = async (categoria_id, categoria, token) => {
  try {
    const response = await axios.put(
      `${config.backendUrl}/api/categorias/${categoria_id}`,
      categoria,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Error al modificar categoría');
  }
};

// Eliminar una categoría (baja lógica)
export const eliminarCategoria = async (categoria_id, token) => {
  try {
    const response = await axios.delete(`${config.backendUrl}/api/categorias/${categoria_id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Error al eliminar categoría');
  }
};

// Reordenar categorías o subcategorías
export const reordenarCategorias = async (nuevasOrdenes, token) => {
  try {
    const response = await axios.put(`${config.backendUrl}/api/categorias/reordenar`, nuevasOrdenes, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Error al reordenar categorías');
  }
};