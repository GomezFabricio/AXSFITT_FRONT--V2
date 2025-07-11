import React, { useState, useEffect, useRef } from 'react';
import { FaBarcode, FaExclamationTriangle, FaCheck } from 'react-icons/fa';

const InputSku = ({ 
  valor, 
  onChange, 
  placeholder = "Ingrese el SKU del producto (opcional)",
  className = "",
  error = null,
  disabled = false,
  onSkuValidated = null // Callback para cuando se valida el SKU
}) => {
  const [skuDuplicado, setSkuDuplicado] = useState(false);
  const [validandoSku, setValidandoSku] = useState(false);
  const [skuValido, setSkuValido] = useState(false);
  const timeoutRef = useRef(null);

  // Función para validar SKU (simulada - en producción haría llamada al backend)
  const validarSku = async (sku) => {
    if (!sku || sku.trim() === '') {
      setSkuDuplicado(false);
      setSkuValido(false);
      if (onSkuValidated) {
        onSkuValidated({ valid: true, duplicate: false, sku: null });
      }
      return;
    }

    setValidandoSku(true);
    try {
      // Simular llamada al backend para validar SKU
      // En producción, esto sería una llamada real al endpoint de validación
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simulación: considerar duplicado si el SKU contiene "DUP"
      const esDuplicado = sku.toLowerCase().includes('dup');
      
      setSkuDuplicado(esDuplicado);
      setSkuValido(!esDuplicado);
      
      if (onSkuValidated) {
        onSkuValidated({ 
          valid: !esDuplicado, 
          duplicate: esDuplicado, 
          sku: sku 
        });
      }
    } catch (error) {
      console.error('Error al validar SKU:', error);
      setSkuDuplicado(false);
      setSkuValido(false);
      if (onSkuValidated) {
        onSkuValidated({ valid: false, duplicate: false, sku: sku });
      }
    } finally {
      setValidandoSku(false);
    }
  };

  // Manejar cambios en el input
  const handleInputChange = (e) => {
    const nuevoValor = e.target.value;
    onChange(nuevoValor);

    // Resetear estados
    setSkuDuplicado(false);
    setSkuValido(false);

    // Limpiar timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Crear nuevo timeout para la validación
    timeoutRef.current = setTimeout(() => {
      validarSku(nuevoValor);
    }, 800); // Esperar 800ms después de que el usuario deje de escribir
  };

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={valor}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-3 py-2 pr-10 bg-gray-50 border rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 transition-colors ${
            error || skuDuplicado 
              ? 'border-red-400 focus:ring-red-400' 
              : skuValido 
                ? 'border-green-400 focus:ring-green-400'
                : 'border-gray-200'
          } ${className}`}
        />
        
        {/* Icono de estado */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {validandoSku ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-violet-500 border-t-transparent"></div>
          ) : skuDuplicado ? (
            <FaExclamationTriangle className="h-4 w-4 text-red-500" />
          ) : skuValido ? (
            <FaCheck className="h-4 w-4 text-green-500" />
          ) : (
            <FaBarcode className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </div>

      {/* Mensaje de error por duplicado */}
      {skuDuplicado && (
        <div className="mt-1 p-2 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600 flex items-center">
            <FaExclamationTriangle className="h-4 w-4 mr-1" />
            Ya existe un producto con este SKU
          </p>
        </div>
      )}

      {/* Mensaje de éxito */}
      {skuValido && valor && (
        <div className="mt-1 p-2 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-600 flex items-center">
            <FaCheck className="h-4 w-4 mr-1" />
            SKU disponible
          </p>
        </div>
      )}

      {/* Error externo */}
      {error && !skuDuplicado && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

export default InputSku;
