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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl relative">
        <button className="absolute top-3 right-3 btn btn-sm btn-circle btn-ghost" onClick={onClose}>✕</button>
        <h2 className="text-2xl font-semibold mb-4">{pedido ? 'Editar Pedido' : 'Nuevo Pedido'}</h2>
        <form onSubmit={e => handleSubmit(e, onSubmit)} className="space-y-4">
          {/* Proveedor */}
          <div>
            <label className="block text-sm font-semibold mb-1">Proveedor</label>
            <select
              className="select select-bordered w-full"
              value={proveedorId}
              onChange={e => setProveedorId(e.target.value)}
              required
            >
              <option value="">Seleccione proveedor</option>
              {proveedores.map(p => (
                <option key={p.proveedor_id} value={p.proveedor_id}>{p.proveedor_nombre}</option>
              ))}
            </select>
          </div>

          {/* Fecha esperada de entrega (opcional) */}
          <div>
            <label className="block text-sm font-semibold mb-1">Fecha esperada de entrega (opcional)</label>
            <input
              type="date"
              className="input input-bordered w-full"
              value={fechaEsperada}
              onChange={e => setFechaEsperada(e.target.value)}
            />
          </div>

          {/* Selector de productos (modal estilo ventas) */}
          <div>
            <button type="button" className="btn btn-success mb-2" onClick={() => setShowSelector(true)}>
              Agregar productos
            </button>
          </div>

          {/* Modal de selección de productos */}
          {showSelector && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
              <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-4">Seleccionar Productos</h2>
                <div className="flex mb-4">
                  <input
                    type="text"
                    value={busqueda}
                    onChange={e => setBusqueda(e.target.value)}
                    placeholder="Buscar productos..."
                    className="border rounded-l px-4 py-2 w-full"
                    onKeyDown={e => e.key === 'Enter' && setBusqueda(busqueda)}
                  />
                </div>
                <div className="mb-4 space-y-2">
                  {loadingSugerencias ? (
                    <div className="text-center py-4">
                      <p>Cargando productos...</p>
                      <div className="mt-2">
                        <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                      </div>
                    </div>
                  ) : sugerencias.length > 0 ? (
                    sugerencias.map(producto => (
                      <div
                        key={producto.producto_id}
                        className={`flex items-center p-2 border rounded ${
                          seleccionados.find(p => p.producto_id === producto.producto_id)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={!!seleccionados.find(p => p.producto_id === producto.producto_id)}
                          onChange={() => {
                            if (seleccionados.find(p => p.producto_id === producto.producto_id)) {
                              setSeleccionados(prev => prev.filter(p => p.producto_id !== producto.producto_id));
                            } else {
                              setSeleccionados(prev => [...prev, producto]);
                            }
                          }}
                          className="mr-2"
                        />
                        <div className="flex items-center flex-1">
                          {producto.imagen_url && (
                            <img
                              src={`${config.backendUrl}${producto.imagen_url}`}
                              alt={producto.producto_nombre}
                              className="w-12 h-12 object-cover rounded mr-3"
                            />
                          )}
                          <div>
                            <p className="font-medium">{producto.producto_nombre}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500">
                      {busqueda.length < 2
                        ? 'Ingrese al menos 2 caracteres para buscar.'
                        : 'No se encontraron productos.'}
                    </p>
                  )}
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowSelector(false);
                      setSeleccionados([]);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={confirmarSeleccion}
                    disabled={seleccionados.length === 0}
                    className={`px-4 py-2 rounded text-white ${
                      seleccionados.length > 0
                        ? 'bg-blue-500 hover:bg-blue-600'
                        : 'bg-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Agregar {seleccionados.length > 0 && `(${seleccionados.length})`}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Descuento y costo de envío */}
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-semibold mb-1">Descuento</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="input input-bordered w-full"
                value={descuento}
                onChange={e => setDescuento(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold mb-1">Costo de Envío</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="input input-bordered w-full"
                value={costoEnvio}
                onChange={e => setCostoEnvio(e.target.value)}
              />
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
            <div className="mt-4 border-t pt-4">
              <div className="flex justify-between mb-1">
                <span className="font-medium">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="font-medium">Descuento ({descuentoPorcentaje}%)</span>
                <span>-${descuentoMonto.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="font-medium">Costo de Envío</span>
                <span>${Number(costoEnvio).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          )}

          <button
            type="button"
            className="btn btn-link"
            onClick={() => setProductosSinRegistrar(prev => ([...prev, { nombre: '', cantidad: '', precio_costo: '' }]))}
          >
            Agregar producto sin registrar
          </button>

          {error && <p className="text-error text-sm">{error}</p>}

          <button type="submit" className="btn btn-primary w-full">{pedido ? 'Guardar Cambios' : 'Crear Pedido'}</button>
        </form>
      </div>
    </div>
  );
}

export default CrearPedidoModal;
