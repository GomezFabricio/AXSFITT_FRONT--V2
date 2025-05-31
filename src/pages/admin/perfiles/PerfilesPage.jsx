import React, { useEffect, useState } from 'react';
import Table from '../../../components/molecules/Table';
import { getPerfiles, eliminarPerfil } from '../../../api/perfilesApi';
import { useNavigate, useLocation } from 'react-router-dom';
import ModalDetalleModulosYPermisos from '../../../components/organisms/Modals/ModalDetalleModulosYPermisos';
import ModalEliminar from '../../../components/organisms/Modals/ModalEliminar';

const tienePermiso = (permisoDescripcion) => {
  const userData = JSON.parse(sessionStorage.getItem('userData'));
  if (!userData || !userData.modulos) return false;
  return userData.modulos.some(
    m => m.permisos && m.permisos.some(p => p.permiso_descripcion === permisoDescripcion)
  );
};

const PerfilesPage = () => {
  const [perfiles, setPerfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalDetalleOpen, setModalDetalleOpen] = useState(false);
  const [modulosDetalle, setModulosDetalle] = useState([]);
  const [modalEliminarOpen, setModalEliminarOpen] = useState(false);
  const [perfilAEliminar, setPerfilAEliminar] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const columns = [
    { title: 'ID', data: 'perfil_id' },
    { title: 'Nombre', data: 'perfil_descripcion' },
    { title: 'Usuarios con este perfil', data: 'cantidad_usuarios' },
    {
      title: 'Módulos y Permisos',
      data: 'modulos',
      orderable: false,
      render: (data, type, row) => {
        return `<button class="btn-detalle-perfil" data-id="${row.perfil_id}" style="background:#ede9fe;color:#7c3aed;border:none;padding:6px 16px;border-radius:5px;cursor:pointer;font-weight:500;">Detalles</button>`;
      }
    },
    {
      title: 'Acciones',
      data: null,
      orderable: false,
      render: (data, type, row) => {
        let botones = [];
        if (tienePermiso('Modificar Perfil')) {
          botones.push(
            `<button class="btn-modificar-perfil" data-id="${row.perfil_id}" title="Modificar" style="background:#e0e7ff;color:#2563eb;border:none;padding:6px 12px;border-radius:6px;cursor:pointer;font-weight:600;margin-right:8px;display:inline-block;">Modificar</button>`
          );
        }
        if (tienePermiso('Eliminar Perfil')) {
          botones.push(
            `<button class="btn-eliminar-perfil" data-id="${row.perfil_id}" title="Eliminar" style="background:#fee2e2;color:#dc2626;border:none;padding:6px 12px;border-radius:6px;cursor:pointer;font-weight:600;display:inline-block;">Eliminar</button>`
          );
        }
        if (botones.length === 0) return '-';
        return `<div style="display:flex;gap:10px;justify-content:center;align-items:center;">${botones.join('')}</div>`;
      }
    }
  ];

  const reloadPerfiles = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      const data = await getPerfiles(token);
      setPerfiles(data);
    } catch (error) {
      // Maneja el error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadPerfiles();
    // eslint-disable-next-line
  }, [location.pathname]);

  useEffect(() => {
    const handler = (e) => {
      if (e.target.closest('.btn-modificar-perfil')) {
        const id = e.target.closest('.btn-modificar-perfil').getAttribute('data-id');
        navigate(`/admin/perfiles/editar/${id}`);
      }
      if (e.target.closest('.btn-eliminar-perfil')) {
        const id = e.target.closest('.btn-eliminar-perfil').getAttribute('data-id');
        const perfil = perfiles.find(p => String(p.perfil_id) === String(id));
        setPerfilAEliminar(perfil);
        setModalEliminarOpen(true);
      }
      if (e.target.closest('.btn-detalle-perfil')) {
        const id = e.target.closest('.btn-detalle-perfil').getAttribute('data-id');
        const perfil = perfiles.find(p => String(p.perfil_id) === String(id));
        setModulosDetalle(perfil?.modulos || []);
        setModalDetalleOpen(true);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [perfiles, navigate]);

  const handleEliminarPerfil = async () => {
    if (!perfilAEliminar) return;
    try {
      const token = sessionStorage.getItem('token');
      await eliminarPerfil(perfilAEliminar.perfil_id, token);
      setModalEliminarOpen(false);
      setPerfilAEliminar(null);
      reloadPerfiles();
    } catch (e) {
      setModalEliminarOpen(false);
      setPerfilAEliminar(null);
      alert('Error al eliminar perfil');
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div>
      <h2 className='pl-12 text-xl font-semibold'>Listado de Perfiles</h2>
      <Table columns={columns} data={perfiles} />

      <ModalDetalleModulosYPermisos
        isOpen={modalDetalleOpen}
        modulos={modulosDetalle}
        onClose={() => setModalDetalleOpen(false)}
      />

      <ModalEliminar
        isOpen={modalEliminarOpen}
        onClose={() => {
          setModalEliminarOpen(false);
          setPerfilAEliminar(null);
        }}
        onConfirm={handleEliminarPerfil}
        nombreEntidad="perfil"
      />
    </div>
  );
};

export default PerfilesPage;