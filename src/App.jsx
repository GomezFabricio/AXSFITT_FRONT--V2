import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Layout general
import Layout from './components/templates/Layout/Layout';

// Páginas públicas
import LoginPage from './pages/auth/LoginPage';
import RecuperarPasswordPage from './pages/auth/RecuperarPasswordPage';
import RestablecerPasswordPage from './pages/auth/RestablecerPasswordPage';

// Ruta protegida
import ProtectedRoute from './pages/common/ProtectedRoute';

// Rutas protegidas definidas aparte
import { rutasProtegidas } from './rutasProtegidas';

// Opcional: Página 404
import NotFoundPage from './pages/common/NotFound'; 

function App() {
  return (
    <Routes>
      {/* Páginas públicas */}
      <Route path="/login" element={<LoginPage />} />
      
      {/* Rutas de recuperación de contraseña */}
      <Route path="/recuperar-password" element={<RecuperarPasswordPage />} />
      <Route path="/restablecer-password/:token" element={<RestablecerPasswordPage />} />

      {/* Rutas protegidas dinámicas */}
      {rutasProtegidas.map(({ path, permiso, componente }) => {
        if (!path || !componente) {
          console.warn('Ruta inválida en rutasProtegidas:', { path, permiso, componente });
          return null;
        }

        return (
          <Route
            key={path}
            path={path}
            element={
              <ProtectedRoute permisoRequerido={permiso}>
                <Layout>{componente}</Layout>
              </ProtectedRoute>
            }
          />
        );
      })}

      {/* Ruta fallback para páginas no encontradas */}
      <Route
        path="*"
        element={
          <Layout>
            <NotFoundPage /> 
          </Layout>
        }
      />
    </Routes>
  );
}

export default App;