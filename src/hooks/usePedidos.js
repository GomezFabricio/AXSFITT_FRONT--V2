import { useState, useCallback } from 'react';
import { getPedidoPorId } from '../api/pedidosApi';
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
  const puedeVerHistorial = tienePermiso('Ver Histórico Modificaciones');

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

  const recepcionarPedido = useCallback(async (datosRecepcion) => {
    setLoading(true);
    setError(null);
    try {
      // Si hay productos sin registrar, precargarlos primero
      if (datosRecepcion.productos_sin_registrar?.length > 0) {
        for (const producto of datosRecepcion.productos_sin_registrar) {
          await pedidosApi.precargarProductoSinRegistrar({
            ...producto,
            pedido_id: datosRecepcion.pedido_id
          });
        }
      }

      // Luego proceder con la recepción del pedido
      const recepcionData = {
        pedido_id: datosRecepcion.pedido_id,
        recepcion: datosRecepcion.recepcion,
        usuario_id: datosRecepcion.usuario_id,
        observaciones: datosRecepcion.observaciones
      };

      await pedidosApi.recepcionarPedido(recepcionData);
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

  // Handler para ver detalle de pedido
  const [detallePedido, setDetallePedido] = useState(null);
  const [modalDetalleOpen, setModalDetalleOpen] = useState(false);
  const handleDetallePedido = useCallback(async (pedido_id) => {
    setLoading(true);
    setError(null);
    try {
      const detalle = await getPedidoPorId(pedido_id);
      setDetallePedido(detalle);
      setModalDetalleOpen(true);
    } catch (err) {
      setError(err.message || 'Error al obtener detalle del pedido');
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
    puedeVerHistorial,
    // Detalle
    detallePedido,
    modalDetalleOpen,
    setModalDetalleOpen,
    handleDetallePedido,
  };
};

export default usePedidos;
