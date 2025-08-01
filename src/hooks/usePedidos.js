import { useState, useCallback } from 'react';
import * as pedidosApi from '../api/pedidosApi';
import tienePermiso from '../utils/tienePermiso';

const usePedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Permisos usando el mismo patrón del hook funcional
  const puedeGestionar = tienePermiso('Gestionar Pedidos');
  const puedeCrear = tienePermiso('Crear Pedido');
  const puedeModificar = tienePermiso('Modificar Pedido');
  const puedeCancelar = tienePermiso('Cancelar Pedido');
  const puedeRecepcionar = tienePermiso('Recibir Pedido');

  const cargarPedidos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await pedidosApi.getPedidos();
      setPedidos(data);
    } catch (err) {
      setError(err.message || 'Error al cargar pedidos');
    } finally {
      setLoading(false);
    }
  }, []);

  const crearPedido = useCallback(async (pedido) => {
    setLoading(true);
    setError(null);
    try {
      await pedidosApi.crearPedido(pedido);
      await cargarPedidos();
    } catch (err) {
      setError(err.message || 'Error al crear pedido');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [cargarPedidos]);

  const modificarPedido = useCallback(async (modificacion) => {
    setLoading(true);
    setError(null);
    try {
      await pedidosApi.modificarPedido(modificacion);
      await cargarPedidos();
    } catch (err) {
      setError(err.message || 'Error al modificar pedido');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [cargarPedidos]);

  const cancelarPedido = useCallback(async (cancelacion) => {
    setLoading(true);
    setError(null);
    try {
      await pedidosApi.cancelarPedido(cancelacion);
      await cargarPedidos();
    } catch (err) {
      setError(err.message || 'Error al cancelar pedido');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [cargarPedidos]);

  const recepcionarPedido = useCallback(async (recepcion) => {
    setLoading(true);
    setError(null);
    try {
      await pedidosApi.recepcionarPedido(recepcion);
      await cargarPedidos();
    } catch (err) {
      setError(err.message || 'Error al recepcionar pedido');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [cargarPedidos]);

  const precargarProductoSinRegistrar = useCallback(async (producto) => {
    setLoading(true);
    setError(null);
    try {
      await pedidosApi.precargarProductoSinRegistrar(producto);
    } catch (err) {
      setError(err.message || 'Error al precargar producto');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getHistorialModificaciones = useCallback(async (pedido_id) => {
    setLoading(true);
    setError(null);
    try {
      return await pedidosApi.getHistorialModificaciones(pedido_id);
    } catch (err) {
      setError(err.message || 'Error al obtener historial');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    pedidos,
    pedidoSeleccionado,
    setPedidoSeleccionado,
    loading,
    error,
    cargarPedidos,
    crearPedido,
    modificarPedido,
    cancelarPedido,
    recepcionarPedido,
    precargarProductoSinRegistrar,
    getHistorialModificaciones,
    puedeGestionar,
    puedeCrear,
    puedeModificar,
    puedeCancelar,
    puedeRecepcionar,
  };
};

export default usePedidos;
