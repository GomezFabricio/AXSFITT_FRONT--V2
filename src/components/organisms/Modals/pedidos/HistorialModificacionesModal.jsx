import React from 'react';

// Modal para ver historial de modificaciones de un pedido
const HistorialModificacionesModal = ({ open, onClose, historial }) => {
  if (!open) return null;
  // TODO: Renderizar lista de modificaciones con fecha, usuario, motivo/cambio
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
        <button className="absolute top-2 right-2 btn btn-xs btn-ghost" onClick={onClose}>✕</button>
        <h2 className="text-lg font-bold mb-4">Historial de Modificaciones</h2>
        <div className="my-4">
          {/* TODO: Renderizar historial */}
          {(!historial || historial.length === 0) ? (
            <div className="text-gray-500">Sin modificaciones registradas.</div>
          ) : (
            <ul className="space-y-2">
              {historial.map((mod, idx) => (
                <li key={idx} className="border-b pb-2">
                  <div><b>Fecha:</b> {mod.fecha}</div>
                  <div><b>Usuario:</b> {mod.usuario}</div>
                  <div><b>Cambio:</b> {mod.cambio}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistorialModificacionesModal;
