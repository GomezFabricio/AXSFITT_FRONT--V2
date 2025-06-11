import React, { useEffect, useState } from 'react';
import Table from '../../../components/molecules/Table';
import { getUsuarios, updatePerfilesUsuario } from '../../../api/usuariosApi';
import { getPerfiles } from '../../../api/perfilesApi';
import ModalAsignarPerfiles from '../../../components/organisms/Modals/ModalAsignarPerfiles';
import tienePermiso from '../../../utils/tienePermiso'; 

const UsuariosPage = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [perfiles, setPerfiles] = useState([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [perfilesSeleccionados, setPerfilesSeleccionados] = useState([]);

  // Recargar usuarios
  const reloadUsuarios = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      const data = await getUsuarios(token);
      setUsuarios(data);
    } catch (error) {
      // Maneja el error
    } finally {
      setLoading(false);
    }
  };

  // Cargar usuarios al montar
  useEffect(() => {
    reloadUsuarios();
  }, []);

  // Abrir modal y cargar perfiles
  const handleAsignarPerfil = async (usuario) => {
    setUsuarioSeleccionado(usuario);
    setPerfilesSeleccionados(usuario.perfiles.map(p => p.perfil_id));
    const token = sessionStorage.getItem('token');
    const perfilesData = await getPerfiles(token);
    setPerfiles(perfilesData);
    setModalOpen(true);
  };

  // Guardar cambios
  const handleGuardarPerfiles = async () => {
    const token = sessionStorage.getItem('token');
    await updatePerfilesUsuario(usuarioSeleccionado.usuario_id, perfilesSeleccionados, token);
    setModalOpen(false);
    reloadUsuarios();
  };

  // Quitar perfil
  const handleRemovePerfil = (perfil_id) => {
    setPerfilesSeleccionados(perfilesSeleccionados.filter(id => id !== perfil_id));
  };

  // Agregar perfil
  const handleAddPerfil = (e) => {
    const id = parseInt(e.target.value);
    if (id && !perfilesSeleccionados.includes(id)) {
      setPerfilesSeleccionados([...perfilesSeleccionados, id]);
    }
  };

  const columns = [
    { title: 'ID', data: 'usuario_id' },
    { title: 'Nombre', data: 'persona_nombre' },
    { title: 'Apellido', data: 'persona_apellido' },
    { title: 'Email', data: 'usuario_email' },
    { title: 'Estado', data: 'estado_usuario_nombre' },
    {
      title: 'Perfiles',
      data: 'perfiles',
      render: (data) => data && data.length > 0 ? data.map(p => p.perfil_descripcion).join(', ') : '-'
    },
    {
      title: 'Acciones',
      data: null,
      orderable: false,
      render: (data, type, row) => {
        let botones = [];
        if (tienePermiso('Asignar Perfil')) {
          botones.push(
            `<button class="btn-asignar-perfil" data-id="${row.usuario_id}" style="background:#ede9fe;color:#7c3aed;border:none;padding:6px 16px;border-radius:5px;cursor:pointer;font-weight:500;">Asignar Perfil</button>`
          );
        }
        if (botones.length === 0) return '-';
        return `<div style="display:flex;gap:10px;justify-content:center;align-items:center;">${botones.join('')}</div>`;
      }
    }
  ];

  // Delegación de eventos para el botón Asignar Perfil
  useEffect(() => {
    const handler = (e) => {
      if (e.target.closest('.btn-asignar-perfil')) {
        const id = e.target.closest('.btn-asignar-perfil').getAttribute('data-id');
        const usuario = usuarios.find(u => u.usuario_id === parseInt(id));
        handleAsignarPerfil(usuario);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [usuarios]);

  if (loading) return <div>Cargando...</div>;

  return (
    <div>
      <h2 className='pl-12 text-xl font-semibold'>Listado de Usuarios</h2>
      <Table columns={columns} data={usuarios} />

      <ModalAsignarPerfiles
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onGuardar={handleGuardarPerfiles}
        usuario={usuarioSeleccionado}
        perfiles={perfiles}
        perfilesSeleccionados={perfilesSeleccionados}
        onAddPerfil={handleAddPerfil}
        onRemovePerfil={handleRemovePerfil}
      />
    </div>
  );
};

export default UsuariosPage;