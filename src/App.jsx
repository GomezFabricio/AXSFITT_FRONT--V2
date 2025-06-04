import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Layout from './components/templates/Layout/Layout';
import LoginPage from './pages/auth/LoginPage';
import HomePage from './pages/HomePage';
import ProtectedRoute from './pages/common/ProtectedRoute';

// Importa los componentes de páginas
import UsuariosPage from './pages/admin/usuarios/UsuariosPage';
import CrearUsuarioPage from './pages/admin/usuarios/CrearUsuarioPage';
import ModulosPage from './pages/admin/ModulosPage';
import PerfilesPage from './pages/admin/perfiles/PerfilesPage';
import CrearPerfilPage from './pages/admin/perfiles/CrearPerfilPage';
import EditarPerfilPage from './pages/admin/perfiles/EditarPerfilPage';
import CategoriasPage from './pages/product/CategoriasPage'; 

// Mapea las rutas de permisos a componentes
const permisoRutaToPage = {
  '/admin/usuarios': <UsuariosPage />,
  '/admin/usuarios/agregar': <CrearUsuarioPage />,
  '/admin/modulos': <ModulosPage />,
  '/admin/perfiles': <PerfilesPage />,
  '/admin/perfiles/agregar': <CrearPerfilPage />,
  '/productos/categorias': <CategoriasPage />, // Añadir ruta para CategoriasPage
  // Las rutas con parámetros dinámicos no se incluyen aquí
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
  const location = useLocation();

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
                  {/* Forzar remount de PerfilesPage usando key */}
                  {permiso.permiso_ruta === '/admin/perfiles'
                    ? <PerfilesPage key={location.key} />
                    : permisoRutaToPage[permiso.permiso_ruta] || <HomePage />}
                </Layout>
              </ProtectedRoute>
            }
          />
        ))}

      {/* Ruta para editar perfil (con parámetro dinámico) */}
      <Route
        path="/admin/perfiles/editar/:perfil_id"
        element={
          <ProtectedRoute>
            <Layout>
              <EditarPerfilPage />
            </Layout>
          </ProtectedRoute>
        }
      />

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

      {/* Ruta por defecto para no encontrados */}
      <Route
        path="*"
        element={
          <ProtectedRoute>
            <Layout>
              <HomePage /> {/* O una página 404 específica */}
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;