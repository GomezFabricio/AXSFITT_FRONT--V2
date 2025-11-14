import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import {
  FaAngleDown, FaAngleRight, FaFolder, FaTools, FaUsers, FaCubes,
  FaIdBadge, FaUserShield, FaBoxOpen, FaTags, FaPlusSquare, FaBoxes, FaSlidersH,
  FaArrowUp, FaDollarSign, FaBell, FaShoppingCart, FaListAlt, FaCartPlus,
  FaAddressBook, FaChartLine, FaCreditCard, FaTruck, FaPercent, FaTicketAlt,
  FaUserPlus, FaUsersCog, FaThLarge, FaClipboardList, FaUserTag, FaGift,
  FaBoxes as FaBoxesSolid, FaWarehouse, FaClipboardCheck, FaLayerGroup,
  FaExclamationTriangle, FaList, FaSyncAlt, FaHandshake, FaChartBar
} from 'react-icons/fa';

const Aside = ({ isAsideOpen = true }) => {
  const [usuario, setUsuario] = useState(null);
  const [modulos, setModulos] = useState([]);
  const [menuOpen, setMenuOpen] = useState({});
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const cargarUserData = () => {
      const userData = JSON.parse(sessionStorage.getItem('userData'));
      setUsuario(userData);

      if (userData && userData.modulos) {
        const modulosJerarquicos = construirJerarquia(userData.modulos);
        setModulos(modulosJerarquicos);
      }
    };

    cargarUserData();
    window.addEventListener('userDataUpdated', cargarUserData);
    return () => window.removeEventListener('userDataUpdated', cargarUserData);
  }, []);

  const construirJerarquia = (modulos) => {
    const mapa = {};
    const raices = [];
    modulos.forEach(mod => {
      mapa[mod.modulo_id] = { ...mod, children: [] };
    });
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
    if (nombre === 'administración del sistema') return <FaTools />;
    if (nombre === 'productos') return <FaBoxOpen />;
    if (nombre === 'gestión de ventas') return <FaShoppingCart />;
    if (nombre === 'ver modulos') return <FaCubes />;
    if (nombre === 'usuarios') return <FaUsers />;
    if (nombre === 'agregar usuario') return <FaUserPlus />;
    if (nombre === 'ver usuarios') return <FaUsersCog />;
    if (nombre === 'perfiles') return <FaIdBadge />;
    if (nombre === 'agregar perfil') return <FaUserShield />;
    if (nombre === 'ver perfiles') return <FaUserTag />;
    if (nombre === 'categorias' || nombre === 'categorías') return <FaTags />;
    if (nombre === 'agregar categoria') return <FaPlusSquare />;
    if (nombre === 'ver categorias') return <FaClipboardList />;
    if (nombre === 'agregar producto') return <FaPlusSquare />;
    if (nombre === 'ver productos') return <FaBoxesSolid />;
    if (nombre === 'utilidades productos') return <FaSlidersH />;
    if (nombre === 'aumentar precios') return <FaArrowUp />;
    if (nombre === 'notificaciones de stock') return <FaBell />;
    if (nombre === 'listado de ventas') return <FaListAlt />;
    if (nombre === 'agregar venta') return <FaCartPlus />;
    if (nombre === 'clientes') return <FaAddressBook />;
    if (nombre === 'metricas' || nombre === 'métricas') return <FaChartLine />;
    if (nombre === 'metodos de pago' || nombre === 'métodos de pago') return <FaCreditCard />;
    if (nombre === 'metodos de envio' || nombre === 'métodos de envío') return <FaTruck />;
    if (nombre === 'logistica' || nombre === 'logística') return <FaTruck />;
    if (nombre === 'promociones') return <FaGift />;
    if (nombre === 'ofertas') return <FaPercent />;
    if (nombre === 'cupones de descuento') return <FaTicketAlt />;
    if (nombre === 'stock') return <FaWarehouse />;
    if (nombre === 'gestionar stock') return <FaClipboardCheck />;
    if (nombre === 'ver stock') return <FaLayerGroup />;
    if (nombre === 'ver lista de faltantes' || nombre === 'ver faltantes') return <FaExclamationTriangle />;
    if (nombre === 'lista de notificaciones' || nombre === 'notificaciones') return <FaBell />;
    if (nombre === 'gestionar proveedores' || nombre === 'proveedores') return <FaHandshake />;
    if (nombre === 'gestionar pedidos') return <FaClipboardList />;
    if (nombre === 'reportes de stock') return <FaChartBar />;
    if (nombre === 'ver clientes') return <FaAddressBook />;
    if (nombre === 'agregar cliente') return <FaUserPlus />;
    return <FaFolder />;
  };

  const renderizarModulo = (modulo, nivel = 1) => {
    const tieneHijos = modulo.children && modulo.children.length > 0;
    const estaAbierto = menuOpen[modulo.modulo_id];

    return (
      <li key={modulo.modulo_id}>
        <div>
          <button
            onClick={() => toggleMenu(modulo.modulo_id)}
            className={`
              w-full flex items-center justify-between px-4 py-2 rounded-lg
              transition-colors duration-200 font-medium text-base
              text-gray-200 hover:bg-gray-800 hover:text-white
            `}
          >
            <span className="flex items-center gap-2">
              <span className="text-lg">{obtenerIcono(modulo.modulo_descripcion)}</span>
              {modulo.modulo_descripcion}
            </span>
            {tieneHijos || (modulo.permisos && modulo.permisos.length > 0) ? (
              <span className="ml-2">{estaAbierto ? <FaAngleDown /> : <FaAngleRight />}</span>
            ) : null}
          </button>
          <div
            className={`transition-all duration-300 overflow-hidden`}
            style={{
              maxHeight: estaAbierto ? '1000px' : '0',
              opacity: estaAbierto ? 1 : 0.5,
            }}
          >
            {estaAbierto && (
              <ul className="pl-6 space-y-1">
                {tieneHijos && modulo.children.map(hijo => renderizarModulo(hijo, nivel + 1))}
                {modulo.permisos && modulo.permisos.length > 0 && (
                  modulo.permisos
                    .filter(permiso => permiso.permiso_visible_menu)
                    .map(permiso => (
                      <li key={permiso.permiso_id}>
                        {permiso.permiso_ruta ? (
                          <Link
                            to={permiso.permiso_ruta}
                            className={`
                              flex items-center gap-2 px-2 py-1 rounded
                              text-gray-300 hover:bg-gray-800 hover:text-white transition
                            `}
                          >
                            <span className="text-base">{obtenerIcono(permiso.permiso_descripcion)}</span>
                            {permiso.permiso_descripcion}
                          </Link>
                        ) : (
                          <span className="flex items-center gap-2 px-2 py-1 text-gray-400">
                            <span className="text-base">{obtenerIcono(permiso.permiso_descripcion)}</span>
                            {permiso.permiso_descripcion}
                          </span>
                        )}
                      </li>
                    ))
                )}
              </ul>
            )}
          </div>
        </div>
      </li>
    );
  };

  const handleLogout = (e) => {
    e.preventDefault();
    sessionStorage.clear();
    localStorage.clear();
    window.dispatchEvent(new Event('storage'));
    navigate('/login');
  };

  return (
    <aside
      className={`
        h-full bg-gradient-to-b from-black via-gray-900 to-black text-white flex flex-col fixed md:static top-0 left-0 z-30
        transition-all duration-300
        w-72 min-w-[18rem] max-w-[18rem]
        shadow-2xl
        border-r border-gray-800
      `}
      style={{
        overflow: 'hidden',
      }}
    >
      {/* Perfil de usuario */}
      {usuario && (
        <div className="flex flex-col gap-1 px-5 py-4 border-b border-gray-800 bg-transparent">
          <Link to="#" className="hover:underline font-semibold text-base text-white">
            {usuario.nombre} {usuario.apellido}
          </Link>
          <div className="text-xs text-gray-400">{usuario.usuario_email}</div>
        </div>
      )}

      {/* Dashboard/Home */}
      <nav className="flex-1 overflow-y-auto mt-2 custom-scrollbar pr-1">
        <ul className="space-y-1">
          <li>
            <Link
              to="/"
              className={`
                w-full flex items-center gap-2 px-4 py-2 rounded-lg font-semibold
                transition hover:bg-gray-800 hover:text-white
                text-gray-200
              `}
            >
              <FaThLarge />
              Inicio
            </Link>
          </li>
          {modulos.length > 0 ? (
            modulos.map(modulo => renderizarModulo(modulo, 1))
          ) : (
            <li className="px-4 py-2 text-sm text-gray-400">
              <i className="fas fa-exclamation-circle mr-1" />
              No hay módulos disponibles
            </li>
          )}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800 bg-transparent">
        <button
          className="flex items-center gap-2 text-gray-400 hover:text-white hover:underline transition"
          onClick={handleLogout}
        >
          <LogOut size={18} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
};

export default Aside;