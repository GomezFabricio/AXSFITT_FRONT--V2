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
    // Si es submódulo, agregar también el padre si no está
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
      navigate('/admin/perfiles'); // Redirige solo la página de perfiles
    } catch (e) {
      alert('Error al crear perfil');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-xl font-semibold mb-4">Crear Perfil</h2>
      {loading && <div>Cargando...</div>}
      {!loading && step === 1 && (
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
          <button
            className="px-4 py-2 bg-purple-700 text-white rounded"
            disabled={!nombrePerfil || modulosSeleccionados.length === 0}
            onClick={() => setStep(2)}
          >
            Siguiente
          </button>
        </>
      )}
      {!loading && step === 2 && (
        <>
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
              onClick={() => setStep(1)}
            >
              Volver
            </button>
            <button
              className="px-4 py-2 bg-purple-700 text-white rounded"
              onClick={handleCrearPerfil}
            >
              Crear Perfil
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CrearPerfilPage;