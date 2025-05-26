import React, { useEffect, useState } from 'react';
import Table from '../../../components/molecules/Table';
import { getPerfiles, eliminarPerfil } from '../../../api/perfilesApi';
import { useNavigate, useLocation } from 'react-router-dom';

// Función para chequear permisos del usuario logueado
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
  const [modalOpen, setModalOpen] = useState(false);
  const [modalModulos, setModalModulos] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [perfilAEliminar, setPerfilAEliminar] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Handlers para modificar y eliminar
  const handleModificar = (perfil_id) => {
    navigate(`/admin/perfiles/editar/${perfil_id}`);
  };

  // Abre el modal de confirmación
  const handleEliminar = (perfil_id) => {
    setPerfilAEliminar(perfil_id);
    setConfirmOpen(true);
  };

  // Confirma la eliminación
  const confirmarEliminar = async () => {
    try {
      const token = sessionStorage.getItem('token');
      await eliminarPerfil(perfilAEliminar, token);
      setConfirmOpen(false);
      setPerfilAEliminar(null);
      reloadPerfiles();
    } catch (e) {
      setConfirmOpen(false);
      setPerfilAEliminar(null);
      alert('Error al eliminar perfil');
    }
  };

  // Modal para mostrar todos los módulos y permisos
  const ModalModulosPermisos = ({ modulos, onClose }) => (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{
        background: 'rgba(0,0,0,0.35)',
        backdropFilter: 'blur(16px)', // Difuminado de fondo
        WebkitBackdropFilter: 'blur(16px)'
      }}
    >
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Módulos y Permisos</h3>
        <ul>
          {modulos.map((m, idx) => (
            <li key={idx} className="mb-3">
              <div className="font-semibold text-purple-700">{m.modulo_descripcion}</div>
              <ul className="ml-4 list-disc">
                {m.permisos.map((p, i) => (
                  <li key={i} className="text-gray-700">{p.permiso_descripcion}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
        <div className="flex justify-end mt-4">
          <button
            className="px-4 py-2 bg-purple-700 text-white rounded hover:bg-purple-800"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );

  // Modal de confirmación de eliminación
  const ConfirmModal = ({ open, onConfirm, onCancel }) => {
    if (!open) return null;
    return (
      <div
        className="fixed inset-0 flex items-center justify-center z-50"
        style={{
          background: 'rgba(0,0,0,0.35)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)'
        }}
      >
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">¿Está seguro que desea eliminar este perfil?</h3>
          <div className="flex justify-end gap-2">
            <button
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              onClick={onCancel}
            >
              Cancelar
            </button>
            <button
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              onClick={onConfirm}
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    );
  };

  const columns = [
    { title: 'ID', data: 'perfil_id' },
    { title: 'Nombre', data: 'perfil_descripcion' },
    { title: 'Usuarios con este perfil', data: 'cantidad_usuarios' },
    {
      title: 'Módulos y Permisos',
      data: 'modulos',
      orderable: false,
      render: (data, type, row) => {
        // Solo mostrar el botón "Detalles"
        return `<button class="btn-ver-mas-modulos-permisos" data-id="${row.perfil_id}" style="background:#ede9fe;color:#7c3aed;border:none;padding:6px 16px;border-radius:5px;cursor:pointer;font-weight:500;">Detalles</button>`;
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

  // Recarga solo los datos de la página (no recarga toda la ventana)
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

  // Recarga perfiles cada vez que cambia la ruta (para soportar "recarga" en la misma ruta)
  useEffect(() => {
    reloadPerfiles();
    // eslint-disable-next-line
  }, [location.pathname]);

  // Delegación de eventos para los botones y ver más
  useEffect(() => {
    const handler = (e) => {
      if (e.target.closest('.btn-modificar-perfil')) {
        const id = e.target.closest('.btn-modificar-perfil').getAttribute('data-id');
        handleModificar(id);
      }
      if (e.target.closest('.btn-eliminar-perfil')) {
        const id = e.target.closest('.btn-eliminar-perfil').getAttribute('data-id');
        handleEliminar(id);
      }
      if (e.target.closest('.btn-ver-mas-modulos-permisos')) {
        e.preventDefault();
        e.stopPropagation();
        const id = e.target.closest('.btn-ver-mas-modulos-permisos').getAttribute('data-id');
        const perfil = perfiles.find(p => String(p.perfil_id) === String(id));
        if (perfil) {
          setModalModulos(perfil.modulos);
          setModalOpen(true);
        }
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [perfiles]);

  if (loading) return <div>Cargando...</div>;

  return (
    <div>
      <h2 className='pl-12 text-xl font-semibold'>Listado de Perfiles</h2>
      <Table columns={columns} data={perfiles} />
      {modalOpen && (
        <ModalModulosPermisos
          modulos={modalModulos}
          onClose={() => {
            setModalOpen(false);
            reloadPerfiles();
          }}
        />
      )}
      <ConfirmModal
        open={confirmOpen}
        onConfirm={confirmarEliminar}
        onCancel={() => {
          setConfirmOpen(false);
          setPerfilAEliminar(null);
        }}
      />
    </div>
  );
};

export default PerfilesPage;