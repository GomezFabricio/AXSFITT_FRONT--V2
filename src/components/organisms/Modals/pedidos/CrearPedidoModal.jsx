import React from 'react';
import useProveedores from '../../../../hooks/useProveedores';
import useCrearPedido from '../../../../hooks/useCrearPedido';
import config from '../../../../config/config';


const CrearPedidoModal = ({ open, onClose, onSubmit, pedido, onPrecargarProducto }) => {
  const { proveedores, cargarProveedores } = useProveedores();
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
  } = useCrearPedido(pedido, cargarProveedores);

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
                  return (
                    <li key={p.uniqueId || idx} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md">
                      <div className="flex items-center gap-2">
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
                        {/* Selector de variante si hay */}
                        {detallesStock?.variantes?.length > 0 && (
                          <select
                            className="ml-2 select select-bordered select-xs"
                            value={varianteId}
                            onChange={e => setProductoDetalles(prev => ({
                              ...prev,
                              [p.uniqueId]: {
                                ...prev[p.uniqueId],
                                varianteId: e.target.value
                              }
                            }))}
                          >
                            {detallesStock.variantes.map(v => (
                              <option key={v.variante_id} value={v.variante_id}>
                                {v.atributos || 'Variante'}
                              </option>
                            ))}
                          </select>
                        )}
                        {/* Input para precio de costo y cantidad a pedir */}
                        <label className="ml-2 text-xs text-gray-600">Precio costo:</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="input input-bordered input-xs w-20 ml-1"
                          value={det.precio_costo ?? ''}
                          onChange={e => setProductoDetalles(prev => ({
                            ...prev,
                            [p.uniqueId]: {
                              ...prev[p.uniqueId],
                              precio_costo: e.target.value
                            }
                          }))}
                        />
                        <label className="ml-2 text-xs text-gray-600">Cantidad a pedir:</label>
                        <input
                          type="number"
                          min="1"
                          required
                          className="input input-bordered input-xs w-16 ml-1"
                          value={cantidad === undefined ? '' : cantidad}
                          onChange={e => setProductoDetalles(prev => ({
                            ...prev,
                            [p.uniqueId]: {
                              ...prev[p.uniqueId],
                              cantidad: e.target.value === '' ? undefined : Number(e.target.value)
                            }
                          }))}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Campo de cantidad duplicado eliminado, ya está arriba */}
                        <button type="button" className="btn btn-xs btn-error" onClick={() => quitarProducto(idx)}>Quitar</button>
                      </div>
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
                {productosSinRegistrar.map((p, idx) => (
                  <li key={idx} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md">
                    <span>{p.nombre} (x{p.cantidad})</span>
                    <button type="button" className="btn btn-xs btn-error" onClick={() => quitarProductoSinRegistrar(idx)}>Quitar</button>
                  </li>
                ))}
              </ul>
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

          <button type="button" className="btn btn-link" onClick={onPrecargarProducto}>Agregar producto sin registrar</button>

          {error && <p className="text-error text-sm">{error}</p>}

          <button type="submit" className="btn btn-primary w-full">{pedido ? 'Guardar Cambios' : 'Crear Pedido'}</button>
        </form>
      </div>
    </div>
  );
}

export default CrearPedidoModal;
