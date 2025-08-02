import React from "react";

const DetallePedidoModal = ({ open, onClose, pedido }) => {
  if (!open || !pedido) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative">
        <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={onClose}>
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-4">Detalle del Pedido #{pedido.pedido_id}</h2>
        <div className="mb-2 text-sm text-gray-700">
          <div><b>Proveedor:</b> {pedido.proveedor_nombre}</div>
          <div><b>Usuario:</b> {pedido.persona_nombre} {pedido.persona_apellido}</div>
          <div><b>Fecha:</b> {new Date(pedido.pedido_fecha_pedido).toLocaleString()}</div>
          <div><b>Estado:</b> {pedido.pedido_estado}</div>
          <div><b>Entrega esperada:</b> {pedido.pedido_fecha_esperada_entrega || '-'}</div>
        </div>
        <hr className="my-3" />
        <h3 className="font-semibold mb-2">Productos</h3>
        <table className="w-full text-sm mb-4">
          <thead>
            <tr className="bg-gray-100 text-center">
              <th className="p-1">Producto</th>
              <th className="p-1">Variante</th>
              <th className="p-1">Cantidad</th>
              <th className="p-1">Precio Unitario</th>
              <th className="p-1">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {pedido.items.map(item => (
              <tr key={item.pd_id} className="text-center">
                <td className="p-1 text-center">{item.producto_nombre || '-'}</td>
                <td className="p-1 text-center">{item.variante_atributos || '-'}</td>
                <td className="p-1 text-center">{item.pd_cantidad_pedida}</td>
                <td className="p-1 text-center">${Number(item.pd_precio_unitario).toFixed(2)}</td>
                <td className="p-1 text-center">${Number(item.pd_subtotal || item.pd_precio_unitario * item.pd_cantidad_pedida).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Sección de productos sin registrar */}
        {pedido.productosSinRegistrar && pedido.productosSinRegistrar.length > 0 && (
          <div className="mt-6">
            <h4 className="font-semibold mb-2 text-yellow-700">Productos sin registrar:</h4>
            <table className="w-full text-sm mb-2">
              <thead>
                <tr className="bg-yellow-100 text-center">
                  <th className="p-1">Nombre</th>
                  <th className="p-1">Cantidad</th>
                  <th className="p-1">Precio Unitario</th>
                  <th className="p-1">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {pedido.productosSinRegistrar.map(item => (
                  <tr key={item.pd_id} className="bg-yellow-50 text-center">
                    <td className="p-1 text-center">{item.nombre} <span className="italic text-xs">(Sin registrar)</span></td>
                    <td className="p-1 text-center">{item.pd_cantidad_pedida}</td>
                    <td className="p-1 text-center">${Number(item.pd_precio_unitario).toFixed(2)}</td>
                    <td className="p-1 text-center">${Number(item.pd_subtotal || item.pd_precio_unitario * item.pd_cantidad_pedida).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex flex-col items-end gap-1 text-sm">
          <div><b>Subtotal:</b> ${Number(pedido.subtotal).toFixed(2)}</div>
          <div><b>Descuento:</b> {Number(pedido.descuento).toFixed(2)}% (-${Number(pedido.descuentoCalculado || 0).toFixed(2)})</div>
          <div><b>Costo de envío:</b> +${Number(pedido.costo_envio).toFixed(2)}</div>
          <div className="text-lg font-bold mt-2"><b>Total:</b> ${Number(pedido.total).toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
};

export default DetallePedidoModal;
