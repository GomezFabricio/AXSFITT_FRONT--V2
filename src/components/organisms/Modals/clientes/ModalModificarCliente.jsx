import React, { useState, useEffect } from 'react';
import { clienteSchema } from '../../../../validations/clientes.schema';

const ModalModificarCliente = ({ isOpen, onClose, cliente, onSubmit, isSubmitting }) => {
  const [form, setForm] = useState({
    persona_nombre: '',
    persona_apellido: '',
    persona_dni: '',
    persona_fecha_nac: '',
    persona_domicilio: '',
    persona_telefono: '',
    cliente_email: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (cliente) {
      // Formatear la fecha para que sea compatible con el input date
      let fechaNac = cliente.persona_fecha_nac ? new Date(cliente.persona_fecha_nac).toISOString().split('T')[0] : '';
      
      setForm({
        persona_nombre: cliente.persona_nombre || '',
        persona_apellido: cliente.persona_apellido || '',
        persona_dni: cliente.persona_dni || '',
        persona_fecha_nac: fechaNac,
        persona_domicilio: cliente.persona_domicilio || '',
        persona_telefono: cliente.persona_telefono || '',
        cliente_email: cliente.cliente_email || ''
      });
    }
  }, [cliente]);

  if (!isOpen) return null;

  const handleChange = e => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Borrar el error del campo cuando el usuario empieza a escribir de nuevo
    if (errors[name]) {
      setErrors(prevErrors => ({ ...prevErrors, [name]: '' }));
    }
  };

  const validateForm = () => {
    try {
      clienteSchema.parse(form);
      setErrors({});
      return true;
    } catch (error) {
      const newErrors = {};
      error.errors.forEach(err => {
        newErrors[err.path[0]] = err.message;
      });
      setErrors(newErrors);
      return false;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Enviar los datos al padre (VerClientes)
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
          <h2 className="text-xl font-bold text-purple-800">Modificar Cliente</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {errors.form && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {errors.form}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block mb-1 font-semibold text-gray-700">Nombre *</label>
              <input
                className="border border-violet-200 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
                name="persona_nombre"
                value={form.persona_nombre}
                onChange={handleChange}
                required
              />
              {errors.persona_nombre && (
                <p className="text-red-500 text-sm mt-1">{errors.persona_nombre}</p>
              )}
            </div>
            <div className="flex-1">
              <label className="block mb-1 font-semibold text-gray-700">Apellido *</label>
              <input
                className="border border-violet-200 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
                name="persona_apellido"
                value={form.persona_apellido}
                onChange={handleChange}
                required
              />
              {errors.persona_apellido && (
                <p className="text-red-500 text-sm mt-1">{errors.persona_apellido}</p>
              )}
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block mb-1 font-semibold text-gray-700">DNI *</label>
              <input
                className="border border-violet-200 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
                name="persona_dni"
                value={form.persona_dni}
                onChange={handleChange}
                required
              />
              {errors.persona_dni && (
                <p className="text-red-500 text-sm mt-1">{errors.persona_dni}</p>
              )}
            </div>
            <div className="flex-1">
              <label className="block mb-1 font-semibold text-gray-700">Fecha de Nacimiento</label>
              <input
                type="date"
                className="border border-violet-200 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
                name="persona_fecha_nac"
                value={form.persona_fecha_nac}
                onChange={handleChange}
              />
              {errors.persona_fecha_nac && (
                <p className="text-red-500 text-sm mt-1">{errors.persona_fecha_nac}</p>
              )}
            </div>
          </div>
          
          <div>
            <label className="block mb-1 font-semibold text-gray-700">Email *</label>
            <input
              className="border border-violet-200 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
              name="cliente_email"
              type="email"
              value={form.cliente_email}
              onChange={handleChange}
              required
              placeholder="ejemplo@correo.com"
            />
            {errors.cliente_email && (
              <p className="text-red-500 text-sm mt-1">{errors.cliente_email}</p>
            )}
          </div>
          
          <div>
            <label className="block mb-1 font-semibold text-gray-700">Teléfono *</label>
            <input
              className="border border-violet-200 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
              name="persona_telefono"
              value={form.persona_telefono}
              onChange={handleChange}
              required
              placeholder="10 dígitos"
            />
            {errors.persona_telefono && (
              <p className="text-red-500 text-sm mt-1">{errors.persona_telefono}</p>
            )}
          </div>
          
          <div>
            <label className="block mb-1 font-semibold text-gray-700">Domicilio</label>
            <input
              className="border border-violet-200 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
              name="persona_domicilio"
              value={form.persona_domicilio}
              onChange={handleChange}
            />
            {errors.persona_domicilio && (
              <p className="text-red-500 text-sm mt-1">{errors.persona_domicilio}</p>
            )}
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
              {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalModificarCliente;