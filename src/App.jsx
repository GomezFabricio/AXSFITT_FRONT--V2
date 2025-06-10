import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Layout general
import Layout from './components/templates/Layout/Layout';

// Página pública
import LoginPage from './pages/auth/LoginPage';

// Página por defecto para fallback
import HomePage from './pages/HomePage';

// Ruta protegida
import ProtectedRoute from './pages/common/ProtectedRoute';

// Rutas protegidas definidas aparte
import { rutasProtegidas } from './rutasProtegidas';

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
                <Layout>{componente}</Layout> {/* Envolver siempre en Layout */}
              </ProtectedRoute>
            }
          />
        );
      })}

      {/* Ruta fallback por defecto */}
      <Route
        path="*"
        element={
          <Layout>
            <HomePage /> {/* Cambiar a una página 404 si es necesario */}
          </Layout>
        }
      />
    </Routes>
  );
}

export default App;