
import React, { useState, useEffect } from 'react';
// import { proveedorSchema } from '../../../../validations/proveedores.schema'; // Si tienes validación, descomenta y ajusta

const ModalModificarProveedor = ({ isOpen, onClose, proveedor, onSubmit, isSubmitting }) => {
  const [form, setForm] = useState({
    proveedor_nombre: '',
    proveedor_contacto: '',
    proveedor_email: '',
    proveedor_telefono: '',
    proveedor_direccion: '',
    proveedor_cuit: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (proveedor) {
      setForm({
        proveedor_nombre: proveedor.proveedor_nombre || '',
        proveedor_contacto: proveedor.proveedor_contacto || '',
        proveedor_email: proveedor.proveedor_email || '',
        proveedor_telefono: proveedor.proveedor_telefono || '',
        proveedor_direccion: proveedor.proveedor_direccion || '',
        proveedor_cuit: proveedor.proveedor_cuit || ''
      });
    } else {
      setForm({
        proveedor_nombre: '',
        proveedor_contacto: '',
        proveedor_email: '',
        proveedor_telefono: '',
        proveedor_direccion: '',
        proveedor_cuit: ''
      });
    }
  }, [proveedor]);

  if (!isOpen) return null;

  const handleChange = e => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Si tienes proveedorSchema, puedes agregar validación aquí
  // const validateForm = () => { ... };

  const handleSubmit = (e) => {
    e.preventDefault();
    // if (!validateForm()) return;
    onSubmit(form);
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{
        background: 'rgba(30, 27, 75, 0.18)',
        backdropFilter: 'blur(3px)',
        WebkitBackdropFilter: 'blur(3px)',
      }}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-purple-800">{proveedor ? 'Modificar Proveedor' : 'Agregar Proveedor'}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {/* {errors.form && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {errors.form}
          </div>
        )} */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block mb-1 font-semibold text-gray-700">Nombre *</label>
              <input
                className="border border-violet-200 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
                name="proveedor_nombre"
                value={form.proveedor_nombre}
                onChange={handleChange}
                required
              />
              {errors.proveedor_nombre && (
                <p className="text-red-500 text-sm mt-1">{errors.proveedor_nombre}</p>
              )}
            </div>
            <div className="flex-1">
              <label className="block mb-1 font-semibold text-gray-700">Contacto</label>
              <input
                className="border border-violet-200 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
                name="proveedor_contacto"
                value={form.proveedor_contacto}
                onChange={handleChange}
              />
              {errors.proveedor_contacto && (
                <p className="text-red-500 text-sm mt-1">{errors.proveedor_contacto}</p>
              )}
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block mb-1 font-semibold text-gray-700">Email *</label>
              <input
                className="border border-violet-200 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
                name="proveedor_email"
                type="email"
                value={form.proveedor_email}
                onChange={handleChange}
                required
                placeholder="ejemplo@correo.com"
              />
              {errors.proveedor_email && (
                <p className="text-red-500 text-sm mt-1">{errors.proveedor_email}</p>
              )}
            </div>
            <div className="flex-1">
              <label className="block mb-1 font-semibold text-gray-700">Teléfono</label>
              <input
                className="border border-violet-200 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
                name="proveedor_telefono"
                value={form.proveedor_telefono}
                onChange={handleChange}
              />
              {errors.proveedor_telefono && (
                <p className="text-red-500 text-sm mt-1">{errors.proveedor_telefono}</p>
              )}
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block mb-1 font-semibold text-gray-700">Dirección</label>
              <input
                className="border border-violet-200 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
                name="proveedor_direccion"
                value={form.proveedor_direccion}
                onChange={handleChange}
              />
              {errors.proveedor_direccion && (
                <p className="text-red-500 text-sm mt-1">{errors.proveedor_direccion}</p>
              )}
            </div>
            <div className="flex-1">
              <label className="block mb-1 font-semibold text-gray-700">CUIT</label>
              <input
                className="border border-violet-200 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
                name="proveedor_cuit"
                value={form.proveedor_cuit}
                onChange={handleChange}
              />
              {errors.proveedor_cuit && (
                <p className="text-red-500 text-sm mt-1">{errors.proveedor_cuit}</p>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold text-gray-700 transition"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-lg font-semibold shadow transition"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Guardando...' : (proveedor ? 'Guardar Cambios' : 'Agregar Proveedor')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalModificarProveedor;
