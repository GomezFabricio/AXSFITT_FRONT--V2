import axios from 'axios';
import config from '../config/config';

// Obtener todos los perfiles
export const getPerfiles = async (token) => {
  try {
    const response = await axios.get(`${config.backendUrl}/api/perfiles`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Error al obtener perfiles');
  }
};

// Crear un nuevo perfil
export const crearPerfil = async (perfil_descripcion, modulosPermisos, token) => {
  try {
    const response = await axios.post(
      `${config.backendUrl}/api/perfiles`,
      { perfil_descripcion, modulosPermisos },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Error al crear perfil');
  }
};

// Modificar un perfil existente
export const modificarPerfil = async (perfil_id, perfil_descripcion, modulosPermisos, token) => {
  try {
    const response = await axios.put(
      `${config.backendUrl}/api/perfiles/${perfil_id}`,
      { perfil_descripcion, modulosPermisos },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Error al modificar perfil');
  }
};

// Eliminar un perfil existente
export const eliminarPerfil = async (perfil_id, token) => {
  try {
    const response = await axios.delete(
      `${config.backendUrl}/api/perfiles/${perfil_id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Error al eliminar perfil');
  }
};