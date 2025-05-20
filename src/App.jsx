import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/templates/Layout/Layout';
import LoginPage from './pages/auth/LoginPage';
import HomePage from './pages/HomePage';
import ProtectedRoute from './pages/common/ProtectedRoute';

// Importa los componentes de página que ya tienes
import UsuariosPage from './pages/admin/UsuariosPage';
import ModulosPage from './pages/admin/ModulosPage';
import PerfilesPage from './pages/admin/PerfilesPage';

const moduloRutaToPage = {
  '/admin/usuarios': <UsuariosPage />,
  '/admin/modulos': <ModulosPage />,
  '/admin/perfiles': <PerfilesPage />,
  // Agrega aquí más rutas y sus componentes correspondientes
  // '/admin/otro-modulo': <OtroModuloPage />,
};

function App() {
  const [modulos, setModulos] = useState([]);

  useEffect(() => {
    const userData = JSON.parse(sessionStorage.getItem('userData') || localStorage.getItem('userData'));
    if (userData && userData.modulos) {
      setModulos(userData.modulos);
    }
  }, []);

  return (
    <Routes>
      {/* Página pública */}
      <Route path="/login" element={<LoginPage />} />

      {/* Rutas dinámicas protegidas */}
      {modulos.map(modulo => (
        <Route
          key={modulo.modulo_id}
          path={modulo.modulo_ruta}
          element={
            <ProtectedRoute>
              <Layout>
                {moduloRutaToPage[modulo.modulo_ruta] || <HomePage />}
              </Layout>
            </ProtectedRoute>
          }
        />
      ))}

      {/* Ruta raíz protegida */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <HomePage />
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;