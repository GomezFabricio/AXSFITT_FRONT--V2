import React from 'react';
import PropTypes from 'prop-types';
import { FaEye, FaEyeSlash, FaEdit, FaTrash } from 'react-icons/fa';

const TarjetaProducto = ({
  nombre,
  categoria,
  marca,
  stockTotal,
  imagenUrl,
  visible,
  producto_estado,
  onEditar,
  onEliminar,
  onToggleVisible,
  onVerStock,
  onReactivar, // Nueva prop para la función reactivar
}) => {
  return (
    <div className="flex items-center p-4 bg-white shadow-md rounded-md border border-gray-200 hover:shadow-lg transition-shadow">
      {/* Imagen del producto */}
      <div className="flex-shrink-0">
        <img
          src={imagenUrl}
          alt={nombre}
          className="w-20 h-20 object-cover rounded-md"
        />
      </div>

      {/* Información del producto */}
      <div className="flex-grow ml-4">
        <h3 className="text-lg font-semibold text-gray-800">
          {nombre} {marca && <span className="text-sm text-gray-500">({marca})</span>}
        </h3>
        <p className="text-sm text-gray-500">{categoria}</p>
        <p className="text-sm text-gray-600 mt-1">Stock total: {stockTotal}</p>
        <button
          onClick={onVerStock}
          className="text-blue-500 text-sm hover:underline mt-1"
        >
          VER DETALLE DE STOCK
        </button>
      </div>

      {/* Acciones */}
      <div className="flex items-center space-x-2 ml-4">
        {/* Si el producto está inactivo, mostrar solo el botón para reactivar */}
        {producto_estado === 'inactivo' ? (
          <>
            {onReactivar && (
              <button
                onClick={onReactivar}
                className="p-2 rounded-full bg-green-500 text-white hover:opacity-80"
                title="Reactivar producto"
              >
                Reactivar
              </button>
            )}
          </>
        ) : (
          <>
            {/* Icono de visibilidad */}
            {onToggleVisible && (
              <button
                onClick={onToggleVisible}
                className={`p-2 rounded-full ${
                  visible ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                } hover:opacity-80`}
                title={visible ? 'Ocultar producto' : 'Mostrar producto'}
              >
                {visible ? <FaEye className="w-5 h-5" /> : <FaEyeSlash className="w-5 h-5" />}
              </button>
            )}

            {/* Icono de editar */}
            {onEditar && (
              <button
                onClick={onEditar}
                className="p-2 rounded-full bg-yellow-500 text-white hover:opacity-80"
                title="Editar producto"
              >
                <FaEdit className="w-5 h-5" />
              </button>
            )}

            {/* Icono de eliminar */}
            {onEliminar && (
              <button
                onClick={onEliminar}
                className="p-2 rounded-full bg-red-500 text-white hover:opacity-80"
                title="Eliminar producto"
              >
                <FaTrash className="w-5 h-5" />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

TarjetaProducto.propTypes = {
  nombre: PropTypes.string.isRequired,
  categoria: PropTypes.string.isRequired,
  marca: PropTypes.string,
  stockTotal: PropTypes.number.isRequired,
  imagenUrl: PropTypes.string.isRequired,
  visible: PropTypes.bool.isRequired,
  producto_estado: PropTypes.string.isRequired,
  onEditar: PropTypes.func,
  onEliminar: PropTypes.func,
  onToggleVisible: PropTypes.func,
  onVerStock: PropTypes.func.isRequired,
  onReactivar: PropTypes.func, // PropType para la función reactivar
};

export default TarjetaProducto;