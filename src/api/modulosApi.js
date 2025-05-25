import axios from 'axios';
import config from '../config/config';

export const getModulos = async (token) => {
  try {
    const response = await axios.get(`${config.backendUrl}/api/modulos`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Error al obtener módulos');
  }
};

// Nueva función para actualizar el nombre del módulo
export const updateModulo = async (modulo_id, data, token) => {
  try {
    const response = await axios.put(
      `${config.backendUrl}/api/modulos/${modulo_id}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Error al actualizar módulo');
  }
};