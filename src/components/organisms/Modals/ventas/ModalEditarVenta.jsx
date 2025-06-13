import React, { useState, useEffect } from 'react';

const ModalEditarVenta = ({ isOpen, onClose, venta, onConfirm, loading = false }) => {
  const [form, setForm] = useState({
    venta_nota: '',
    venta_origen: ''
  });

  // Lista de orígenes disponibles
  const origenes = [
    { value: 'Venta Manual', label: 'Venta Manual' },
    { value: 'Redes Sociales', label: 'Redes Sociales' },
    { value: 'Whatsapp', label: 'Whatsapp' },
    { value: 'Presencial', label: 'Presencial' },
  ];

  // Inicializar el formulario cuando se abre el modal o cambia la venta
  useEffect(() => {
    if (venta) {
      setForm({
        venta_nota: venta.venta_nota || '',
        venta_origen: venta.venta_origen || ''
      });
    }
  }, [venta, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(form);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{
        background: 'rgba(30, 27, 75, 0.18)',
        backdropFilter: 'blur(3px)',
        WebkitBackdropFilter: 'blur(3px)',
      }}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-purple-800">Editar información de venta #{venta?.venta_id}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-1 font-semibold text-gray-700">Origen de la venta</label>
            <select
              name="venta_origen"
              value={form.venta_origen}
              onChange={handleChange}
              className="border border-violet-200 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
            >
              <option value="">Seleccionar origen</option>
              {origenes.map(origen => (
                <option key={origen.value} value={origen.value}>
                  {origen.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-semibold text-gray-700">Notas internas</label>
            <textarea
              name="venta_nota"
              value={form.venta_nota}
              onChange={handleChange}
              className="border border-violet-200 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
              rows="4"
              placeholder="Instrucciones especiales, observaciones, etc."
            ></textarea>
            <p className="text-xs text-gray-500 mt-1">
              Estas notas son para uso interno y no serán visibles para el cliente.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold text-gray-700 transition"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-lg font-semibold shadow transition"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Guardando...
                </div>
              ) : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalEditarVenta;