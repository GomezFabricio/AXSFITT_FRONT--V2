import React from 'react';

const ModalEliminar = ({ isOpen, onClose, onConfirm, nombreEntidad = 'elemento' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50"
      style={{
        background: 'rgba(30, 27, 75, 0.18)',
        backdropFilter: 'blur(3px)',
        WebkitBackdropFilter: 'blur(3px)'
      }}>
      <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-7 border border-red-100">
        <h2 className="text-xl font-bold mb-3 text-red-700 flex items-center gap-2">
          <svg width="24" height="24" fill="none" className="inline-block"><circle cx="12" cy="12" r="10" fill="#fee2e2"/><path d="M8 8l8 8M16 8l-8 8" stroke="#dc2626" strokeWidth="2" strokeLinecap="round"/></svg>
          ¿Estás seguro?
        </h2>
        <p className="text-gray-700 mb-6">Esta acción eliminará el <b>{nombreEntidad}</b> de forma permanente.</p>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition">Cancelar</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white font-semibold transition">Eliminar</button>
        </div>
      </div>
    </div>
  );
};

export default ModalEliminar;