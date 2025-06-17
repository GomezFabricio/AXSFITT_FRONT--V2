import React, { useState, useEffect } from 'react';

const ModalGestionCategoria = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = { categoria_nombre: '', categoria_descripcion: '' },
  mode, 
  parentCategoriaNombre = null,
  loadingSubmit
}) => {
  const [formData, setFormData] = useState(initialData);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData, isOpen]); 

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  let modalTitle = 'Gestionar Categoría';
  if (mode === 'edit') {
    modalTitle = 'Modificar Categoría';
  } else if (mode === 'create_sub') {
    modalTitle = 'Nueva Subcategoría';
  } else {
    modalTitle = 'Nueva Categoría Padre';
  }

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out"
      style={{
        background: 'linear-gradient(rgba(30, 27, 75, 0.15), rgba(30, 27, 75, 0.25))',
        backdropFilter: 'blur(3px)',
        WebkitBackdropFilter: 'blur(3px)'
      }}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-7 border border-violet-100 transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-modal-scale-fade-in">
        <h2 className="text-2xl font-bold mb-6 text-purple-700 text-center">
          {modalTitle}
        </h2>
        {parentCategoriaNombre && mode === 'create_sub' && (
          <p className="mb-4 text-sm text-center text-gray-600">
            Subcategoría de: <strong className="text-purple-600">{parentCategoriaNombre}</strong>
          </p>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label htmlFor="categoria_nombre" className="block text-sm font-semibold text-gray-700 mb-1">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="categoria_nombre"
              id="categoria_nombre"
              value={formData.categoria_nombre}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2.5 border border-violet-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition duration-150 ease-in-out sm:text-sm"
              required
              placeholder="Ej: Indumentaria Deportiva"
            />
          </div>
          <div className="mb-8">
            <label htmlFor="categoria_descripcion" className="block text-sm font-semibold text-gray-700 mb-1">
              Descripción (Opcional)
            </label>
            <textarea
              name="categoria_descripcion"
              id="categoria_descripcion"
              value={formData.categoria_descripcion}
              onChange={handleChange}
              rows="3"
              className="mt-1 block w-full px-4 py-2.5 border border-violet-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition duration-150 ease-in-out sm:text-sm"
              placeholder="Detalles adicionales sobre la categoría"
            ></textarea>
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loadingSubmit}
              className="w-full sm:w-auto px-6 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg border border-gray-300 shadow-sm transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loadingSubmit}
              className="w-full sm:w-auto px-6 py-2.5 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loadingSubmit ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Guardando...
                </div>
              ) : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
      {/* Animación para el modal */}
      <style jsx global>{`
        @keyframes modal-scale-fade-in {
          0% {
            opacity: 0;
            transform: scale(0.95);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-modal-scale-fade-in {
          animation: modal-scale-fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ModalGestionCategoria;