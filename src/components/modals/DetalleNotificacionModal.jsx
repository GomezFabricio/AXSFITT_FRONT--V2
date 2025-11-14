import React from 'react';

const DetalleNotificacionModal = ({ notificacion, isOpen, onClose }) => {
  if (!isOpen || !notificacion) return null;

  const formatearFecha = (fechaISO) => {
    if (!fechaISO) return '-';
    return new Date(fechaISO).toLocaleString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getTipoIcon(notificacion.tipo_notificacion)}</span>
            <div>
              <h2 className="text-xl font-bold">Detalle de Notificación</h2>
              <p className="text-blue-100">ID: #{notificacion.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors p-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            {/* Estado */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: getEstadoColor(notificacion.estado) }}
                />
                <span className="font-semibold text-gray-700">Estado:</span>
                <span 
                  className="px-3 py-1 rounded-full text-sm font-medium text-white"
                  style={{ backgroundColor: getEstadoColor(notificacion.estado) }}
                >
                  {notificacion.estado?.toUpperCase()}
                </span>
              </div>
              <span className="text-sm text-gray-500">
                {getFrecuenciaText(notificacion.tipo_frecuencia)}
              </span>
            </div>

            {/* Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Tipo de Notificación</label>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getTipoIcon(notificacion.tipo_notificacion)}</span>
                    <span className="capitalize font-medium">{notificacion.tipo_notificacion}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Destinatario</label>
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <span className="font-mono text-sm">
                      {notificacion.destinatario || 'No especificado'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Fecha de Creación</label>
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <span className="font-mono text-sm">
                      {formatearFecha(notificacion.fecha_creacion)}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Fecha de Envío</label>
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <span className="font-mono text-sm">
                      {formatearFecha(notificacion.fecha_envio)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Asunto */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">Asunto</label>
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <p className="text-gray-800 font-medium">
                  {notificacion.asunto || 'Sin asunto especificado'}
                </p>
              </div>
            </div>

            {/* Cuerpo del mensaje */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">Contenido del Mensaje</label>
              <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                <div className="prose prose-sm max-w-none">
                  {notificacion.cuerpo ? (
                    <div 
                      className="text-gray-700 whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{ 
                        __html: notificacion.cuerpo.replace(/\n/g, '<br/>') 
                      }}
                    />
                  ) : (
                    <p className="text-gray-500 italic">No hay contenido disponible</p>
                  )}
                </div>
              </div>
            </div>

            {/* Información adicional */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {notificacion.destinatario_email && (
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Email</label>
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <span className="font-mono text-sm">{notificacion.destinatario_email}</span>
                  </div>
                </div>
              )}

              {notificacion.destinatario_telefono && (
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Teléfono</label>
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <span className="font-mono text-sm">{notificacion.destinatario_telefono}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Error (si existe) */}
            {notificacion.error_mensaje && (
              <div>
                <label className="block text-sm font-semibold text-red-600 mb-2">Mensaje de Error</label>
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <span className="text-red-500 text-lg">⚠️</span>
                    <div className="text-red-700">
                      <p className="font-medium">Se produjo un error durante el envío:</p>
                      <p className="text-sm mt-1 font-mono">{notificacion.error_mensaje}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-2 rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetalleNotificacionModal;