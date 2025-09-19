import { useState, useEffect } from 'react';
import { getPedidoPorId } from '../api/pedidosApi';

const useEditarPedidoSimple = (pedido) => {
  const [datosCompletos, setDatosCompletos] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar datos completos del pedido cuando se pasa el pedido
  useEffect(() => {
    if (pedido?.pedido_id) {
      cargarDatosCompletos();
    }
  }, [pedido?.pedido_id]);

  const cargarDatosCompletos = async () => {
    setLoading(true);
    setError(null);
    try {
      const datos = await getPedidoPorId(pedido.pedido_id);
      setDatosCompletos(datos);
    } catch (err) {
      setError(err.message || 'Error al cargar datos del pedido');
    } finally {
      setLoading(false);
    }
  };

  return {
    datosCompletos,
    loading,
    error,
    cargarDatosCompletos
  };
};

export default useEditarPedidoSimple;