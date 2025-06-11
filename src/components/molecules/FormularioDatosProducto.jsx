import React from 'react';
import PropTypes from 'prop-types';

const FormularioDatosProducto = ({
  nombre,
  setNombre,
  categoriaId,
  setCategoriaId,
  descripcion,
  setDescripcion,
  precioVenta,
  setPrecioVenta,
  precioCosto,
  setPrecioCosto,
  precioOferta,
  setPrecioOferta,
  stockGeneral,
  setStockGeneral,
  skuGeneral,
  setSkuGeneral,
  categorias,
  errores,
  usarAtributos,
}) => {
  return (
    <div>
      <div className="mb-4">
        <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
          Nombre del Producto
        </label>
        <input
          type="text"
          id="nombre"
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
            errores?.producto_nombre ? 'border-red-500' : ''
          }`}
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        {errores?.producto_nombre && (
          <p className="mt-2 text-sm text-red-600">{errores.producto_nombre}</p>
        )}
      </div>

      <div className="mb-4">
        <label htmlFor="categoria" className="block text-sm font-medium text-gray-700">
          Categoría
        </label>
        <select
          id="categoria"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          value={categoriaId}
          onChange={(e) => setCategoriaId(e.target.value)}
        >
          <option value="">Seleccione una categoría</option>
          {categorias && categorias.map((categoria) => (
            <option key={categoria.categoria_id} value={categoria.categoria_id}>
              {categoria.nombreJerarquico}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">
          Descripción
        </label>
        <textarea
          id="descripcion"
          rows="3"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        ></textarea>
      </div>

      <div className="mb-4">
        <label htmlFor="precioVenta" className="block text-sm font-medium text-gray-700">
          Precio de Venta
        </label>
        <input
          type="number"
          id="precioVenta"
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
            errores?.producto_precio_venta ? 'border-red-500' : ''
          }`}
          value={precioVenta}
          onChange={(e) => setPrecioVenta(e.target.value)}
        />
        {errores?.producto_precio_venta && (
          <p className="mt-2 text-sm text-red-600">{errores.producto_precio_venta}</p>
        )}
      </div>

      <div className="mb-4">
        <label htmlFor="precioCosto" className="block text-sm font-medium text-gray-700">
          Precio de Costo
        </label>
        <input
          type="number"
          id="precioCosto"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          value={precioCosto}
          onChange={(e) => setPrecioCosto(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label htmlFor="precioOferta" className="block text-sm font-medium text-gray-700">
          Precio de Oferta
        </label>
        <input
          type="number"
          id="precioOferta"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          value={precioOferta}
          onChange={(e) => setPrecioOferta(e.target.value)}
        />
      </div>

      {!usarAtributos && (
        <>
          <div className="mb-4">
            <label htmlFor="stockGeneral" className="block text-sm font-medium text-gray-700">
              Stock General
            </label>
            <input
              type="number"
              id="stockGeneral"
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                errores?.producto_stock ? 'border-red-500' : ''
              }`}
              value={stockGeneral}
              onChange={(e) => setStockGeneral(e.target.value)}
            />
            {errores?.producto_stock && (
              <p className="mt-2 text-sm text-red-600">{errores.producto_stock}</p>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="skuGeneral" className="block text-sm font-medium text-gray-700">
              SKU General
            </label>
            <input
              type="text"
              id="skuGeneral"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={skuGeneral}
              onChange={(e) => setSkuGeneral(e.target.value)}
            />
          </div>
        </>
      )}
    </div>
  );
};

FormularioDatosProducto.propTypes = {
  nombre: PropTypes.string.isRequired,
  setNombre: PropTypes.func.isRequired,
  categoriaId: PropTypes.string.isRequired,
  setCategoriaId: PropTypes.func.isRequired,
  descripcion: PropTypes.string,
  setDescripcion: PropTypes.func.isRequired,
  precioVenta: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  setPrecioVenta: PropTypes.func.isRequired,
  precioCosto: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  setPrecioCosto: PropTypes.func.isRequired,
  precioOferta: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  setPrecioOferta: PropTypes.func.isRequired,
  stockGeneral: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  setStockGeneral: PropTypes.func.isRequired,
  skuGeneral: PropTypes.string,
  setSkuGeneral: PropTypes.func.isRequired,
  categorias: PropTypes.arrayOf(
    PropTypes.shape({
      categoria_id: PropTypes.number.isRequired,
      nombreJerarquico: PropTypes.string.isRequired,
    })
  ).isRequired,
  errores: PropTypes.object,
  usarAtributos: PropTypes.bool.isRequired,
};

export default FormularioDatosProducto;