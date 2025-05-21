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

// Mapea las rutas de permisos a componentes
const permisoRutaToPage = {
  '/admin/usuarios': <UsuariosPage />,
  '/admin/modulos': <ModulosPage />,
  '/admin/perfiles': <PerfilesPage />,
  // Agregar el resto de rutas
};

function extraerPermisos(modulos) {
  // Extrae todos los permisos de todos los módulos/submódulos en un array plano
  let permisos = [];
  modulos.forEach(modulo => {
    if (modulo.permisos && modulo.permisos.length > 0) {
      permisos = permisos.concat(modulo.permisos);
    }
    if (modulo.children && modulo.children.length > 0) {
      permisos = permisos.concat(extraerPermisos(modulo.children));
    }
  });
  return permisos;
}

function App() {
  const [permisos, setPermisos] = useState([]);

  useEffect(() => {
    const userData = JSON.parse(sessionStorage.getItem('userData') || localStorage.getItem('userData'));
    if (userData && userData.modulos) {
      setPermisos(extraerPermisos(userData.modulos));
    }
  }, []);

  return (
    <Routes>
      {/* Página pública */}
      <Route path="/login" element={<LoginPage />} />

      {/* Rutas dinámicas protegidas por permisos */}
      {permisos
        .filter(permiso => permiso.permiso_ruta)
        .map(permiso => (
          <Route
            key={permiso.permiso_id}
            path={permiso.permiso_ruta}
            element={
              <ProtectedRoute>
                <Layout>
                  {permisoRutaToPage[permiso.permiso_ruta] || <HomePage />}
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