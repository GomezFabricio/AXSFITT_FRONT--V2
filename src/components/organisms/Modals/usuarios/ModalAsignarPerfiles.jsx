import React from 'react';

const ModalAsignarPerfiles = ({
  isOpen,
  onClose,
  onGuardar,
  usuario,
  perfiles,
  perfilesSeleccionados,
  onAddPerfil,
  onRemovePerfil
}) => {
  if (!isOpen || !usuario) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50"
      style={{
        background: 'rgba(30, 27, 75, 0.18)',
        backdropFilter: 'blur(3px)',
        WebkitBackdropFilter: 'blur(3px)'
      }}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-7 border border-violet-100">
        <h3 className="text-xl font-bold mb-4 text-purple-700">
          Asignar Perfiles a {usuario.persona_nombre} {usuario.persona_apellido}
        </h3>
        <div className="mb-4">
          {perfiles
            .filter(p => perfilesSeleccionados.includes(p.perfil_id))
            .map(p => (
              <span key={p.perfil_id} className="inline-block bg-purple-100 text-purple-700 rounded-full px-3 py-1 mr-2 mb-2 font-medium">
                {p.perfil_descripcion}
                <button
                  className="ml-2 text-purple-500 hover:text-purple-800 font-bold"
                  onClick={() => onRemovePerfil(p.perfil_id)}
                  title="Quitar"
                >×</button>
              </span>
            ))}
        </div>
        <select
          className="w-full mb-4 border border-violet-200 rounded px-2 py-2"
          onChange={onAddPerfil}
          value=""
        >
          <option value="">Agregar perfil...</option>
          {perfiles
            .filter(p => !perfilesSeleccionados.includes(p.perfil_id))
            .map(p => (
              <option key={p.perfil_id} value={p.perfil_id}>{p.perfil_descripcion}</option>
            ))}
        </select>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 font-semibold transition"
          >
            Cancelar
          </button>
          <button
            onClick={onGuardar}
            className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded font-semibold transition"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalAsignarPerfiles;