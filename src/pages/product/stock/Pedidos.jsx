import React, { useState } from 'react';
import usePedidos from '../../../hooks/usePedidos';
import Table from '../../../components/molecules/Table';
import RecepcionarPedidoPanel from '../../../components/molecules/pedidos/RecepcionarPedidoPanel';
import CrearPedidoModal from '../../../components/organisms/modals/pedidos/CrearPedidoModal';
import { crearPedido, modificarPedido } from '../../../api/pedidosApi';
import PrecargarProductoModal from '../../../components/organisms/modals/pedidos/PrecargarProductoModal';
import HistorialModificacionesModal from '../../../components/organisms/modals/pedidos/HistorialModificacionesModal';
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
    cargarPedidos,
    recepcionarPedido,
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
        if (puedeModificar && row.pedido_estado === 'pendiente') {
          botones.push(`<button class="btn-editar-pedido" data-id="${row.pedido_id}" style="background:#e0e7ff;color:#2563eb;border:none;padding:6px 12px;border-radius:6px;cursor:pointer;font-weight:600;margin-right:8px;display:inline-block;">Editar</button>`);
        }
        // Botón de ver detalle
        botones.push(`<button class="btn-detalle-pedido" data-id="${row.pedido_id}" style="background:#bae6fd;color:#0369a1;border:none;padding:6px 12px;border-radius:6px;cursor:pointer;font-weight:600;display:inline-block;">Detalle</button>`);
        return `<div style="display:flex;gap:8px;justify-content:center;align-items:center;">${botones.join('')}</div>`;
      }
    }
  ];

  // Delegación de eventos para botones de acción de DataTables
  React.useEffect(() => {
    const handler = (e) => {
      const detalleBtn = e.target.closest('.btn-detalle-pedido');
      if (detalleBtn) {
        const rowId = detalleBtn.getAttribute('data-id');
        const row = pedidos.find(r => String(r.pedido_id) === String(rowId));
        if (row) handleDetallePedido(row.pedido_id);
        return;
      }
      const editarBtn = e.target.closest('.btn-editar-pedido');
      if (editarBtn) {
        const rowId = editarBtn.getAttribute('data-id');
        const row = pedidos.find(r => String(r.pedido_id) === String(rowId));
        if (row) {
          setPedidoSeleccionado(row);
          setModalCrear(true);
        }
        return;
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [pedidos, handleDetallePedido]);

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

      {/* Recepción de Pedido */}
      {tab === 'recepcion' && pedidoSeleccionado && (
        <RecepcionarPedidoPanel
          pedido={pedidoSeleccionado}
          onRecepcionar={async (pedido) => {
            await recepcionarPedido(pedido);
            setTab('gestion');
            setPedidoSeleccionado(null);
            cargarPedidos();
          }}
          onClose={() => {
            setTab('gestion');
            setPedidoSeleccionado(null);
          }}
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
