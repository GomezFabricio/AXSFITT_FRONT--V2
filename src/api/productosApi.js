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

export const obtenerProductos = async (token, estado) => {
  try {
    const response = await axios.get(`${config.backendUrl}/api/productos`, {
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

export const reactivarProducto = async (producto_id, token) => {
  try {
    const response = await axios.put(`${config.backendUrl}/api/productos/${producto_id}/reactivar`, {}, {
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

export const moverImagenProducto = async (data, token) => {
  try {
    const response = await axios.put(`${config.backendUrl}/api/productos/imagenes/mover`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error en la API moverImagenProducto:', error);
    throw error.response?.data || new Error('Error al mover la imagen del producto');
  }
};

export const eliminarImagenProducto = async ({ producto_id, imagen_id }, token) => {
  try {
    const response = await axios.delete(`${config.backendUrl}/api/productos/${producto_id}/imagenes/${imagen_id}`, {
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
  console.log('Subiendo imagen al producto:', producto_id, formData);
  try {
    const response = await axios.post(`${config.backendUrl}/api/productos/${producto_id}/imagenes`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Error al subir la imagen del producto');
  }
};

// Eliminar imágenes nuevas al cancelar
export const cancelarImagenesNuevas = async (producto_id, imagenes, token) => {
  try {
    const response = await axios.post(`${config.backendUrl}/api/productos/${producto_id}/cancelar-imagenes`, { producto_id, imagenes }, {
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
  return axios.put(`${config.backendUrl}/api/productos/variantes/estado`, {
    variante_id,
    estado,
  }, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const verificarVentasVariante = async (variante_id, token) => {
  console.log('Verificando ventas para variante:', variante_id);
  if (!variante_id) {
    throw new Error('El ID de la variante es requerido para verificar ventas');
  }
  const response = await axios.get(`${config.backendUrl}/api/productos/variantes/${variante_id}/ventas`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
