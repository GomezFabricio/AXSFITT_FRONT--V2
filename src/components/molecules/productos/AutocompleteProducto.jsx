import React, { useState, useEffect, useRef } from 'react';
import { buscarProductosPorNombre } from '../../../api/productosApi';
import { FaSearch, FaExclamationTriangle } from 'react-icons/fa';

const AutocompleteProducto = ({ 
  valor, 
  onChange, 
  categoriaId, 
  placeholder = "Ingrese el nombre del producto",
  className = "",
  error = null,
  disabled = false,
  onDuplicateFound = null // Callback para cuando se encuentra un duplicado
}) => {
  const [sugerencias, setSugerencias] = useState([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [duplicadoEncontrado, setDuplicadoEncontrado] = useState(null);
  const timeoutRef = useRef(null);
  const containerRef = useRef(null);

  // Cerrar sugerencias cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setMostrarSugerencias(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Función para buscar productos
  const buscarProductos = async (nombreBusqueda) => {
    if (!nombreBusqueda || nombreBusqueda.length < 2) {
      setSugerencias([]);
      setMostrarSugerencias(false);
      setDuplicadoEncontrado(null);
      return;
    }

    setCargando(true);
    try {
      const token = sessionStorage.getItem('token');
      const productos = await buscarProductosPorNombre(nombreBusqueda, categoriaId, token);
      
      setSugerencias(productos);
      setMostrarSugerencias(productos.length > 0);

      // Verificar si hay duplicado exacto
      const duplicado = productos.find(
        producto => 
          producto.producto_nombre.toLowerCase() === nombreBusqueda.toLowerCase() &&
          (!categoriaId || producto.categoria_id === parseInt(categoriaId))
      );

      if (duplicado) {
        setDuplicadoEncontrado(duplicado);
        if (onDuplicateFound) {
          onDuplicateFound(duplicado);
        }
      } else {
        setDuplicadoEncontrado(null);
        if (onDuplicateFound) {
          onDuplicateFound(null);
        }
      }
    } catch (error) {
      console.error('Error al buscar productos:', error);
      setSugerencias([]);
      setMostrarSugerencias(false);
    } finally {
      setCargando(false);
    }
  };

  // Manejar cambios en el input
  const handleInputChange = (e) => {
    const nuevoValor = e.target.value;
    onChange(nuevoValor);

    // Limpiar timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Crear nuevo timeout para la búsqueda
    timeoutRef.current = setTimeout(() => {
      buscarProductos(nuevoValor);
    }, 300); // Esperar 300ms después de que el usuario deje de escribir
  };

  // Manejar selección de sugerencia
  const handleSugerenciaClick = (producto) => {
    onChange(producto.producto_nombre);
    setMostrarSugerencias(false);
    setDuplicadoEncontrado(producto);
    if (onDuplicateFound) {
      onDuplicateFound(producto);
    }
  };

  // Manejar focus
  const handleFocus = () => {
    if (valor && valor.length >= 2) {
      buscarProductos(valor);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <input
          type="text"
          value={valor}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-3 py-2 pr-10 bg-gray-50 border rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 transition-colors ${
            error || duplicadoEncontrado 
              ? 'border-red-400 focus:ring-red-400' 
              : 'border-gray-200'
          } ${className}`}
        />
        
        {/* Icono de búsqueda o carga */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {cargando ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-violet-500 border-t-transparent"></div>
          ) : duplicadoEncontrado ? (
            <FaExclamationTriangle className="h-4 w-4 text-red-500" />
          ) : (
            <FaSearch className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </div>

      {/* Mensaje de error por duplicado */}
      {duplicadoEncontrado && (
        <div className="mt-1 p-2 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600 flex items-center">
            <FaExclamationTriangle className="h-4 w-4 mr-1" />
            Ya existe un producto con este nombre en la categoría "{duplicadoEncontrado.categoria_nombre}"
          </p>
        </div>
      )}

      {/* Error externo */}
      {error && !duplicadoEncontrado && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}

      {/* Lista de sugerencias */}
      {mostrarSugerencias && sugerencias.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {sugerencias.map((producto) => (
            <div
              key={producto.producto_id}
              className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
              onClick={() => handleSugerenciaClick(producto)}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900">{producto.producto_nombre}</span>
                <span className="text-sm text-gray-500">{producto.categoria_nombre}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AutocompleteProducto;
