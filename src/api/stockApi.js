import axios from 'axios';
import config from '../config/config';

export const actualizarStockMinimoMaximo = async (id, stockMinimo, stockMaximo, token) => {
  try {
    const res = await axios.put(`${config.backendUrl}/api/productos/${id}/stock`, {
      stock_minimo: stockMinimo,
      stock_maximo: stockMaximo
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