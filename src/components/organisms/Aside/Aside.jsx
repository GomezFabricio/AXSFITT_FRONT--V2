import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import {
  FaAngleDown, FaAngleRight, FaFolder, FaUserCircle, FaTools, FaUsers, FaCubes,
  FaIdBadge, FaUserShield, FaBoxOpen, FaTags, FaPlusSquare, FaBoxes, FaSlidersH,
  FaArrowUp, FaDollarSign, FaBell, FaShoppingCart, FaListAlt, FaCartPlus,
  FaAddressBook, FaChartLine, FaCreditCard, FaTruck, FaPercent, FaTicketAlt,
  FaUserPlus, FaUsersCog
} from 'react-icons/fa';

const Aside = () => {
  const [usuario, setUsuario] = useState(null);
  const [modulos, setModulos] = useState([]);
  const [menuOpen, setMenuOpen] = useState({});

  useEffect(() => {
    const userData = JSON.parse(sessionStorage.getItem('userData') || localStorage.getItem('userData'));
    setUsuario(userData);

    if (userData && userData.modulos) {
      const modulosJerarquicos = construirJerarquia(userData.modulos);
      setModulos(modulosJerarquicos);
    }
  }, []);

  const construirJerarquia = (modulos) => {
    const mapa = {};
    const raices = [];

    // Crea el mapa de módulos
    modulos.forEach(mod => {
      mapa[mod.modulo_id] = { ...mod, children: [] };
    });

    // Asocia hijos a padres
    modulos.forEach(mod => {
      if (mod.modulo_padre_id === null) {
        raices.push(mapa[mod.modulo_id]);
      } else if (mapa[mod.modulo_padre_id]) {
        mapa[mod.modulo_padre_id].children.push(mapa[mod.modulo_id]);
      }
    });

    return raices;
  };

  const toggleMenu = (id) => {
    setMenuOpen(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const obtenerIcono = (descripcion) => {
    const nombre = descripcion?.toLowerCase() || '';

    // Administración
    if (nombre.includes('administración')) return <FaTools />;
    if (nombre === 'ver modulos') return <FaCubes />;
    if (nombre === 'usuarios') return <FaUsers />;
    if (nombre === 'agregar usuario') return <FaUserPlus />;
    if (nombre === 'administrar usuarios') return <FaUsersCog />;
    if (nombre === 'perfiles') return <FaIdBadge />;
    if (nombre === 'agregar perfil') return <FaUserShield />;
    if (nombre === 'administrar perfiles') return <FaUserShield />;

    // Productos
    if (nombre === 'productos') return <FaBoxOpen />;
    if (nombre === 'categorias' || nombre === 'categorías') return <FaTags />;
    if (nombre === 'agregar categoria') return <FaPlusSquare />;
    if (nombre === 'administrar categorias') return <FaTags />;
    if (nombre === 'agregar producto') return <FaPlusSquare />;
    if (nombre === 'configuración avanzada') return <FaSlidersH />;
    if (nombre === 'aumentar precios') return <FaArrowUp />;
    if (nombre === 'notificaciones de stock') return <FaBell />;

    // Ventas
    if (nombre === 'gestión de ventas') return <FaShoppingCart />;
    if (nombre === 'listado de ventas') return <FaListAlt />;
    if (nombre === 'agregar venta') return <FaCartPlus />;
    if (nombre === 'clientes') return <FaAddressBook />;
    if (nombre === 'metricas' || nombre === 'métricas') return <FaChartLine />;
    if (nombre === 'metodos de pago' || nombre === 'métodos de pago') return <FaCreditCard />;
    if (nombre === 'metodos de envio' || nombre === 'métodos de envío') return <FaTruck />;
    if (nombre === 'logistica' || nombre === 'logística') return <FaTruck />;
    if (nombre === 'crear promociones') return <FaTags />;
    if (nombre === 'ofertas') return <FaPercent />;
    if (nombre === 'cupones de descuento') return <FaTicketAlt />;

    // Perfil
    if (nombre === 'perfil') return <FaUserCircle />;

    // Default
    return <FaFolder />;
  };

  const renderizarModulo = (modulo) => {
    const tieneHijos = modulo.children && modulo.children.length > 0;
    const estaAbierto = menuOpen[modulo.modulo_id];

    return (
      <li key={modulo.modulo_id} className="text-white">
        <div>
          <button
            onClick={() => toggleMenu(modulo.modulo_id)}
            className="w-full flex items-center justify-between px-4 py-2 hover:bg-purple-800 transition"
          >
            <span className="flex items-center gap-2">
              {obtenerIcono(modulo.modulo_descripcion)}
              {modulo.modulo_descripcion}
            </span>
            {tieneHijos || (modulo.permisos && modulo.permisos.length > 0) ? (
              estaAbierto ? <FaAngleDown /> : <FaAngleRight />
            ) : null}
          </button>
          {estaAbierto && (
            <ul className="pl-6 space-y-1">
              {/* Renderiza submódulos */}
              {tieneHijos && modulo.children.map(hijo => renderizarModulo(hijo))}
              {/* Renderiza permisos como tercer nivel */}
              {modulo.permisos && modulo.permisos.length > 0 && (
                modulo.permisos
                  .filter(permiso => permiso.permiso_visible_menu) // Solo permisos visibles en menú
                  .map(permiso => (
                    <li key={permiso.permiso_id} className="text-purple-200 pl-4">
                      {permiso.permiso_ruta ? (
                        <Link to={permiso.permiso_ruta} className="flex items-center gap-2 hover:underline">
                          {obtenerIcono(permiso.permiso_descripcion)}
                          {permiso.permiso_descripcion}
                        </Link>
                      ) : (
                        <span className="flex items-center gap-2">
                          {obtenerIcono(permiso.permiso_descripcion)}
                          {permiso.permiso_descripcion}
                        </span>
                      )}
                    </li>
                  ))
              )}
            </ul>
          )}
        </div>
      </li>
    );
  };

  return (
    <aside className="w-72 h-full bg-black text-white flex flex-col">

      {/* Perfil de usuario */}
      {usuario && (
        <div className="flex items-center gap-3 px-4 py-3 border-b border-purple-700">
          <Link to="/perfil" className="hover:underline">
            {usuario.nombre} {usuario.apellido}
          </Link>
        </div>
      )}

      {/* Navegación */}
      <nav className="flex-1 overflow-y-auto mt-2">
        <ul className="space-y-1">
          {modulos.length > 0 ? (
            modulos.map(modulo => renderizarModulo(modulo))
          ) : (
            <li className="px-4 py-2 text-sm text-purple-200">
              <i className="fas fa-exclamation-circle mr-1" />
              No hay módulos disponibles
            </li>
          )}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-purple-700">
        <Link to="/logout" className="flex items-center gap-2 text-white hover:underline">
          <LogOut size={18} />
          Cerrar sesión
        </Link>
      </div>
    </aside>
  );
};

export default Aside;