import React, { useState } from 'react';
import { agregarUsuario } from '../../../api/usuariosApi';
import { useNavigate } from 'react-router-dom';
import { usuarioSchema } from '../../../validations/usuario.schema';

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
      alert('Usuario creado correctamente');
      navigate('/admin/usuarios');
    } catch (error) {
      if (error.errors) {
        alert(error.errors[0].message); // Muestra el primer error de validación
      } else {
        alert(error?.message || 'Error al crear usuario');
      }
    }
    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h2 className="text-xl font-semibold mb-4">Crear Usuario</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block mb-1">Nombre *</label>
            <input
              className="border rounded px-2 py-1 w-full"
              name="persona_nombre"
              value={form.persona_nombre}
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex-1">
            <label className="block mb-1">Apellido *</label>
            <input
              className="border rounded px-2 py-1 w-full"
              name="persona_apellido"
              value={form.persona_apellido}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block mb-1">DNI *</label>
            <input
              className="border rounded px-2 py-1 w-full"
              name="persona_dni"
              value={form.persona_dni}
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex-1">
            <label className="block mb-1">Fecha de Nacimiento</label>
            <input
              type="date"
              className="border rounded px-2 py-1 w-full"
              name="persona_fecha_nac"
              value={form.persona_fecha_nac}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block mb-1">Domicilio</label>
            <input
              className="border rounded px-2 py-1 w-full"
              name="persona_domicilio"
              value={form.persona_domicilio}
              onChange={handleChange}
            />
          </div>
          <div className="flex-1">
            <label className="block mb-1">Teléfono</label>
            <input
              className="border rounded px-2 py-1 w-full"
              name="persona_telefono"
              value={form.persona_telefono}
              onChange={handleChange}
            />
          </div>
        </div>
        <div>
          <label className="block mb-1">CUIT</label>
          <input
            className="border rounded px-2 py-1 w-full"
            name="persona_cuit"
            value={form.persona_cuit}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block mb-1">Email *</label>
          <input
            type="email"
            className="border rounded px-2 py-1 w-full"
            name="usuario_email"
            value={form.usuario_email}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className="block mb-1">Contraseña *</label>
          <input
            type="password"
            className="border rounded px-2 py-1 w-full"
            name="usuario_pass"
            value={form.usuario_pass}
            onChange={handleChange}
            required
          />
        </div>
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            className="px-4 py-2 bg-gray-300 rounded"
            onClick={() => navigate('/admin/usuarios')}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-purple-700 text-white rounded"
            disabled={loading}
          >
            {loading ? 'Creando...' : 'Crear Usuario'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CrearUsuarioPage;