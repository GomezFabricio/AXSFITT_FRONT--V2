import React, { useState, useEffect } from 'react';

const ModalEditarModulo = ({ isOpen, onClose, modulo, onActualizar }) => {
  const [nombre, setNombre] = useState('');

  useEffect(() => {
    if (modulo) setNombre(modulo.modulo_descripcion ?? modulo.nombre ?? '');
  }, [modulo]);

  if (!isOpen || !modulo) return null;

  const handleSubmit = async () => {
    await onActualizar(nombre);
    // El cierre del modal lo maneja la función onActualizar en la página
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50"
      style={{
        background: 'rgba(30, 27, 75, 0.18)',
        backdropFilter: 'blur(3px)',
        WebkitBackdropFilter: 'blur(3px)'
      }}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-7 border border-violet-100">
        <h2 className="text-xl font-bold mb-4 text-purple-700">Editar Módulo</h2>
        <input
          className="w-full p-3 border border-violet-200 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre del módulo"
        />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 font-semibold transition">Cancelar</button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded font-semibold transition">Guardar</button>
        </div>
      </div>
    </div>
  );
};

export default ModalEditarModulo;