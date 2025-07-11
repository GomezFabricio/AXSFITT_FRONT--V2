import React, { useState } from 'react';
import PropTypes from 'prop-types';
import AutocompleteProducto from './AutocompleteProducto';
import InputSku from './InputSku';

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
  tienePermiso,
  onDuplicateFound = null, // Callback para manejar duplicados
  onSkuValidated = null, // Callback para validar SKU
}) => {
  const [productoDuplicado, setProductoDuplicado] = useState(null);
  const [skuEstado, setSkuEstado] = useState({ valid: true, duplicate: false });
  
  // Verificar si el usuario tiene permiso para definir precios
  const puedeDefinirPrecios = tienePermiso("Definir Precio Producto");

  // Manejar cuando se encuentra un duplicado
  const handleDuplicateFound = (duplicado) => {
    setProductoDuplicado(duplicado);
    if (onDuplicateFound) {
      onDuplicateFound(duplicado);
    }
  };

  // Manejar validación de SKU
  const handleSkuValidated = (estado) => {
    setSkuEstado(estado);
    if (onSkuValidated) {
      onSkuValidated(estado);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 transition-all duration-300">
      <div className="space-y-6">
        {/* Nombre del Producto con Autocomplete */}
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre del Producto
          </label>
          <AutocompleteProducto
            valor={nombre}
            onChange={setNombre}
            categoriaId={categoriaId}
            placeholder="Ingrese el nombre del producto"
            error={errores?.producto_nombre}
            onDuplicateFound={handleDuplicateFound}
          />
        </div>

        {/* Categoría */}
        <div>
          <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-1">
            Categoría
          </label>
          <div className="relative">
            <select
              id="categoria"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-violet-500 transition-colors"
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
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Descripción */}
        <div>
          <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <textarea
            id="descripcion"
            rows="3"
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 transition-colors"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Describa el producto"
          ></textarea>
        </div>

        {!usarAtributos && (
          <>
            {/* Sección de Precios */}
            <div className="border-t border-gray-100 pt-5">
              <h3 className="text-sm font-medium text-gray-500 mb-4">Información de Precios</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Precio de Venta */}
                <div>
                  <label htmlFor="precioVenta" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    Precio de Venta
                    {!puedeDefinirPrecios && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                        Sin permiso
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      id="precioVenta"
                      className={`w-full pl-7 pr-3 py-2 bg-gray-50 border rounded-md focus:outline-none focus:ring-2 ${
                        !puedeDefinirPrecios ? 'bg-gray-100 text-gray-500' : ''
                      } ${
                        errores?.producto_precio_venta ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-violet-500'
                      }`}
                      value={precioVenta}
                      onChange={(e) => setPrecioVenta(e.target.value)}
                      disabled={!puedeDefinirPrecios}
                      title={!puedeDefinirPrecios ? "No tienes permiso para definir precios" : ""}
                      placeholder="0.00"
                    />
                  </div>
                  {errores?.producto_precio_venta && (
                    <p className="mt-1 text-sm text-red-500">{errores.producto_precio_venta}</p>
                  )}
                </div>

                {/* Precio de Costo */}
                <div>
                  <label htmlFor="precioCosto" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    Precio de Costo
                    {!puedeDefinirPrecios && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                        Sin permiso
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      id="precioCosto"
                      className={`w-full pl-7 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                        !puedeDefinirPrecios ? 'bg-gray-100 text-gray-500' : ''
                      }`}
                      value={precioCosto}
                      onChange={(e) => setPrecioCosto(e.target.value)}
                      disabled={!puedeDefinirPrecios}
                      title={!puedeDefinirPrecios ? "No tienes permiso para definir precios" : ""}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Precio de Oferta */}
                <div>
                  <label htmlFor="precioOferta" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    Precio de Oferta
                    {!puedeDefinirPrecios && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                        Sin permiso
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      id="precioOferta"
                      className={`w-full pl-7 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                        !puedeDefinirPrecios ? 'bg-gray-100 text-gray-500' : ''
                      }`}
                      value={precioOferta}
                      onChange={(e) => setPrecioOferta(e.target.value)}
                      disabled={!puedeDefinirPrecios}
                      title={!puedeDefinirPrecios ? "No tienes permiso para definir precios" : ""}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sección de Inventario */}
            <div className="border-t border-gray-100 pt-5">
              <h3 className="text-sm font-medium text-gray-500 mb-4">Información de Inventario</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Stock General */}
                <div>
                  <label htmlFor="stockGeneral" className="block text-sm font-medium text-gray-700 mb-1">
                    Stock General
                  </label>
                  <input
                    type="number"
                    id="stockGeneral"
                    className={`w-full px-3 py-2 bg-gray-50 border rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 transition-colors ${
                      errores?.producto_stock ? 'border-red-400 focus:ring-red-400' : 'border-gray-200'
                    }`}
                    value={stockGeneral}
                    onChange={(e) => setStockGeneral(e.target.value)}
                    placeholder="0"
                  />
                  {errores?.producto_stock && (
                    <p className="mt-1 text-sm text-red-500">{errores.producto_stock}</p>
                  )}
                </div>

                {/* SKU General */}
                <div>
                  <label htmlFor="skuGeneral" className="block text-sm font-medium text-gray-700 mb-1">
                    SKU General
                  </label>
                  <InputSku
                    valor={skuGeneral}
                    onChange={setSkuGeneral}
                    placeholder="SKU-XXXXX (opcional)"
                    error={errores?.producto_sku}
                    onSkuValidated={handleSkuValidated}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

FormularioDatosProducto.propTypes = {
  nombre: PropTypes.string,
  setNombre: PropTypes.func.isRequired,
  categoriaId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
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
  tienePermiso: PropTypes.func.isRequired,
  onDuplicateFound: PropTypes.func,
  onSkuValidated: PropTypes.func,
};

export default FormularioDatosProducto;