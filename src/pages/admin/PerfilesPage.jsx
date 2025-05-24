import React, { useEffect, useState } from 'react';
import Table from '../../components/molecules/Table';
import { getPerfiles } from '../../api/perfilesApi';

const PerfilesPage = () => {
  const [perfiles, setPerfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  const columns = [
    { title: 'ID', data: 'perfil_id' },
    { title: 'Nombre', data: 'perfil_descripcion' },
    {
      title: 'Módulos y Permisos',
      data: 'modulos',
      render: (data) =>
        data && data.length > 0
          ? data.map(m =>
              `${m.modulo_descripcion} (${m.permisos.map(p => p.permiso_descripcion).join(', ')})`
            ).join(' | ')
          : '-'
    },
    { title: 'Usuarios con este perfil', data: 'cantidad_usuarios' }
  ];

  useEffect(() => {
    const fetchPerfiles = async () => {
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
    fetchPerfiles();
  }, []);

  if (loading) return <div>Cargando...</div>;

  return (
    <div>
      <h2 className='pl-12 text-xl font-semibold'>Listado de Perfiles</h2>
      <Table columns={columns} data={perfiles} />
    </div>
  );
};

export default PerfilesPage;