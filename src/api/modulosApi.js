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