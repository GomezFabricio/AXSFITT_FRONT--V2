import React, { useState } from 'react';
import ModalConfigurarAtributos from '../../../../components/organisms/Modals/product/ModalConfigurarAtributos';
import AgregarVariante from './AgregarVariante';
import useProveedores from '../../../../hooks/useProveedores';
import useCrearPedido from '../../../../hooks/useCrearPedido';
import config from '../../../../config/config';


const CrearPedidoModal = ({ open, onClose, onSubmit, pedido, onPrecargarProducto }) => {
  const { proveedores, cargarProveedores } = useProveedores();
  
  // Estado para variantes y atributos de productos sin registrar
  const [showVarianteModalIdx, setShowVarianteModalIdx] = useState(null); // idx del producto sin registrar
  const [showAtributosModalIdx, setShowAtributosModalIdx] = useState(null); // idx del producto sin registrar para atributos
  const [formulariosVariantes, setFormulariosVariantes] = useState({}); // { idx: [ { ...variante } ] }
  // Estado para la variante draft (solo uno global)
  const [varianteDraft, setVarianteDraft] = useState({});

  const {
    proveedorId, setProveedorId,
    productos, setProductos,
    descuento, setDescuento,
    costoEnvio, setCostoEnvio,
    productosSinRegistrar, setProductosSinRegistrar,
    fechaEsperada, setFechaEsperada,
    error, setError,
    showSelector, setShowSelector,
    busqueda, setBusqueda,
    sugerencias, setSugerencias,
    loadingSugerencias, setLoadingSugerencias,
    seleccionados, setSeleccionados,
    productoDetalles, setProductoDetalles,
    subtotal, descuentoPorcentaje, descuentoMonto, total,
    confirmarSeleccion, quitarProducto, quitarProductoSinRegistrar, handleSubmit
  } = useCrearPedido(pedido, cargarProveedores, formulariosVariantes);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[95vh] overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-violet-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {pedido ? 'Editar Pedido' : 'Nuevo Pedido'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {pedido ? 'Modifica los detalles del pedido' : 'Crea un nuevo pedido para un proveedor'}
            </p>
          </div>
          <button 
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-2 transition-colors" 
            onClick={onClose}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-140px)]">
          <form onSubmit={e => handleSubmit(e, onSubmit)} className="space-y-6">
            {/* Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Proveedor */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Proveedor <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full px-3 py-2.5 border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition duration-150 bg-white"
                  value={proveedorId}
                  onChange={e => setProveedorId(e.target.value)}
                  required
                >
                  <option value="">Seleccione un proveedor</option>
                  {proveedores.map(p => (
                    <option key={p.proveedor_id} value={p.proveedor_id}>{p.proveedor_nombre}</option>
                  ))}
                </select>
              </div>

              {/* Fecha esperada de entrega */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Fecha esperada de entrega
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2.5 border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition duration-150"
                  value={fechaEsperada}
                  onChange={e => setFechaEsperada(e.target.value)}
                />
              </div>
            </div>

            {/* Selector de productos */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-medium text-gray-800">Productos</h3>
                <button 
                  type="button" 
                  className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg shadow-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 flex items-center gap-2" 
                  onClick={() => setShowSelector(true)}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Agregar productos
                </button>
              </div>
            </div>

          {/* Modal de selección de productos */}
          {showSelector && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[85vh] overflow-hidden border border-gray-100">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-violet-50">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Seleccionar Productos</h2>
                    <p className="text-sm text-gray-600 mt-1">Busca y selecciona los productos para el pedido</p>
                  </div>
                  <button 
                    onClick={() => {
                      setShowSelector(false);
                      setSeleccionados([]);
                    }}
                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-2 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="p-6">
                  <div className="relative mb-6">
                    <input
                      type="text"
                      value={busqueda}
                      onChange={e => setBusqueda(e.target.value)}
                      placeholder="Buscar productos por nombre..."
                      className="w-full pl-10 pr-4 py-3 border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition duration-150"
                      onKeyDown={e => e.key === 'Enter' && setBusqueda(busqueda)}
                    />
                    <svg className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  
                  <div className="max-h-[400px] overflow-y-auto space-y-3">
                    {loadingSugerencias ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-600 border-t-transparent mb-4"></div>
                        <p className="text-gray-600">Cargando productos...</p>
                      </div>
                    ) : sugerencias.length > 0 ? (
                      sugerencias.map(producto => (
                        <div
                          key={producto.producto_id}
                          className={`flex items-center p-4 border rounded-lg cursor-pointer transition duration-150 ${
                            seleccionados.find(p => p.producto_id === producto.producto_id)
                              ? 'border-purple-300 bg-purple-50 shadow-sm'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                          onClick={() => {
                            if (seleccionados.find(p => p.producto_id === producto.producto_id)) {
                              setSeleccionados(prev => prev.filter(p => p.producto_id !== producto.producto_id));
                            } else {
                              setSeleccionados(prev => [...prev, producto]);
                            }
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={!!seleccionados.find(p => p.producto_id === producto.producto_id)}
                            onChange={() => {}} // Manejado por el onClick del div
                            className="mr-3 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                          />
                          <div className="flex items-center flex-1">
                            {producto.imagen_url && (
                              <img
                                src={`${config.backendUrl}${producto.imagen_url}`}
                                alt={producto.producto_nombre}
                                className="w-12 h-12 object-cover rounded-lg mr-4 border border-gray-200"
                              />
                            )}
                            <div className="flex-1">
                              <p className="font-medium text-gray-800">{producto.producto_nombre}</p>
                              {producto.producto_descripcion && (
                                <p className="text-sm text-gray-600 mt-1">{producto.producto_descripcion}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.467-.881-6.08-2.33M15 17H9v-2.639a9.015 9.015 0 016 0V17z" />
                        </svg>
                        <p className="text-gray-600">
                          {busqueda.length < 2
                            ? 'Ingrese al menos 2 caracteres para buscar productos'
                            : 'No se encontraron productos con ese criterio'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
                  <button
                    type="button"
                    onClick={() => {
                      setShowSelector(false);
                      setSeleccionados([]);
                    }}
                    className="flex-1 px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border border-gray-300 shadow-sm transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={confirmarSeleccion}
                    disabled={seleccionados.length === 0}
                    className={`flex-1 px-4 py-2.5 font-medium rounded-lg shadow-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      seleccionados.length > 0
                        ? 'bg-purple-600 hover:bg-purple-700 text-white focus:ring-purple-500'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Agregar Productos {seleccionados.length > 0 && `(${seleccionados.length})`}
                  </button>
                </div>
              </div>
            </div>
          )}

            {/* Configuración de costos */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Configuración de Costos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Descuento (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    className="w-full px-3 py-2.5 border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition duration-150"
                    placeholder="0.00"
                    value={descuento}
                    onChange={e => setDescuento(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Costo de Envío ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2.5 border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition duration-150"
                    placeholder="0.00"
                    value={costoEnvio}
                    onChange={e => setCostoEnvio(e.target.value)}
                  />
                </div>
              </div>
            </div>

          {/* Productos agregados */}
          {productos.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Productos Agregados</h3>
              <ul className="space-y-2">
                {productos.map((p, idx) => {
                  const det = productoDetalles[p.uniqueId] || {};
                  const detallesStock = det.detallesStock;
                  const varianteId = det.varianteId || '';
                  const cantidad = det.cantidad;
                  // Buscar la variante seleccionada
                  const varianteSeleccionada = detallesStock?.variantes?.find(v => v.variante_id === varianteId);
                  // Imagen: primero la de la variante seleccionada, si no, la del producto
                  const imagen = (varianteSeleccionada?.imagen_url && varianteSeleccionada.imagen_url !== '')
                    ? varianteSeleccionada.imagen_url
                    : (detallesStock?.producto?.imagen_url || detallesStock?.imagen_url || '');
                  // Nombre y atributos
                  let nombre = p.nombre;
                  let precio = det.precio_costo;
                  if (!precio && varianteSeleccionada) {
                    precio = varianteSeleccionada.variante_precio_costo ?? '';
                  } else if (!precio && detallesStock) {
                    precio = detallesStock.precio_costo ?? '';
                  }
                  let atributosStr = '';
                  if (varianteSeleccionada) {
                    if (Array.isArray(varianteSeleccionada.atributos)) {
                      atributosStr = varianteSeleccionada.atributos.map(a => `${a.atributo_nombre}: ${a.valor_nombre}`).join(', ');
                    } else if (typeof varianteSeleccionada.atributos === 'string') {
                      atributosStr = varianteSeleccionada.atributos;
                    }
                  }
                  nombre = `${p.nombre}${atributosStr ? ' (' + atributosStr + ')' : ''}`;

                  // --- NUEVO: Si el producto NO tiene variantes en el sistema, permitir configurar atributos y variantes ---
                  const tieneVariantesSistema = detallesStock?.variantes && detallesStock.variantes.length > 0;
                  // Estado local para atributos y variantes de productos registrados sin variantes
                  if (!tieneVariantesSistema) {
                    // Usar campos en productoDetalles para atributos y variantes
                    const atributosConfigurados = det.atributosConfigurados || { atributos: [] };
                    const variantes = det.variantes || [];
                    const mostrarInputsSimples = atributosConfigurados.atributos.length === 0;
                    return (
                      <li key={p.uniqueId || idx} className="flex flex-col gap-1 bg-gray-50 px-3 py-2 rounded-md">
                        <div className="flex items-center gap-2 w-full">
                          {imagen ? (
                            <img
                              src={`${imagen.startsWith('http') ? '' : config.backendUrl}${imagen}`}
                              alt="prod"
                              className="w-8 h-8 border rounded object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 border rounded bg-gray-200 flex items-center justify-center text-xs text-gray-500">Sin</div>
                          )}
                          <span>{nombre}</span>
                          <button type="button" className="btn btn-xs btn-error ml-2" onClick={() => quitarProducto(idx)}>Quitar</button>
                        </div>
                        {/* Inputs simples de cantidad y precio_costo si no hay atributos configurados */}
                        {mostrarInputsSimples && (
                          <div className="flex items-center gap-2 mt-1">
                            <label className="ml-2 text-xs text-gray-600">Cantidad:</label>
                            <input
                              type="number"
                              min="1"
                              className="input input-bordered input-xs w-16 ml-1"
                              value={det.cantidad === undefined ? '' : det.cantidad}
                              onChange={e => setProductoDetalles(prev => ({
                                ...prev,
                                [p.uniqueId]: {
                                  ...prev[p.uniqueId],
                                  cantidad: e.target.value === '' ? '' : Number(e.target.value)
                                }
                              }))}
                              required
                            />
                            <label className="ml-2 text-xs text-gray-600">Precio:</label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              className="input input-bordered input-xs w-20 ml-1"
                              value={det.precio_costo === undefined ? '' : det.precio_costo}
                              onChange={e => setProductoDetalles(prev => ({
                                ...prev,
                                [p.uniqueId]: {
                                  ...prev[p.uniqueId],
                                  precio_costo: e.target.value === '' ? '' : Number(e.target.value)
                                }
                              }))}
                              required
                            />
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <button type="button" className="btn btn-xs btn-outline" onClick={() => {
                            // Abrir modal de atributos para este producto registrado
                            setProductoDetalles(prev => ({
                              ...prev,
                              [p.uniqueId]: {
                                ...prev[p.uniqueId],
                                showAtributosModal: true
                              }
                            }));
                          }}>
                            {atributosConfigurados.atributos.length > 0 ? 'Editar atributos' : 'Configurar atributos'}
                          </button>
                          {atributosConfigurados.atributos.length > 0 && (
                            <button type="button" className="btn btn-xs btn-outline" onClick={() => {
                              // Inicializar draft de variante al abrir el modal (inputs vacíos)
                              const atributos = atributosConfigurados.atributos || [];
                              const initial = {};
                              atributos.forEach(a => { initial[a.atributo_nombre] = ''; });
                              initial.cantidad = '';
                              initial.precio_costo = '';
                              setProductoDetalles(prev => ({
                                ...prev,
                                [p.uniqueId]: {
                                  ...prev[p.uniqueId],
                                  varianteDraft: initial,
                                  showVarianteModal: true
                                }
                              }));
                            }}>Gestionar variantes</button>
                          )}
                          {atributosConfigurados.atributos.length > 0 && <span className="text-xs text-gray-500">{variantes.length} variante(s)</span>}
                        </div>
                        {/* Listado de variantes */}
                        {atributosConfigurados.atributos.length > 0 && variantes.length > 0 && (
                          <ul className="ml-4 mt-1 space-y-1">
                            {variantes.map((v, vIdx) => (
                              <li key={vIdx} className="flex items-center gap-2">
                                <span className="text-xs">{atributosConfigurados.atributos.map(a => `${a.atributo_nombre}: ${v[a.atributo_nombre] || ''}`).join(', ')} | Cant: {v.cantidad} | $ {v.precio_costo}</span>
                                <button type="button" className="btn btn-xs btn-error" onClick={() => {
                                  setProductoDetalles(prev => ({
                                    ...prev,
                                    [p.uniqueId]: {
                                      ...prev[p.uniqueId],
                                      variantes: prev[p.uniqueId].variantes.filter((_, j) => j !== vIdx)
                                    }
                                  }));
                                }}>Quitar</button>
                              </li>
                            ))}
                          </ul>
                        )}
                        {/* Modal para configurar atributos */}
                        {det.showAtributosModal && (
                          <ModalConfigurarAtributos
                            isOpen={true}
                            onClose={() => setProductoDetalles(prev => ({
                              ...prev,
                              [p.uniqueId]: {
                                ...prev[p.uniqueId],
                                showAtributosModal: false
                              }
                            }))}
                            initialAtributos={atributosConfigurados.atributos || []}
                            onSave={data => {
                              const yaTenieAtributos = atributosConfigurados.atributos.length > 0;
                              setProductoDetalles(prev => ({
                                ...prev,
                                [p.uniqueId]: {
                                  ...prev[p.uniqueId],
                                  atributosConfigurados: data,
                                  showAtributosModal: false,
                                  variantes: [], // reset variantes si cambian atributos
                                  // Si antes no tenía atributos y ahora sí, borrar cantidad y precio originales
                                  cantidad: !yaTenieAtributos && data.atributos.length > 0 ? '' : prev[p.uniqueId].cantidad,
                                  precio_costo: !yaTenieAtributos && data.atributos.length > 0 ? '' : prev[p.uniqueId].precio_costo
                                }
                              }));
                            }}
                          />
                        )}
                        {/* Modal para gestionar variantes */}
                        {det.showVarianteModal && (
                          <AgregarVariante
                            isOpen={true}
                            atributos={atributosConfigurados.atributos || []}
                            varianteDraft={det.varianteDraft || {}}
                            setVarianteDraft={fn => setProductoDetalles(prev => ({
                              ...prev,
                              [p.uniqueId]: {
                                ...prev[p.uniqueId],
                                varianteDraft: typeof fn === 'function' ? fn(prev[p.uniqueId].varianteDraft || {}) : fn
                              }
                            }))}
                            onAgregar={() => {
                              setProductoDetalles(prev => ({
                                ...prev,
                                [p.uniqueId]: {
                                  ...prev[p.uniqueId],
                                  variantes: [...(prev[p.uniqueId].variantes || []), det.varianteDraft],
                                  varianteDraft: {},
                                  showVarianteModal: false
                                }
                              }));
                            }}
                            onClose={() => setProductoDetalles(prev => ({
                              ...prev,
                              [p.uniqueId]: {
                                ...prev[p.uniqueId],
                                varianteDraft: {},
                                showVarianteModal: false
                              }
                            }))}
                          />
                        )}
                      </li>
                    );
                  }
                  // --- FIN NUEVO ---

                  // Caso original: producto registrado con variantes
                  // Mostrar todas las variantes existentes para este producto, con inputs de cantidad y precio_costo
                  // y permitir agregar nuevas variantes
                  // 1. Parsear atributos únicos para el modal de agregar variante
                  let atributosSistema = [];
                  if (detallesStock?.variantes?.length > 0) {
                    const atributosSet = new Set();
                    detallesStock.variantes.forEach(v => {
                      let attrs = v.atributos;
                      if (typeof attrs === 'string') {
                        attrs = attrs.split(',').map(s => {
                          const [nombre, valor] = s.split(':').map(x => x && x.trim());
                          return nombre ? { atributo_nombre: nombre, valor_nombre: valor || '' } : null;
                        }).filter(Boolean);
                      }
                      if (Array.isArray(attrs)) {
                        attrs.forEach(a => {
                          if (a && a.atributo_nombre && !atributosSet.has(a.atributo_nombre)) {
                            atributosSet.add(a.atributo_nombre);
                            atributosSistema.push({ atributo_nombre: a.atributo_nombre });
                          }
                        });
                      }
                    });
                  }

                  // 2. Estado local para cantidades y precios de variantes seleccionadas
                  // Guardar en productoDetalles[p.uniqueId].variantesPedido: [{variante_id, cantidad, precio_costo}]
                  const variantesPedido = det.variantesPedido || [];
                  // 3. Mapear variantes existentes
                  // Unir variantes existentes del sistema y las nuevas agregadas en este pedido
                  const variantesNuevas = det.variantes || [];
                  // Las variantes nuevas no tienen variante_id, así que les asignamos un id temporal negativo
                  const variantesExistentes = [
                    ...(detallesStock?.variantes || []).map(v => {
                      let attrs = v.atributos;
                      if (typeof attrs === 'string') {
                        attrs = attrs.split(',').map(s => {
                          const [nombre, valor] = s.split(':').map(x => x && x.trim());
                          return nombre ? { atributo_nombre: nombre, valor_nombre: valor || '' } : null;
                        }).filter(Boolean);
                      }
                      return {
                        ...v,
                        atributos: attrs,
                        _esNueva: false
                      };
                    }),
                    ...variantesNuevas.map((v, i) => ({
                      ...v,
                      variante_id: v.variante_id || `nueva_${i}`,
                      atributos: atributosSistema.map(a => ({
                        atributo_nombre: a.atributo_nombre,
                        valor_nombre: v[a.atributo_nombre] || ''
                      })),
                      _esNueva: true
                    }))
                  ];

                  return (
                    <li key={p.uniqueId || idx} className="flex flex-col gap-1 bg-gray-50 px-3 py-2 rounded-md">
                      <div className="flex items-center gap-2 w-full">
                        {imagen ? (
                          <img
                            src={`${imagen.startsWith('http') ? '' : config.backendUrl}${imagen}`}
                            alt="prod"
                            className="w-8 h-8 border rounded object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 border rounded bg-gray-200 flex items-center justify-center text-xs text-gray-500">Sin</div>
                        )}
                        <span>{nombre}</span>
                        <button type="button" className="btn btn-xs btn-error ml-2" onClick={() => quitarProducto(idx)}>Quitar</button>
                      </div>
                      {/* Tabla de variantes existentes */}
                      {variantesExistentes.length > 0 && (
                        <div className="mt-2">
                          <div className="overflow-x-auto">
                            <table className="table table-xs w-full">
                              <thead>
                                <tr>
                                  <th>Variante</th>
                                  <th>Cantidad</th>
                                  <th>Precio costo</th>
                                  <th>Incluir</th>
                                </tr>
                              </thead>
                              <tbody>
                                {variantesExistentes.map((v, vIdx) => {
                                  // Buscar si ya está en variantesPedido
                                  const pedido = variantesPedido.find(x => x.variante_id === v.variante_id) || { cantidad: '', precio_costo: '' };
                                  return (
                                    <tr key={v.variante_id}>
                                      <td className="text-xs">
                                        {Array.isArray(v.atributos)
                                          ? v.atributos.map(a => `${a.atributo_nombre}: ${a.valor_nombre}`).join(', ')
                                          : v.atributos || 'Variante'}
                                      </td>
                                      <td>
                                        <input
                                          type="number"
                                          min="0"
                                          className="input input-bordered input-xs w-16"
                                          value={pedido.cantidad}
                                          onChange={e => {
                                            const val = e.target.value === '' ? '' : Number(e.target.value);
                                            setProductoDetalles(prev => {
                                              const prevPedido = prev[p.uniqueId]?.variantesPedido || [];
                                              const idxPedido = prevPedido.findIndex(x => x.variante_id === v.variante_id);
                                              let newPedido;
                                              if (idxPedido >= 0) {
                                                newPedido = [...prevPedido];
                                                newPedido[idxPedido] = { ...newPedido[idxPedido], cantidad: val };
                                              } else {
                                                newPedido = [...prevPedido, { variante_id: v.variante_id, cantidad: val, precio_costo: pedido.precio_costo }];
                                              }
                                              return {
                                                ...prev,
                                                [p.uniqueId]: {
                                                  ...prev[p.uniqueId],
                                                  variantesPedido: newPedido
                                                }
                                              };
                                            });
                                          }}
                                        />
                                      </td>
                                      <td>
                                        <input
                                          type="number"
                                          min="0"
                                          step="0.01"
                                          className="input input-bordered input-xs w-20"
                                          value={pedido.precio_costo}
                                          onChange={e => {
                                            const val = e.target.value === '' ? '' : Number(e.target.value);
                                            setProductoDetalles(prev => {
                                              const prevPedido = prev[p.uniqueId]?.variantesPedido || [];
                                              const idxPedido = prevPedido.findIndex(x => x.variante_id === v.variante_id);
                                              let newPedido;
                                              if (idxPedido >= 0) {
                                                newPedido = [...prevPedido];
                                                newPedido[idxPedido] = { ...newPedido[idxPedido], precio_costo: val };
                                              } else {
                                                newPedido = [...prevPedido, { variante_id: v.variante_id, cantidad: pedido.cantidad, precio_costo: val }];
                                              }
                                              return {
                                                ...prev,
                                                [p.uniqueId]: {
                                                  ...prev[p.uniqueId],
                                                  variantesPedido: newPedido
                                                }
                                              };
                                            });
                                          }}
                                        />
                                      </td>
                                      <td>
                                        <input
                                          type="checkbox"
                                          checked={pedido.cantidad > 0}
                                          onChange={e => {
                                            // Si se desmarca, poner cantidad en ''
                                            setProductoDetalles(prev => {
                                              const prevPedido = prev[p.uniqueId]?.variantesPedido || [];
                                              const idxPedido = prevPedido.findIndex(x => x.variante_id === v.variante_id);
                                              let newPedido;
                                              if (idxPedido >= 0) {
                                                newPedido = [...prevPedido];
                                                newPedido[idxPedido] = { ...newPedido[idxPedido], cantidad: e.target.checked ? (pedido.cantidad || 1) : '' };
                                              } else {
                                                newPedido = [...prevPedido, { variante_id: v.variante_id, cantidad: 1, precio_costo: pedido.precio_costo }];
                                              }
                                              return {
                                                ...prev,
                                                [p.uniqueId]: {
                                                  ...prev[p.uniqueId],
                                                  variantesPedido: newPedido
                                                }
                                              };
                                            });
                                          }}
                                        />
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                      {/* Botón para agregar nueva variante */}
                      <div className="mt-2">
                        <button type="button" className="btn btn-xs btn-outline" onClick={() => {
                          const initial = {};
                          atributosSistema.forEach(a => { initial[a.atributo_nombre] = ''; });
                          initial.cantidad = '';
                          initial.precio_costo = '';
                          setProductoDetalles(prev => ({
                            ...prev,
                            [p.uniqueId]: {
                              ...prev[p.uniqueId],
                              varianteDraft: initial,
                              showVarianteModal: true
                            }
                          }));
                        }}>Agregar variante nueva</button>
                      </div>
                      {/* Modal para agregar variante nueva */}
                      {det.showVarianteModal && (
                        <AgregarVariante
                          isOpen={true}
                          atributos={atributosSistema}
                          varianteDraft={det.varianteDraft || {}}
                          setVarianteDraft={fn => setProductoDetalles(prev => ({
                            ...prev,
                            [p.uniqueId]: {
                              ...prev[p.uniqueId],
                              varianteDraft: typeof fn === 'function' ? fn(prev[p.uniqueId].varianteDraft || {}) : fn
                            }
                          }))}
                          onAgregar={() => {
                            setProductoDetalles(prev => {
                              const nuevas = [...(prev[p.uniqueId].variantes || []), det.varianteDraft];
                              // También agregar a variantesPedido con cantidad y precio_costo
                              const nuevasPedido = [
                                ...(prev[p.uniqueId].variantesPedido || []),
                                {
                                  variante_id: `nueva_${nuevas.length - 1}`,
                                  cantidad: det.varianteDraft.cantidad,
                                  precio_costo: det.varianteDraft.precio_costo,
                                  atributos: Object.keys(det.varianteDraft || {})
                                    .filter(key => key !== 'cantidad' && key !== 'precio_costo')
                                    .map(key => ({
                                      atributo_nombre: key,
                                      valor_nombre: det.varianteDraft[key] || ''
                                    }))
                                }
                              ];
                              return {
                                ...prev,
                                [p.uniqueId]: {
                                  ...prev[p.uniqueId],
                                  variantes: nuevas,
                                  variantesPedido: nuevasPedido,
                                  varianteDraft: {},
                                  showVarianteModal: false
                                }
                              };
                            });
                          }}
                          onClose={() => setProductoDetalles(prev => ({
                            ...prev,
                            [p.uniqueId]: {
                              ...prev[p.uniqueId],
                              varianteDraft: {},
                              showVarianteModal: false
                            }
                          }))}
                        />
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}


          {productosSinRegistrar.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Productos sin Registrar</h3>
              <ul className="space-y-2">
                {productosSinRegistrar.map((p, idx) => {
                  const tieneAtributos = !!p.atributosConfigurados && p.atributosConfigurados.atributos && p.atributosConfigurados.atributos.length > 0;
                  const variantes = formulariosVariantes[idx] || [];
                  return (
                    <li key={idx} className="flex flex-col gap-1 bg-gray-50 px-3 py-2 rounded-md">
                      <div className="flex items-center gap-2 w-full">
                        <input
                          type="text"
                          className="input input-bordered input-xs w-40"
                          value={p.nombre}
                          onChange={e => setProductosSinRegistrar(prev => prev.map((item, i) => i === idx ? { ...item, nombre: e.target.value } : item))}
                          placeholder="Nombre del producto"
                          required
                        />
                        {/* Si no tiene atributos, modo simple */}
                        {!tieneAtributos && <>
                          <label className="ml-2 text-xs text-gray-600">Cantidad:</label>
                          <input
                            type="number"
                            min="1"
                            className="input input-bordered input-xs w-16 ml-1"
                            value={p.cantidad === undefined ? '' : p.cantidad}
                            onChange={e => setProductosSinRegistrar(prev => prev.map((item, i) => i === idx ? { ...item, cantidad: e.target.value === '' ? '' : Number(e.target.value) } : item))}
                            required
                          />
                          <label className="ml-2 text-xs text-gray-600">Precio:</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="input input-bordered input-xs w-20 ml-1"
                            value={p.precio_costo === undefined ? '' : p.precio_costo}
                            onChange={e => setProductosSinRegistrar(prev => prev.map((item, i) => i === idx ? { ...item, precio_costo: e.target.value === '' ? '' : Number(e.target.value) } : item))}
                            required
                          />
                        </>}
                        <button type="button" className="btn btn-xs btn-error ml-2" onClick={() => quitarProductoSinRegistrar(idx)}>Quitar</button>
                      </div>
                      {/* Configurar atributos */}
                      <div className="flex items-center gap-2 mt-1">
                        <button type="button" className="btn btn-xs btn-outline" onClick={() => setShowAtributosModalIdx(idx)}>
                          {tieneAtributos ? 'Editar atributos' : 'Configurar atributos'}
                        </button>
                        {tieneAtributos && <button type="button" className="btn btn-xs btn-outline" onClick={() => {
                          // Inicializar draft de variante al abrir el modal (inputs vacíos)
                          const atributos = p.atributosConfigurados?.atributos || [];
                          const initial = {};
                          atributos.forEach(a => { initial[a.atributo_nombre] = ''; });
                          initial.cantidad = '';
                          initial.precio_costo = '';
                          setVarianteDraft(initial);
                          setShowVarianteModalIdx(idx);
                        }}>Gestionar variantes</button>}
                        {tieneAtributos && <span className="text-xs text-gray-500">{variantes.length} variante(s)</span>}
                      </div>
                      {/* Listado de variantes */}
                      {tieneAtributos && variantes.length > 0 && (
                        <ul className="ml-4 mt-1 space-y-1">
                          {variantes.map((v, vIdx) => (
                            <li key={vIdx} className="flex items-center gap-2">
                              <span className="text-xs">{p.atributosConfigurados.atributos.map(a => `${a.atributo_nombre}: ${v[a.atributo_nombre] || ''}`).join(', ')} | Cant: {v.cantidad} | $ {v.precio_costo}</span>
                              <button type="button" className="btn btn-xs btn-error" onClick={() => {
                                setFormulariosVariantes(prev => ({
                                  ...prev,
                                  [idx]: prev[idx].filter((_, j) => j !== vIdx)
                                }));
                              }}>Quitar</button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
              {/* Modal para configurar atributos */}
              {showAtributosModalIdx !== null && (
                <ModalConfigurarAtributos
                  isOpen={true}
                  onClose={() => setShowAtributosModalIdx(null)}
                  initialAtributos={productosSinRegistrar[showAtributosModalIdx]?.atributosConfigurados?.atributos || []}
                  onSave={data => {
                    const yaTenieAtributos = productosSinRegistrar[showAtributosModalIdx]?.atributosConfigurados?.atributos?.length > 0;
                    setProductosSinRegistrar(prev => prev.map((item, i) => i === showAtributosModalIdx ? { 
                      ...item, 
                      atributosConfigurados: data,
                      // Si antes no tenía atributos y ahora sí, borrar cantidad y precio originales
                      cantidad: !yaTenieAtributos && data.atributos.length > 0 ? '' : item.cantidad,
                      precio_costo: !yaTenieAtributos && data.atributos.length > 0 ? '' : item.precio_costo
                    } : item));
                    setShowAtributosModalIdx(null);
                  }}
                />
              )}
              {/* Modal para gestionar variantes */}
              {showVarianteModalIdx !== null && (
                <AgregarVariante
                  isOpen={true}
                  atributos={productosSinRegistrar[showVarianteModalIdx]?.atributosConfigurados?.atributos || []}
                  varianteDraft={varianteDraft}
                  setVarianteDraft={setVarianteDraft}
                  onAgregar={() => {
                    setFormulariosVariantes(prev => ({
                      ...prev,
                      [showVarianteModalIdx]: [...(prev[showVarianteModalIdx] || []), varianteDraft]
                    }));
                    setVarianteDraft({});
                    setShowVarianteModalIdx(null);
                  }}
                  onClose={() => {
                    setVarianteDraft({});
                    setShowVarianteModalIdx(null);
                  }}
                />
              )}
            </div>
          )}

          {/* Resumen de totales: solo mostrar si hay productos o productosSinRegistrar */}
          {(productos.length > 0 || productosSinRegistrar.length > 0) && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-800 mb-3">Resumen del Pedido</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Descuento ({descuentoPorcentaje}%)</span>
                  <span className="font-medium text-red-600">-${descuentoMonto.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Costo de Envío</span>
                  <span className="font-medium">${Number(costoEnvio).toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-300 pt-2 mt-2">
                  <div className="flex justify-between text-lg font-bold text-gray-800">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Agregar producto sin registrar */}
          <div className="flex justify-center">
            <button
              type="button"
              className="px-4 py-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg font-medium transition duration-150 flex items-center gap-2"
              onClick={() => setProductosSinRegistrar(prev => ([...prev, { nombre: '', cantidad: '', precio_costo: '' }]))}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Agregar producto sin registrar
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Footer con botones */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button 
              type="button" 
              className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg border border-gray-300 shadow-sm transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400" 
              onClick={onClose}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="flex-1 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg shadow-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              {pedido ? 'Guardar Cambios' : 'Crear Pedido'}
            </button>
          </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CrearPedidoModal;
