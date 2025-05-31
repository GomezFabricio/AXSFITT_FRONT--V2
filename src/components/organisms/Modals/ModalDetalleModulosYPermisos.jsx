import React from 'react';

const ModalDetalleModulosYPermisos = ({ isOpen, modulos, onClose }) => {
  if (!isOpen || !modulos) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50"
      style={{
        background: 'rgba(30, 27, 75, 0.18)',
        backdropFilter: 'blur(3px)',
        WebkitBackdropFilter: 'blur(3px)'
      }}>
      <div className="bg-white rounded-xl shadow-2xl p-7 max-w-lg w-full max-h-[80vh] overflow-y-auto border border-violet-100">
        <h3 className="text-xl font-bold mb-4 text-purple-700">Módulos y Permisos</h3>
        <ul>
          {modulos.length === 0 && <li className="text-gray-500">Sin módulos</li>}
          {modulos.map((m, idx) => (
            <li key={idx} className="mb-4">
              <div className="font-semibold text-purple-700">{m.modulo_descripcion}</div>
              <ul className="ml-4 list-disc">
                {m.permisos && m.permisos.length > 0
                  ? m.permisos.map((p, i) => (
                      <li key={i} className="text-gray-700">{p.permiso_descripcion}</li>
                    ))
                  : <li className="text-gray-400">Sin permisos</li>
                }
              </ul>
            </li>
          ))}
        </ul>
        <div className="flex justify-end mt-4">
          <button
            className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded font-semibold transition"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalDetalleModulosYPermisos;