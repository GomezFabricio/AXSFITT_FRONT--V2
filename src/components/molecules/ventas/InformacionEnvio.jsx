import React from 'react';

const InformacionEnvio = ({ mostrar, onToggleMostrar, datosEnvio, onEnvioChange, errores }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
      {/* Encabezado colapsable */}
      <div 
        className="flex justify-between items-center cursor-pointer"
        onClick={onToggleMostrar}
      >
        <h3 className="text-lg font-bold">Información de envío <span className="text-sm font-normal text-gray-500">(opcional)</span></h3>
        <span className="text-gray-600">
          {mostrar ? '▲' : '▼'}
        </span>
      </div>
      
      {/* Contenido desplegable */}
      {mostrar && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Calle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Calle</label>
            <input
              type="text"
              value={datosEnvio.calle}
              onChange={(e) => onEnvioChange('calle', e.target.value)}
              className={`border rounded w-full px-3 py-2 ${
                errores.envio_calle ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {errores.envio_calle && (
              <p className="text-red-500 text-sm mt-1">{errores.envio_calle}</p>
            )}
          </div>
          
          {/* Número */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
            <input
              type="text"
              value={datosEnvio.numero}
              onChange={(e) => onEnvioChange('numero', e.target.value)}
              className={`border rounded w-full px-3 py-2 ${
                errores.envio_numero ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {errores.envio_numero && (
              <p className="text-red-500 text-sm mt-1">{errores.envio_numero}</p>
            )}
          </div>
          
          {/* Código Postal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Código postal</label>
            <input
              type="text"
              value={datosEnvio.cp}
              onChange={(e) => onEnvioChange('cp', e.target.value)}
              className={`border rounded w-full px-3 py-2 ${
                errores.envio_cp ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {errores.envio_cp && (
              <p className="text-red-500 text-sm mt-1">{errores.envio_cp}</p>
            )}
          </div>
          
          {/* Piso */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Piso <span className="text-xs text-gray-500">(opcional)</span></label>
            <input
              type="text"
              value={datosEnvio.piso || ''}
              onChange={(e) => onEnvioChange('piso', e.target.value)}
              className="border border-gray-300 rounded w-full px-3 py-2"
            />
          </div>
          
          {/* Departamento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Departamento <span className="text-xs text-gray-500">(opcional)</span></label>
            <input
              type="text"
              value={datosEnvio.depto || ''}
              onChange={(e) => onEnvioChange('depto', e.target.value)}
              className="border border-gray-300 rounded w-full px-3 py-2"
            />
          </div>
          
          {/* Ciudad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
            <input
              type="text"
              value={datosEnvio.ciudad}
              onChange={(e) => onEnvioChange('ciudad', e.target.value)}
              className={`border rounded w-full px-3 py-2 ${
                errores.envio_ciudad ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {errores.envio_ciudad && (
              <p className="text-red-500 text-sm mt-1">{errores.envio_ciudad}</p>
            )}
          </div>
          
          {/* Provincia */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Provincia</label>
            <select
              value={datosEnvio.provincia}
              onChange={(e) => onEnvioChange('provincia', e.target.value)}
              className={`border rounded w-full px-3 py-2 ${
                errores.envio_provincia ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            >
              <option value="">Selecciona una opción</option>
              <option value="Buenos Aires">Buenos Aires</option>
              <option value="CABA">CABA</option>
              <option value="Catamarca">Catamarca</option>
              <option value="Chaco">Chaco</option>
              <option value="Chubut">Chubut</option>
              <option value="Córdoba">Córdoba</option>
              <option value="Corrientes">Corrientes</option>
              <option value="Entre Ríos">Entre Ríos</option>
              <option value="Formosa">Formosa</option>
              <option value="Jujuy">Jujuy</option>
              <option value="La Pampa">La Pampa</option>
              <option value="La Rioja">La Rioja</option>
              <option value="Mendoza">Mendoza</option>
              <option value="Misiones">Misiones</option>
              <option value="Neuquén">Neuquén</option>
              <option value="Río Negro">Río Negro</option>
              <option value="Salta">Salta</option>
              <option value="San Juan">San Juan</option>
              <option value="San Luis">San Luis</option>
              <option value="Santa Cruz">Santa Cruz</option>
              <option value="Santa Fe">Santa Fe</option>
              <option value="Santiago del Estero">Santiago del Estero</option>
              <option value="Tierra del Fuego">Tierra del Fuego</option>
              <option value="Tucumán">Tucumán</option>
            </select>
            {errores.envio_provincia && (
              <p className="text-red-500 text-sm mt-1">{errores.envio_provincia}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InformacionEnvio;