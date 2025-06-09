import React from 'react';

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
  tienePermiso, // Recibir la función tienePermiso
  usarAtributos, // Recibir el estado de atributos activados
}) => {
  return (
    <div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Nombre del Producto:</label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
            errores.producto_nombre ? 'border-red-500' : ''
          }`}
          required
        />
        {errores.producto_nombre && (
          <p className="text-sm text-red-500 mt-1">{errores.producto_nombre}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Categoría:</label>
        <select
          value={categoriaId}
          onChange={(e) => setCategoriaId(e.target.value)}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
            errores.categoria_id ? 'border-red-500' : ''
          }`}
          required
        >
          <option value="">Seleccionar Categoría</option>
          {categorias.map((categoria) => (
            <option key={categoria.categoria_id} value={categoria.categoria_id}>
              {categoria.nombreJerarquico}
            </option>
          ))}
        </select>
        {errores.categoria_id && (
          <p className="text-sm text-red-500 mt-1">{errores.categoria_id}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Descripción:</label>
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
            errores.producto_descripcion ? 'border-red-500' : ''
          }`}
          rows="4"
        />
        {errores.producto_descripcion && (
          <p className="text-sm text-red-500 mt-1">{errores.producto_descripcion}</p>
        )}
      </div>

      {!usarAtributos && (
        <>
          {tienePermiso('Definir Precio Producto') && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">Precio de Costo:</label>
                <input
                  type="number"
                  value={precioCosto}
                  onChange={(e) => setPrecioCosto(e.target.value)}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                    errores.producto_precio_costo ? 'border-red-500' : ''
                  }`}
                />
                {errores.producto_precio_costo && (
                  <p className="text-sm text-red-500 mt-1">{errores.producto_precio_costo}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Precio de Venta:</label>
                <input
                  type="number"
                  value={precioVenta}
                  onChange={(e) => setPrecioVenta(e.target.value)}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                    errores.producto_precio_venta ? 'border-red-500' : ''
                  }`}
                />
                {errores.producto_precio_venta && (
                  <p className="text-sm text-red-500 mt-1">{errores.producto_precio_venta}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Precio de Oferta:</label>
                <input
                  type="number"
                  value={precioOferta}
                  onChange={(e) => setPrecioOferta(e.target.value)}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                    errores.producto_precio_oferta ? 'border-red-500' : ''
                  }`}
                />
                {errores.producto_precio_oferta && (
                  <p className="text-sm text-red-500 mt-1">{errores.producto_precio_oferta}</p>
                )}
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Stock General:</label>
            <input
              type="number"
              value={stockGeneral}
              onChange={(e) => setStockGeneral(e.target.value)}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                errores.producto_stock ? 'border-red-500' : ''
              }`}
            />
            {errores.producto_stock && (
              <p className="text-sm text-red-500 mt-1">{errores.producto_stock}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">SKU General:</label>
            <input
              type="text"
              value={skuGeneral}
              onChange={(e) => setSkuGeneral(e.target.value)}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                errores.producto_sku ? 'border-red-500' : ''
              }`}
            />
            {errores.producto_sku && (
              <p className="text-sm text-red-500 mt-1">{errores.producto_sku}</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default FormularioDatosProducto;