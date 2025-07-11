import axios from 'axios';
import config from '../config/config';

const API_BASE_URL = `${config.backendUrl}/api/productos-v2`;

// Crear un nuevo producto
export const crearProducto = async (productoData, token) => {
  try {
    const response = await axios.post(`${API_BASE_URL}`, productoData, {
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
    const response = await axios.post(`${API_BASE_URL}/imagenes-temporales`, formData, {
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
    const response = await axios.get(`${API_BASE_URL}/imagenes-temporales/${usuario_id}`, {
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
    const response = await axios.put(`${API_BASE_URL}/imagenes-temporales/mover`, data, {
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
    const response = await axios.delete(`${API_BASE_URL}/imagenes-temporales`, {
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
    const response = await axios.post(`${API_BASE_URL}/cancelar-proceso-alta`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Error al cancelar el proceso de alta del producto');
  }
};

export const obtenerProductos = async (token, estado) => {
  try {
    const response = await axios.get(`${API_BASE_URL}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: { 
        estado: estado,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Error al obtener productos');
  }
};

export const eliminarProducto = async (producto_id, token) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/${producto_id}`, {
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
    const response = await axios.put(`${API_BASE_URL}/cambiar-visibilidad`, 
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

export const reactivarProducto = async (producto_id, token) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/${producto_id}/reactivar`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Error al reactivar producto');
  }
};

export const obtenerDetallesStock = async (producto_id, token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/detalles-stock/${producto_id}`, {
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
    const response = await axios.get(`${API_BASE_URL}/${producto_id}`, {
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
    const response = await axios.put(`${API_BASE_URL}/${producto_id}`, productoData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Error al actualizar producto');
  }
};

export const moverImagenProducto = async (data, token) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/imagenes/mover`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('❌ API: Error al mover imagen:', error);
    console.error('❌ API: Respuesta de error:', error.response?.data);
    throw error.response?.data || new Error('Error al mover la imagen del producto');
  }
};

export const eliminarImagenProducto = async ({ producto_id, imagen_id }, token) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/${producto_id}/imagenes/${imagen_id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error en la API eliminarImagenProducto:', error);
    throw error.response?.data || new Error('Error al eliminar la imagen del producto');
  }
};

// Subir una nueva imagen al producto
export const subirImagenProducto = async (producto_id, formData, token) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/${producto_id}/imagenes`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('❌ API: Error al subir imagen:', error);
    throw error.response?.data || new Error('Error al subir la imagen del producto');
  }
};

// Eliminar imágenes nuevas al cancelar
export const cancelarImagenesNuevas = async (producto_id, imagenes, token) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/${producto_id}/cancelar-imagenes`, { producto_id, imagenes }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Error al cancelar imágenes nuevas');
  }
};

export const cambiarEstadoVariante = async (variante_id, estado, token) => {
  return axios.put(`${API_BASE_URL}/variantes/estado`, {
    variante_id,
    estado,
  }, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const verificarVentasVariante = async (variante_id, token) => {
  if (!variante_id) {
    throw new Error('El ID de la variante es requerido para verificar ventas');
  }
  const response = await axios.get(`${API_BASE_URL}/variantes/${variante_id}/ventas`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Nueva función para búsqueda de productos por nombre (autocomplete)
export const buscarProductosPorNombre = async (nombre, categoria_id, token) => {
  try {
    const params = { nombre };
    if (categoria_id) params.categoria_id = categoria_id;
    
    const response = await axios.get(`${API_BASE_URL}/buscar`, {
      headers: { Authorization: `Bearer ${token}` },
      params,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Error al buscar productos');
  }
};
