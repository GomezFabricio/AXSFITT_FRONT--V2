import React from 'react';

const ModalMensaje = ({ isOpen, onClose, tipo = 'error', mensaje }) => {
  if (!isOpen) return null;

  const estilos = {
    error: {
      color: 'text-red-700',
      bg: 'bg-red-100',
      icon: (
        <svg width="24" height="24" fill="none" className="inline-block">
          <circle cx="12" cy="12" r="10" fill="#fee2e2" />
          <path d="M8 8l8 8M16 8l-8 8" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
    },
    exito: {
      color: 'text-green-700',
      bg: 'bg-green-100',
      icon: (
        <svg width="24" height="24" fill="none" className="inline-block">
          <circle cx="12" cy="12" r="10" fill="#d1fae5" />
          <path d="M9 12l2 2 4-4" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
    },
  };

  const estiloActual = estilos[tipo];

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{
        background: 'rgba(30, 27, 75, 0.18)',
        backdropFilter: 'blur(3px)',
        WebkitBackdropFilter: 'blur(3px)',
      }}
    >
      <div className={`bg-white rounded-xl shadow-2xl max-w-sm w-full p-7 border ${estiloActual.bg}`}>
        <h2 className={`text-xl font-bold mb-3 flex items-center gap-2 ${estiloActual.color}`}>
          {estiloActual.icon}
          {tipo === 'error' ? 'Ha ocurrido un error' : 'Operación exitosa'}
        </h2>
        <p className="text-gray-700 mb-6">{mensaje}</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalMensaje;