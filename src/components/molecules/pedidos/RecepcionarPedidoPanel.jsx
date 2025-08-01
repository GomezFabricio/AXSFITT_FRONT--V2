import React from 'react';

// Panel lateral para gestionar la recepción de un pedido seleccionado
const RecepcionarPedidoPanel = ({ pedido, onRecepcionar, onClose }) => {
  // TODO: Inputs para cantidades y precios recibidos, validaciones
  if (!pedido) return null;
  return (
    <div className="fixed right-0 top-0 w-full max-w-md h-full bg-white shadow-lg z-50 p-6 overflow-y-auto">
      <button className="absolute top-2 right-2 btn btn-xs btn-ghost" onClick={onClose}>✕</button>
      <h2 className="text-lg font-bold mb-4">Recepcionar Pedido #{pedido.id}</h2>
      {/* Listado de productos y campos para cantidades/precios recibidos */}
      <form onSubmit={e => { e.preventDefault(); onRecepcionar(pedido); }}>
        {/* TODO: Renderizar productos del pedido con inputs */}
        <div className="my-4">(Aquí van los productos y campos de recepción)</div>
        <button type="submit" className="btn btn-success w-full">Confirmar Recepción</button>
      </form>
    </div>
  );
};

export default RecepcionarPedidoPanel;
