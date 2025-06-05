import axios from 'axios';
import config from '../config/config';

// Crear un nuevo producto
export const crearProducto = async (productoData, token) => {
  try {
    const response = await axios.post(`${config.backendUrl}/api/productos`, productoData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Error al crear producto');
  }
};

// Guardar imágenes en la tabla temporal
export const guardarImagenTemporal = async (imagenData, token) => {
  try {
    const response = await axios.post(`${config.backendUrl}/api/imagenes-temporales`, imagenData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Error al guardar imagen temporal');
  }
};

// Obtener imágenes temporales de un usuario
export const obtenerImagenesTemporales = async (usuario_id, token) => {
  try {
    const response = await axios.get(`${config.backendUrl}/api/productos/imagenes-temporales/${usuario_id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Error al obtener imágenes temporales');
  }
};