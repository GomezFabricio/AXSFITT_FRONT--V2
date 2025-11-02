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
      pedido_total: 'Total',
      pedido_estado: 'Estado del Pedido',
      estado: 'Estado del Pedido',
      fecha_recepcion: 'Fecha de Recepción'
    };

    const formatearValor = (valor) => {
      if (valor === null || valor === undefined) return 'Sin definir';
      if (typeof valor === 'string' && valor.includes('T')) {
        // Es una fecha ISO
        try {
          const fecha = new Date(valor);
          return fecha.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: '2-digit', 
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          });
        } catch {
          return valor;
        }
      }
      if (typeof valor === 'string' && !isNaN(parseFloat(valor))) {
        // Es un número como string (precios, descuentos)
        const num = parseFloat(valor);
        if (valor.includes('.') && num >= 1000) {
          // Probablemente sea un precio
          return new Intl.NumberFormat('es-ES', { 
            style: 'currency', 
            currency: 'ARS' 
          }).format(num);
        } else if (num < 100 && num > 0) {
          // Probablemente sea un porcentaje
          return `${num}%`;
        }
        return num.toString();
      }
      // Capitalizar estados y strings
      if (typeof valor === 'string') {
        return valor.charAt(0).toUpperCase() + valor.slice(1).toLowerCase();
      }
      return valor.toString();
    };

    // Campos ya procesados para evitar duplicados
    const camposProcesados = new Set();
    
    // Solo procesar los campos que están definidos en nuestro mapeo de campos
    Object.keys(campos).forEach(campo => {
      const valorAnterior = anterior ? anterior[campo] : undefined;
      const valorNuevo = nuevo ? nuevo[campo] : undefined;
      
      // Evitar duplicados: si es estado, priorizar 'estado' sobre 'pedido_estado'
      if (campo === 'pedido_estado' && (nuevo.hasOwnProperty('estado') || camposProcesados.has('Estado del Pedido'))) {
        return; // Skip este campo si ya procesamos 'estado'
      }
      
      // Solo mostrar el cambio si el campo existe en 'nuevo' y es diferente al anterior
      if (nuevo.hasOwnProperty(campo) && valorAnterior !== valorNuevo) {
        camposProcesados.add(campos[campo]); // Marcar como procesado
        cambios.push({
          campo: campos[campo],
          anterior: formatearValor(valorAnterior),
          nuevo: formatearValor(valorNuevo)
        });
      }
    });



    // Agregar información sobre cambios en items si están presentes
    if (nuevo.items && Array.isArray(nuevo.items)) {
      const cantidadItemsAnterior = anterior?.items?.length || 0;
      const cantidadItemsNuevo = nuevo.items.length;
      
      if (cantidadItemsAnterior !== cantidadItemsNuevo) {
        cambios.push({
          campo: 'Cantidad de Items',
          anterior: cantidadItemsAnterior.toString(),
          nuevo: cantidadItemsNuevo.toString()
        });
      }
      
      // Si hay modificaciones en items específicos, mostrar un resumen
      if (cantidadItemsNuevo > 0) {
        cambios.push({
          campo: 'Items del Pedido',
          anterior: 'Ver detalle completo',
          nuevo: 'Modificados/Actualizados'
        });
      }
    }

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
                      {cambios.length > 0 ? (
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
                                        {cambio.anterior}
                                      </span>
                                    </td>
                                    <td className="px-4 py-2 text-sm text-gray-600">
                                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                                        {cambio.nuevo}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ) : (
                        (() => {
                          const anterior = modificacion.pm_datos_anteriores ? JSON.parse(modificacion.pm_datos_anteriores) : null;
                          const nuevo = modificacion.pm_datos_nuevos ? JSON.parse(modificacion.pm_datos_nuevos) : null;
                          
                          // Si es un cambio de estado únicamente
                          if (anterior && nuevo && anterior.estado !== nuevo.estado) {
                            return (
                              <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                                <div className="flex">
                                  <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                  <div className="ml-3 w-full">
                                    <p className="text-sm font-medium text-blue-800 mb-2">Cambio de estado:</p>
                                    <div className="bg-white rounded p-3 border">
                                      <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-600">De:</span>
                                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded font-medium">
                                          {formatearValor(anterior.estado)}
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-center text-sm mt-2">
                                        <span className="text-gray-600">A:</span>
                                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded font-medium">
                                          {formatearValor(nuevo.estado)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          
                          // Para otros tipos de acciones
                          return (
                            <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                              <div className="flex">
                                <div className="flex-shrink-0">
                                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                  </svg>
                                </div>
                                <div className="ml-3">
                                  <p className="text-sm text-blue-700">
                                    <b>Acción realizada:</b> {modificacion.pm_descripcion || 'Modificación de estado del pedido'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })()
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
