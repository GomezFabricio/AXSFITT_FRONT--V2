import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Layout general
import Layout from './components/templates/Layout/Layout';

// Página pública
import LoginPage from './pages/auth/LoginPage';

// Ruta protegida
import ProtectedRoute from './pages/common/ProtectedRoute';

// Rutas protegidas definidas aparte
import { rutasProtegidas } from './rutasProtegidas';

// Opcional: Página 404
import NotFoundPage from './pages/common/NotFound'; 

function App() {
  return (
    <Routes>
      {/* Página pública */}
      <Route path="/login" element={<LoginPage />} />

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
