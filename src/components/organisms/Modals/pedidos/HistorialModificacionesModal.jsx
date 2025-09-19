import React, { useState, useEffect } from 'react';
import { getHistorialModificaciones } from '../../../../api/pedidosApi';

// Modal para ver historial de modificaciones de un pedido
const HistorialModificacionesModal = ({ open, onClose, pedido }) => {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open && pedido?.pedido_id) {
      cargarHistorial();
    }
  }, [open, pedido?.pedido_id]);

  const cargarHistorial = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getHistorialModificaciones(pedido.pedido_id);
      setHistorial(data || []);
    } catch (err) {
      setError(err.message || 'Error al cargar el historial');
    } finally {
      setLoading(false);
    }
  };

  const formatearCambios = (anterior, nuevo) => {
    const cambios = [];
    const campos = {
      pedido_proveedor_id: 'Proveedor ID',
      pedido_descuento: 'Descuento',
      pedido_costo_envio: 'Costo de envío',
      pedido_fecha_esperada_entrega: 'Fecha esperada entrega',
      pedido_total: 'Total'
    };

    Object.keys(campos).forEach(campo => {
      if (anterior[campo] !== nuevo[campo]) {
        cambios.push({
          campo: campos[campo],
          anterior: anterior[campo],
          nuevo: nuevo[campo]
        });
      }
    });

    return cambios;
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 relative m-4">
        
        <button 
          className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-full text-xl w-8 h-8 flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg font-bold" 
          onClick={onClose}
        >
          ×
        </button>

        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Historial de Modificaciones - Pedido #{pedido?.pedido_id}
        </h2>

        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Cargando historial...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  <b>Error:</b> {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-4">
            {historial.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-6xl mb-4">📝</div>
                <p className="text-lg font-medium">Sin modificaciones registradas</p>
                <p className="text-sm">Este pedido no ha sido modificado desde su creación.</p>
              </div>
            ) : (
              historial.map((modificacion, index) => {
                const cambios = formatearCambios(
                  modificacion.pm_detalle_anterior,
                  modificacion.pm_detalle_nuevo
                );

                return (
                  <div key={modificacion.pm_id} className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* Header de la modificación */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-gray-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold text-gray-800">
                            Modificación #{historial.length - index}
                          </div>
                          <div className="text-sm text-gray-600">
                            Por: <b>{modificacion.usuario_nombre}</b>
                          </div>
                        </div>
                        <div className="text-right text-sm text-gray-600">
                          <div>{new Date(modificacion.pm_fecha_modificacion).toLocaleDateString()}</div>
                          <div>{new Date(modificacion.pm_fecha_modificacion).toLocaleTimeString()}</div>
                        </div>
                      </div>
                    </div>

                    {/* Contenido de la modificación */}
                    <div className="p-4 space-y-4">
                      {/* Motivo */}
                      <div>
                        <h4 className="font-medium text-gray-800 mb-2">Motivo:</h4>
                        <p className="text-gray-700 bg-gray-50 p-3 rounded border-l-4 border-blue-400">
                          {modificacion.pm_motivo}
                        </p>
                      </div>

                      {/* Cambios realizados */}
                      {cambios.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-800 mb-2">Cambios realizados:</h4>
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-100">
                                <tr>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                    Campo
                                  </th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                    Valor Anterior
                                  </th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                    Valor Nuevo
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {cambios.map((cambio, idx) => (
                                  <tr key={idx} className="hover:bg-gray-50">
                                    <td className="px-4 py-2 text-sm font-medium text-gray-800">
                                      {cambio.campo}
                                    </td>
                                    <td className="px-4 py-2 text-sm text-gray-600">
                                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded">
                                        {cambio.anterior || 'N/A'}
                                      </span>
                                    </td>
                                    <td className="px-4 py-2 text-sm text-gray-600">
                                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                                        {cambio.nuevo || 'N/A'}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Botón cerrar */}
        <div className="flex justify-end pt-6 border-t border-gray-200 mt-6">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default HistorialModificacionesModal;
