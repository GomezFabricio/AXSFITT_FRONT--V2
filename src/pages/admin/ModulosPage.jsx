import React, { useEffect, useState } from 'react';
import Table from '../../components/molecules/Table';
import { getModulos } from '../../api/modulosApi';

const ModulosPage = () => {
  const [modulos, setModulos] = useState([]);
  const [loading, setLoading] = useState(true);

  const columns = [
  { title: 'ID', data: 'modulo_id', responsivePriority: 1 },
  { title: 'Nombre', data: 'modulo_descripcion', responsivePriority: 2 },
  { title: 'Usuarios asignados', data: 'usuarios_asignados', responsivePriority: 3 },
  {
    title: 'Permisos',
    data: 'permisos',
    render: (data) => data.map(p => p.permiso_descripcion).join(', '),
    responsivePriority: 4
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

  if (loading) return <div>Cargando...</div>;

  return (
    <div>
      <h2 className='pl-12 text-xl font-semibold'>Listado de Módulos</h2>
      <Table columns={columns} data={modulos} />
    </div>
  );
};

export default ModulosPage;