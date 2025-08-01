import React from 'react';

// Modal para precargar producto sin registrar
const PrecargarProductoModal = ({ open, onClose, onSubmit }) => {
  if (!open) return null;
  // TODO: Formulario para nombre, categoría, precio, stock inicial
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <button className="absolute top-2 right-2 btn btn-xs btn-ghost" onClick={onClose}>✕</button>
        <h2 className="text-lg font-bold mb-4">Agregar Producto Sin Registrar</h2>
        <form onSubmit={e => { e.preventDefault(); onSubmit(); }}>
          {/* TODO: Inputs para nombre, categoría, precio, stock inicial */}
          <div className="my-4">(Aquí va el formulario de producto sin registrar)</div>
          <button type="submit" className="btn btn-primary w-full mt-4">Guardar Producto</button>
        </form>
      </div>
    </div>
  );
};

export default PrecargarProductoModal;
