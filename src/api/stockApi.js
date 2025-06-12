import axios from 'axios';
import config from '../config/config';

export const obtenerStock = async (token) => {
  try {
    const res = await axios.get(`${config.backendUrl}/api/stock`, {
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
    const res = await axios.put(`${config.backendUrl}/api/stock/${id}`, {
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
