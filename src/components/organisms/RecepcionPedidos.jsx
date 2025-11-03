import React, { useState, useEffect, useMemo } from 'react';
import { FiPackage, FiSearch, FiFilter, FiEye, FiCheck, FiClock } from 'react-icons/fi';
import Table from '../molecules/Table';
import RecepcionPedidoModal from './Modals/pedidos/RecepcionPedidoModal';

const RecepcionPedidos = ({ 
  pedidos, 
  loading, 
  error, 
  onRecepcionar, 
  onVerDetalle,
  puedeRecepcionar = true 
}) => {
  const [filtros, setFiltros] = useState({
    busqueda: '',
    proveedor: '',
    fechaDesde: '',
    fechaHasta: '',
    diasPendientes: ''
  });
  
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [modalRecepcionOpen, setModalRecepcionOpen] = useState(false);

  // Filtrar pedidos pendientes
  const pedidosPendientes = useMemo(() => {
    return pedidos.filter(pedido => pedido.pedido_estado === 'pendiente');
  }, [pedidos]);

  // Aplicar filtros
  const pedidosFiltrados = useMemo(() => {
    return pedidosPendientes.filter(pedido => {
      const coincideBusqueda = !filtros.busqueda || 
        pedido.proveedor_nombre.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
        pedido.pedido_id.toString().includes(filtros.busqueda);

      const coincideProveedor = !filtros.proveedor || 
        pedido.proveedor_nombre.toLowerCase().includes(filtros.proveedor.toLowerCase());

      const fechaPedido = new Date(pedido.pedido_fecha_pedido);
      const coincideFechaDesde = !filtros.fechaDesde || 
        fechaPedido >= new Date(filtros.fechaDesde);
      
      const coincideFechaHasta = !filtros.fechaHasta || 
        fechaPedido <= new Date(filtros.fechaHasta);

      const diasPendiente = Math.floor((new Date() - fechaPedido) / (1000 * 60 * 60 * 24));
      const coincideDiasPendientes = !filtros.diasPendientes || 
        (filtros.diasPendientes === '1-3' && diasPendiente >= 1 && diasPendiente <= 3) ||
        (filtros.diasPendientes === '4-7' && diasPendiente >= 4 && diasPendiente <= 7) ||
        (filtros.diasPendientes === '8+' && diasPendiente >= 8);

      return coincideBusqueda && coincideProveedor && coincideFechaDesde && 
             coincideFechaHasta && coincideDiasPendientes;
    });
  }, [pedidosPendientes, filtros]);

  // Estadísticas
  const estadisticas = useMemo(() => {
    const total = pedidosFiltrados.length;
    const totalMonetario = pedidosFiltrados.reduce((sum, p) => sum + parseFloat(p.pedido_total || 0), 0);
    const promedioAntiguedad = total > 0 ? 
      pedidosFiltrados.reduce((sum, p) => {
        const dias = Math.floor((new Date() - new Date(p.pedido_fecha_pedido)) / (1000 * 60 * 60 * 24));
        return sum + dias;
      }, 0) / total : 0;

    return { total, totalMonetario, promedioAntiguedad };
  }, [pedidosFiltrados]);

  // Configuración de columnas para la tabla
  const columns = [
    { 
      title: 'ID', 
      data: 'pedido_id',
      render: (data) => `#${data}`
    },
    { 
      title: 'Proveedor', 
      data: 'proveedor_nombre' 
    },
    { 
      title: 'Fecha Pedido', 
      data: 'pedido_fecha_pedido',
      render: (data) => new Date(data).toLocaleDateString('es-ES')
    },
    { 
      title: 'Días Pendientes', 
      data: 'pedido_fecha_pedido',
      render: (data) => {
        const dias = Math.floor((new Date() - new Date(data)) / (1000 * 60 * 60 * 24));
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            dias <= 3 ? 'bg-green-100 text-green-800' :
            dias <= 7 ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {dias} día{dias !== 1 ? 's' : ''}
          </span>
        );
      }
    },
    { 
      title: 'Total', 
      data: 'pedido_total',
      render: (data) => `$${parseFloat(data || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}`
    },
    { 
      title: 'Fecha Esperada', 
      data: 'pedido_fecha_esperada_entrega',
      render: (data) => data ? new Date(data).toLocaleDateString('es-ES') : 'No definida'
    },
    {
      title: 'Acciones',
      data: 'pedido_id',
      orderable: false,
      render: (data, type, row) => {
        const botones = [];
        
        // Botón ver detalle
        botones.push(
          `<button class="btn-ver-detalle" data-id="${row.pedido_id}" 
            style="background:#e0f2fe;color:#0277bd;border:none;padding:6px 12px;border-radius:6px;cursor:pointer;font-weight:600;margin-right:8px;">
            <i class="fi fi-eye"></i> Ver Detalle
          </button>`
        );

        // Botón recepcionar (solo si tiene permiso)
        if (puedeRecepcionar) {
          botones.push(
            `<button class="btn-recepcionar" data-id="${row.pedido_id}"
              style="background:#e8f5e8;color:#2e7d2e;border:none;padding:6px 12px;border-radius:6px;cursor:pointer;font-weight:600;">
              <i class="fi fi-check"></i> Recepcionar
            </button>`
          );
        }

        return `<div style="display:flex;gap:8px;justify-content:center;">${botones.join('')}</div>`;
      }
    }
  ];

  // Manejo de acciones de la tabla
  useEffect(() => {
    const handleAction = (e) => {
      const pedidoId = e.target.closest('button')?.dataset?.id;
      if (!pedidoId) return;

      const pedido = pedidosFiltrados.find(p => p.pedido_id.toString() === pedidoId);
      if (!pedido) return;

      if (e.target.closest('.btn-ver-detalle')) {
        onVerDetalle && onVerDetalle(pedido);
      } else if (e.target.closest('.btn-recepcionar')) {
        setPedidoSeleccionado(pedido);
        setModalRecepcionOpen(true);
      }
    };

    document.addEventListener('click', handleAction);
    return () => document.removeEventListener('click', handleAction);
  }, [pedidosFiltrados, onVerDetalle]);

  const limpiarFiltros = () => {
    setFiltros({
      busqueda: '',
      proveedor: '',
      fechaDesde: '',
      fechaHasta: '',
      diasPendientes: ''
    });
  };

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FiPackage className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Recepción de Pedidos</h2>
              <p className="text-gray-600">Gestiona la recepción de pedidos pendientes</p>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Pedidos Pendientes</p>
                <p className="text-2xl font-bold text-blue-900">{estadisticas.total}</p>
              </div>
              <FiClock className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Valor Total</p>
                <p className="text-2xl font-bold text-green-900">
                  ${estadisticas.totalMonetario.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <span className="text-2xl">💰</span>
            </div>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">Promedio Antigüedad</p>
                <p className="text-2xl font-bold text-orange-900">
                  {Math.round(estadisticas.promedioAntiguedad)} días
                </p>
              </div>
              <span className="text-2xl">📅</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <FiFilter className="w-5 h-5 mr-2" />
            Filtros
          </h3>
          <button
            onClick={limpiarFiltros}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Limpiar filtros
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Búsqueda */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por ID o proveedor..."
              value={filtros.busqueda}
              onChange={(e) => setFiltros(prev => ({ ...prev, busqueda: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Proveedor */}
          <input
            type="text"
            placeholder="Filtrar por proveedor"
            value={filtros.proveedor}
            onChange={(e) => setFiltros(prev => ({ ...prev, proveedor: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />

          {/* Fecha desde */}
          <input
            type="date"
            value={filtros.fechaDesde}
            onChange={(e) => setFiltros(prev => ({ ...prev, fechaDesde: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />

          {/* Fecha hasta */}
          <input
            type="date"
            value={filtros.fechaHasta}
            onChange={(e) => setFiltros(prev => ({ ...prev, fechaHasta: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />

          {/* Días pendientes */}
          <select
            value={filtros.diasPendientes}
            onChange={(e) => setFiltros(prev => ({ ...prev, diasPendientes: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todos los días</option>
            <option value="1-3">1-3 días</option>
            <option value="4-7">4-7 días</option>
            <option value="8+">8+ días</option>
          </select>
        </div>
      </div>

      {/* Tabla de pedidos */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <Table
          columns={columns}
          data={pedidosFiltrados}
          loading={loading}
          error={error}
          emptyMessage="No hay pedidos pendientes de recepción"
          className="rounded-lg overflow-hidden"
        />
      </div>

      {/* Modal de recepción */}
      {modalRecepcionOpen && (
        <RecepcionPedidoModal
          open={modalRecepcionOpen}
          onClose={() => {
            setModalRecepcionOpen(false);
            setPedidoSeleccionado(null);
          }}
          pedido={pedidoSeleccionado}
          onRecepcionar={async (datosRecepcion) => {
            await onRecepcionar(datosRecepcion);
            setModalRecepcionOpen(false);
            setPedidoSeleccionado(null);
          }}
        />
      )}
    </div>
  );
};

export default RecepcionPedidos;