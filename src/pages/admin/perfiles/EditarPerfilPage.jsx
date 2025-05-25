import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getModulos, getPermisosPorModulos } from '../../../api/modulosApi';
import { getPerfiles, modificarPerfil } from '../../../api/perfilesApi';

const EditarPerfilPage = () => {
  const { perfil_id } = useParams();
  const [nombrePerfil, setNombrePerfil] = useState('');
  const [modulosDisponibles, setModulosDisponibles] = useState([]);
  const [modulosSeleccionados, setModulosSeleccionados] = useState([]);
  const [permisosPorModulo, setPermisosPorModulo] = useState({});
  const [permisosSeleccionados, setPermisosSeleccionados] = useState({});
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Cargar datos del perfil y módulos disponibles
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = sessionStorage.getItem('token');
        // Obtener todos los perfiles y buscar el actual
        const perfiles = await getPerfiles(token);
        const perfil = perfiles.find(p => String(p.perfil_id) === String(perfil_id));
        if (!perfil) {
          alert('Perfil no encontrado');
          navigate('/admin/perfiles');
          return;
        }
        setNombrePerfil(perfil.perfil_descripcion);
        setModulosSeleccionados(perfil.modulos);

        // Obtener todos los módulos
        const modulos = await getModulos(token);
        // Filtrar los módulos que no están seleccionados
        const seleccionadosIds = perfil.modulos.map(m => m.modulo_id);
        setModulosDisponibles(modulos.filter(m => !seleccionadosIds.includes(m.modulo_id)));

        // Obtener permisos de los módulos seleccionados
        const moduloIds = perfil.modulos.map(m => m.modulo_id);
        const permisosData = await getPermisosPorModulos(moduloIds, token);
        setPermisosPorModulo(permisosData);

        // Setear permisos seleccionados
        const seleccionados = {};
        perfil.modulos.forEach(m => {
          seleccionados[m.modulo_id] = m.permisos.map(p => p.permiso_id);
        });
        setPermisosSeleccionados(seleccionados);
      } catch (e) {
        alert('Error al cargar datos');
      }
      setLoading(false);
    };
    fetchData();
  }, [perfil_id, navigate]);

  // Manejo de selección de módulos
  const handleSelectModulo = (modulo) => {
    let nuevos = [...modulosSeleccionados];
    if (!nuevos.some(m => m.modulo_id === modulo.modulo_id)) {
      nuevos.push(modulo);
      if (modulo.modulo_padre_id && !nuevos.some(m => m.modulo_id === modulo.modulo_padre_id)) {
        // Agregar el padre si no está
        const padre = modulosDisponibles.find(m => m.modulo_id === modulo.modulo_padre_id);
        if (padre) nuevos.push(padre);
      }
      setModulosSeleccionados(nuevos);
      setModulosDisponibles(modulosDisponibles.filter(m => m.modulo_id !== modulo.modulo_id));
    }
  };

  const handleRemoveModulo = (modulo) => {
    setModulosSeleccionados(modulosSeleccionados.filter(m => m.modulo_id !== modulo.modulo_id));
    setModulosDisponibles([...modulosDisponibles, modulo]);
    // Quitar permisos seleccionados de ese módulo
    setPermisosSeleccionados(prev => {
      const nuevo = { ...prev };
      delete nuevo[modulo.modulo_id];
      return nuevo;
    });
  };

  // Cargar permisos cuando se agregan módulos nuevos
  useEffect(() => {
    const cargarPermisos = async () => {
      const token = sessionStorage.getItem('token');
      const moduloIds = modulosSeleccionados.map(m => m.modulo_id);
      const data = await getPermisosPorModulos(moduloIds, token);
      setPermisosPorModulo(data);
      // Si hay módulos nuevos, selecciona todos sus permisos por defecto
      setPermisosSeleccionados(prev => {
        const nuevo = { ...prev };
        Object.entries(data).forEach(([moduloId, permisos]) => {
          if (!nuevo[moduloId]) {
            nuevo[moduloId] = permisos.map(p => p.permiso_id);
          }
        });
        return nuevo;
      });
    };
    if (modulosSeleccionados.length > 0) {
      cargarPermisos();
    }
  }, [modulosSeleccionados]);

  // Manejo de selección de permisos
  const handlePermisoCheck = (moduloId, permisoId) => {
    setPermisosSeleccionados(prev => ({
      ...prev,
      [moduloId]: prev[moduloId].includes(permisoId)
        ? prev[moduloId].filter(id => id !== permisoId)
        : [...prev[moduloId], permisoId]
    }));
  };

  // Enviar perfil modificado
  const handleModificarPerfil = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      const modulosPermisos = Object.entries(permisosSeleccionados).map(([modulo_id, permisos]) => ({
        modulo_id,
        permisos
      }));
      await modificarPerfil(perfil_id, nombrePerfil, modulosPermisos, token);
      alert('Perfil modificado correctamente');
      navigate('/admin/perfiles');
    } catch (e) {
      alert('Error al modificar perfil');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-xl font-semibold mb-4">Modificar Perfil</h2>
      {loading && <div>Cargando...</div>}
      {!loading && (
        <>
          <label className="block mb-2">Nombre del perfil</label>
          <input
            className="border rounded px-2 py-1 w-full mb-4"
            value={nombrePerfil}
            onChange={e => setNombrePerfil(e.target.value)}
          />
          <label className="block mb-2">Módulos seleccionados</label>
          <div className="flex flex-wrap gap-2 mb-4">
            {modulosSeleccionados.map(m => (
              <span key={m.modulo_id} className="bg-purple-200 px-2 py-1 rounded flex items-center">
                {m.modulo_descripcion}
                <button className="ml-2 text-red-500" onClick={() => handleRemoveModulo(m)}>x</button>
              </span>
            ))}
          </div>
          <label className="block mb-2">Módulos disponibles</label>
          <ul className="mb-4">
            {modulosDisponibles.map(m => (
              <li key={m.modulo_id}>
                <button
                  className="text-purple-700 hover:underline"
                  onClick={() => handleSelectModulo(m)}
                >
                  {m.modulo_descripcion}
                </button>
              </li>
            ))}
          </ul>
          <h3 className="text-lg font-semibold mb-2">Permisos por módulo</h3>
          {modulosSeleccionados.map(m => (
            <div key={m.modulo_id} className="mb-4">
              <details open>
                <summary className="font-semibold">{m.modulo_descripcion}</summary>
                <ul className="ml-4">
                  {(permisosPorModulo[m.modulo_id] || []).map(p => (
                    <li key={p.permiso_id}>
                      <label>
                        <input
                          type="checkbox"
                          checked={permisosSeleccionados[m.modulo_id]?.includes(p.permiso_id) || false}
                          onChange={() => handlePermisoCheck(m.modulo_id, p.permiso_id)}
                        />
                        {p.permiso_descripcion}
                      </label>
                    </li>
                  ))}
                </ul>
              </details>
            </div>
          ))}
          <div className="flex gap-2">
            <button
              className="px-4 py-2 bg-gray-300 rounded"
              onClick={() => navigate('/admin/perfiles')}
            >
              Cancelar
            </button>
            <button
              className="px-4 py-2 bg-purple-700 text-white rounded"
              onClick={handleModificarPerfil}
            >
              Guardar Cambios
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default EditarPerfilPage;