import axios from 'axios';
import config from '../config/config';

export const login = async (email, password) => {
  try {
    const response = await axios.post(`${config.backendUrl}/api/login`, {
      email,
      password,
    });

    return response.data;
  } catch (error) {
    console.error('Error en el login:', error.response?.data || error.message);
    throw error.response?.data || new Error('Error en la solicitud');
  }
};

export const solicitarRecuperacionPassword = async (email) => {
  try {
    const response = await axios.post(`${config.backendUrl}/api/login/recuperar-password`, {
      email
    });
    return response.data;
  } catch (error) {
    console.error('Error al solicitar recuperación:', error.response?.data || error.message);
    throw error.response?.data || new Error('Error al solicitar la recuperación de contraseña');
  }
};

export const verificarTokenRecuperacion = async (token) => {
  try {
    const response = await axios.get(`${config.backendUrl}/api/login/verificar-token-recuperacion/${token}`);
    return response.data;
  } catch (error) {
    console.error('Error al verificar token:', error.response?.data || error.message);
    throw error.response?.data || new Error('Token inválido o expirado');
  }
};

export const restablecerPassword = async (token, newPassword) => {
  try {
    const response = await axios.post(`${config.backendUrl}/api/login/restablecer-password`, {
      token,
      newPassword
    });
    return response.data;
  } catch (error) {
    console.error('Error al restablecer contraseña:', error.response?.data || error.message);
    throw error.response?.data || new Error('Error al restablecer la contraseña');
  }
};