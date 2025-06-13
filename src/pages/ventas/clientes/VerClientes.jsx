import React, { useEffect, useState } from 'react';
import Table from '../../../components/molecules/Table';
import { 
  obtenerClientes, 
  eliminarCliente,
  actualizarCliente,
  obtenerClientesEliminados,
  reactivarCliente
} from '../../../api/clientesApi';
import { useNavigate, useLocation } from 'react-router-dom';
import ModalMensaje from '../../../components/organisms/Modals/ModalMensaje';
import ModalEliminar from '../../../components/organisms/Modals/ModalEliminar';
import ModalModificarCliente from '../../../components/organisms/Modals/clientes/ModalModificarCliente';
import tienePermiso from '../../../utils/tienePermiso';

const VerClientes = () => {
  const [clientes, setClientes] = useState([]);
  const [clientesEliminados, setClientesEliminados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalEliminarOpen, setModalEliminarOpen] = useState(false);
  const [modalModificarOpen, setModalModificarOpen] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [modalMensajeOpen, setModalMensajeOpen] = useState(false);
  const [mensajeModal, setMensajeModal] = useState({ tipo: '', mensaje: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modoVisualizacion, setModoVisualizacion] = useState('activos');
  const navigate = useNavigate();
  const location = useLocation();
  
  const reloadClientes = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      
      // Cargar clientes activos
      const clientesActivos = await obtenerClientes(token);
      setClientes(clientesActivos);
      
      // Cargar clientes eliminados
      const eliminados = await obtenerClientesEliminados(token);
      setClientesEliminados(eliminados);
    } catch (error) {
      setMensajeModal({
        tipo: 'error',
        mensaje: 'Error al cargar los clientes'
      });
      setModalMensajeOpen(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadClientes();
    // eslint-disable-next-line
  }, [location.pathname]);

  // Columnas para clientes activos
  const columnsActivos = [
    { title: 'ID', data: 'cliente_id' },
    { title: 'Nombre', data: 'persona_nombre', render: (data, type, row) => `${row.persona_nombre} ${row.persona_apellido}` },
    { title: 'DNI', data: 'persona_dni' },
    { title: 'Email', data: 'cliente_email' },
    { title: 'Teléfono', data: 'persona_telefono' },
    { title: 'Domicilio', data: 'persona_domicilio', render: (data) => data || '-' },
    { title: 'Fecha Alta', data: 'cliente_fecha_alta', render: (data) => {
      if (!data) return '-';
      const fecha = new Date(data);
      return fecha.toLocaleDateString('es-AR');
    }},
    {
      title: 'Acciones',
      data: null,
      orderable: false,
      render: (data, type, row) => {
        let botones = [];
        
        if (tienePermiso('Modificar Cliente')) {
          botones.push(
            `<button class="btn-modificar-cliente" data-id="${row.cliente_id}" title="Modificar" style="background:#e0e7ff;color:#2563eb;border:none;padding:6px 12px;border-radius:6px;cursor:pointer;font-weight:600;margin-right:8px;display:inline-block;">Modificar</button>`
          );
        }
        if (tienePermiso('Eliminar Cliente')) {
          botones.push(
            `<button class="btn-eliminar-cliente" data-id="${row.cliente_id}" title="Eliminar" style="background:#fee2e2;color:#dc2626;border:none;padding:6px 12px;border-radius:6px;cursor:pointer;font-weight:600;display:inline-block;">Eliminar</button>`
          );
        }
        
        if (botones.length === 0) return '-';
        return `<div style="display:flex;gap:10px;justify-content:center;align-items:center;">${botones.join('')}</div>`;
      }
    }
  ];

  useEffect(() => {
    const handler = (e) => {
      if (e.target.closest('.btn-modificar-cliente')) {
        const id = e.target.closest('.btn-modificar-cliente').getAttribute('data-id');
        const cliente = clientes.find(c => String(c.cliente_id) === String(id));
        setClienteSeleccionado(cliente);
        setModalModificarOpen(true);
      }
      if (e.target.closest('.btn-eliminar-cliente')) {
        const id = e.target.closest('.btn-eliminar-cliente').getAttribute('data-id');
        const cliente = clientes.find(c => String(c.cliente_id) === String(id));
        setClienteSeleccionado(cliente);
        setModalEliminarOpen(true);
      }
      if (e.target.closest('.btn-reactivar-cliente')) {
        const id = e.target.closest('.btn-reactivar-cliente').getAttribute('data-id');
        const cliente = clientesEliminados.find(c => String(c.cliente_id) === String(id));
        handleReactivarCliente(cliente);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [clientes, clientesEliminados]);

  const handleEliminarCliente = async () => {
    if (!clienteSeleccionado) return;
    try {
      const token = sessionStorage.getItem('token');
      await eliminarCliente(clienteSeleccionado.cliente_id, token);
      setModalEliminarOpen(false);
      
      setMensajeModal({
        tipo: 'exito',
        mensaje: 'Cliente eliminado exitosamente'
      });
      setModalMensajeOpen(true);
      
      reloadClientes();
    } catch (error) {
      setModalEliminarOpen(false);
      
      setMensajeModal({
        tipo: 'error',
        mensaje: error?.message || 'Error al eliminar el cliente'
      });
      setModalMensajeOpen(true);
    } finally {
      setClienteSeleccionado(null);
    }
  };

  const handleReactivarCliente = async (cliente) => {
    if (!cliente) return;
    
    try {
      const token = sessionStorage.getItem('token');
      await reactivarCliente(cliente.cliente_id, token);
      
      setMensajeModal({
        tipo: 'exito',
        mensaje: 'Cliente reactivado exitosamente'
      });
      setModalMensajeOpen(true);
      
      reloadClientes();
    } catch (error) {
      setMensajeModal({
        tipo: 'error',
        mensaje: error?.message || 'Error al reactivar el cliente'
      });
      setModalMensajeOpen(true);
    }
  };

  const handleActualizarCliente = async (formData) => {
    if (!clienteSeleccionado) return;
    
    setIsSubmitting(true);
    try {
      const token = sessionStorage.getItem('token');
      await actualizarCliente(clienteSeleccionado.cliente_id, formData, token);
      
      setModalModificarOpen(false);
      setClienteSeleccionado(null);
      
      setMensajeModal({
        tipo: 'exito',
        mensaje: 'Cliente actualizado exitosamente'
      });
      setModalMensajeOpen(true);
      
      reloadClientes();
    } catch (error) {
      setMensajeModal({
        tipo: 'error',
        mensaje: error?.message || 'Error al actualizar el cliente'
      });
      setModalMensajeOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const cambiarModoVisualizacion = (modo) => {
    setModoVisualizacion(modo);
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-800"></div>
    </div>
  );

  return (
    <div className="container-fluid px-4">
      <div className="d-flex justify-content-between align-items-center mb-4 mt-4">
        <h2 className="pl-12 text-xl font-semibold">Listado de Clientes</h2>
        
      </div>
      
      {/* Pestañas para cambiar entre clientes activos y eliminados */}
      <div className="mx-12 mb-4 flex border-b border-gray-200">
        <button
          onClick={() => cambiarModoVisualizacion('activos')}
          className={`py-2 px-4 font-medium text-sm ${
            modoVisualizacion === 'activos'
              ? 'border-b-2 border-purple-500 text-purple-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Clientes Activos
        </button>
        <button
          onClick={() => cambiarModoVisualizacion('eliminados')}
          className={`py-2 px-4 font-medium text-sm ${
            modoVisualizacion === 'eliminados'
              ? 'border-b-2 border-purple-500 text-purple-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Clientes Eliminados
        </button>
      </div>
      
      {modoVisualizacion === 'activos' ? (
        <Table columns={columnsActivos} data={clientes} />
      ) : (
        <div className="py-6">
          <div className="rounded-xl shadow-lg bg-white p-4 md:p-6 w-[95%] mx-auto border border-violet-200">
            <div className="overflow-x-auto"> {/* Contenedor con scroll horizontal */}
              <table className="w-full min-w-full table-auto">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DNI</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Domicilio</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Alta</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Baja</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {clientesEliminados.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="px-4 py-4 text-center text-sm text-gray-500">
                        No hay clientes eliminados
                      </td>
                    </tr>
                  ) : (
                    clientesEliminados.map(cliente => (
                      <tr key={cliente.cliente_id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{cliente.cliente_id}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{`${cliente.persona_nombre} ${cliente.persona_apellido}`}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{cliente.persona_dni}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{cliente.cliente_email || '-'}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{cliente.persona_telefono || '-'}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{cliente.persona_domicilio || '-'}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {cliente.cliente_fecha_alta ? new Date(cliente.cliente_fecha_alta).toLocaleDateString('es-AR') : '-'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {cliente.cliente_fecha_baja ? new Date(cliente.cliente_fecha_baja).toLocaleDateString('es-AR') : '-'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                          {tienePermiso('Modificar Cliente') && (
                            <button
                              onClick={() => handleReactivarCliente(cliente)}
                              className="bg-green-100 text-green-600 border-none px-3 py-1 rounded-md font-semibold"
                              style={{background:"#dcfce7", color:"#16a34a", border:"none", padding:"6px 12px", borderRadius:"6px", cursor:"pointer", fontWeight:"600"}}
                            >
                              Reactivar
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal para confirmar eliminación */}
      <ModalEliminar
        isOpen={modalEliminarOpen}
        onClose={() => {
          setModalEliminarOpen(false);
          setClienteSeleccionado(null);
        }}
        onConfirm={handleEliminarCliente}
        nombreEntidad={clienteSeleccionado ? `cliente ${clienteSeleccionado.persona_nombre} ${clienteSeleccionado.persona_apellido}` : 'cliente'}
      />

      {/* Modal para modificar cliente */}
      {clienteSeleccionado && (
        <ModalModificarCliente
          isOpen={modalModificarOpen}
          onClose={() => {
            setModalModificarOpen(false);
            setClienteSeleccionado(null);
          }}
          cliente={clienteSeleccionado}
          onSubmit={handleActualizarCliente}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Modal para mensajes */}
      <ModalMensaje
        isOpen={modalMensajeOpen}
        onClose={() => setModalMensajeOpen(false)}
        tipo={mensajeModal.tipo}
        mensaje={mensajeModal.mensaje}
      />
    </div>
  );
};

export default VerClientes;