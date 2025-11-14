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
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <div className="mt-4 text-lg text-gray-600">Cargando notificaciones...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-4 shadow-sm">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <div className="text-red-800 font-semibold">Error al cargar notificaciones</div>
            <div className="text-red-700 text-sm">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold">Notificaciones</h1>
              </div>
              <p className="text-blue-100 opacity-90">
                Gestiona y monitorea todas las notificaciones del sistema
              </p>
            </div>
            <button
              onClick={handleGoBack}
              className="bg-white text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-100 transition-all duration-300 flex items-center space-x-2 border-2 border-white shadow-lg font-semibold"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Volver</span>
            </button>
          </div>
          
          {/* Stats Cards */}
          <div className="mt-6 grid grid-cols-4 gap-4">
            {[
              { label: 'Total', value: notificaciones.length, color: 'bg-white bg-opacity-90 text-gray-800' },
              { label: 'Pendientes', value: notificaciones.filter(n => n.estado === 'pendiente').length, color: 'bg-orange-100 text-orange-900 border-orange-300' },
              { label: 'Enviadas', value: notificaciones.filter(n => n.estado === 'enviado').length, color: 'bg-green-100 text-green-900 border-green-300' },
              { label: 'Errores', value: notificaciones.filter(n => n.estado === 'error').length, color: 'bg-red-100 text-red-900 border-red-300' }
            ].map((stat, index) => (
              <div key={index} className={`${stat.color} rounded-lg p-4 shadow-lg border-2`}>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6">
          {notificaciones.length === 0 ? (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay notificaciones</h3>
                <p className="text-gray-600">Aún no se han registrado notificaciones en el sistema.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-gray-50 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="text-left py-4 px-6 font-semibold text-gray-800 text-sm uppercase tracking-wide">ID</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-800 text-sm uppercase tracking-wide">Tipo</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-800 text-sm uppercase tracking-wide">Destinatario</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-800 text-sm uppercase tracking-wide">Asunto</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-800 text-sm uppercase tracking-wide">Frecuencia</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-800 text-sm uppercase tracking-wide">Creación</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-800 text-sm uppercase tracking-wide">Envío</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-800 text-sm uppercase tracking-wide">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {currentNotificaciones.map((notif) => (
                        <tr
                          key={notif.id}
                          onClick={() => handleRowClick(notif)}
                          className="bg-white hover:bg-gray-50 transition-all duration-200 cursor-pointer group transform hover:scale-[1.01] hover:shadow-md"
                        >
                          <td className="py-4 px-6">
                            <span className="font-mono text-sm font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                              #{notif.id}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-blue-100 transition-colors">
                                <span className="text-lg">{getTipoIcon(notif.tipo_notificacion)}</span>
                              </div>
                              <span className="capitalize text-sm font-medium text-gray-700">
                                {notif.tipo_notificacion}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="text-sm">
                              {notif.destinatario ? (
                                <span className="font-mono bg-gray-100 px-2 py-1 rounded text-gray-700">
                                  {notif.destinatario}
                                </span>
                              ) : (
                                <span className="text-gray-400 italic">Sin destinatario</span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="max-w-xs">
                              {notif.asunto ? (
                                <span className="text-sm text-gray-700 line-clamp-2" title={notif.asunto}>
                                  {notif.asunto}
                                </span>
                              ) : (
                                <span className="text-gray-400 italic">Sin asunto</span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {getFrecuenciaText(notif.tipo_frecuencia)}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="text-sm font-mono text-gray-600">
                              {formatearFecha(notif.fecha_creacion)}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="text-sm font-mono text-gray-600">
                              {formatearFecha(notif.fecha_envio) || (
                                <span className="text-gray-400 italic">Pendiente</span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-3 h-3 rounded-full shadow-sm"
                                style={{ backgroundColor: getEstadoColor(notif.estado) }}
                              />
                              <span className={`text-sm font-medium capitalize px-3 py-1 rounded-full ${
                                notif.estado === 'pendiente' ? 'bg-orange-100 text-orange-800' :
                                notif.estado === 'enviado' ? 'bg-green-100 text-green-800' :
                                notif.estado === 'error' ? 'bg-red-100 text-red-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {notif.estado}
                              </span>
                              {notif.error_mensaje && (
                                <div
                                  className="text-red-500 cursor-help p-1 hover:bg-red-50 rounded transition-colors"
                                  title={notif.error_mensaje}
                                >
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Paginación moderna */}
              {totalPages > 1 && (
                <div className="mt-8 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">
                          {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, notificaciones.length)}
                        </span>
                        <span className="mx-2">de</span>
                        <span className="font-medium">{notificaciones.length}</span>
                        <span className="ml-2">notificaciones</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="flex items-center gap-2 px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span>Anterior</span>
                      </button>
                      
                      <div className="flex items-center gap-1">
                        {[...Array(totalPages)].map((_, i) => {
                          const page = i + 1;
                          const isCurrentPage = page === currentPage;
                          const isNearCurrentPage = Math.abs(page - currentPage) <= 2;
                          const isFirstOrLast = page === 1 || page === totalPages;
                          
                          if (!isNearCurrentPage && !isFirstOrLast) {
                            if (page === currentPage - 3 || page === currentPage + 3) {
                              return (
                                <span key={page} className="px-3 py-2 text-sm text-gray-400">
                                  ...
                                </span>
                              );
                            }
                            return null;
                          }
                          
                          return (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                                isCurrentPage
                                  ? 'bg-blue-600 text-white shadow-lg transform scale-110'
                                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300 shadow-sm'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        })}
                      </div>
                      
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-2 px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                      >
                        <span>Siguiente</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Footer con estadísticas */}
          <div className="mt-8 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="font-semibold text-gray-800">Resumen del estado</span>
              </div>
              
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-orange-500 shadow-sm" />
                  <span className="text-sm font-medium text-gray-800">Pendiente</span>
                  <span className="bg-orange-100 text-orange-900 px-2 py-1 rounded-full text-xs font-semibold border border-orange-300">
                    {notificaciones.filter(n => n.estado === 'pendiente').length}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm" />
                  <span className="text-sm font-medium text-gray-800">Enviado</span>
                  <span className="bg-green-100 text-green-900 px-2 py-1 rounded-full text-xs font-semibold border border-green-300">
                    {notificaciones.filter(n => n.estado === 'enviado').length}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm" />
                  <span className="text-sm font-medium text-gray-800">Error</span>
                  <span className="bg-red-100 text-red-900 px-2 py-1 rounded-full text-xs font-semibold border border-red-300">
                    {notificaciones.filter(n => n.estado === 'error').length}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm" />
                  <span className="text-sm font-medium text-gray-800">Agrupado</span>
                  <span className="bg-blue-100 text-blue-900 px-2 py-1 rounded-full text-xs font-semibold border border-blue-300">
                    {notificaciones.filter(n => n.estado === 'agrupado').length}
                  </span>
                </div>
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