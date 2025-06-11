import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import Layout from '../../components/templates/Layout/Layout';
import Error403Page from './Error403Page';
import axios from 'axios';
import config from '../../config/config';

const ProtectedRoute = ({ children, permisoRequerido }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [tienePermiso, setTienePermiso] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');

      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${config.backendUrl}/api/login/verify-token`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status !== 200) {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        const userData = JSON.parse(sessionStorage.getItem('userData') || localStorage.getItem('userData'));

        if (!userData) {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        setIsAuthenticated(true);

        // ✅ Nueva validación: si no se requiere permiso, es válido automáticamente
        const permisoValido = !permisoRequerido || userData?.modulos?.some((modulo) =>
          modulo.permisos?.some((permiso) => permiso.permiso_descripcion === permisoRequerido)
        );

        setTienePermiso(permisoValido);
        setIsLoading(false);
      } catch (error) {
        console.error('Error al verificar el token:', error);
        setIsAuthenticated(false);
        setIsLoading(false);
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('userData');
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
      }
    };

    checkAuth();
  }, [permisoRequerido]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (!tienePermiso) {
    return (
      <Layout>
        <Error403Page />
      </Layout>
    );
  }

  return children;
};

export default ProtectedRoute;
