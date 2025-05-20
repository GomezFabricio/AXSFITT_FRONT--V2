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
      title: 'Módulos asociados',
      data: 'modulos',
      render: (data) => data.map(m => m.modulo_descripcion).join(', ')
    },
    { title: 'Usuarios con este perfil', data: 'cantidad_usuarios' }
    // Agregar más columnas según sea necesario
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
      <h2>Listado de Perfiles</h2>
      <Table columns={columns} data={perfiles} />
    </div>
  );
};

export default PerfilesPage;