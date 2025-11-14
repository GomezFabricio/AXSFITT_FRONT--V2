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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden transform transition-all duration-300 scale-100">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
                <span className="text-2xl">{getTipoIcon(notificacion.tipo_notificacion)}</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold">Detalle de Notificación</h2>
                <div className="flex items-center space-x-3 mt-1">
                  <span className="text-white font-mono bg-black bg-opacity-30 px-3 py-1 rounded text-sm font-semibold">
                    ID: #{notificacion.id}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    notificacion.estado === 'pendiente' ? 'bg-orange-600 text-white' :
                    notificacion.estado === 'enviado' ? 'bg-green-600 text-white' :
                    notificacion.estado === 'error' ? 'bg-red-600 text-white' :
                    'bg-blue-600 text-white'
                  }`}>
                    {notificacion.estado?.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-all duration-200 p-2 hover:bg-black hover:bg-opacity-30 rounded-lg border border-white border-opacity-30"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-160px)] bg-gray-50">
          <div className="space-y-6">
            {/* Información principal en cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tipo y Destinatario */}
              <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Información básica
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Tipo:</span>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium capitalize">
                      {notificacion.tipo_notificacion}
                    </span>
                  </div>
                  <div className="flex items-start justify-between">
                    <span className="text-gray-600">Destinatario:</span>
                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                      {notificacion.destinatario || 'No especificado'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Frecuencia:</span>
                    <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                      {getFrecuenciaText(notificacion.tipo_frecuencia)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Fechas */}
              <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Cronología
                </h3>
                <div className="space-y-3">
                  <div className="flex flex-col">
                    <span className="text-gray-600 text-sm">Creación:</span>
                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded mt-1">
                      {formatearFecha(notificacion.fecha_creacion)}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-600 text-sm">Envío:</span>
                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded mt-1">
                      {formatearFecha(notificacion.fecha_envio) || 'Pendiente'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Asunto */}
            <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                Asunto
              </h3>
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <p className="text-gray-800 font-medium">
                  {notificacion.asunto || 'Sin asunto especificado'}
                </p>
              </div>
            </div>

            {/* Cuerpo del mensaje */}
            <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Contenido del Mensaje
              </h3>
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
            {(notificacion.destinatario_email || notificacion.destinatario_telefono) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {notificacion.destinatario_email && (
                  <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
                    <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                      <svg className="w-4 h-4 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                      Email
                    </h3>
                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                      {notificacion.destinatario_email}
                    </span>
                  </div>
                )}

                {notificacion.destinatario_telefono && (
                  <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
                    <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                      <svg className="w-4 h-4 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                      Teléfono
                    </h3>
                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                      {notificacion.destinatario_telefono}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Error (si existe) */}
            {notificacion.error_mensaje && (
              <div className="bg-white rounded-lg p-5 shadow-sm border border-red-200">
                <h3 className="font-semibold text-red-800 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Mensaje de Error
                </h3>
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <span className="text-red-500 text-lg">⚠️</span>
                    <div className="text-red-700">
                      <p className="font-medium">Se produjo un error durante el envío:</p>
                      <p className="text-sm mt-1 font-mono bg-red-100 p-2 rounded">
                        {notificacion.error_mensaje}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-gray-200 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-2 rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetalleNotificacionModal;