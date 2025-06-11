import UsuariosPage from './pages/admin/usuarios/UsuariosPage';
import CrearUsuarioPage from './pages/admin/usuarios/CrearUsuarioPage';
import ModulosPage from './pages/admin/ModulosPage';
import PerfilesPage from './pages/admin/perfiles/PerfilesPage';
import CrearPerfilPage from './pages/admin/perfiles/CrearPerfilPage';
import EditarPerfilPage from './pages/admin/perfiles/EditarPerfilPage';
import CategoriasPage from './pages/product/CategoriasPage';
import CrearProducto from './pages/product/productos/CrearProducto';
import VerProductos from './pages/product/productos/VerProductos';
import ModificarProducto from './pages/product/productos/ModificarProducto';
import Stock from './pages/product/Stock'; 
import HomePage from './pages/HomePage';

export const rutasProtegidas = [
  {
    path: '/',
    permiso: '', 
    componente: <HomePage />,
  },
  {
    path: '/admin/usuarios',
    permiso: 'Ver Usuarios',
    componente: <UsuariosPage />,
  },
  {
    path: '/admin/usuarios/agregar',
    permiso: 'Agregar Usuario',
    componente: <CrearUsuarioPage />,
  },
  {
    path: '/admin/modulos',
    permiso: 'Ver Modulos',
    componente: <ModulosPage />,
  },
  {
    path: '/admin/perfiles',
    permiso: 'Ver Perfiles',
    componente: <PerfilesPage />,
  },
  {
    path: '/admin/perfiles/agregar',
    permiso: 'Agregar Perfil',
    componente: <CrearPerfilPage />,
  },
  {
    path: '/admin/perfiles/editar/:perfil_id',
    permiso: 'Modificar Perfil',
    componente: <EditarPerfilPage />,
  },
  {
    path: '/productos',
    permiso: 'Ver Productos',
    componente: <VerProductos />,
  },
  {
    path: '/productos/categorias',
    permiso: 'Ver Categorias',
    componente: <CategoriasPage />,
  },
  {
    path: '/productos/agregar',
    permiso: 'Agregar Producto',
    componente: <CrearProducto />,
  },
  {
    path: '/productos/modificar/:producto_id',
    permiso: 'Modificar Producto',
    componente: <ModificarProducto />,
  },
  {
    path: '/productos/stock',
    permiso: '',
    componente: <Stock />,
  },
];