import axios from 'axios';
import config from '../config/config';

// Obtener todos los clientes
export const obtenerClientes = async (token) => {
  try {
    const response = await axios.get(`${config.backendUrl}/api/clientes`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Error al obtener clientes');
  }
};

// Buscar clientes
export const buscarClientes = async (termino, token) => {
  try {
    const response = await axios.get(
      `${config.backendUrl}/api/clientes/buscar?termino=${encodeURIComponent(termino)}`, 
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Error al buscar clientes');
  }
};

// Obtener un cliente por ID
export const obtenerClientePorId = async (id, token) => {
  try {
    const response = await axios.get(`${config.backendUrl}/api/clientes/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error(`Error al obtener cliente con ID ${id}`);
  }
};

// Crear un nuevo cliente
export const crearCliente = async (clienteData, token) => {
  try {
    const response = await axios.post(
      `${config.backendUrl}/api/clientes`, 
      clienteData, 
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Error al crear cliente');
  }
};

// Actualizar un cliente existente
export const actualizarCliente = async (id, clienteData, token) => {
  try {
    const response = await axios.put(
      `${config.backendUrl}/api/clientes/${id}`, 
      clienteData, 
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error(`Error al actualizar cliente con ID ${id}`);
  }
};

// Eliminar un cliente
export const eliminarCliente = async (id, token) => {
  try {
    const response = await axios.delete(
      `${config.backendUrl}/api/clientes/${id}`, 
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error(`Error al eliminar cliente con ID ${id}`);
  }
};

// Obtener clientes eliminados
export const obtenerClientesEliminados = async (token) => {
  try {
    const response = await axios.get(`${config.backendUrl}/api/clientes/eliminados`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Error al obtener clientes eliminados');
  }
};

// Reactivar un cliente
export const reactivarCliente = async (id, token) => {
  try {
    const response = await axios.patch(
      `${config.backendUrl}/api/clientes/reactivar/${id}`, 
      {}, // Body vacío para PATCH
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error(`Error al reactivar cliente con ID ${id}`);
  }
};