import React, { useEffect, useState } from 'react';
import Table from '../../components/molecules/Table';
import { getModulos, updateModulo } from '../../api/modulosApi';

const ModulosPage = () => {
  const [modulos, setModulos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [moduloSeleccionado, setModuloSeleccionado] = useState(null);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [confirmar, setConfirmar] = useState(false);

  // Obtener permisos del usuario solo desde sessionStorage
  const userData = JSON.parse(sessionStorage.getItem('userData'));

  // Chequea si el usuario tiene el permiso "Modificar Modulo" en cualquier módulo
  const tienePermisoModificarModulo = () => {
    if (!userData || !userData.modulos) return false;
    return userData.modulos.some(
      m => m.permisos && m.permisos.some(p => p.permiso_descripcion === 'Modificar Modulo')
    );
  };

  const columns = [
    { title: 'ID', data: 'modulo_id', responsivePriority: 1 },
    { title: 'Nombre', data: 'modulo_descripcion', responsivePriority: 2 },
    { title: 'Usuarios asignados', data: 'usuarios_asignados', responsivePriority: 3 },
    {
      title: 'Permisos',
      data: 'permisos',
      render: (data) => data.map(p => p.permiso_descripcion).join(', '),
      responsivePriority: 4
    },
    {
      title: 'Acciones',
      data: null,
      orderable: false,
      render: (data, type, row) => {
        if (tienePermisoModificarModulo()) {
          return `<button class="btn-modificar-modulo" data-id="${row.modulo_id}" data-nombre="${row.modulo_descripcion}">Modificar</button>`;
        }
        return '';
      },
      responsivePriority: 5
    }
  ];

  useEffect(() => {
    const fetchModulos = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const data = await getModulos(token);
        setModulos(data);
      } catch (error) {
        // Maneja el error
      } finally {
        setLoading(false);
      }
    };
    fetchModulos();
  }, []);

  // Manejar clicks en el botón de modificar (delegación de eventos)
  useEffect(() => {
    const handler = (e) => {
      if (e.target.classList.contains('btn-modificar-modulo')) {
        const id = e.target.getAttribute('data-id');
        const nombre = e.target.getAttribute('data-nombre');
        setModuloSeleccionado({ modulo_id: id, modulo_descripcion: nombre });
        setNuevoNombre(nombre);
        setModalOpen(true);
        setConfirmar(false);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const handleCancelar = async () => {
    setModalOpen(false);
    setConfirmar(false);
    setLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      const data = await getModulos(token);
      setModulos(data);
    } catch (error) {
      // Maneja el error si quieres
    } finally {
      setLoading(false);
    }
  };

  const handleActualizar = async () => {
    if (!confirmar) {
      setConfirmar(true);
      return;
    }
    try {
      const token = sessionStorage.getItem('token');
      await updateModulo(moduloSeleccionado.modulo_id, { modulo_descripcion: nuevoNombre }, token);
      setModalOpen(false);
      setConfirmar(false);
      setLoading(true);
      const data = await getModulos(token);
      setModulos(data);

      // Actualizar el nombre del módulo en sessionStorage (userData)
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
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div>
      <h2 className='pl-12 text-xl font-semibold'>Listado de Módulos</h2>
      <Table columns={columns} data={modulos} />
      {/* Modal para modificar nombre */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-5 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[350px] shadow-lg">
            {!confirmar ? (
              <>
                <h3 className="text-lg font-semibold mb-2">Modificar nombre del módulo</h3>
                <input
                  className="border rounded px-2 py-1 w-full mb-4"
                  value={nuevoNombre}
                  onChange={e => setNuevoNombre(e.target.value)}
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <button
                    className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
                    onClick={handleCancelar}
                  >
                    Cancelar
                  </button>
                  <button
                    className="px-3 py-1 bg-purple-700 text-white rounded hover:bg-purple-800"
                    onClick={handleActualizar}
                  >
                    Guardar
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="mb-4">
                  Está a punto de cambiar el nombre de <b>{moduloSeleccionado.modulo_descripcion}</b> a <b>{nuevoNombre}</b>.<br />
                  ¿Está seguro?
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
                    onClick={handleCancelar}
                  >
                    Cancelar
                  </button>
                  <button
                    className="px-3 py-1 bg-purple-700 text-white rounded hover:bg-purple-800"
                    onClick={handleActualizar}
                  >
                    Confirmar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModulosPage;