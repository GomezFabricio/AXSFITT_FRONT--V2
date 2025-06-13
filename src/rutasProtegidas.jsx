import UsuariosPage from './pages/admin/usuarios/UsuariosPage';
import CrearUsuarioPage from './pages/admin/usuarios/CrearUsuarioPage';
import ModulosPage from './pages/admin/modulos/ModulosPage';
import PerfilesPage from './pages/admin/perfiles/PerfilesPage';
import CrearPerfilPage from './pages/admin/perfiles/CrearPerfilPage';
import EditarPerfilPage from './pages/admin/perfiles/EditarPerfilPage';
import CategoriasPage from './pages/product/categorias/CategoriasPage';
import CrearProducto from './pages/product/productos/CrearProducto';
import VerProductos from './pages/product/productos/VerProductos';
import ModificarProducto from './pages/product/productos/ModificarProducto';
import Stock from './pages/product/stock/Stock'; 
import Faltantes from './pages/product/stock/Faltantes';
import CrearClientePage from './pages/ventas/clientes/CrearClientePage';
import VerClientes from './pages/ventas/clientes/VerClientes';
import AgregarVentaPage from './pages/ventas/ventas/AgregarVentaPage';
import VerVentasPage from './pages/ventas/ventas/VerVentasPage';
import DetalleVentaPage from './pages/ventas/ventas/DetalleVentaPage';
import HomePage from './pages/HomePage';
import FacturaPage from './pages/ventas/ventas/FacturaPage';

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
    permiso: 'Gestionar Stock',
    componente: <Stock />,
  },
  {
    path: '/productos/faltantes',
    permiso: 'Ver Lista de Faltantes',
    componente: <Faltantes />,
  },
  {
    path: '/ventas/clientes/agregar',
    permiso: 'Agregar Cliente',
    componente: <CrearClientePage />,
  },
  {
    path: '/ventas/clientes',
    permiso: 'Ver Clientes',
    componente: <VerClientes />,
  },
  {
    path: '/ventas',
    permiso: 'Listado de Ventas',
    componente: <VerVentasPage />,
  },
  {
    path: '/ventas/agregar',
    permiso: 'Agregar Venta',
    componente: <AgregarVentaPage />,
  },
  {
    path: '/ventas/:id',
    permiso: 'Listado de Ventas',
    componente: <DetalleVentaPage />,
  },
  {
    path: '/ventas/:id/factura',
    permiso: 'Listado de Ventas',
    componente: <FacturaPage />,
  }
];