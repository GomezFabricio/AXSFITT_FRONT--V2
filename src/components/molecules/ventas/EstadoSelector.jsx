import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

const EstadoSelector = ({ tipo, estadoActual, onEstadoChange, disabled, fechaVenta }) => {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const menuRef = useRef(null);
  
  const opciones = tipo === 'pago' 
    ? [
        { valor: 'pendiente', etiqueta: 'Pendiente', clase: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' },
        { valor: 'abonado', etiqueta: 'Abonado', clase: 'bg-green-100 text-green-800 hover:bg-green-200' },
        { valor: 'cancelado', etiqueta: 'Cancelado', clase: 'bg-red-100 text-red-800 hover:bg-red-200' },
      ]
    : [
        { valor: 'pendiente', etiqueta: 'Pendiente', clase: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' },
        { valor: 'enviado', etiqueta: 'Enviado', clase: 'bg-blue-100 text-blue-800 hover:bg-blue-200' },
        { valor: 'entregado', etiqueta: 'Entregado', clase: 'bg-green-100 text-green-800 hover:bg-green-200' },
        { valor: 'cancelado', etiqueta: 'Cancelado', clase: 'bg-red-100 text-red-800 hover:bg-red-200' },
      ];

  // Función para verificar si una opción está deshabilitada
  const isOpcionDeshabilitada = (opcion) => {
    // Si el estado actual es cancelado, no se puede cambiar a otros estados
    if (estadoActual === 'cancelado' && opcion.valor !== 'cancelado') {
      return true;
    }
    
    // Si es tipo pago y se intenta cancelar, verificar restricción de 24 horas
    if (tipo === 'pago' && opcion.valor === 'cancelado' && fechaVenta) {
      const ahora = new Date();
      const fechaVentaDate = new Date(fechaVenta);
      const diferenciaHoras = (ahora - fechaVentaDate) / (1000 * 60 * 60);
      
      if (diferenciaHoras > 24) {
        return true;
      }
    }
    
    return false;
  };
  
  // Cerrar el menú cuando se hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuAbierto(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuRef]);
  
  const getEstadoClass = () => {
    const opcion = opciones.find(o => o.valor === estadoActual);
    return opcion ? opcion.clase : 'bg-gray-100 text-gray-800';
  };
  
  const handleSeleccionarEstado = (nuevoEstado) => {
    if (nuevoEstado !== estadoActual) {
      onEstadoChange(nuevoEstado);
    }
    setMenuAbierto(false);
  };
  
  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => !disabled && setMenuAbierto(!menuAbierto)}
        className={`px-2 py-1 rounded-full text-xs leading-5 font-semibold cursor-pointer relative ${getEstadoClass()} ${disabled ? 'opacity-75 cursor-default' : ''}`}
        disabled={disabled}
      >
        {opciones.find(o => o.valor === estadoActual)?.etiqueta || estadoActual}
        {!disabled && (
          <span className="ml-1">▼</span>
        )}
      </button>
      
      {menuAbierto && !disabled && (
        <div 
          className="fixed z-50 mt-1 w-36 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5" 
          style={{
            top: menuRef.current ? menuRef.current.getBoundingClientRect().bottom + window.scrollY : 0,
            left: menuRef.current ? menuRef.current.getBoundingClientRect().left + window.scrollX : 0
          }}
        >
          <div className="py-1" role="menu" aria-orientation="vertical">
            {opciones.map((opcion) => {
              const deshabilitada = isOpcionDeshabilitada(opcion);
              return (
                <button
                  key={opcion.valor}
                  onClick={() => !deshabilitada && handleSeleccionarEstado(opcion.valor)}
                  className={`block w-full text-left px-4 py-2 text-sm ${opcion.clase} ${opcion.valor === estadoActual ? 'font-bold' : ''} ${deshabilitada ? 'opacity-50 cursor-not-allowed' : ''}`}
                  role="menuitem"
                  disabled={deshabilitada}
                  title={deshabilitada ? 
                    (estadoActual === 'cancelado' && opcion.valor !== 'cancelado' ? 
                      'No se puede cambiar desde cancelado a otro estado' : 
                      'No se puede cancelar después de 24 horas') : 
                    ''}
                >
                  {opcion.etiqueta}
                  {deshabilitada && (
                    <span className="ml-1 text-gray-400">🚫</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

EstadoSelector.propTypes = {
  tipo: PropTypes.oneOf(['pago', 'envio']).isRequired,
  estadoActual: PropTypes.string.isRequired,
  onEstadoChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  fechaVenta: PropTypes.string
};

EstadoSelector.defaultProps = {
  disabled: false,
  fechaVenta: null
};

export default EstadoSelector;