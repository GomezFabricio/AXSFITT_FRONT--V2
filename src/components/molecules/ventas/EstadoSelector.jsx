import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

const EstadoSelector = ({ tipo, estadoActual, onEstadoChange, disabled }) => {
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
            {opciones.map((opcion) => (
              <button
                key={opcion.valor}
                onClick={() => handleSeleccionarEstado(opcion.valor)}
                className={`block w-full text-left px-4 py-2 text-sm ${opcion.clase} ${opcion.valor === estadoActual ? 'font-bold' : ''}`}
                role="menuitem"
              >
                {opcion.etiqueta}
              </button>
            ))}
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
  disabled: PropTypes.bool
};

EstadoSelector.defaultProps = {
  disabled: false
};

export default EstadoSelector;