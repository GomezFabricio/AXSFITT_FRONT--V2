import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import config from '../../config/config'

const ProtectedRoute = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);

    useEffect(() => {
        const checkAuth = async () => {
            // Verificar tanto en localStorage como en sessionStorage
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            
            if (!token) {
                setIsAuthenticated(false);
                return;
            }

            try {
                // Verifica el token con una solicitud al servidor
                const response = await axios.get(`${config.backendUrl}/api/login/verify-token`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.status === 200) {
                    setIsAuthenticated(true);
                } else {
                    setIsAuthenticated(false);
                }
            } catch (error) {
                setIsAuthenticated(false);
            }
        };

        checkAuth();
    }, []);

    if (isAuthenticated === null) {
        // Mostrar un indicador de carga o similar mientras se verifica la autenticación
        return <div>Loading...</div>;
    }

    return isAuthenticated ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;