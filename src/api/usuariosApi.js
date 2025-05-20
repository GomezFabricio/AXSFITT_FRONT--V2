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