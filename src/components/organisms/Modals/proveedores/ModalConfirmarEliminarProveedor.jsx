import React from 'react';

const ModalConfirmarEliminarProveedor = ({ isOpen, onClose, onConfirm, loading }) => {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{
        background: 'rgba(30, 27, 75, 0.18)',
        backdropFilter: 'blur(3px)',
        WebkitBackdropFilter: 'blur(3px)'
      }}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-7 border border-violet-200">
        <h2 className="text-xl font-bold mb-3 flex items-center gap-2 text-violet-700">
          <svg width="24" height="24" fill="none" className="inline-block">
            <circle cx="12" cy="12" r="10" fill="#ede9fe" />
            <path d="M12 8v4m0 4h.01" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Confirmar acción
        </h2>
        <p className="text-gray-700 mb-6">¿Está seguro que desea eliminar este proveedor?</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded bg-purple-700 hover:bg-purple-800 text-white font-semibold transition"
            disabled={loading}
          >
            {loading ? 'Eliminando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalConfirmarEliminarProveedor;
