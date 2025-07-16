import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getVentaPorId, actualizarEstadoPago, actualizarEstadoEnvio } from '../../../api/ventasApi';
import tienePermiso from '../../../utils/tienePermiso';
import config from '../../../config/config';
import { FaArrowLeft, FaFileInvoice, FaPrint } from 'react-icons/fa';
import useNotification from '../../../hooks/useNotification';
import NotificationContainer from '../../../components/atoms/NotificationContainer';

const DetalleVentaPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [venta, setVenta] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hook para notificaciones
  const { notifications, removeNotification, success, error, warning, info } = useNotification();

  // Verificar permisos
  const puedeModificarVenta = tienePermiso('Modificar Venta');

  useEffect(() => {
    const cargarVenta = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const data = await getVentaPorId(id, token);
        setVenta(data);
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar detalle de venta:', error);
        error('No se pudo cargar el detalle de la venta');
        navigate('/ventas');
      }
    };

    cargarVenta();
  }, [id, navigate, error]);

  const handleCambiarEstadoPago = async () => {
    if (!puedeModificarVenta) {
      warning('No tienes permisos para modificar el estado de pago');
      return;
    }

    const nuevoEstado = prompt(
      `Cambiar estado de pago (opciones: pendiente, abonado, cancelado)
Estado actual: ${venta.venta_estado_pago}`,
      venta.venta_estado_pago
    );

    if (nuevoEstado && ['pendiente', 'abonado', 'cancelado'].includes(nuevoEstado) && nuevoEstado !== venta.venta_estado_pago) {
      try {
        const token = sessionStorage.getItem('token');
        await actualizarEstadoPago(id, nuevoEstado, token);

        // Actualizar estado local
        setVenta({
          ...venta,
          venta_estado_pago: nuevoEstado
        });

        success(`El estado de pago se ha cambiado a ${nuevoEstado}`);
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
    } else if (nuevoEstado && !['pendiente', 'abonado', 'cancelado'].includes(nuevoEstado)) {
      warning('Estado de pago no válido. Opciones: pendiente, abonado, cancelado');
    }
  };

  const handleCambiarEstadoEnvio = async () => {
    if (!puedeModificarVenta) {
      warning('No tienes permisos para modificar el estado de envío');
      return;
    }

    const nuevoEstado = prompt(
      `Cambiar estado de envío (opciones: pendiente, enviado, entregado, cancelado)
Estado actual: ${venta.venta_estado_envio}`,
      venta.venta_estado_envio
    );

    if (nuevoEstado && ['pendiente', 'enviado', 'entregado', 'cancelado'].includes(nuevoEstado) && nuevoEstado !== venta.venta_estado_envio) {
      try {
        const token = sessionStorage.getItem('token');
        await actualizarEstadoEnvio(id, nuevoEstado, token);

        // Actualizar estado local
        setVenta({
          ...venta,
          venta_estado_envio: nuevoEstado
        });

        success(`El estado de envío se ha cambiado a ${nuevoEstado}`);
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
    } else if (nuevoEstado && !['pendiente', 'enviado', 'entregado', 'cancelado'].includes(nuevoEstado)) {
      warning('Estado de envío no válido. Opciones: pendiente, enviado, entregado, cancelado');
    }
  };

  const getEstadoClass = (estado, tipo) => {
    if (tipo === 'pago') {
      switch (estado) {
        case 'abonado': return 'bg-green-100 text-green-800';
        case 'pendiente': return 'bg-yellow-100 text-yellow-800';
        case 'cancelado': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    } else { // envío
      switch (estado) {
        case 'entregado': return 'bg-green-100 text-green-800';
        case 'enviado': return 'bg-blue-100 text-blue-800';
        case 'pendiente': return 'bg-yellow-100 text-yellow-800';
        case 'cancelado': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
      }
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
        <span className="ml-3 text-gray-700">Cargando detalles de la venta...</span>
      </div>
    );
  }

  if (!venta) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          No se encontró la venta solicitada.
        </div>
        <div className="mt-4">
          <Link to="/ventas" className="text-blue-600 hover:underline flex items-center">
            <FaArrowLeft className="mr-2" /> Volver al listado de ventas
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/ventas" className="text-blue-600 hover:underline flex items-center mr-4">
            <FaArrowLeft className="mr-1" /> Volver
          </Link>
          <h1 className="text-2xl font-bold">Detalle de Venta #{venta.venta_id}</h1>
        </div>
        <div className="flex space-x-2">
          {puedeModificarVenta && (
            <Link
              to={`/ventas/${id}/factura`}
              className="flex items-center bg-green-50 text-green-700 px-3 py-2 rounded-md hover:bg-green-100"
              title="Ver factura"
            >
              <FaFileInvoice className="mr-2" /> Factura
            </Link>
          )}
        </div>
      </div>

      {/* Información general de la venta */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold mb-3">Información de la venta</h2>
            <div className="space-y-2">
              <p><span className="font-medium">ID de Venta:</span> #{venta.venta_id}</p>
              <p><span className="font-medium">Fecha:</span> {formatDate(venta.venta_fecha)}</p>
              <p><span className="font-medium">Origen:</span> {venta.venta_origen || 'No especificado'}</p>
              <p><span className="font-medium">Nota:</span> {venta.venta_nota || 'Sin notas'}</p>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3">Estado</h2>
            <div className="space-y-4">
              <div>
                <p className="font-medium mb-1">Estado de pago:</p>
                <span
                  className={`px-3 py-1 inline-flex text-sm font-semibold rounded-md ${getEstadoClass(venta.venta_estado_pago, 'pago')}`}
                >
                  {venta.venta_estado_pago.charAt(0).toUpperCase() + venta.venta_estado_pago.slice(1)}
                </span>
              </div>

              <div>
                <p className="font-medium mb-1">Estado de envío:</p>
                <span
                  className={`px-3 py-1 inline-flex text-sm font-semibold rounded-md ${getEstadoClass(venta.venta_estado_envio, 'envio')}`}
                >
                  {venta.venta_estado_envio.charAt(0).toUpperCase() + venta.venta_estado_envio.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Información del cliente */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-3">Información del cliente</h2>
        {venta.cliente ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p><span className="font-medium">Nombre:</span> {venta.cliente.persona_nombre || venta.cliente.nombre} {venta.cliente.persona_apellido || venta.cliente.apellido}</p>
              <p><span className="font-medium">Email:</span> {venta.cliente.cliente_email || venta.cliente.email}</p>
              <p><span className="font-medium">Teléfono:</span> {venta.cliente.persona_telefono || venta.cliente.telefono || 'No disponible'}</p>
              {venta.cliente.persona_dni && <p><span className="font-medium">DNI:</span> {venta.cliente.persona_dni}</p>}
            </div>

            {venta.envio && (
              <div>
                <h3 className="font-medium mb-1">Dirección de envío:</h3>
                <p>{venta.envio.calle} {venta.envio.numero}</p>
                {venta.envio.piso && <p>Piso: {venta.envio.piso} - Depto: {venta.envio.depto}</p>}
                <p>CP: {venta.envio.cp}</p>
                <p>{venta.envio.ciudad}, {venta.envio.provincia}</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500">No hay información del cliente disponible.</p>
        )}
      </div>

      {/* Listado de productos */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Productos</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Detalle</th>
                <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Precio Unitario</th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {venta.productos && venta.productos.map((producto) => (
                <tr key={producto.vd_id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {producto.imagen_url && (
                        <div className="flex-shrink-0 h-12 w-12 mr-3">
                          <img
                            src={`${producto.imagen_url.startsWith('http') ? '' : config.backendUrl}${producto.imagen_url}`}
                            alt={producto.producto_nombre}
                            className="h-12 w-12 object-cover rounded"
                          />
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">{producto.producto_nombre}</div>
                        {producto.variante_sku && (
                          <div className="text-xs text-gray-500">SKU: {producto.variante_sku}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-900">
                      {producto.variante_descripcion || 'Producto sin variantes'}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center text-sm text-gray-500">
                    {producto.vd_cantidad}
                  </td>
                  <td className="px-4 py-4 text-right text-sm text-gray-500">
                    {formatCurrency(producto.vd_precio_unitario)}
                  </td>
                  <td className="px-4 py-4 text-right text-sm font-medium text-gray-900">
                    {formatCurrency(producto.vd_subtotal)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              {venta.venta_monto_descuento > 0 && (
                <tr className="bg-gray-50">
                  <td colSpan="4" className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                    Descuento:
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-red-600">
                    -{formatCurrency(venta.venta_monto_descuento)}
                  </td>
                </tr>
              )}
              <tr className="bg-gray-50">
                <td colSpan="4" className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                  Total:
                </td>
                <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                  {formatCurrency(venta.venta_monto_total)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Si hay cupón mostrar información */}
      {venta.cupon && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">Cupón aplicado</h2>
          <p><span className="font-medium">Código:</span> {venta.cupon.cupon_codigo}</p>
          {venta.cupon.cupon_porcentaje > 0 && (
            <p><span className="font-medium">Porcentaje de descuento:</span> {venta.cupon.cupon_porcentaje}%</p>
          )}
          {venta.cupon.cupon_monto_fijo > 0 && (
            <p><span className="font-medium">Monto fijo de descuento:</span> {formatCurrency(venta.cupon.cupon_monto_fijo)}</p>
          )}
        </div>
      )}

      {/* Notificaciones */}
      <NotificationContainer 
        notifications={notifications} 
        removeNotification={removeNotification} 
      />
    </div>
  );
};

export default DetalleVentaPage;