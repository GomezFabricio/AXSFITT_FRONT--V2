import React, { useEffect, useState, useMemo } from 'react';
import Table from '../../../components/molecules/Table';
import { getModulos, updateModulo } from '../../../api/modulosApi';
import ModalDetalleModulosYPermisos from '../../../components/organisms/Modals/modulos/ModalDetalleModulosYPermisos';
import ModalEditarModulo from '../../../components/organisms/Modals/modulos/ModalEditarModulo';
import tienePermiso from '../../../utils/tienePermiso'; 

const ModulosPage = () => {
  const [modulos, setModulos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [moduloSeleccionado, setModuloSeleccionado] = useState(null);
  const [modalPermisosOpen, setModalPermisosOpen] = useState(false);

  // useMemo para que columns no cambie de referencia en cada render
  const columns = useMemo(() => [
    { title: 'ID', data: 'modulo_id', responsivePriority: 1 },
    { title: 'Nombre', data: 'modulo_descripcion', responsivePriority: 2 },
    { title: 'Usuarios asignados', data: 'usuarios_asignados', responsivePriority: 3 },
    {
      title: 'Permisos',
      data: 'permisos',
      orderable: false,
      render: (data, type, row) => {
        return `<button class="btn-detalle-permisos" data-id="${row.modulo_id}" style="background:#ede9fe;color:#7c3aed;border:none;padding:6px 16px;border-radius:5px;cursor:pointer;font-weight:500;">Detalle</button>`;
      },
      responsivePriority: 4
    },
    {
      title: 'Acciones',
      data: null,
      orderable: false,
      render: (data, type, row) => {
        if (tienePermiso('Modificar Modulo')) { // Usa la función tienePermiso importada
          return `<button class="btn-modificar-modulo" data-id="${row.modulo_id}" data-nombre="${row.modulo_descripcion}" style="background:#e0e7ff;color:#2563eb;border:none;padding:6px 12px;border-radius:6px;cursor:pointer;font-weight:600;">Modificar</button>`;
        }
        return '';
      },
      responsivePriority: 5
    }
  ], []); // Elimina userData de las dependencias, ya que tienePermiso ya lo usa internamente

  const reloadModulos = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      const data = await getModulos(token);
      setModulos(data);
    } catch (error) {
      // Manejo opcional de error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadModulos();
  }, []);

  // Solo delega eventos una vez al montar
  useEffect(() => {
    const handler = (e) => {
      if (e.target.classList.contains('btn-modificar-modulo')) {
        const id = e.target.getAttribute('data-id');
        const nombre = e.target.getAttribute('data-nombre');
        setModuloSeleccionado({ modulo_id: id, modulo_descripcion: nombre });
        setModalOpen(true);
      }
      if (e.target.classList.contains('btn-detalle-permisos')) {
        const id = e.target.getAttribute('data-id');
        const modulo = modulos.find(m => String(m.modulo_id) === String(id));
        setModuloSeleccionado(modulo);
        setModalPermisosOpen(true);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
    // eslint-disable-next-line
  }, [modulos]); // Si modulos cambia, se actualiza la referencia

  const handleCerrarModalEdicion = async () => {
    setModalOpen(false);
    await reloadModulos();
  };

  const handleActualizarModulo = async (nuevoNombre) => {
    try {
      const token = sessionStorage.getItem('token');
      await updateModulo(moduloSeleccionado.modulo_id, { modulo_descripcion: nuevoNombre }, token);
      setModalOpen(false);
      await reloadModulos();

      const userData = JSON.parse(sessionStorage.getItem('userData'));
      if (userData && userData.modulos) {
        userData.modulos = userData.modulos.map(m =>
          String(m.modulo_id) === String(moduloSeleccionado.modulo_id)
            ? { ...m, modulo_descripcion: nuevoNombre }
            : m
        );
        sessionStorage.setItem('userData', JSON.stringify(userData));
        window.dispatchEvent(new Event('userDataUpdated'));
      }
    } catch (error) {
      alert(error.message || 'Error al actualizar el módulo');
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div>
      <h2 className='pl-12 text-xl font-semibold'>Listado de Módulos</h2>
      <Table columns={columns} data={modulos} />

      <ModalDetalleModulosYPermisos
        isOpen={modalPermisosOpen}
        modulos={moduloSeleccionado ? [moduloSeleccionado] : []}
        onClose={() => setModalPermisosOpen(false)}
      />

      <ModalEditarModulo
        isOpen={modalOpen}
        modulo={moduloSeleccionado}
        onClose={handleCerrarModalEdicion}
        onActualizar={handleActualizarModulo}
      />
    </div>
  );
};

export default ModulosPage;