import axios from 'axios';
import config from '../config/config';

export const obtenerStock = async (token) => {
  try {
    const res = await axios.get(`${config.backendUrl}/api/stock-v2`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return res.data;
  } catch (error) {
    console.error("Error al obtener el stock:", error);
    throw error;
  }
};

export const actualizarStockMinimoMaximo = async (id, stockMinimo, stockMaximo, tipo, token) => {
  try {
    const res = await axios.put(`${config.backendUrl}/api/stock-v2/${id}`, {
      stock_minimo: stockMinimo,
      stock_maximo: stockMaximo,
      tipo 
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return res.data;
  } catch (error) {
    console.error("Error al actualizar el stock:", error);
    throw error;
  }
};

export const obtenerFaltantes = async (token) => {
  try {
    const res = await axios.get(`${config.backendUrl}/api/stock-v2/faltantes`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return res.data;
  } catch (error) {
    console.error("Error al obtener la lista de faltantes:", error);
    throw error;
  }
};

export const registrarFaltante = async (datos, token) => {
  try {
    const res = await axios.post(`${config.backendUrl}/api/stock-v2/faltantes`, datos, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return res.data;
  } catch (error) {
    console.error("Error al registrar faltante:", error);
    throw error;
  }
};

export const resolverFaltante = async (idFaltante, token) => {
  try {
    const res = await axios.put(`${config.backendUrl}/api/stock-v2/faltantes/${idFaltante}/resolver`, {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return res.data;
  } catch (error) {
    console.error("Error al resolver faltante:", error);
    throw error;
  }
};
