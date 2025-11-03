import React, { useState } from 'react';
import usePedidos from '../../../hooks/usePedidos';
import Table from '../../../components/molecules/Table';
import RecepcionPedidos from '../../../components/organisms/RecepcionPedidos';
import CrearPedidoModal from '../../../components/organisms/modals/pedidos/CrearPedidoModal';
import EditarPedidoModal from '../../../components/organisms/Modals/pedidos/EditarPedidoModalSimple';
import { crearPedido, modificarPedido } from '../../../api/pedidosApi';
import PrecargarProductoModal from '../../../components/organisms/modals/pedidos/PrecargarProductoModal';
import HistorialModificacionesModal from '../../../components/organisms/Modals/pedidos/HistorialModificacionesModal';
import DetallePedidoModal from '../../../components/organisms/Modals/pedidos/DetallePedidoModal';

const Pedidos = () => {
  const {
    pedidos,
    loading,
    error,
    puedeCrear,
    puedeModificar,
    puedeRecepcionar,
    puedeCancelar,
    puedeVerHistorial,
    cargarPedidos,
    recepcionarPedido,
    modificarPedido,
    cancelarPedido,
    detallePedido,
    modalDetalleOpen,
    setModalDetalleOpen,
    handleDetallePedido
  } = usePedidos();

  // Cargar pedidos al montar
  React.useEffect(() => {
    cargarPedidos();
  }, [cargarPedidos]);

  React.useEffect(() => {
    console.log('PEDIDOS:', pedidos);
  }, [pedidos]);

  const [tab, setTab] = useState('gestion');
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [modalCrear, setModalCrear] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalPrecargar, setModalPrecargar] = useState(false);
  const [modalHistorial, setModalHistorial] = useState(false);

  const columns = [
    { title: 'ID', data: 'pedido_id' },
    { title: 'Proveedor', data: 'proveedor_nombre' },
    { title: 'Usuario', data: row => `${row.persona_nombre || ''} ${row.persona_apellido || ''}`.trim() },
    { title: 'Estado', data: 'pedido_estado' },
    { title: 'Fecha Pedido', data: row => row.pedido_fecha_pedido ? new Date(row.pedido_fecha_pedido).toLocaleDateString() : '' },
    { title: 'Total', data: 'pedido_total' },
    { title: 'Descuento', data: 'pedido_descuento' },
    { title: 'Costo Envío', data: 'pedido_costo_envio' },
    { title: 'Fecha Esperada Entrega', data: row => row.pedido_fecha_esperada_entrega ? new Date(row.pedido_fecha_esperada_entrega).toLocaleDateString() : '' },
    {
      title: 'Acciones',
      data: 'pedido_id',
      orderable: false,
      render: function (data, type, row) {
        let botones = [];
        // Botón de editar (solo si tiene permiso y está pendiente)
        if (puedeModificar && row.pedido_estado === 'pendiente') {
          botones.push(`<button class="btn-editar-pedido" data-id="${row.pedido_id}" style="background:#e0e7ff;color:#2563eb;border:none;padding:6px 12px;border-radius:6px;cursor:pointer;font-weight:600;margin-right:8px;display:inline-block;">Editar</button>`);
        }
        // Botón de ver detalle (siempre visible)
        botones.push(`<button class="btn-detalle-pedido" data-id="${row.pedido_id}" style="background:#bae6fd;color:#0369a1;border:none;padding:6px 12px;border-radius:6px;cursor:pointer;font-weight:600;display:inline-block;">Detalle</button>`);

        // Menú desplegable 'Más opciones'
        let opciones = [];
        if (puedeVerHistorial) {
          opciones.push(`<button class='btn-historial-pedido' data-id='${row.pedido_id}' style='background:none;border:none;padding:6px 12px;width:100%;text-align:left;cursor:pointer;'>Ver historial</button>`);
        }
        if (puedeCancelar && row.pedido_estado === 'pendiente') {
          opciones.push(`<button class='btn-cancelar-pedido' data-id='${row.pedido_id}' style='background:none;border:none;padding:6px 12px;width:100%;text-align:left;cursor:pointer;color:#dc2626;'>Cancelar pedido</button>`);
        }
        if (opciones.length > 0) {
          botones.push(`
            <div class='dropdown-mas-opciones' style='position:relative;display:inline-block;'>
              <button class='btn-mas-opciones' style='background:#f1f5f9;color:#334155;border:none;padding:6px 12px;border-radius:6px;cursor:pointer;font-weight:600;font-size:20px;line-height:1;'>⋮</button>
              <div class='dropdown-content-mas-opciones' style='display:none;position:absolute;right:0;top:110%;background:#fff;border:1px solid #e5e7eb;border-radius:8px;box-shadow:0 2px 8px #0002;min-width:160px;z-index:100;'>
                ${opciones.join('')}
              </div>
            </div>
          `);
        }
        return `<div style="display:flex;gap:8px;justify-content:center;align-items:center;">${botones.join('')}</div>`;
      }
    }
  ];

  // Delegación de eventos para botones de acción de DataTables
  React.useEffect(() => {
    const handler = (e) => {
      // Botón detalle
      const detalleBtn = e.target.closest('.btn-detalle-pedido');
      if (detalleBtn) {
        const rowId = detalleBtn.getAttribute('data-id');
        const row = pedidos.find(r => String(r.pedido_id) === String(rowId));
        if (row) handleDetallePedido(row.pedido_id);
        return;
      }

      // Botón editar
      const editarBtn = e.target.closest('.btn-editar-pedido');
      if (editarBtn) {
        const rowId = editarBtn.getAttribute('data-id');
        const row = pedidos.find(r => String(r.pedido_id) === String(rowId));
        if (row) {
          setPedidoSeleccionado(row);
          setModalEditar(true);
        }
        return;
      }

      // Botón historial
      const historialBtn = e.target.closest('.btn-historial-pedido');
      if (historialBtn) {
        const rowId = historialBtn.getAttribute('data-id');
        const row = pedidos.find(r => String(r.pedido_id) === String(rowId));
        if (row) {
          setPedidoSeleccionado(row);
          setModalHistorial(true);
        }
        return;
      }

      // Botón cancelar pedido
      const cancelarBtn = e.target.closest('.btn-cancelar-pedido');
      if (cancelarBtn) {
        const rowId = cancelarBtn.getAttribute('data-id');
        const row = pedidos.find(r => String(r.pedido_id) === String(rowId));
        if (row) {
          if (window.confirm('¿Seguro que deseas cancelar este pedido?')) {
            cancelarPedido({ pedido_id: row.pedido_id, motivo_cancelacion: 'Cancelado desde tabla', usuario_id: row.usuario_id });
          }
        }
        return;
      }

      // Desplegar/cerrar menú de opciones
      const masOpcionesBtn = e.target.closest('.btn-mas-opciones');
      if (masOpcionesBtn) {
        // Cerrar otros menús abiertos
        document.querySelectorAll('.dropdown-content-mas-opciones-fixed').forEach(el => {
          el.remove();
        });

        // Crear menú como elemento fixed en el body
        const rect = masOpcionesBtn.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const menuHeight = 80; // Aproximado, puedes ajustar
        let top = rect.bottom + 4;
        let dropup = false;
        if (rect.bottom + menuHeight > windowHeight - 20) {
          top = rect.top - menuHeight - 4;
          dropup = true;
        }
        const left = rect.right - 160; // ancho del menú

        const menu = document.createElement('div');
        menu.className = 'dropdown-content-mas-opciones-fixed';
        menu.style.position = 'fixed';
        menu.style.top = `${top}px`;
        menu.style.left = `${left}px`;
        menu.style.background = '#fff';
        menu.style.border = '1px solid #e5e7eb';
        menu.style.borderRadius = '8px';
        menu.style.boxShadow = dropup ? '0 -4px 16px 2px #0004' : '0 4px 16px 2px #0004';
        menu.style.minWidth = '160px';
        menu.style.zIndex = '999999';
        menu.style.padding = '4px 0';
        menu.innerHTML = masOpcionesBtn.parentElement.parentElement.querySelector('.btn-historial-pedido, .btn-cancelar-pedido')
          ? masOpcionesBtn.parentElement.parentElement.querySelector('.btn-historial-pedido, .btn-cancelar-pedido').parentElement.innerHTML
          : '';

        // Alternativa: reconstruir el HTML de opciones
        let opcionesHtml = '';
        const rowId = masOpcionesBtn.getAttribute('data-id');
        if (masOpcionesBtn.parentElement.parentElement.querySelector('.btn-historial-pedido')) {
          opcionesHtml += masOpcionesBtn.parentElement.parentElement.querySelector('.btn-historial-pedido').outerHTML;
        }
        if (masOpcionesBtn.parentElement.parentElement.querySelector('.btn-cancelar-pedido')) {
          opcionesHtml += masOpcionesBtn.parentElement.parentElement.querySelector('.btn-cancelar-pedido').outerHTML;
        }
        menu.innerHTML = opcionesHtml;

        document.body.appendChild(menu);

        // Cerrar menú al hacer click fuera
        setTimeout(() => {
          document.addEventListener('click', function cerrarMenu(ev) {
            if (!menu.contains(ev.target) && ev.target !== masOpcionesBtn) {
              menu.remove();
              document.removeEventListener('click', cerrarMenu);
            }
          });
        }, 10);

        e.stopPropagation();
        return;
      }

      // Cerrar menú si se hace click fuera
      document.querySelectorAll('.dropdown-content-mas-opciones').forEach(el => {
        el.style.display = 'none';
      });
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [pedidos, handleDetallePedido, modificarPedido]);

  return (
    <div className="px-2 sm:px-4 md:px-6 py-4 md:py-8">
      <h1 className="text-xl md:text-2xl font-bold mb-4">Gestión de Pedidos</h1>

      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          onClick={() => setTab('gestion')}
          className={`py-2 px-4 text-sm md:text-base font-medium ${
            tab === 'gestion'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Gestión de Pedidos
        </button>
        <button
          onClick={() => setTab('recepcion')}
          className={`py-2 px-4 text-sm md:text-base font-medium ${
            tab === 'recepcion'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Recepción de Pedidos
        </button>
      </div>

      {/* Botón Crear */}
      {tab === 'gestion' && puedeCrear && (
        <button
          onClick={() => {
            setPedidoSeleccionado(null);
            setModalCrear(true);
          }}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded text-sm md:text-base mb-4 transition"
        >
          Crear Nuevo Pedido
        </button>
      )}

      {/* Tabla de Pedidos */}
      {tab === 'gestion' && (
        <Table
          columns={columns}
          data={pedidos}
          loading={loading}
          error={error}
          onRowClick={row => setPedidoSeleccionado(row)}
          onActionClick={(action, row) => {
            if (action === 'detalle') handleDetallePedido(row.pedido_id);
            if (action === 'editar') {
              setPedidoSeleccionado(row);
              setModalCrear(true);
            }
          }}
        />
      )}

      {/* Vista de Recepción */}
      {tab === 'recepcion' && (
        <RecepcionPedidos
          pedidos={pedidos}
          loading={loading}
          error={error}
          onRecepcionar={async (datosRecepcion) => {
            await recepcionarPedido(datosRecepcion);
            cargarPedidos();
          }}
          onVerDetalle={handleDetallePedido}
          puedeRecepcionar={puedeRecepcionar}
        />
      )}

      {/* Modales */}
      {modalCrear && (
        <CrearPedidoModal
          open={modalCrear}
          onClose={() => setModalCrear(false)}
          pedido={pedidoSeleccionado}
          onSubmit={async (data) => {
            try {
              const userData = JSON.parse(sessionStorage.getItem('userData'));
              const usuario_id = userData?.usuario_id;
              if (!usuario_id) {
                alert('No se encontró el usuario logueado.');
                return;
              }
              if (pedidoSeleccionado && pedidoSeleccionado.id) {
                // Editar pedido existente
                await modificarPedido({ ...data, pedido_id: pedidoSeleccionado.id, pedido_usuario_id: usuario_id });
              } else {
                // Crear nuevo pedido
                await crearPedido({ ...data, pedido_usuario_id: usuario_id });
              }
              setModalCrear(false);
              setPedidoSeleccionado(null);
              cargarPedidos();
              // Podés mostrar un mensaje de éxito aquí si querés
            } catch (err) {
              alert('Error al guardar el pedido: ' + (err?.message || 'Error desconocido'));
            }
          }}
          onPrecargarProducto={() => setModalPrecargar(true)}
        />
      )}
      {modalEditar && (
        <EditarPedidoModal
          open={modalEditar}
          onClose={() => {
            setModalEditar(false);
            setPedidoSeleccionado(null);
          }}
          pedido={pedidoSeleccionado}
          onSubmit={async (data) => {
            try {
              await modificarPedido(data);
              setModalEditar(false);
              setPedidoSeleccionado(null);
              cargarPedidos();
              alert('Pedido modificado exitosamente');
            } catch (err) {
              alert('Error al modificar el pedido: ' + (err?.message || 'Error desconocido'));
            }
          }}
        />
      )}
      {modalPrecargar && (
        <PrecargarProductoModal
          open={modalPrecargar}
          onClose={() => setModalPrecargar(false)}
          onSuccess={() => setModalPrecargar(false)}
        />
      )}
      {modalHistorial && (
        <HistorialModificacionesModal
          open={modalHistorial}
          onClose={() => setModalHistorial(false)}
          pedido={pedidoSeleccionado}
        />
      )}
      {/* Modal Detalle Pedido */}
      <DetallePedidoModal
        open={modalDetalleOpen}
        onClose={() => setModalDetalleOpen(false)}
        pedido={detallePedido}
      />
    </div>
  );
};

export default Pedidos;
