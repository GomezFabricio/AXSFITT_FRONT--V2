import React, { useState } from 'react';
import { agregarUsuario } from '../../../api/usuariosApi';
import { useNavigate } from 'react-router-dom';
import { usuarioSchema } from '../../../validations/usuario.schema';
import ModalMensaje from '../../../components/organisms/Modals/ModalMensaje';

const CrearUsuarioPage = () => {
  const [form, setForm] = useState({
    persona_nombre: '',
    persona_apellido: '',
    persona_dni: '',
    persona_fecha_nac: '',
    persona_domicilio: '',
    persona_telefono: '',
    persona_cuit: '',
    usuario_email: '',
    usuario_pass: ''
  });
  const [loading, setLoading] = useState(false);
  const [modalMensajeOpen, setModalMensajeOpen] = useState(false);
  const [mensajeModal, setMensajeModal] = useState({ tipo: 'error', mensaje: '' });
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      usuarioSchema.parse(form); // Valida con Zod
      setLoading(true);
      const token = sessionStorage.getItem('token');
      await agregarUsuario(form, token);
      
      setMensajeModal({
        tipo: 'exito',
        mensaje: 'Usuario creado correctamente'
      });
      setModalMensajeOpen(true);
      
      // Navegar después de mostrar el mensaje
      setTimeout(() => {
        navigate('/admin/usuarios');
      }, 2000);
    } catch (error) {
      if (error.errors) {
        setMensajeModal({
          tipo: 'error',
          mensaje: error.errors[0].message
        });
      } else {
        setMensajeModal({
          tipo: 'error',
          mensaje: error?.message || 'Error al crear usuario'
        });
      }
      setModalMensajeOpen(true);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl border border-violet-100 p-8">
        <h2 className="text-2xl font-bold mb-6 text-purple-800 text-center">Crear Usuario</h2>
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
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block mb-1 font-semibold text-gray-700">Domicilio</label>
              <input
                className="border border-violet-200 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
                name="persona_domicilio"
                value={form.persona_domicilio}
                onChange={handleChange}
                placeholder="Domicilio"
              />
            </div>
            <div className="flex-1">
              <label className="block mb-1 font-semibold text-gray-700">Teléfono</label>
              <input
                className="border border-violet-200 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
                name="persona_telefono"
                value={form.persona_telefono}
                onChange={handleChange}
                placeholder="Teléfono"
              />
            </div>
          </div>
          <div>
            <label className="block mb-1 font-semibold text-gray-700">CUIT</label>
            <input
              className="border border-violet-200 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
              name="persona_cuit"
              value={form.persona_cuit}
              onChange={handleChange}
              placeholder="CUIT"
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold text-gray-700">Email *</label>
            <input
              type="email"
              className="border border-violet-200 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
              name="usuario_email"
              value={form.usuario_email}
              onChange={handleChange}
              required
              placeholder="Email"
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold text-gray-700">Contraseña *</label>
            <input
              type="password"
              className="border border-violet-200 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
              name="usuario_pass"
              value={form.usuario_pass}
              onChange={handleChange}
              required
              placeholder="Contraseña"
            />
          </div>
          <div className="flex gap-2 justify-end mt-4">
            <button
              type="button"
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold text-gray-700 transition"
              onClick={() => navigate('/admin/usuarios')}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-lg font-semibold shadow transition"
              disabled={loading}
            >
              {loading ? 'Creando...' : 'Crear Usuario'}
            </button>
          </div>
        </form>
      </div>
      
      <ModalMensaje
        isOpen={modalMensajeOpen}
        onClose={() => setModalMensajeOpen(false)}
        tipo={mensajeModal.tipo}
        mensaje={mensajeModal.mensaje}
      />
    </div>
  );
};

export default CrearUsuarioPage;