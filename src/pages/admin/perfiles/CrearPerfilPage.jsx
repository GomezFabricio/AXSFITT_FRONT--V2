import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getModulos, getPermisosPorModulos } from '../../../api/modulosApi';
import { crearPerfil } from '../../../api/perfilesApi';

const CrearPerfilPage = () => {
  const [step, setStep] = useState(1);
  const [nombrePerfil, setNombrePerfil] = useState('');
  const [modulosDisponibles, setModulosDisponibles] = useState([]);
  const [modulosSeleccionados, setModulosSeleccionados] = useState([]);
  const [permisosPorModulo, setPermisosPorModulo] = useState({});
  const [permisosSeleccionados, setPermisosSeleccionados] = useState({});
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Paso 1: cargar módulos
  useEffect(() => {
    const fetchModulos = async () => {
      setLoading(true);
      try {
        const token = sessionStorage.getItem('token');
        const data = await getModulos(token);
        setModulosDisponibles(data);
      } catch (e) {}
      setLoading(false);
    };
    fetchModulos();
  }, []);

  // Paso 2: cargar permisos de los módulos seleccionados
  useEffect(() => {
    if (step === 2 && modulosSeleccionados.length > 0) {
      const fetchPermisos = async () => {
        setLoading(true);
        try {
          const token = sessionStorage.getItem('token');
          const moduloIds = modulosSeleccionados.map(m => m.modulo_id);
          const data = await getPermisosPorModulos(moduloIds, token);
          setPermisosPorModulo(data);
          // Por defecto, seleccionar todos los permisos
          const seleccionados = {};
          Object.entries(data).forEach(([moduloId, permisos]) => {
            seleccionados[moduloId] = permisos.map(p => p.permiso_id);
          });
          setPermisosSeleccionados(seleccionados);
        } catch (e) {}
        setLoading(false);
      };
      fetchPermisos();
    }
  }, [step, modulosSeleccionados]);

  // Manejo de selección de módulos
  const handleSelectModulo = (modulo) => {
    let nuevos = [...modulosSeleccionados];
    if (!nuevos.some(m => m.modulo_id === modulo.modulo_id)) {
      nuevos.push(modulo);
      if (modulo.modulo_padre_id && !nuevos.some(m => m.modulo_id === modulo.modulo_padre_id)) {
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
  };

  // Manejo de selección de permisos
  const handlePermisoCheck = (moduloId, permisoId) => {
    setPermisosSeleccionados(prev => ({
      ...prev,
      [moduloId]: prev[moduloId].includes(permisoId)
        ? prev[moduloId].filter(id => id !== permisoId)
        : [...prev[moduloId], permisoId]
    }));
  };

  // Enviar perfil
  const handleCrearPerfil = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      const modulosPermisos = Object.entries(permisosSeleccionados).map(([modulo_id, permisos]) => ({
        modulo_id,
        permisos
      }));
      await crearPerfil(nombrePerfil, modulosPermisos, token);
      alert('Perfil creado correctamente');
      navigate('/admin/perfiles');
    } catch (e) {
      alert('Error al crear perfil');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg border border-violet-100 p-6 md:p-10">
        <h2 className="text-2xl font-bold mb-6 text-purple-700 text-center">Crear Perfil</h2>
        {loading && (
          <div className="flex justify-center items-center py-8">
            <span className="text-purple-700 font-semibold animate-pulse">Cargando...</span>
          </div>
        )}
        {!loading && step === 1 && (
          <>
            <label className="block mb-2 font-semibold text-gray-700">Nombre del perfil</label>
            <input
              className="border border-violet-200 rounded-lg px-3 py-2 w-full mb-6 focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
              value={nombrePerfil}
              onChange={e => setNombrePerfil(e.target.value)}
              placeholder="Ej: Administrador"
            />
            <label className="block mb-2 font-semibold text-gray-700">Módulos seleccionados</label>
            <div className="flex flex-wrap gap-2 mb-6">
              {modulosSeleccionados.map(m => (
                <span key={m.modulo_id} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full flex items-center font-medium shadow-sm">
                  {m.modulo_descripcion}
                  <button
                    className="ml-2 text-red-500 hover:text-red-700 font-bold"
                    onClick={() => handleRemoveModulo(m)}
                    title="Quitar módulo"
                  >×</button>
                </span>
              ))}
            </div>
            <label className="block mb-2 font-semibold text-gray-700">Módulos disponibles</label>
            <ul className="mb-6 flex flex-wrap gap-2">
              {modulosDisponibles.map(m => (
                <li key={m.modulo_id}>
                  <button
                    className="bg-violet-50 hover:bg-violet-100 text-purple-700 px-3 py-1 rounded-full font-medium shadow-sm transition"
                    onClick={() => handleSelectModulo(m)}
                  >
                    {m.modulo_descripcion}
                  </button>
                </li>
              ))}
            </ul>
            <button
              className="w-full md:w-auto px-6 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-lg font-semibold shadow transition"
              disabled={!nombrePerfil || modulosSeleccionados.length === 0}
              onClick={() => setStep(2)}
            >
              Siguiente
            </button>
          </>
        )}
        {!loading && step === 2 && (
          <>
            <h3 className="text-lg font-semibold mb-4 text-purple-700">Permisos por módulo</h3>
            <div className="space-y-4 mb-6">
              {modulosSeleccionados.map(m => (
                <div key={m.modulo_id} className="bg-violet-50 rounded-lg p-4 shadow-sm">
                  <details open>
                    <summary className="font-semibold cursor-pointer text-purple-800">{m.modulo_descripcion}</summary>
                    <ul className="ml-4 mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(permisosPorModulo[m.modulo_id] || []).map(p => (
                        <li key={p.permiso_id}>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={permisosSeleccionados[m.modulo_id]?.includes(p.permiso_id) || false}
                              onChange={() => handlePermisoCheck(m.modulo_id, p.permiso_id)}
                              className="accent-purple-600"
                            />
                            <span className="text-gray-700">{p.permiso_descripcion}</span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  </details>
                </div>
              ))}
            </div>
            <div className="flex flex-col md:flex-row gap-2">
              <button
                className="w-full md:w-auto px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold text-gray-700 shadow transition"
                onClick={() => setStep(1)}
              >
                Volver
              </button>
              <button
                className="w-full md:w-auto px-6 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-lg font-semibold shadow transition"
                onClick={handleCrearPerfil}
              >
                Crear Perfil
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CrearPerfilPage;