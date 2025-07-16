import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getVentas, actualizarEstadoPago, actualizarEstadoEnvio, actualizarDatosVenta } from '../../../api/ventasApi';
import { FaEye, FaEdit, FaFileInvoice } from 'react-icons/fa';
import tienePermiso from '../../../utils/tienePermiso';
import EstadoSelector from '../../../components/molecules/ventas/EstadoSelector';
import ModalEditarVenta from '../../../components/organisms/Modals/ventas/ModalEditarVenta';
import useNotification from '../../../hooks/useNotification';
import NotificationContainer from '../../../components/atoms/NotificationContainer';

const VerVentasPage = () => {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstadoPago, setFiltroEstadoPago] = useState('todos');
  const [filtroEstadoEnvio, setFiltroEstadoEnvio] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [ventasFiltradas, setVentasFiltradas] = useState([]);

  // Estados para el modal de edición
  const [modalEdicionAbierto, setModalEdicionAbierto] = useState(false);
  const [ventaEnEdicion, setVentaEnEdicion] = useState(null);
  const [guardando, setGuardando] = useState(false);

  // Hook para notificaciones
  const { notifications, removeNotification, success, error, warning, info } = useNotification();

  // Verificar permisos
  const puedeModificarVenta = tienePermiso('Modificar Venta');

  useEffect(() => {
    const cargarVentas = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const data = await getVentas(token);
        setVentas(data);
        setVentasFiltradas(data);
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar ventas:', error);
        error('No se pudieron cargar las ventas');
        setLoading(false);
      }
    };

    cargarVentas();
  }, [error]);

  useEffect(() => {
    // Aplicar filtros
    let resultado = ventas;

    // Filtrar por estado de pago
    if (filtroEstadoPago !== 'todos') {
      resultado = resultado.filter(venta => venta.venta_estado_pago === filtroEstadoPago);
    }

    // Filtrar por estado de envío
    if (filtroEstadoEnvio !== 'todos') {
      resultado = resultado.filter(venta => venta.venta_estado_envio === filtroEstadoEnvio);
    }

    // Filtrar por búsqueda (cliente o ID)
    if (busqueda.trim() !== '') {
      const terminoBusqueda = busqueda.toLowerCase();
      resultado = resultado.filter(venta =>
        venta.cliente_nombre?.toLowerCase().includes(terminoBusqueda) ||
        venta.venta_id.toString().includes(terminoBusqueda)
      );
    }

    setVentasFiltradas(resultado);
  }, [ventas, filtroEstadoPago, filtroEstadoEnvio, busqueda]);

  const handleCambiarEstadoPago = async (ventaId, nuevoEstado) => {
    if (!puedeModificarVenta) {
      warning('No tienes permisos para modificar el estado de pago');
      return;
    }

    try {
      const token = sessionStorage.getItem('token');
      await actualizarEstadoPago(ventaId, nuevoEstado, token);

      // Recargar ventas para obtener los estados sincronizados
      const ventasActualizadas = await getVentas(token);
      setVentas(ventasActualizadas);

      // Buscar la venta actualizada para mostrar mensaje apropiado
      const ventaActualizada = ventasActualizadas.find(v => v.venta_id === ventaId);
      
      if (nuevoEstado === 'cancelado' && ventaActualizada) {
        success(`El estado de pago se ha cambiado a ${nuevoEstado}. El estado de envío también se cambió automáticamente a cancelado.`);
      } else {
        success(`El estado de pago se ha cambiado a ${nuevoEstado}`);
      }
    } catch (error) {
      console.error('Error al actualizar estado de pago:', error);
      
      // Manejar errores específicos
      if (error.response && error.response.data && error.response.data.message) {
        const mensaje = error.response.data.message;
        
        if (mensaje.includes('después de 24 horas')) {
          error('No se puede cancelar el estado de pago después de 24 horas desde la venta');
        } else if (mensaje.includes('No se puede cambiar el estado desde "cancelado"')) {
          error('No se puede cambiar el estado desde "cancelado" a otro estado');
        } else {
          error(mensaje);
        }
      } else {
        error('No se pudo actualizar el estado de pago');
      }
    }
  };

  const handleCambiarEstadoEnvio = async (ventaId, nuevoEstado) => {
    if (!puedeModificarVenta) {
      warning('No tienes permisos para modificar el estado de envío');
      return;
    }

    try {
      const token = sessionStorage.getItem('token');
      await actualizarEstadoEnvio(ventaId, nuevoEstado, token);

      // Recargar ventas para obtener los estados sincronizados
      const ventasActualizadas = await getVentas(token);
      setVentas(ventasActualizadas);

      // Buscar la venta actualizada para mostrar mensaje apropiado
      const ventaActualizada = ventasActualizadas.find(v => v.venta_id === ventaId);
      
      if (nuevoEstado === 'cancelado' && ventaActualizada) {
        success(`El estado de envío se ha cambiado a ${nuevoEstado}. El estado de pago también se cambió automáticamente a cancelado.`);
      } else {
        success(`El estado de envío se ha cambiado a ${nuevoEstado}`);
      }
    } catch (error) {
      console.error('Error al actualizar estado de envío:', error);
      
      // Manejar errores específicos
      if (error.response && error.response.data && error.response.data.message) {
        const mensaje = error.response.data.message;
        
        if (mensaje.includes('No se puede cambiar el estado desde "cancelado"')) {
          error('No se puede cambiar el estado desde "cancelado" a otro estado');
        } else {
          error(mensaje);
        }
      } else {
        error('No se pudo actualizar el estado de envío');
      }
    }
  };

  // Nueva función para abrir el modal de edición
  const handleEditarVenta = (venta) => {
    if (!puedeModificarVenta) {
      alert('No tienes permisos para modificar ventas');
      return;
    }
    setVentaEnEdicion(venta);
    setModalEdicionAbierto(true);
  };

  // Nueva función para guardar cambios de edición
  const handleGuardarEdicion = async (datosActualizados) => {
    if (!ventaEnEdicion) return;

    setGuardando(true);
    try {
      const token = sessionStorage.getItem('token');
      await actualizarDatosVenta(ventaEnEdicion.venta_id, datosActualizados, token);

      // Actualizar estado local
      setVentas(prevVentas =>
        prevVentas.map(venta =>
          venta.venta_id === ventaEnEdicion.venta_id
            ? {
              ...venta,
              venta_nota: datosActualizados.venta_nota,
              venta_origen: datosActualizados.venta_origen
            }
            : venta
        )
      );

      alert('Datos de la venta actualizados correctamente');
      setModalEdicionAbierto(false);
      setVentaEnEdicion(null);
    } catch (error) {
      console.error('Error al actualizar datos de venta:', error);
      alert('No se pudieron actualizar los datos de la venta');
    } finally {
      setGuardando(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-700">Cargando ventas...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Gestión de Ventas</h1>

      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado de Pago</label>
            <select
              value={filtroEstadoPago}
              onChange={(e) => setFiltroEstadoPago(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="todos">Todos</option>
              <option value="pendiente">Pendiente</option>
              <option value="abonado">Abonado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado de Envío</label>
            <select
              value={filtroEstadoEnvio}
              onChange={(e) => setFiltroEstadoEnvio(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="todos">Todos</option>
              <option value="pendiente">Pendiente</option>
              <option value="enviado">Enviado</option>
              <option value="entregado">Entregado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por cliente o ID"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Tabla de ventas */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Productos
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado Pago
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado Envío
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ventasFiltradas.length > 0 ? (
                ventasFiltradas.map((venta) => (
                  <tr key={venta.venta_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{venta.venta_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(venta.venta_fecha)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {venta.cliente_nombre || 'Cliente sin nombre'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {venta.cantidad_productos} {venta.cantidad_productos === 1 ? 'producto' : 'productos'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(venta.venta_monto_total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <EstadoSelector
                        tipo="pago"
                        estadoActual={venta.venta_estado_pago}
                        onEstadoChange={(nuevoEstado) => handleCambiarEstadoPago(venta.venta_id, nuevoEstado)}
                        disabled={!puedeModificarVenta}
                        fechaVenta={venta.venta_fecha}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <EstadoSelector
                        tipo="envio"
                        estadoActual={venta.venta_estado_envio}
                        onEstadoChange={(nuevoEstado) => handleCambiarEstadoEnvio(venta.venta_id, nuevoEstado)}
                        disabled={!puedeModificarVenta}
                        fechaVenta={venta.venta_fecha}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link to={`/ventas/${venta.venta_id}`} className="text-indigo-600 hover:text-indigo-900">
                          <FaEye className="text-lg" title="Ver detalle" />
                        </Link>
                        {puedeModificarVenta && (
                          <Link
                            to={`/ventas/${venta.venta_id}/factura`}
                            className="text-green-600 hover:text-green-900"
                          >
                            <FaFileInvoice className="text-lg" title="Ver factura" />
                          </Link>
                        )}
                        {puedeModificarVenta && (
                          <button
                            className="text-amber-600 hover:text-amber-900"
                            onClick={() => handleEditarVenta(venta)}
                          >
                            <FaEdit className="text-lg" title="Editar venta" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                    No se encontraron ventas con los filtros aplicados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de edición */}
      <ModalEditarVenta
        isOpen={modalEdicionAbierto}
        onClose={() => {
          setModalEdicionAbierto(false);
          setVentaEnEdicion(null);
        }}
        venta={ventaEnEdicion}
        onConfirm={handleGuardarEdicion}
        loading={guardando}
      />

      {/* Notificaciones */}
      <NotificationContainer 
        notifications={notifications} 
        removeNotification={removeNotification} 
      />
    </div>
  );
};

export default VerVentasPage;