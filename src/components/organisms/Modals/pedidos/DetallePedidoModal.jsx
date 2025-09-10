import React from "react";

const DetallePedidoModal = ({ open, onClose, pedido }) => {
  if (!open || !pedido) return null;

  // Función para formatear atributos de variantes
  const formatearAtributos = (atributos) => {
    if (!atributos) return '-';
    
    // Si es un string simple, devolverlo directamente (para variante_atributos)
    if (typeof atributos === 'string') {
      return atributos;
    }
    
    // Si es un array (como vb_atributos del backend)
    if (Array.isArray(atributos)) {
      return atributos
        .map(attr => `${attr.atributo_nombre}: ${attr.valor_nombre}`)
        .join(', ');
    }
    
    // Si es un objeto plano
    if (typeof atributos === 'object' && atributos !== null) {
      // Si tiene la estructura específica de pbp_atributos
      if (atributos.atributos && Array.isArray(atributos.atributos)) {
        return atributos.atributos
          .map(attr => attr.atributo_nombre || attr.nombre || Object.values(attr)[0])
          .join(', ');
      }
      
      // Para objetos planos (key-value)
      return Object.entries(atributos)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
    }
    
    return '-';
  };

  // Agrupar productos por nombre para mostrar variantes debajo de cada producto
  const agruparProductos = () => {
    const grupos = new Map();

    // 1. Productos registrados (items)
    pedido.items?.forEach(item => {
      const nombreProducto = item.producto_nombre || 'Producto sin nombre';
      if (!grupos.has(nombreProducto)) {
        grupos.set(nombreProducto, {
          nombre: nombreProducto,
          tipo: 'registrado',
          variantes: [],
          productoBase: null
        });
      }
      
      const grupo = grupos.get(nombreProducto);
      grupo.variantes.push({
        ...item,
        tipo: 'registrada',
        atributos: item.variante_atributos,
        cantidad: item.pd_cantidad_pedida,
        precio: item.pd_precio_unitario,
        subtotal: item.pd_subtotal || (item.pd_precio_unitario * item.pd_cantidad_pedida)
      });
    });

    // 2. Variantes borrador (nuevas variantes de productos existentes)
    pedido.variantesBorrador?.forEach(variante => {
      const nombreProducto = variante.producto_nombre || 'Producto sin nombre';
      if (!grupos.has(nombreProducto)) {
        grupos.set(nombreProducto, {
          nombre: nombreProducto,
          tipo: 'registrado',
          variantes: [],
          productoBase: null
        });
      }
      
      const grupo = grupos.get(nombreProducto);
      grupo.variantes.push({
        ...variante,
        tipo: 'borrador',
        atributos: variante.vb_atributos,
        cantidad: variante.vb_cantidad || 0,
        precio: variante.vb_precio_unitario || 0,
        subtotal: (Number(variante.vb_precio_unitario) || 0) * (Number(variante.vb_cantidad) || 0)
      });
    });

    // 3. Productos borrador (productos completamente nuevos)
    pedido.productosBorrador?.forEach(producto => {
      const nombreProducto = producto.pbp_nombre || 'Producto sin nombre';
      
      // Las variantes ya vienen parseadas desde el backend
      const variantesInternas = Array.isArray(producto.pbp_variantes) ? producto.pbp_variantes : [];
      
      grupos.set(`${nombreProducto}_borrador_${producto.pbp_id}`, {
        nombre: nombreProducto,
        tipo: 'borrador',
        variantes: [],
        productoBase: {
          ...producto,
          cantidad: producto.pbp_cantidad || 0,
          precio: producto.pbp_precio_unitario || 0,
          subtotal: producto.pbp_subtotal || (Number(producto.pbp_precio_unitario || 0) * Number(producto.pbp_cantidad || 0)),
          atributos: producto.pbp_atributos,
          variantes_internas: variantesInternas
        }
      });
    });

    return Array.from(grupos.values());
  };

  const productosAgrupados = agruparProductos();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 relative m-4">
        <button 
          className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-full text-xl w-8 h-8 flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg font-bold" 
          onClick={onClose}
        >
          ×
        </button>
        
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Detalle del Pedido #{pedido.pedido_id}</h2>
        
        {/* Información básica del pedido */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg mb-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div><b>Proveedor:</b> {pedido.proveedor_nombre}</div>
            <div><b>Usuario:</b> {pedido.persona_nombre} {pedido.persona_apellido}</div>
            <div><b>Fecha:</b> {new Date(pedido.pedido_fecha_pedido).toLocaleString()}</div>
            <div><b>Estado:</b> 
              <span className={`ml-2 px-2 py-1 rounded text-xs ${
                pedido.pedido_estado === 'pendiente' ? 'bg-yellow-200 text-yellow-800' :
                pedido.pedido_estado === 'recibido' ? 'bg-green-200 text-green-800' :
                'bg-gray-200 text-gray-800'
              }`}>
                {pedido.pedido_estado}
              </span>
            </div>
            <div><b>Entrega esperada:</b> {pedido.pedido_fecha_esperada_entrega ? new Date(pedido.pedido_fecha_esperada_entrega).toLocaleDateString() : '-'}</div>
          </div>
        </div>

        <hr className="my-4" />
        
        {/* Productos agrupados */}
        <h3 className="font-semibold mb-4 text-lg">Detalle de Productos</h3>
        
        {productosAgrupados && productosAgrupados.length > 0 ? (
          productosAgrupados.map((grupo, index) => (
          <div key={index} className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
            {/* Encabezado del producto */}
            <div className={`px-4 py-3 font-semibold ${
              grupo.tipo === 'borrador' 
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white' 
                : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
            }`}>
              <div className="flex justify-between items-center">
                <span>{grupo.nombre}</span>
                <span className="text-xs bg-black bg-opacity-20 px-2 py-1 rounded text-white font-medium">
                  {grupo.tipo === 'borrador' ? 'Producto Nuevo' : 'Producto Registrado'}
                </span>
              </div>
            </div>

            {/* Contenido del producto */}
            <div className="p-4">
              {/* Si es un producto borrador, mostrar información base */}
              {grupo.productoBase && (
                <div className="mb-4">
                  {(() => {
                    // Las variantes ya vienen parseadas desde el backend
                    const variantesInternas = Array.isArray(grupo.productoBase.variantes_internas) 
                      ? grupo.productoBase.variantes_internas 
                      : [];
                    
                    return variantesInternas.length > 0 ? (
                      <div>
                        <h5 className="font-medium mb-2 text-gray-700">Variantes del producto:</h5>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-orange-100">
                                <th className="p-2 text-left">Atributos</th>
                                <th className="p-2 text-center">Cantidad</th>
                                <th className="p-2 text-center">Precio Unitario</th>
                                <th className="p-2 text-center">Subtotal</th>
                              </tr>
                            </thead>
                            <tbody>
                              {variantesInternas.map((variante, vIndex) => {
                                // Formatear los atributos de cada variante
                                const atributosFormateados = Object.entries(variante)
                                  .filter(([key]) => key !== 'cantidad' && key !== 'precio')
                                  .map(([key, value]) => `${key}: ${value}`)
                                  .join(', ');

                                return (
                                  <tr key={vIndex} className="border-b border-orange-200">
                                    <td className="p-2">{atributosFormateados || '-'}</td>
                                    <td className="p-2 text-center">{variante.cantidad || 0}</td>
                                    <td className="p-2 text-center">${Number(variante.precio || 0).toFixed(2)}</td>
                                    <td className="p-2 text-center">${Number((variante.precio || 0) * (variante.cantidad || 0)).toFixed(2)}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-orange-50 p-3 rounded">
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-sm">
                          <div><b>Atributos:</b> {formatearAtributos(grupo.productoBase.atributos)}</div>
                          <div><b>Cantidad:</b> {grupo.productoBase.cantidad || 0}</div>
                          <div><b>Precio:</b> ${Number(grupo.productoBase.precio || 0).toFixed(2)}</div>
                          <div><b>Subtotal:</b> ${Number(grupo.productoBase.subtotal || 0).toFixed(2)}</div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Variantes del producto (registradas y borrador) */}
              {grupo.variantes.length > 0 && (
                <div>
                  <h5 className="font-medium mb-2 text-gray-700">
                    {grupo.productoBase ? 'Variantes adicionales:' : 'Variantes:'}
                  </h5>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="p-2 text-left">Tipo</th>
                          <th className="p-2 text-left">Atributos</th>
                          <th className="p-2 text-center">Cantidad</th>
                          <th className="p-2 text-center">Precio Unitario</th>
                          <th className="p-2 text-center">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {grupo.variantes.map((variante, vIndex) => (
                          <tr key={vIndex} className="border-b border-gray-200">
                            <td className="p-2">
                              <span className={`px-2 py-1 rounded text-xs ${
                                variante.tipo === 'borrador' 
                                  ? 'bg-yellow-200 text-yellow-800' 
                                  : 'bg-green-200 text-green-800'
                              }`}>
                                {variante.tipo === 'borrador' ? 'Nueva' : 'Registrada'}
                              </span>
                            </td>
                            <td className="p-2">{formatearAtributos(variante.atributos)}</td>
                            <td className="p-2 text-center">{variante.cantidad}</td>
                            <td className="p-2 text-center">${Number(variante.precio || 0).toFixed(2)}</td>
                            <td className="p-2 text-center">${Number(variante.subtotal || 0).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No hay productos en este pedido.</p>
          </div>
        )}

        {/* Resumen de totales */}
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
          <div className="flex flex-col items-end gap-2 text-sm">
            <div className="text-gray-700"><b>Subtotal:</b> ${Number(pedido.subtotal || 0).toFixed(2)}</div>
            <div className="text-orange-600"><b>Descuento:</b> {Number(pedido.descuento || 0).toFixed(2)}% (-${Number(pedido.descuentoCalculado || 0).toFixed(2)})</div>
            <div className="text-green-600"><b>Costo de envío:</b> +${Number(pedido.costo_envio || 0).toFixed(2)}</div>
            <div className="text-xl font-bold mt-2 pt-2 border-t border-blue-300 text-blue-800">
              <b>Total:</b> ${Number(pedido.total || 0).toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetallePedidoModal;
