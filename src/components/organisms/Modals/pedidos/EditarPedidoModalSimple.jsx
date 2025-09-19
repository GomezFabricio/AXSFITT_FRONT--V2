import React, { useState } from 'react';
import useEditarPedidoModal from '../../../../hooks/useEditarPedidoModal';
import { FiX, FiPackage, FiUser, FiCalendar, FiDollarSign, FiTruck, FiSave, FiPlus, FiSearch } from 'react-icons/fi';

const EditarPedidoModal = ({ open, onClose, pedido, onSubmit }) => {
  const { 
    datosCompletos, 
    loading, 
    error, 
    formData, 
    handleInputChange, 
    handleSave,
    showSelector,
    setShowSelector,
    busqueda,
    setBusqueda,
    sugerencias,
    loadingSugerencias,
    seleccionados,
    setSeleccionados,
    confirmarSeleccionProductos,
    cargarDatosCompletos
  } = useEditarPedidoModal(pedido);
  const [saving, setSaving] = useState(false);

  if (!open || !pedido) return null;

  // Función para calcular el total dinámico basado en el formulario
  const calcularTotalDinamico = () => {
    if (!datosCompletos) return 0;
    
    const subtotal = parseFloat(datosCompletos.subtotal) || 0;
    const descuentoPorcentaje = parseFloat(formData.pedido_descuento) || 0;
    const costoEnvio = parseFloat(formData.pedido_costo_envio) || 0;
    
    const montoDescuento = (subtotal * descuentoPorcentaje) / 100;
    const total = subtotal - montoDescuento + costoEnvio;
    
    return total;
  };

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

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const handleSaveClick = async () => {
    setSaving(true);
    try {
      await handleSave();
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error al guardar:', error);
      alert(`Error al modificar el pedido: ${error.message || error}`);
    } finally {
      setSaving(false);
    }
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
                  <input
                    type="date"
                    value={formData.pedido_fecha_esperada_entrega}
                    onChange={(e) => handleInputChange('pedido_fecha_esperada_entrega', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
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
                    Descuento (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={formData.pedido_descuento}
                    onChange={(e) => handleInputChange('pedido_descuento', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                  {formData.pedido_descuento > 0 && (
                    <p className="text-xs text-gray-600 mt-1">
                      Descuento: -{formatearPrecio((parseFloat(datosCompletos?.subtotal || 0) * parseFloat(formData.pedido_descuento)) / 100)}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FiTruck className="inline mr-1" />
                    Costo de Envío
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.pedido_costo_envio}
                    onChange={(e) => handleInputChange('pedido_costo_envio', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                <div className="bg-green-100 rounded-lg p-3">
                  <label className="block text-sm font-medium text-green-700 mb-1">
                    Total
                  </label>
                  <p className="text-xl font-bold text-green-800">
                    {formatearPrecio(calcularTotalDinamico())}
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
                          <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {datosCompletos.items
                          .filter((item, idx) => !formData.itemsEliminados?.includes(item.pd_id))
                          .map((item, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-sm text-gray-900">
                              {item.producto_nombre || 'Producto sin nombre'}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-600">
                              {item.variante_atributos || 'Sin variante'}
                            </td>
                            <td className="px-4 py-2 text-center">
                              <input
                                type="number"
                                min="1"
                                step="1"
                                value={formData.items?.[idx]?.pd_cantidad_pedida || item.pd_cantidad_pedida}
                                onChange={(e) => handleInputChange('items', idx, 'pd_cantidad_pedida', parseInt(e.target.value) || 0)}
                                className="w-20 px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </td>
                            <td className="px-4 py-2 text-right">
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.items?.[idx]?.pd_precio_unitario || item.pd_precio_unitario}
                                onChange={(e) => handleInputChange('items', idx, 'pd_precio_unitario', parseFloat(e.target.value) || 0)}
                                className="w-24 px-2 py-1 border border-gray-300 rounded text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </td>
                            <td className="px-4 py-2 text-right text-sm font-medium text-gray-900">
                              {formatearPrecio((formData.items?.[idx]?.pd_precio_unitario || item.pd_precio_unitario) * (formData.items?.[idx]?.pd_cantidad_pedida || item.pd_cantidad_pedida))}
                            </td>
                            <td className="px-4 py-2 text-center">
                              <button
                                onClick={() => handleInputChange('removeItem', item.pd_id)}
                                className="text-red-600 hover:text-red-800 transition-colors"
                                title="Eliminar producto"
                              >
                                <FiX className="w-5 h-5" />
                              </button>
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
                    {Object.entries(agruparVariantesPorProducto(
                      datosCompletos.variantesBorrador.filter(v => !formData.variantesBorradorEliminadas?.includes(v.vb_id))
                    )).map(([productoNombre, variantes]) => (
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
                                <th className="px-3 py-2 text-center text-sm font-medium text-gray-700">Acciones</th>
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
                                  <td className="px-3 py-2 text-center">
                                    <input
                                      type="number"
                                      min="1"
                                      step="1"
                                      value={formData.variantesBorrador?.find(v => v.vb_id === variante.vb_id)?.vb_cantidad || variante.vb_cantidad}
                                      onChange={(e) => handleInputChange('variantesBorrador', variante.vb_id, 'vb_cantidad', parseInt(e.target.value) || 0)}
                                      className="w-20 px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                  </td>
                                  <td className="px-3 py-2 text-right">
                                    <input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={formData.variantesBorrador?.find(v => v.vb_id === variante.vb_id)?.vb_precio_unitario || variante.vb_precio_unitario}
                                      onChange={(e) => handleInputChange('variantesBorrador', variante.vb_id, 'vb_precio_unitario', parseFloat(e.target.value) || 0)}
                                      className="w-24 px-2 py-1 border border-gray-300 rounded text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                  </td>
                                  <td className="px-3 py-2 text-right text-sm font-medium text-gray-900">
                                    {formatearPrecio((formData.variantesBorrador?.find(v => v.vb_id === variante.vb_id)?.vb_precio_unitario || variante.vb_precio_unitario) * (formData.variantesBorrador?.find(v => v.vb_id === variante.vb_id)?.vb_cantidad || variante.vb_cantidad))}
                                  </td>
                                  <td className="px-3 py-2 text-center">
                                    <button
                                      onClick={() => handleInputChange('removeVarianteBorrador', variante.vb_id)}
                                      className="text-red-600 hover:text-red-800 transition-colors"
                                      title="Eliminar variante"
                                    >
                                      <FiX className="w-4 h-4" />
                                    </button>
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
                              variantes.reduce((sum, v) => {
                                const cantidad = formData.variantesBorrador?.find(vb => vb.vb_id === v.vb_id)?.vb_cantidad || v.vb_cantidad;
                                const precio = formData.variantesBorrador?.find(vb => vb.vb_id === v.vb_id)?.vb_precio_unitario || v.vb_precio_unitario;
                                return sum + (precio * cantidad);
                              }, 0)
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
                    {datosCompletos.productosBorrador
                      .filter(producto => !formData.productosBorradorEliminados?.includes(producto.pbp_id))
                      .map((producto, idx) => (
                      <div key={idx} className="border border-purple-200 bg-purple-50 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <h5 className="font-medium text-gray-900">
                            {producto.pbp_nombre}
                            <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                              producto borrador
                            </span>
                          </h5>
                          <button
                            onClick={() => handleInputChange('removeProductoBorrador', producto.pbp_id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                            title="Eliminar producto"
                          >
                            <FiX className="w-5 h-5" />
                          </button>
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
                            <input
                              type="number"
                              min="1"
                              step="1"
                              value={formData.productosBorrador?.find(p => p.pbp_id === producto.pbp_id)?.pbp_cantidad || producto.pbp_cantidad}
                              onChange={(e) => handleInputChange('productosBorrador', producto.pbp_id, 'pbp_cantidad', parseInt(e.target.value) || 0)}
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Precio Unit.:</span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={formData.productosBorrador?.find(p => p.pbp_id === producto.pbp_id)?.pbp_precio_unitario || producto.pbp_precio_unitario}
                              onChange={(e) => handleInputChange('productosBorrador', producto.pbp_id, 'pbp_precio_unitario', parseFloat(e.target.value) || 0)}
                              className="w-28 px-2 py-1 border border-gray-300 rounded text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
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

                        {/* Subtotal del producto borrador */}
                        <div className="mt-3 pt-3 border-t border-purple-200 text-right">
                          <span className="text-sm font-medium text-gray-700">
                            Subtotal: {formatearPrecio(
                              (formData.productosBorrador?.find(p => p.pbp_id === producto.pbp_id)?.pbp_precio_unitario || producto.pbp_precio_unitario) * 
                              (formData.productosBorrador?.find(p => p.pbp_id === producto.pbp_id)?.pbp_cantidad || producto.pbp_cantidad)
                            )}
                          </span>
                        </div>
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

              {/* Botones para agregar productos */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex gap-3">
                  <button
                    onClick={() => handleInputChange('openProductSelector')}
                    className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <FiPlus className="w-4 h-4 mr-2" />
                    Agregar Producto
                  </button>
                  <button
                    onClick={() => handleInputChange('openProductoBorradorModal')}
                    className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  >
                    <FiPlus className="w-4 h-4 mr-2" />
                    Agregar Producto Sin Registrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-6 py-2 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSaveClick}
            disabled={saving || loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Guardando...
              </>
            ) : (
              <>
                <FiSave className="text-sm" />
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </div>

      {/* Modal de éxito */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center">
            <span className="text-green-600 text-3xl mb-2">✔</span>
            <span className="text-lg font-semibold mb-2">¡Pedido modificado con éxito!</span>
            <span className="text-gray-600 text-sm mb-4">Los cambios se guardaron correctamente.</span>
            <button
              className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              onClick={async () => {
                await cargarDatosCompletos(pedido.pedido_id);
                setShowSuccessModal(false);
                onClose();
              }}
            >Cerrar</button>
          </div>
        </div>
      )}
      {/* Modal de selección de productos */}
      {showSelector && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[85vh] overflow-hidden border border-gray-100">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Seleccionar Productos</h2>
                <p className="text-sm text-gray-600 mt-1">Busca y selecciona productos para agregar al pedido</p>
              </div>
              <button 
                onClick={() => {
                  setShowSelector(false);
                  setSeleccionados([]);
                  setBusqueda('');
                }}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-2 transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="relative mb-6">
                <input
                  type="text"
                  value={busqueda}
                  onChange={e => setBusqueda(e.target.value)}
                  placeholder="Buscar productos por nombre..."
                  className="w-full pl-10 pr-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-150"
                />
                <FiSearch className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              </div>

              {loadingSugerencias && (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Buscando productos...</span>
                </div>
              )}

              {!loadingSugerencias && sugerencias.length > 0 && (
                <div className="space-y-2 mb-6">
                  <h3 className="text-sm font-medium text-gray-700">Productos disponibles:</h3>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {sugerencias.map(producto => (
                      <div 
                        key={producto.producto_id} 
                        className={`p-3 border rounded-lg cursor-pointer transition-all ${
                          seleccionados.find(s => s.producto_id === producto.producto_id)
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-blue-300 hover:bg-blue-25'
                        }`}
                        onClick={() => {
                          const yaSeleccionado = seleccionados.find(s => s.producto_id === producto.producto_id);
                          if (yaSeleccionado) {
                            setSeleccionados(prev => prev.filter(s => s.producto_id !== producto.producto_id));
                          } else {
                            setSeleccionados(prev => [...prev, producto]);
                          }
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">{producto.producto_nombre}</div>
                            <div className="text-sm text-gray-500">
                              Precio costo: ${producto.producto_precio_costo || 0} | Stock: {producto.stock_cantidad || 0}
                            </div>
                          </div>
                          {seleccionados.find(s => s.producto_id === producto.producto_id) && (
                            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                              <FiX className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!loadingSugerencias && busqueda && sugerencias.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <FiPackage className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No se encontraron productos con "{busqueda}"</p>
                </div>
              )}

              {seleccionados.length > 0 && (
                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Productos seleccionados ({seleccionados.length}):
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {seleccionados.map(producto => (
                      <div key={producto.producto_id} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                        {producto.producto_nombre}
                        <button
                          onClick={() => {
                            setSeleccionados(prev => prev.filter(s => s.producto_id !== producto.producto_id));
                          }}
                          className="hover:bg-blue-200 rounded-full p-0.5"
                        >
                          <FiX className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
                <button
                  onClick={() => {
                    setShowSelector(false);
                    setSeleccionados([]);
                    setBusqueda('');
                  }}
                  className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarSeleccionProductos}
                  disabled={seleccionados.length === 0}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                >
                  Agregar {seleccionados.length > 0 ? `(${seleccionados.length})` : ''} Producto{seleccionados.length !== 1 ? 's' : ''}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditarPedidoModal;