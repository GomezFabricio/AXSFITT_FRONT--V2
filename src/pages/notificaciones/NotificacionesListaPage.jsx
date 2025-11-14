import React, { useEffect, useState } from 'react';
import { getNotificacionesLista } from '../../api/notificacionesListaApi';
import tienePermiso from '../../utils/tienePermiso';
import { useNavigate } from 'react-router-dom';
import DetalleNotificacionModal from '../../components/modals/DetalleNotificacionModal';

const NotificacionesListaPage = () => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNotificacion, setSelectedNotificacion] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const navigate = useNavigate();

  // Calcular elementos para la paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentNotificaciones = notificaciones.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(notificaciones.length / itemsPerPage);

  // Verificar permisos al cargar
  useEffect(() => {
    if (!tienePermiso('Ver Lista de Faltantes')) {
      navigate('/');
      return;
    }

    const fetchNotificaciones = async () => {
      try {
        const token = sessionStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const data = await getNotificacionesLista(token);
        setNotificaciones(data);
      } catch (err) {
        setError('Error al cargar las notificaciones');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotificaciones();
  }, [navigate]);

  const formatearFecha = (fechaISO) => {
    if (!fechaISO) return '-';
    return new Date(fechaISO).toLocaleString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleRowClick = (notificacion) => {
    setSelectedNotificacion(notificacion);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedNotificacion(null);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'pendiente':
        return '#FFA500'; // Naranja
      case 'enviado':
        return '#4CAF50'; // Verde
      case 'error':
        return '#E53935'; // Rojo
      case 'agrupado':
        return '#2196F3'; // Azul
      default:
        return '#666'; // Gris por defecto
    }
  };

  const getEstadoColorRow = (estado) => {
    switch (estado) {
      case 'pendiente':
        return 'bg-orange-100 hover:bg-orange-200'; // Fila naranja
      case 'enviado':
        return 'bg-green-100 hover:bg-green-200'; // Fila verde
      case 'error':
        return 'bg-red-100 hover:bg-red-200'; // Fila roja
      case 'agrupado':
        return 'bg-blue-100 hover:bg-blue-200'; // Fila azul
      default:
        return 'bg-gray-100 hover:bg-gray-200'; // Fila gris por defecto
    }
  };

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case 'email':
        return '📧';
      case 'whatsapp':
        return '📱';
      default:
        return '📬';
    }
  };

  const getFrecuenciaText = (tipo_frecuencia) => {
    switch (tipo_frecuencia) {
      case 'inmediata':
        return 'Inmediata';
      case 'diaria':
        return 'Diaria';
      case 'semanal':
        return 'Semanal';
      case 'diaria_agrupado':
        return 'Diaria (Agrupada)';
      case 'semanal_agrupado':
        return 'Semanal (Agrupada)';
      default:
        return tipo_frecuencia || '-';
    }
  };

  if (!tienePermiso('Ver Lista de Faltantes')) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Cargando notificaciones...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-red-700 font-semibold">Error</div>
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Lista de Notificaciones</h1>
              <p className="text-gray-600 mt-2">
                Historial completo de notificaciones pendientes y enviadas del sistema
              </p>
            </div>
            <button
              onClick={handleGoBack}
              className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 py-2 rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 flex items-center space-x-2"
            >
              <span>←</span>
              <span>Volver</span>
            </button>
          </div>
        </div>

        <div className="p-6">
          {notificaciones.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-4">📭</div>
              <div className="text-lg">No hay notificaciones registradas</div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Tipo</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Destinatario</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Asunto</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Frecuencia</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Creación</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Envío</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentNotificaciones.map((notif) => (
                      <tr
                        key={notif.id}
                        onClick={() => handleRowClick(notif)}
                        className={`${getEstadoColorRow(notif.estado)} transition-colors cursor-pointer border-b border-gray-100`}
                      >
                        <td className="py-3 px-4 font-mono text-sm font-medium">{notif.id}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getTipoIcon(notif.tipo_notificacion)}</span>
                            <span className="capitalize text-sm font-medium">
                              {notif.tipo_notificacion}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm">
                            {notif.destinatario ? (
                              <span className="font-mono">{notif.destinatario}</span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="max-w-xs">
                            {notif.asunto ? (
                              <span className="text-sm line-clamp-2" title={notif.asunto}>
                                {notif.asunto}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-xs px-2 py-1 bg-white bg-opacity-70 rounded-full border">
                            {getFrecuenciaText(notif.tipo_frecuencia)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm font-mono">
                          {formatearFecha(notif.fecha_creacion)}
                        </td>
                        <td className="py-3 px-4 text-sm font-mono">
                          {formatearFecha(notif.fecha_envio)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: getEstadoColor(notif.estado) }}
                            />
                            <span className="text-sm font-medium capitalize">
                              {notif.estado}
                            </span>
                            {notif.error_mensaje && (
                              <span
                                className="text-red-500 cursor-help ml-1"
                                title={notif.error_mensaje}
                              >
                                ⚠️
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>
                      Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, notificaciones.length)} de {notificaciones.length} notificaciones
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-l-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      ← Anterior
                    </button>
                    
                    {[...Array(totalPages)].map((_, i) => {
                      const page = i + 1;
                      const isCurrentPage = page === currentPage;
                      const isNearCurrentPage = Math.abs(page - currentPage) <= 2;
                      const isFirstOrLast = page === 1 || page === totalPages;
                      
                      if (!isNearCurrentPage && !isFirstOrLast) {
                        if (page === currentPage - 3 || page === currentPage + 3) {
                          return <span key={page} className="px-3 py-2 text-sm text-gray-400">...</span>;
                        }
                        return null;
                      }
                      
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-2 text-sm border-t border-b transition-colors ${
                            isCurrentPage
                              ? 'bg-blue-500 text-white border-blue-500'
                              : 'bg-white border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-r-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Siguiente →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          <div className="mt-6 flex items-center justify-between text-sm text-gray-500 border-t pt-4">
            <div>
              Total: {notificaciones.length} notificaciones
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                <span>Pendiente</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span>Enviado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span>Error</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span>Agrupado</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de detalle */}
      <DetalleNotificacionModal
        notificacion={selectedNotificacion}
        isOpen={modalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default NotificacionesListaPage;