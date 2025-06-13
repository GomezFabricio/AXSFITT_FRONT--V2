import React, { useState } from 'react';
import { crearCliente } from '../../../api/clientesApi';
import { useNavigate } from 'react-router-dom';
import { clienteSchema } from '../../../validations/clientes.schema';
import ModalMensaje from '../../../components/organisms/Modals/ModalMensaje';

const CrearClientePage = () => {
  const [form, setForm] = useState({
    persona_nombre: '',
    persona_apellido: '',
    persona_dni: '',
    persona_fecha_nac: '',
    persona_domicilio: '',
    persona_telefono: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalInfo, setModalInfo] = useState({ tipo: 'exito', mensaje: '' });
  const navigate = useNavigate();

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

  const handleSubmit = async e => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const token = sessionStorage.getItem('token');
      await crearCliente(form, token);
      
      // Mostrar modal de éxito
      setModalInfo({
        tipo: 'exito',
        mensaje: 'Cliente creado exitosamente.'
      });
      setShowModal(true);
      
      // No navegamos inmediatamente, esperamos a que el usuario cierre el modal
    } catch (error) {
      setModalInfo({
        tipo: 'error',
        mensaje: error?.message || 'Error al crear el cliente.'
      });
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    // Si fue un éxito, navegar a la lista de clientes
    if (modalInfo.tipo === 'exito') {
      navigate('/ventas/clientes');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl border border-violet-100 p-8">
        <h2 className="text-2xl font-bold mb-6 text-purple-800 text-center">Crear Cliente</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block mb-1 font-semibold text-gray-700">Nombre *</label>
              <input
                className="border border-violet-200 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
                name="persona_nombre"
                value={form.persona_nombre}
                onChange={handleChange}
                required
                placeholder="Nombre"
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
                placeholder="Apellido"
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
                placeholder="DNI"
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
            <label className="block mb-1 font-semibold text-gray-700">Domicilio</label>
            <input
              className="border border-violet-200 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
              name="persona_domicilio"
              value={form.persona_domicilio}
              onChange={handleChange}
              placeholder="Domicilio"
            />
            {errors.persona_domicilio && (
              <p className="text-red-500 text-sm mt-1">{errors.persona_domicilio}</p>
            )}
          </div>
          <div>
            <label className="block mb-1 font-semibold text-gray-700">Teléfono</label>
            <input
              className="border border-violet-200 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
              name="persona_telefono"
              value={form.persona_telefono}
              onChange={handleChange}
              placeholder="Teléfono (10 dígitos)"
            />
            {errors.persona_telefono && (
              <p className="text-red-500 text-sm mt-1">{errors.persona_telefono}</p>
            )}
          </div>
          <div className="flex gap-2 justify-end mt-4">
            <button
              type="button"
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold text-gray-700 transition"
              onClick={() => navigate('/ventas/clientes')}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-lg font-semibold shadow transition"
              disabled={loading}
            >
              {loading ? 'Creando...' : 'Crear Cliente'}
            </button>
          </div>
        </form>
      </div>

      {/* Modal de mensaje de éxito o error */}
      <ModalMensaje
        isOpen={showModal}
        onClose={handleCloseModal}
        tipo={modalInfo.tipo}
        mensaje={modalInfo.mensaje}
      />
    </div>
  );
};

export default CrearClientePage;