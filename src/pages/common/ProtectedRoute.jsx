import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import Layout from '../../components/templates/Layout/Layout';
import Error403Page from './Error403Page';

const ProtectedRoute = ({ children, permisoRequerido }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [tienePermiso, setTienePermiso] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const userData = JSON.parse(sessionStorage.getItem('userData') || localStorage.getItem('userData'));

      if (!token || !userData) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      setIsAuthenticated(true);

      const permisoValido = userData?.modulos?.some((modulo) =>
        modulo.permisos?.some((permiso) => permiso.permiso_descripcion === permisoRequerido)
      );

      setTienePermiso(permisoValido);
      setIsLoading(false);
    };

    checkAuth();
  }, [permisoRequerido]);

  if (isLoading) {
    return <div>Loading...</div>; // Mostrar un indicador de carga mientras se verifica
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (!tienePermiso) {
    return (
      <Layout>
        <Error403Page /> {/* Mostrar la página 403 con el Layout */}
      </Layout>
    );
  }

  return children;
};

export default ProtectedRoute;