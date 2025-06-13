import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaShoppingCart, FaBoxOpen, FaUsers, FaUserFriends, 
  FaChartLine, FaTags, FaClipboardList, FaWarehouse,
  FaLayerGroup, FaCog
} from 'react-icons/fa';
import tienePermiso from '../utils/tienePermiso';

const HomePage = () => {
  const [userName, setUserName] = useState('');
  
  useEffect(() => {
    try {
      const userData = JSON.parse(sessionStorage.getItem('userData'));
      if (userData && userData.nombre) {
        setUserName(userData.nombre);
      }
    } catch (error) {
      console.error("Error al obtener los datos del usuario:", error);
    }
  }, []);

  return (
    <div className="from-violet-50 via-gray-100 to-violet-100 min-h-[70vh] px-4 py-8 flex flex-col items-center relative overflow-hidden animate-fade-in">
      {/* Efecto de brillo detrás del logo */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-0">
        <div className="h-32 w-32 rounded-full bg-violet-300 blur-3xl opacity-40 animate-pulse"></div>
      </div>
      
      {/* Logo y título */}
      <img
        src="/img/logo_axsfitt.svg"
        alt="AXSFITT Logo"
        className="h-24 w-24 mb-4 rounded-full shadow-2xl z-10 transition-transform duration-300 hover:scale-110 hover:rotate-6"
        style={{ boxShadow: '0 8px 32px 0 rgba(124,58,237,0.25)' }}
        onError={(e) => {
          e.target.src = 'https://placehold.co/200x200?text=AXSFITT';
        }}
      />
      <h1 className="text-4xl font-extrabold text-purple-800 mb-2 text-center drop-shadow-lg animate-slide-down z-10">
        Bienvenido a <span className="text-violet-600">AXSFITT</span>
      </h1>
      
      <p className="text-lg text-gray-700 mb-8 text-center animate-fade-in-slow z-10 max-w-2xl">
        Hola <span className="font-semibold text-violet-700">{userName || 'Usuario'}</span>, 
        bienvenido al sistema de gestión. Accede rápidamente a tus funciones:
      </p>
      
      {/* Accesos directos personalizados según permisos */}
      <div className="w-full max-w-5xl grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 z-10">
        {/* Administración del Sistema */}
        {tienePermiso('Ver Modulos') && (
          <Link to="/admin/modulos" className="bg-white rounded-xl shadow-md p-5 flex flex-col items-center justify-center border border-violet-100 hover:shadow-lg transition animate-pop">
            <FaCog className="text-4xl text-gray-600 mb-3" />
            <span className="text-sm font-medium text-gray-700">Módulos</span>
          </Link>
        )}
        
        {/* Usuarios */}
        {tienePermiso('Ver Usuarios') && (
          <Link to="/admin/usuarios" className="bg-white rounded-xl shadow-md p-5 flex flex-col items-center justify-center border border-violet-100 hover:shadow-lg transition animate-pop delay-100">
            <FaUsers className="text-4xl text-purple-600 mb-3" />
            <span className="text-sm font-medium text-gray-700">Usuarios</span>
          </Link>
        )}
        
        {/* Agregar Usuario */}
        {tienePermiso('Agregar Usuario') && (
          <Link to="/admin/usuarios/agregar" className="bg-white rounded-xl shadow-md p-5 flex flex-col items-center justify-center border border-violet-100 hover:shadow-lg transition animate-pop delay-150">
            <div className="relative">
              <FaUsers className="text-4xl text-purple-600 mb-3" />
              <div className="absolute -top-1 -right-1 bg-green-500 rounded-full w-4 h-4 flex items-center justify-center text-white text-xs font-bold">+</div>
            </div>
            <span className="text-sm font-medium text-gray-700">Nuevo Usuario</span>
          </Link>
        )}
        
        {/* Perfiles */}
        {tienePermiso('Ver Perfiles') && (
          <Link to="/admin/perfiles" className="bg-white rounded-xl shadow-md p-5 flex flex-col items-center justify-center border border-violet-100 hover:shadow-lg transition animate-pop delay-200">
            <FaLayerGroup className="text-4xl text-blue-600 mb-3" />
            <span className="text-sm font-medium text-gray-700">Perfiles</span>
          </Link>
        )}
        
        {/* Productos */}
        {tienePermiso('Ver Productos') && (
          <Link to="/productos" className="bg-white rounded-xl shadow-md p-5 flex flex-col items-center justify-center border border-violet-100 hover:shadow-lg transition animate-pop delay-200">
            <FaBoxOpen className="text-4xl text-indigo-600 mb-3" />
            <span className="text-sm font-medium text-gray-700">Productos</span>
          </Link>
        )}
        
        {/* Nuevo Producto */}
        {tienePermiso('Agregar Producto') && (
          <Link to="/productos/agregar" className="bg-white rounded-xl shadow-md p-5 flex flex-col items-center justify-center border border-violet-100 hover:shadow-lg transition animate-pop delay-250">
            <div className="relative">
              <FaBoxOpen className="text-4xl text-indigo-600 mb-3" />
              <div className="absolute -top-1 -right-1 bg-green-500 rounded-full w-4 h-4 flex items-center justify-center text-white text-xs font-bold">+</div>
            </div>
            <span className="text-sm font-medium text-gray-700">Nuevo Producto</span>
          </Link>
        )}
        
        {/* Categorías */}
        {tienePermiso('Ver Categorias') && (
          <Link to="/productos/categorias" className="bg-white rounded-xl shadow-md p-5 flex flex-col items-center justify-center border border-violet-100 hover:shadow-lg transition animate-pop delay-300">
            <FaTags className="text-4xl text-yellow-600 mb-3" />
            <span className="text-sm font-medium text-gray-700">Categorías</span>
          </Link>
        )}
        
        {/* Gestión de Stock */}
        {tienePermiso('Gestionar Stock') && (
          <Link to="/productos/stock" className="bg-white rounded-xl shadow-md p-5 flex flex-col items-center justify-center border border-violet-100 hover:shadow-lg transition animate-pop delay-350">
            <FaWarehouse className="text-4xl text-orange-600 mb-3" />
            <span className="text-sm font-medium text-gray-700">Gestión de Stock</span>
          </Link>
        )}
        
        {/* Faltantes */}
        {tienePermiso('Ver Lista de Faltantes') && (
          <Link to="/productos/faltantes" className="bg-white rounded-xl shadow-md p-5 flex flex-col items-center justify-center border border-violet-100 hover:shadow-lg transition animate-pop delay-350">
            <div className="relative">
              <FaWarehouse className="text-4xl text-orange-600 mb-3" />
              <div className="absolute -top-1 -right-1 bg-red-500 rounded-full w-4 h-4 flex items-center justify-center text-white text-xs font-bold">!</div>
            </div>
            <span className="text-sm font-medium text-gray-700">Faltantes</span>
          </Link>
        )}
        
        {/* Ventas */}
        {tienePermiso('Listado de Ventas') && (
          <Link to="/ventas" className="bg-white rounded-xl shadow-md p-5 flex flex-col items-center justify-center border border-violet-100 hover:shadow-lg transition animate-pop delay-100">
            <FaShoppingCart className="text-4xl text-violet-600 mb-3" />
            <span className="text-sm font-medium text-gray-700">Ventas</span>
          </Link>
        )}
        
        {/* Nueva Venta */}
        {tienePermiso('Agregar Venta') && (
          <Link to="/ventas/agregar" className="bg-white rounded-xl shadow-md p-5 flex flex-col items-center justify-center border border-violet-100 hover:shadow-lg transition animate-pop delay-150">
            <div className="relative">
              <FaShoppingCart className="text-4xl text-violet-600 mb-3" />
              <div className="absolute -top-1 -right-1 bg-green-500 rounded-full w-4 h-4 flex items-center justify-center text-white text-xs font-bold">+</div>
            </div>
            <span className="text-sm font-medium text-gray-700">Nueva Venta</span>
          </Link>
        )}
        
        {/* Clientes */}
        {tienePermiso('Ver Clientes') && (
          <Link to="/ventas/clientes" className="bg-white rounded-xl shadow-md p-5 flex flex-col items-center justify-center border border-violet-100 hover:shadow-lg transition animate-pop delay-250">
            <FaUserFriends className="text-4xl text-blue-600 mb-3" />
            <span className="text-sm font-medium text-gray-700">Clientes</span>
          </Link>
        )}
        
        {/* Nuevo Cliente */}
        {tienePermiso('Agregar Cliente') && (
          <Link to="/ventas/clientes/agregar" className="bg-white rounded-xl shadow-md p-5 flex flex-col items-center justify-center border border-violet-100 hover:shadow-lg transition animate-pop delay-300">
            <div className="relative">
              <FaUserFriends className="text-4xl text-blue-600 mb-3" />
              <div className="absolute -top-1 -right-1 bg-green-500 rounded-full w-4 h-4 flex items-center justify-center text-white text-xs font-bold">+</div>
            </div>
            <span className="text-sm font-medium text-gray-700">Nuevo Cliente</span>
          </Link>
        )}
        
        {/* Métricas de Ventas */}
        {tienePermiso('Metricas') && (
          <Link to="/ventas/metricas" className="bg-white rounded-xl shadow-md p-5 flex flex-col items-center justify-center border border-violet-100 hover:shadow-lg transition animate-pop delay-400">
            <FaChartLine className="text-4xl text-green-600 mb-3" />
            <span className="text-sm font-medium text-gray-700">Métricas</span>
          </Link>
        )}
        
      </div>
      
      {/* Sutiles partículas decorativas */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-6 left-8 w-3 h-3 bg-violet-200 rounded-full blur-sm opacity-60 animate-bounce-slow"></div>
        <div className="absolute bottom-8 right-10 w-2 h-2 bg-violet-300 rounded-full blur-sm opacity-50 animate-bounce-slower"></div>
        <div className="absolute bottom-4 left-1/2 w-4 h-4 bg-violet-100 rounded-full blur-md opacity-40 animate-bounce"></div>
      </div>
      
      {/* Animaciones personalizadas */}
      <style>
        {`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(30px);}
            to { opacity: 1; transform: translateY(0);}
          }
          .animate-fade-in { animation: fade-in 0.8s cubic-bezier(.4,0,.2,1) both; }
          .animate-fade-in-slow { animation: fade-in 1.5s cubic-bezier(.4,0,.2,1) both; }
          @keyframes slide-down {
            from { opacity: 0; transform: translateY(-40px);}
            to { opacity: 1; transform: translateY(0);}
          }
          .animate-slide-down { animation: slide-down 1s cubic-bezier(.4,0,.2,1) both; }
          @keyframes pop {
            0% { transform: scale(0.95); opacity: 0;}
            100% { transform: scale(1); opacity: 1;}
          }
          .animate-pop { animation: pop 0.7s cubic-bezier(.4,0,.2,1) both; }
          .animate-pop.delay-100 { animation-delay: .1s; }
          .animate-pop.delay-150 { animation-delay: .15s; }
          .animate-pop.delay-200 { animation-delay: .2s; }
          .animate-pop.delay-250 { animation-delay: .25s; }
          .animate-pop.delay-300 { animation-delay: .3s; }
          .animate-pop.delay-350 { animation-delay: .35s; }
          .animate-pop.delay-400 { animation-delay: .4s; }
          .animate-pop.delay-450 { animation-delay: .45s; }
          @keyframes bounce-slow {
            0%, 100% { transform: translateY(0);}
            50% { transform: translateY(-10px);}
          }
          .animate-bounce-slow { animation: bounce-slow 2.5s infinite; }
          @keyframes bounce-slower {
            0%, 100% { transform: translateY(0);}
            50% { transform: translateY(-6px);}
          }
          .animate-bounce-slower { animation: bounce-slower 3.5s infinite; }
        `}
      </style>
    </div>
  );
};

export default HomePage;