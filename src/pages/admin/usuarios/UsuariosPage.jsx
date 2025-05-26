import React, { useEffect, useState } from 'react';
import Table from '../../../components/molecules/Table';
import { getUsuarios } from '../../../api/usuariosApi';

const UsuariosPage = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  const columns = [
    { title: 'ID', data: 'usuario_id' },
    { title: 'Nombre', data: 'persona_nombre' },
    { title: 'Apellido', data: 'persona_apellido' },
    { title: 'Email', data: 'usuario_email' },
    { title: 'Estado', data: 'estado_usuario_nombre' },
    {
      title: 'Perfiles',
      data: 'perfiles',
      render: (data) => data && data.length > 0 ? data.map(p => p.perfil_descripcion).join(', ') : '-'
    }
  ];

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const data = await getUsuarios(token);
        setUsuarios(data);
      } catch (error) {
        // Maneja el error
      } finally {
        setLoading(false);
      }
    };
    fetchUsuarios();
  }, []);

  if (loading) return <div>Cargando...</div>;

  return (
    <div>
      <h2 className='pl-12 text-xl font-semibold'>Listado de Usuarios</h2>
      <Table columns={columns} data={usuarios} />
    </div>
  );
};

export default UsuariosPage;