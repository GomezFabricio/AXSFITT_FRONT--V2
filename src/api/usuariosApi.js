import axios from 'axios';
import config from '../config/config';

export const getUsuarios = async (token) => {
  try {
    const response = await axios.get(`${config.backendUrl}/api/usuarios`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Error al obtener usuarios');
  }
};

// Alta de usuario (sin asignar perfil)
export const agregarUsuario = async (usuario, token) => {
  try {
    const response = await axios.post(
      `${config.backendUrl}/api/usuarios`,
      usuario,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Error al crear usuario');
  }
};

export const updatePerfilesUsuario = async (usuario_id, perfiles, token) => {
  try {
    const response = await axios.put(
      `${config.backendUrl}/api/usuarios/${usuario_id}/perfiles`,
      { perfiles },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Error al actualizar perfiles');
  }
};