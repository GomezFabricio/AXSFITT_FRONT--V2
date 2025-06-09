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
export const guardarImagenTemporal = async (formData, token) => {
  try {
    const response = await axios.post(`${config.backendUrl}/api/productos/imagenes-temporales`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
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

export const moverImagenTemporal = async (data, token) => {
  try {
    const response = await axios.put(`${config.backendUrl}/api/productos/imagenes-temporales/mover`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error en la API moverImagenTemporal:', error);
    throw error.response?.data || new Error('Error al mover la imagen temporal');
  }
};

export const eliminarImagenTemporal = async (data, token) => {
  try {
    const response = await axios.delete(`${config.backendUrl}/api/productos/imagenes-temporales`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Error al eliminar imagen temporal');
  }
};

export const cancelarProcesoAltaProducto = async (data, token) => {
  try {
    const response = await axios.post(`${config.backendUrl}/api/productos/cancelar-proceso-alta`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Error al cancelar el proceso de alta del producto');
  }
};

export const obtenerProductos = async (token) => {
  try {
    const response = await axios.get(`${config.backendUrl}/api/productos`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Error al obtener productos');
  }
};

export const eliminarProducto = async (producto_id, token) => {
  try {
    const response = await axios.delete(`${config.backendUrl}/api/productos/${producto_id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Error al eliminar producto');
  }
};

export const cambiarVisibilidadProducto = async (producto_id, visible, token) => {
  try {
    const response = await axios.put(`${config.backendUrl}/api/productos/cambiar-visibilidad`, 
      { producto_id, visible }, 
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Error al cambiar visibilidad del producto');
  }
};

export const obtenerDetallesStock = async (producto_id, token) => {
  try {
    const response = await axios.get(`${config.backendUrl}/api/productos/detalles-stock/${producto_id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Error al obtener detalles de stock');
  }
};

export const obtenerProductoPorId = async (producto_id, token) => {
  try {
    const response = await axios.get(`${config.backendUrl}/api/productos/${producto_id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Error al obtener producto por ID');
  }
};

export const actualizarProducto = async (producto_id, productoData, token) => {
  try {
    const response = await axios.put(`${config.backendUrl}/api/productos/${producto_id}`, productoData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Error al actualizar producto');
  }
};