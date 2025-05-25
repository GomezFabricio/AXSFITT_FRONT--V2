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
  const [modalPermisosOpen, setModalPermisosOpen] = useState(false);
  const [permisosDetalle, setPermisosDetalle] = useState([]);

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
      orderable: false,
      render: (data, type, row) => {
        // Botón Detalle para abrir modal
        return `<button class="btn-detalle-permisos" data-id="${row.modulo_id}" style="background:#ede9fe;color:#7c3aed;border:none;padding:6px 16px;border-radius:5px;cursor:pointer;font-weight:500;">Detalle</button>`;
      },
      responsivePriority: 4
    },
    {
      title: 'Acciones',
      data: null,
      orderable: false,
      render: (data, type, row) => {
        if (tienePermisoModificarModulo()) {
          // Botón con estilos
          return `<button class="btn-modificar-modulo" data-id="${row.modulo_id}" data-nombre="${row.modulo_descripcion}" style="background:#e0e7ff;color:#2563eb;border:none;padding:6px 12px;border-radius:6px;cursor:pointer;font-weight:600;">Modificar</button>`;
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

  // Manejar clicks en los botones de la tabla (delegación de eventos)
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
      if (e.target.classList.contains('btn-detalle-permisos')) {
        const id = e.target.getAttribute('data-id');
        const modulo = modulos.find(m => String(m.modulo_id) === String(id));
        setPermisosDetalle(modulo?.permisos || []);
        setModalPermisosOpen(true);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [modulos]);

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

  // Modal para mostrar permisos del módulo
  const ModalPermisos = ({ permisos, onClose }) => (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{
        background: 'rgba(0,0,0,0.35)',
        backdropFilter: 'blur(16px)', // Igual que en Perfiles
        WebkitBackdropFilter: 'blur(16px)'
      }}
    >
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Permisos del Módulo</h3>
        <ul>
          {permisos.length === 0 && <li className="text-gray-500">Sin permisos</li>}
          {permisos.map((p, idx) => (
            <li key={idx} className="mb-2 text-gray-700">{p.permiso_descripcion}</li>
          ))}
        </ul>
        <div className="flex justify-end mt-4">
          <button
            className="px-4 py-2 bg-purple-700 text-white rounded hover:bg-purple-800"
            onClick={() => {
              onClose();
              setLoading(true);
              // Recarga los módulos al cerrar el modal
              (async () => {
                try {
                  const token = sessionStorage.getItem('token');
                  const data = await getModulos(token);
                  setModulos(data);
                } catch (error) {
                  // Maneja el error si quieres
                } finally {
                  setLoading(false);
                }
              })();
            }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );

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
      {/* Modal para detalle de permisos */}
      {modalPermisosOpen && (
        <ModalPermisos
          permisos={permisosDetalle}
          onClose={() => setModalPermisosOpen(false)}
        />
      )}
    </div>
  );
};

export default ModulosPage;