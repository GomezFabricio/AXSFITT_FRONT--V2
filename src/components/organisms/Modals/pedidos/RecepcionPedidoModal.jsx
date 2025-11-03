import React, { useState, useEffect, useMemo } from 'react';
import { FiX, FiPackage, FiPlus, FiMinus, FiAlertCircle, FiDollarSign, FiCheck } from 'react-icons/fi';
import { getPedidoPorId } from '../../../../api/pedidosApi';
import ProductoSinRegistrarForm from './ProductoSinRegistrarForm';
import RegistrarProductoBorradorModal from './RegistrarProductoBorradorModal';

const RecepcionPedidoModal = ({ open, onClose, pedido, onRecepcionar }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [detallePedido, setDetallePedido] = useState(null);
  
  // Estados para la recepción
  const [itemsRecepcion, setItemsRecepcion] = useState([]);
  const [productosSinRegistrar, setProductosSinRegistrar] = useState([]);
  const [showFormProductoSinRegistrar, setShowFormProductoSinRegistrar] = useState(false);
  const [showRegistrarBorrador, setShowRegistrarBorrador] = useState(false);
  const [productoBorradorSeleccionado, setProductoBorradorSeleccionado] = useState(null);
  const [observaciones, setObservaciones] = useState('');
  
  // Estado para validaciones
  const [errores, setErrores] = useState({});

  // Cargar detalle del pedido
  useEffect(() => {
    if (open && pedido?.pedido_id) {
      cargarDetallePedido();
    }
  }, [open, pedido?.pedido_id]);

  // Función auxiliar para parsear JSON de forma segura o retornar el valor si ya es un objeto
  const safeJsonParse = (value) => {
    // Si ya es un objeto o array, retornarlo directamente
    if (typeof value === 'object' && value !== null) {
      return value;
    }
    
    // Si es null, undefined, o cadena vacía, retornar null
    if (!value || value === 'null' || value === '') {
      return null;
    }
    
    // Si es string, intentar parsearlo
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch (e) {
        console.warn('Error parseando JSON:', value, e);
        return null;
      }
    }
    
    // Para cualquier otro tipo, retornar null
    return null;
  };

  const cargarDetallePedido = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPedidoPorId(pedido.pedido_id);
      setDetallePedido(data);
      
      // Inicializar items de recepción con productos registrados
      const itemsIniciales = data.items.map(item => ({
        detalle_id: item.pd_id,
        producto_id: item.pd_producto_id,
        variante_id: item.pd_variante_id,
        producto_nombre: item.producto_nombre || 'Producto sin nombre',
        variante_atributos: item.variante_atributos || 'Sin variante',
        cantidad_pedida: item.pd_cantidad_pedida,
        cantidad_recibida: item.pd_cantidad_pedida,
        precio_original: item.pd_precio_unitario,
        precio_costo_nuevo: item.pd_precio_unitario,
        subtotal: item.pd_cantidad_pedida * item.pd_precio_unitario,
        cambio_precio: false,
        observaciones: '',
        tipo: 'registrado'
      }));
      
      setItemsRecepcion(itemsIniciales);
      
      // Inicializar productos sin registrar existentes (productos borrador y variantes borrador)
      const productosSinRegistrarExistentes = [];
      
      // Agregar productos borrador
      if (data.productosBorrador?.length > 0) {
        data.productosBorrador.forEach(producto => {
          productosSinRegistrarExistentes.push({
            id: `pb_${producto.pbp_id}`,
            pbp_id: producto.pbp_id,
            nombre: producto.pbp_nombre,
            precio: parseFloat(producto.pbp_precio_unitario),
            cantidad: producto.pbp_cantidad,
            observaciones: producto.pbp_observaciones || '',
            variantes: safeJsonParse(producto.pbp_variantes) || [],
            atributos: safeJsonParse(producto.pbp_atributos) || {},
            tipo: 'producto_borrador',
            estado: producto.pbp_estado || 'borrador'
          });
        });
      }
      
      // Agregar variantes borrador (nuevas variantes de productos existentes)
      if (data.variantesBorrador?.length > 0) {
        data.variantesBorrador.forEach(variante => {
          const productoExistente = productosSinRegistrarExistentes.find(p => 
            p.tipo === 'variante_borrador' && p.producto_id === variante.vb_producto_id
          );
          
          console.log('Debug variante borrador:', {
            raw_atributos: variante.vb_atributos,
            tipo: typeof variante.vb_atributos
          });
          
          const atributosParsed = safeJsonParse(variante.vb_atributos) || [];
          
          console.log('Debug atributos parsed:', atributosParsed);
          
          if (productoExistente) {
            // Agregar variante al producto existente
            productoExistente.variantes.push({
              vb_id: variante.vb_id,
              atributos: atributosParsed,
              cantidad: variante.vb_cantidad,
              precio_unitario: parseFloat(variante.vb_precio_unitario)
            });
          } else {
            // Crear nuevo grupo para este producto
            productosSinRegistrarExistentes.push({
              id: `vb_${variante.vb_id}`,
              vb_id: variante.vb_id,
              nombre: variante.producto_nombre || 'Producto existente',
              producto_id: variante.vb_producto_id,
              precio: parseFloat(variante.vb_precio_unitario),
              cantidad: variante.vb_cantidad,
              observaciones: '',
              variantes: [{
                vb_id: variante.vb_id,
                atributos: atributosParsed,
                cantidad: variante.vb_cantidad,
                precio_unitario: parseFloat(variante.vb_precio_unitario)
              }],
              tipo: 'variante_borrador',
              estado: variante.vb_estado || 'borrador'
            });
          }
        });
      }
      
      setProductosSinRegistrar(productosSinRegistrarExistentes);
      
    } catch (err) {
      setError(err.message || 'Error al cargar el detalle del pedido');
    } finally {
      setLoading(false);
    }
  };

  // Actualizar cantidad recibida de un item
  const actualizarCantidadRecibida = (detalleId, nuevaCantidad) => {
    setItemsRecepcion(prev => prev.map(item => {
      if (item.detalle_id === detalleId) {
        const cantidadNum = Math.max(0, parseInt(nuevaCantidad) || 0);
        return {
          ...item,
          cantidad_recibida: cantidadNum,
          subtotal: cantidadNum * item.precio_costo_nuevo
        };
      }
      return item;
    }));
    
    // Limpiar errores relacionados
    setErrores(prev => ({
      ...prev,
      [`cantidad_${detalleId}`]: null
    }));
  };

  // Actualizar precio de costo de un item
  const actualizarPrecioCosto = (detalleId, nuevoPrecio) => {
    setItemsRecepcion(prev => prev.map(item => {
      if (item.detalle_id === detalleId) {
        const precioNum = Math.max(0, parseFloat(nuevoPrecio) || 0);
        const cambioPrecio = precioNum !== item.precio_original;
        return {
          ...item,
          precio_costo_nuevo: precioNum,
          cambio_precio: cambioPrecio,
          subtotal: item.cantidad_recibida * precioNum
        };
      }
      return item;
    }));
    
    // Limpiar errores relacionados
    setErrores(prev => ({
      ...prev,
      [`precio_${detalleId}`]: null
    }));
  };

  // Validar datos de recepción
  const validarRecepcion = () => {
    const nuevosErrores = {};
    let esValido = true;

    // Validar items de recepción
    itemsRecepcion.forEach(item => {
      if (item.cantidad_recibida < 0) {
        nuevosErrores[`cantidad_${item.detalle_id}`] = 'La cantidad no puede ser negativa';
        esValido = false;
      }
      
      if (item.precio_costo_nuevo <= 0) {
        nuevosErrores[`precio_${item.detalle_id}`] = 'El precio debe ser mayor a 0';
        esValido = false;
      }
    });

    // Validar productos sin registrar
    productosSinRegistrar.forEach((producto, index) => {
      if (!producto.nombre?.trim()) {
        nuevosErrores[`producto_nombre_${index}`] = 'El nombre es requerido';
        esValido = false;
      }
      
      if (producto.cantidad <= 0) {
        nuevosErrores[`producto_cantidad_${index}`] = 'La cantidad debe ser mayor a 0';
        esValido = false;
      }
      
      if (producto.precio <= 0) {
        nuevosErrores[`producto_precio_${index}`] = 'El precio debe ser mayor a 0';
        esValido = false;
      }
    });

    setErrores(nuevosErrores);
    return esValido;
  };

  // Calcular totales
  const totales = useMemo(() => {
    const totalItems = itemsRecepcion.reduce((sum, item) => sum + item.subtotal, 0);
    
    // Calcular total de productos sin registrar (incluye existentes y nuevos)
    const totalProductosSinRegistrar = productosSinRegistrar.reduce((sum, prod) => {
      if (prod.tipo === 'variante_borrador' && prod.variantes?.length > 0) {
        // Para variantes borrador, sumar el precio de cada variante
        return sum + prod.variantes.reduce((vSum, variante) => 
          vSum + (variante.cantidad * variante.precio_unitario), 0);
      } else {
        // Para productos borrador y productos nuevos
        return sum + (prod.cantidad * prod.precio);
      }
    }, 0);
    
    const itemsConCambiosPrecio = itemsRecepcion.filter(item => item.cambio_precio).length;
    const totalItemsRecibidos = itemsRecepcion.reduce((sum, item) => sum + item.cantidad_recibida, 0);
    
    // Contar productos por tipo
    const productosExistentes = productosSinRegistrar.filter(p => 
      p.tipo === 'producto_borrador' || p.tipo === 'variante_borrador'
    ).length;
    
    const productosNuevos = productosSinRegistrar.filter(p => 
      p.tipo !== 'producto_borrador' && p.tipo !== 'variante_borrador'
    ).length;
    
    return {
      totalItems,
      totalProductosSinRegistrar,
      totalGeneral: totalItems + totalProductosSinRegistrar,
      itemsConCambiosPrecio,
      totalItemsRecibidos,
      cantidadProductosSinRegistrar: productosSinRegistrar.length,
      productosExistentes,
      productosNuevos
    };
  }, [itemsRecepcion, productosSinRegistrar]);

  // Manejar confirmación de recepción
  const handleConfirmarRecepcion = async () => {
    if (!validarRecepcion()) {
      return;
    }

    // Separar productos nuevos de los que ya existían en el pedido
    const productosNuevos = productosSinRegistrar.filter(p => 
      p.tipo !== 'producto_borrador' && p.tipo !== 'variante_borrador'
    );

    const datosRecepcion = {
      pedido_id: pedido.pedido_id,
      recepcion: itemsRecepcion.map(item => ({
        detalle_id: item.detalle_id,
        cantidad_recibida: item.cantidad_recibida,
        precio_costo_nuevo: item.cambio_precio ? item.precio_costo_nuevo : null
      })),
      productos_sin_registrar: productosNuevos, // Solo productos agregados manualmente
      observaciones,
      usuario_id: (() => {
        try {
          const userData = sessionStorage.getItem('userData');
          return userData ? JSON.parse(userData)?.usuario_id : null;
        } catch (e) {
          console.warn('Error parseando userData desde sessionStorage:', e);
          return null;
        }
      })()
    };

    try {
      await onRecepcionar(datosRecepcion);
    } catch (error) {
      setError(error.message || 'Error al recepcionar el pedido');
    }
  };

  // Agregar producto sin registrar
  const agregarProductoSinRegistrar = (producto) => {
    setProductosSinRegistrar(prev => [...prev, {
      ...producto,
      id: Date.now() // ID temporal
    }]);
    setShowFormProductoSinRegistrar(false);
  };

  // Eliminar producto sin registrar
  const eliminarProductoSinRegistrar = (index) => {
    setProductosSinRegistrar(prev => prev.filter((_, i) => i !== index));
  };

  // Abrir modal de registro para producto borrador
  const abrirModalRegistro = (producto) => {
    setProductoBorradorSeleccionado(producto);
    setShowRegistrarBorrador(true);
  };

  // Manejar registro de producto borrador
  const handleRegistrarProductoBorrador = (datosRegistro) => {
    // Aquí podrías hacer una llamada a la API para registrar el producto
    // Por ahora, solo cerramos el modal
    console.log('Datos de registro:', datosRegistro);
    setShowRegistrarBorrador(false);
    setProductoBorradorSeleccionado(null);
    
    // Opcional: Mostrar mensaje de éxito
    // alert('Producto registrado exitosamente');
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden m-4">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FiPackage className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Recepcionar Pedido #{pedido?.pedido_id}
              </h2>
              <p className="text-gray-600">
                Proveedor: {pedido?.proveedor_nombre} | Fecha: {pedido?.pedido_fecha_pedido ? new Date(pedido.pedido_fecha_pedido).toLocaleDateString('es-ES') : ''}
              </p>
            </div>
          </div>
          <button 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors" 
            onClick={onClose}
          >
            <FiX className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto max-h-[calc(90vh-140px)]">
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Cargando detalle...</span>
            </div>
          )}

          {error && (
            <div className="m-6 bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex items-center">
                <FiAlertCircle className="w-5 h-5 text-red-400 mr-2" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && detallePedido && (
            <div className="p-6 space-y-6">
              
              {/* Resumen de totales */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">Resumen de Recepción</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                  <div className="text-center">
                    <div className="font-semibold text-blue-600">{totales.totalItemsRecibidos}</div>
                    <div className="text-gray-600">Items Recibidos</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-orange-600">{totales.itemsConCambiosPrecio}</div>
                    <div className="text-gray-600">Cambios Precio</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-amber-600">{totales.productosExistentes}</div>
                    <div className="text-gray-600">Prod. Borrador</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-green-600">{totales.productosNuevos}</div>
                    <div className="text-gray-600">Prod. Nuevos</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-purple-600">
                      ${totales.totalGeneral.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-gray-600">Total Recepción</div>
                  </div>
                </div>
              </div>

              {/* Items del pedido */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                  <FiPackage className="w-5 h-5 mr-2" />
                  Productos del Pedido ({itemsRecepcion.length})
                </h3>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Cant. Pedida</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Cant. Recibida</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Precio Original</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Precio Nuevo</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {itemsRecepcion.map((item, index) => (
                        <tr key={item.detalle_id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div>
                              <div className="font-medium text-gray-900">{item.producto_nombre}</div>
                              <div className="text-sm text-gray-500">{item.variante_atributos}</div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                              {item.cantidad_pedida}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <button
                                type="button"
                                onClick={() => actualizarCantidadRecibida(item.detalle_id, item.cantidad_recibida - 1)}
                                className="p-1 hover:bg-gray-200 rounded"
                              >
                                <FiMinus className="w-4 h-4" />
                              </button>
                              <input
                                type="number"
                                value={item.cantidad_recibida}
                                onChange={(e) => actualizarCantidadRecibida(item.detalle_id, e.target.value)}
                                className="w-20 px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                min="0"
                              />
                              <button
                                type="button"
                                onClick={() => actualizarCantidadRecibida(item.detalle_id, item.cantidad_recibida + 1)}
                                className="p-1 hover:bg-gray-200 rounded"
                              >
                                <FiPlus className="w-4 h-4" />
                              </button>
                            </div>
                            {errores[`cantidad_${item.detalle_id}`] && (
                              <p className="text-xs text-red-500 mt-1">{errores[`cantidad_${item.detalle_id}`]}</p>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-gray-600">
                              ${parseFloat(item.precio_original).toFixed(2)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center">
                              <FiDollarSign className="w-4 h-4 text-gray-400 mr-1" />
                              <input
                                type="number"
                                value={item.precio_costo_nuevo}
                                onChange={(e) => actualizarPrecioCosto(item.detalle_id, e.target.value)}
                                className={`w-20 px-2 py-1 border rounded text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                  item.cambio_precio ? 'border-orange-300 bg-orange-50' : 'border-gray-300'
                                }`}
                                min="0"
                                step="0.01"
                              />
                              {item.cambio_precio && (
                                <span className="ml-2 text-xs text-orange-600 font-medium">Modificado</span>
                              )}
                            </div>
                            {errores[`precio_${item.detalle_id}`] && (
                              <p className="text-xs text-red-500 mt-1">{errores[`precio_${item.detalle_id}`]}</p>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center font-medium">
                            ${item.subtotal.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Productos sin registrar */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <FiPlus className="w-5 h-5 mr-2" />
                    Productos Sin Registrar ({productosSinRegistrar.length})
                  </h3>
                  <button
                    onClick={() => setShowFormProductoSinRegistrar(true)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <FiPlus className="w-4 h-4" />
                    <span>Agregar Nuevo Producto</span>
                  </button>
                </div>

                {productosSinRegistrar.length > 0 && (
                  <div className="space-y-3">
                    {productosSinRegistrar.map((producto, index) => (
                      <div key={producto.id} className={`border rounded-lg p-4 ${
                        producto.tipo === 'producto_borrador' ? 'bg-orange-50 border-orange-200' :
                        producto.tipo === 'variante_borrador' ? 'bg-blue-50 border-blue-200' :
                        'bg-yellow-50 border-yellow-200'
                      }`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-medium text-gray-900">{producto.nombre}</h4>
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                producto.tipo === 'producto_borrador' ? 'bg-orange-100 text-orange-800' :
                                producto.tipo === 'variante_borrador' ? 'bg-blue-100 text-blue-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {producto.tipo === 'producto_borrador' ? 'Producto Nuevo' :
                                 producto.tipo === 'variante_borrador' ? 'Nueva Variante' : 'Agregado Ahora'}
                              </span>
                            </div>
                            
                            {producto.tipo === 'variante_borrador' && (
                              <div className="text-sm text-gray-700 mb-2">
                                <strong>Producto existente:</strong> Se agregará nueva variante
                              </div>
                            )}
                            
                            <div className="text-sm text-gray-600">
                              Cantidad: {producto.cantidad} | Precio: ${producto.precio.toFixed(2)} | 
                              Subtotal: ${(producto.cantidad * producto.precio).toFixed(2)}
                            </div>
                            
                            {/* Mostrar variantes si existen */}
                            {producto.variantes && producto.variantes.length > 0 && (
                              <div className="mt-2">
                                <div className="text-xs font-medium text-gray-700 mb-1">Variantes:</div>
                                <div className="space-y-1">
                                  {producto.variantes.map((variante, vIndex) => (
                                    <div key={vIndex} className="text-xs text-gray-600 bg-white px-2 py-1 rounded border">
                                      {producto.tipo === 'variante_borrador' ? (
                                        // Para variantes borrador, formatear atributos
                                        (() => {
                                          try {
                                            // Si atributos es array de objetos
                                            if (Array.isArray(variante.atributos) && variante.atributos.length > 0) {
                                              return variante.atributos.map(attr => {
                                                // Verificar que el atributo tiene las propiedades esperadas
                                                if (attr && typeof attr === 'object') {
                                                  const nombre = attr.atributo_nombre || attr.nombre || 'Atributo';
                                                  const valor = attr.valor_nombre || attr.valor || 'Valor';
                                                  return `${nombre}: ${valor}`;
                                                }
                                                return 'Atributo inválido';
                                              }).join(', ');
                                            }
                                            
                                            // Si atributos es un objeto plano
                                            if (variante.atributos && typeof variante.atributos === 'object' && !Array.isArray(variante.atributos)) {
                                              return Object.entries(variante.atributos).map(([key, value]) => `${key}: ${value}`).join(', ');
                                            }
                                            
                                            return 'Sin atributos';
                                          } catch (e) {
                                            console.error('Error formateando atributos:', e, variante.atributos);
                                            return 'Error mostrando atributos';
                                          }
                                        })()
                                      ) : (
                                        `${variante.nombre}: ${variante.valor} (Cant: ${variante.cantidad}, +$${(variante.precio_adicional || 0).toFixed(2)})`
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Mostrar atributos del producto si existen */}
                            {producto.atributos && Object.keys(producto.atributos).length > 0 && (
                              <div className="mt-2">
                                <div className="text-xs font-medium text-gray-700 mb-1">Atributos:</div>
                                <div className="text-xs text-gray-600 bg-white px-2 py-1 rounded border">
                                  {Object.entries(producto.atributos).map(([key, value]) => (
                                    <span key={key}>{key}: {value}</span>
                                  )).join(', ')}
                                </div>
                              </div>
                            )}
                            
                            {producto.observaciones && (
                              <div className="text-xs text-gray-500 mt-2">
                                <strong>Observaciones:</strong> {producto.observaciones}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {/* Botones para productos borrador */}
                            {(producto.tipo === 'producto_borrador' || producto.tipo === 'variante_borrador') && (
                              <button
                                onClick={() => abrirModalRegistro(producto)}
                                className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-1"
                              >
                                <FiCheck className="w-3 h-3" />
                                <span>Registrar</span>
                              </button>
                            )}
                            
                            {/* Solo mostrar botón eliminar para productos agregados manualmente */}
                            {producto.tipo !== 'producto_borrador' && producto.tipo !== 'variante_borrador' && (
                              <button
                                onClick={() => eliminarProductoSinRegistrar(index)}
                                className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                              >
                                <FiX className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {productosSinRegistrar.filter(p => p.tipo === 'producto_borrador' || p.tipo === 'variante_borrador').length > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <FiAlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <strong>Información importante:</strong> Los productos y variantes marcados como "borrador" 
                        se registrarán automáticamente en el sistema durante la recepción del pedido. 
                        Una vez registrados, estarán disponibles para futuros pedidos.
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Observaciones */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observaciones de la Recepción
                </label>
                <textarea
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Notas adicionales sobre la recepción (opcional)..."
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!loading && !error && (
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-600">
              Total: <span className="font-bold text-lg text-gray-900">
                ${totales.totalGeneral.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarRecepcion}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                <FiCheck className="w-5 h-5" />
                <span>Confirmar Recepción</span>
              </button>
            </div>
          </div>
        )}

        {/* Modal para agregar producto sin registrar */}
        {showFormProductoSinRegistrar && (
          <ProductoSinRegistrarForm
            open={showFormProductoSinRegistrar}
            onClose={() => setShowFormProductoSinRegistrar(false)}
            onSubmit={agregarProductoSinRegistrar}
          />
        )}

        {/* Modal para registrar producto borrador */}
        {showRegistrarBorrador && productoBorradorSeleccionado && (
          <RegistrarProductoBorradorModal
            open={showRegistrarBorrador}
            onClose={() => {
              setShowRegistrarBorrador(false);
              setProductoBorradorSeleccionado(null);
            }}
            onSubmit={handleRegistrarProductoBorrador}
            producto={productoBorradorSeleccionado}
            tipo={productoBorradorSeleccionado.tipo === 'variante_borrador' ? 'variante_nueva' : 'producto_completo'}
          />
        )}
      </div>
    </div>
  );
};

export default RecepcionPedidoModal;