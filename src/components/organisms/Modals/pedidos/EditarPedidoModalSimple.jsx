import React from 'react';
import useEditarPedidoSimple from '../../../../hooks/useEditarPedidoSimple';
import { FiX, FiPackage, FiUser, FiCalendar, FiDollarSign, FiTruck } from 'react-icons/fi';

const EditarPedidoModal = ({ open, onClose, pedido, onSubmit }) => {
  const { datosCompletos, loading, error } = useEditarPedidoSimple(pedido);

  if (!open || !pedido) return null;

  const formatearFecha = (fecha) => {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(precio || 0);
  };

  // Función para agrupar variantes borrador por producto
  const agruparVariantesPorProducto = (variantesBorrador) => {
    if (!variantesBorrador || !Array.isArray(variantesBorrador)) return {};
    
    return variantesBorrador.reduce((grupos, variante) => {
      const productoNombre = variante.producto_nombre || 'Producto sin nombre';
      if (!grupos[productoNombre]) {
        grupos[productoNombre] = [];
      }
      grupos[productoNombre].push(variante);
      return grupos;
    }, {});
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 relative m-4">
        
        {/* Botón cerrar */}
        <button 
          className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-full text-xl w-8 h-8 flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg font-bold" 
          onClick={onClose}
        >
          ×
        </button>

        {/* Título */}
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          <FiPackage className="inline mr-2" />
          Editar Pedido #{pedido.pedido_id}
        </h2>

        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Cargando información del pedido...</span>
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

        {datosCompletos && !loading && (
          <div className="space-y-6">
            {/* Información Básica */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">
                <FiUser className="inline mr-2" />
                Información Básica
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Proveedor
                  </label>
                  <p className="text-gray-900 font-medium">
                    {datosCompletos.proveedor_nombre || 'Sin proveedor'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <span className={`inline-block px-2 py-1 rounded-full text-sm font-medium ${
                    datosCompletos.pedido_estado === 'pendiente' 
                      ? 'bg-yellow-100 text-yellow-800'
                      : datosCompletos.pedido_estado === 'recibido'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {datosCompletos.pedido_estado}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FiCalendar className="inline mr-1" />
                    Fecha del Pedido
                  </label>
                  <p className="text-gray-900">
                    {formatearFecha(datosCompletos.pedido_fecha_pedido)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FiCalendar className="inline mr-1" />
                    Fecha Esperada de Entrega
                  </label>
                  <p className="text-gray-900">
                    {formatearFecha(datosCompletos.pedido_fecha_esperada_entrega)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Usuario
                  </label>
                  <p className="text-gray-900">
                    {datosCompletos.persona_nombre} {datosCompletos.persona_apellido}
                  </p>
                </div>
              </div>
            </div>

            {/* Resumen Financiero */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">
                <FiDollarSign className="inline mr-2" />
                Resumen Financiero
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subtotal
                  </label>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatearPrecio(datosCompletos.subtotal)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descuento ({datosCompletos.descuento || 0}%)
                  </label>
                  <p className="text-lg font-semibold text-red-600">
                    -{formatearPrecio(datosCompletos.descuentoCalculado)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FiTruck className="inline mr-1" />
                    Costo de Envío
                  </label>
                  <p className="text-lg font-semibold text-blue-600">
                    {formatearPrecio(datosCompletos.costo_envio)}
                  </p>
                </div>
                <div className="bg-green-100 rounded-lg p-3">
                  <label className="block text-sm font-medium text-green-700 mb-1">
                    Total
                  </label>
                  <p className="text-xl font-bold text-green-800">
                    {formatearPrecio(datosCompletos.total)}
                  </p>
                </div>
              </div>
            </div>

            {/* Detalle del Pedido */}
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">
                <FiPackage className="inline mr-2" />
                Detalle del Pedido
              </h3>

              {/* Productos y Variantes Registrados */}
              {datosCompletos.items && datosCompletos.items.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-md font-medium mb-3 text-gray-600">
                    Productos Registrados
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Producto</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Variante</th>
                          <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">Cantidad</th>
                          <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Precio Unit.</th>
                          <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {datosCompletos.items.map((item, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-sm text-gray-900">
                              {item.producto_nombre || 'Producto sin nombre'}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-600">
                              {item.variante_atributos || 'Sin variante'}
                            </td>
                            <td className="px-4 py-2 text-center text-sm text-gray-900">
                              {item.pd_cantidad_pedida}
                            </td>
                            <td className="px-4 py-2 text-right text-sm text-gray-900">
                              {formatearPrecio(item.pd_precio_unitario)}
                            </td>
                            <td className="px-4 py-2 text-right text-sm font-medium text-gray-900">
                              {formatearPrecio(item.pd_subtotal)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Variantes Borrador agrupadas por producto */}
              {datosCompletos.variantesBorrador && datosCompletos.variantesBorrador.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-md font-medium mb-3 text-gray-600">
                    Variantes Borrador
                  </h4>
                  <div className="space-y-4">
                    {Object.entries(agruparVariantesPorProducto(datosCompletos.variantesBorrador)).map(([productoNombre, variantes]) => (
                      <div key={productoNombre} className="border border-orange-200 bg-orange-50 rounded-lg p-4">
                        {/* Nombre del producto */}
                        <div className="flex items-center mb-3">
                          <h5 className="font-medium text-gray-900 text-lg">
                            {productoNombre}
                          </h5>
                          <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                            variantes borrador
                          </span>
                        </div>
                        
                        {/* Tabla de variantes para este producto */}
                        <div className="overflow-x-auto">
                          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                            <thead className="bg-orange-100">
                              <tr>
                                <th className="px-3 py-2 text-left text-sm font-medium text-gray-700">Atributos</th>
                                <th className="px-3 py-2 text-center text-sm font-medium text-gray-700">Cantidad</th>
                                <th className="px-3 py-2 text-right text-sm font-medium text-gray-700">Precio Unit.</th>
                                <th className="px-3 py-2 text-right text-sm font-medium text-gray-700">Subtotal</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {variantes.map((variante, idx) => (
                                <tr key={idx} className="hover:bg-orange-25">
                                  <td className="px-3 py-2 text-sm text-gray-600">
                                    {(() => {
                                      if (!variante.vb_atributos) return 'Sin atributos';
                                      
                                      // Si es array de objetos con atributo_nombre y valor_nombre
                                      if (Array.isArray(variante.vb_atributos)) {
                                        return variante.vb_atributos
                                          .map(attr => `${attr.atributo_nombre}: ${attr.valor_nombre}`)
                                          .join(', ');
                                      }
                                      
                                      // Si es string, intentar parsearlo
                                      if (typeof variante.vb_atributos === 'string') {
                                        try {
                                          const parsed = JSON.parse(variante.vb_atributos);
                                          if (Array.isArray(parsed)) {
                                            return parsed
                                              .map(attr => `${attr.atributo_nombre}: ${attr.valor_nombre}`)
                                              .join(', ');
                                          }
                                          return Object.entries(parsed).map(([key, value]) => `${key}: ${value}`).join(', ');
                                        } catch {
                                          return variante.vb_atributos;
                                        }
                                      }
                                      
                                      // Si es objeto, procesarlo directamente
                                      if (typeof variante.vb_atributos === 'object') {
                                        return Object.entries(variante.vb_atributos)
                                          .filter(([key, value]) => key !== undefined && value !== undefined)
                                          .map(([key, value]) => `${key}: ${value}`)
                                          .join(', ') || 'Sin atributos';
                                      }
                                      
                                      return 'Sin atributos';
                                    })()}
                                  </td>
                                  <td className="px-3 py-2 text-center text-sm text-gray-900">
                                    {variante.vb_cantidad}
                                  </td>
                                  <td className="px-3 py-2 text-right text-sm text-gray-900">
                                    {formatearPrecio(variante.vb_precio_unitario)}
                                  </td>
                                  <td className="px-3 py-2 text-right text-sm font-medium text-gray-900">
                                    {formatearPrecio(variante.vb_precio_unitario * variante.vb_cantidad)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        
                        {/* Total para este producto */}
                        <div className="mt-3 text-right">
                          <span className="text-sm font-medium text-gray-700">
                            Subtotal {productoNombre}: {formatearPrecio(
                              variantes.reduce((sum, v) => sum + (v.vb_precio_unitario * v.vb_cantidad), 0)
                            )}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Productos Borrador */}
              {datosCompletos.productosBorrador && datosCompletos.productosBorrador.length > 0 && (
                <div>
                  <h4 className="text-md font-medium mb-3 text-gray-600">
                    Productos Borrador
                  </h4>
                  <div className="space-y-4">
                    {datosCompletos.productosBorrador.map((producto, idx) => (
                      <div key={idx} className="border border-purple-200 bg-purple-50 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <h5 className="font-medium text-gray-900">
                            {producto.pbp_nombre}
                            <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                              producto borrador
                            </span>
                          </h5>
                        </div>
                        
                        {/* Información del producto */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 text-sm">
                          <div>
                            <span className="font-medium text-gray-600">Categoría:</span>
                            <p className="text-gray-900">{producto.pbp_categoria || 'Sin categoría'}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Marca:</span>
                            <p className="text-gray-900">{producto.pbp_marca || 'Sin marca'}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Cantidad:</span>
                            <p className="text-gray-900">{producto.pbp_cantidad || 0}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Precio Unit.:</span>
                            <p className="text-gray-900">{formatearPrecio(producto.pbp_precio_unitario)}</p>
                          </div>
                        </div>

                        {/* Atributos */}
                        {producto.pbp_atributos && (
                          <div className="mb-3">
                            <span className="font-medium text-gray-600">Atributos:</span>
                            <p className="text-gray-900">
                              {(() => {
                                if (!producto.pbp_atributos) return 'Sin atributos';
                                
                                // Estructura esperada: {atributos: [{"atributo_nombre": "sabor"}]}
                                if (typeof producto.pbp_atributos === 'object' && producto.pbp_atributos.atributos) {
                                  return producto.pbp_atributos.atributos
                                    .map(attr => attr.atributo_nombre)
                                    .join(', ');
                                }
                                
                                // Si es string, intentar parsearlo
                                if (typeof producto.pbp_atributos === 'string') {
                                  try {
                                    const parsed = JSON.parse(producto.pbp_atributos);
                                    if (parsed.atributos && Array.isArray(parsed.atributos)) {
                                      return parsed.atributos
                                        .map(attr => attr.atributo_nombre)
                                        .join(', ');
                                    }
                                    return Object.entries(parsed).map(([key, value]) => `${key}: ${value}`).join(', ');
                                  } catch {
                                    return producto.pbp_atributos;
                                  }
                                }
                                
                                // Si es objeto simple, procesarlo directamente
                                if (typeof producto.pbp_atributos === 'object') {
                                  return Object.entries(producto.pbp_atributos)
                                    .filter(([key, value]) => key !== undefined && value !== undefined)
                                    .map(([key, value]) => `${key}: ${value}`)
                                    .join(', ') || 'Sin atributos';
                                }
                                
                                return 'Sin atributos';
                              })()}
                            </p>
                          </div>
                        )}

                        {/* Variantes del producto borrador */}
                        {producto.pbp_variantes && Array.isArray(producto.pbp_variantes) && producto.pbp_variantes.length > 0 && (
                          <div>
                            <span className="font-medium text-gray-600">Variantes:</span>
                            <div className="mt-2 space-y-2">
                              {producto.pbp_variantes.map((variante, vIdx) => (
                                <div key={vIdx} className="bg-white border rounded-lg p-3">
                                  <div className="grid grid-cols-3 gap-3 text-sm">
                                    <div>
                                      <span className="font-medium text-gray-600">Atributos:</span>
                                      <p className="text-gray-900">
                                        {(() => {
                                          // Los atributos de las variantes dentro de productos borrador vienen como propiedades directas del objeto variante
                                          if (!variante) return 'Sin atributos';
                                          
                                          // Extraer todas las propiedades excepto cantidad y precio
                                          const atributos = Object.entries(variante)
                                            .filter(([key, value]) => 
                                              key !== 'cantidad' && 
                                              key !== 'precio' && 
                                              value !== undefined && 
                                              value !== null && 
                                              value !== ''
                                            )
                                            .map(([key, value]) => `${key}: ${value}`)
                                            .join(', ');
                                            
                                          return atributos || 'Sin atributos';
                                        })()}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="font-medium text-gray-600">Cantidad:</span>
                                      <p className="text-gray-900">{variante.cantidad || 0}</p>
                                    </div>
                                    <div>
                                      <span className="font-medium text-gray-600">Precio:</span>
                                      <p className="text-gray-900">{formatearPrecio(variante.precio)}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Si no hay productos */}
              {(!datosCompletos.items || datosCompletos.items.length === 0) && 
               (!datosCompletos.variantesBorrador || datosCompletos.variantesBorrador.length === 0) &&
               (!datosCompletos.productosBorrador || datosCompletos.productosBorrador.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <FiPackage className="text-6xl mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">Sin productos en este pedido</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
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

export default EditarPedidoModal;