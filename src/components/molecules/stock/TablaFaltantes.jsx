import React, { useState } from 'react';
import { registrarFaltante } from '../../../api/stockApi';
import tienePermiso from '../../../utils/tienePermiso';

const TablaFaltantes = ({ faltantes, onRegistrarExitoso }) => {
  const [procesando, setProcesando] = useState(false);
  const [itemSeleccionado, setItemSeleccionado] = useState(null);

  const handleRegistrarFaltante = async (item) => {
    if (!tienePermiso('Gestionar Stock')) return;
    
    try {
      setProcesando(true);
      setItemSeleccionado(item.tipo === 'producto' ? item.producto_id : item.variante_id);
      
      const token = sessionStorage.getItem('token');
      const datos = {
        producto_id: item.tipo === 'producto' ? item.producto_id : null,
        variante_id: item.tipo === 'variante' ? item.variante_id : null,
        cantidad_faltante: item.cantidad_faltante
      };
      
      await registrarFaltante(datos, token);
      onRegistrarExitoso();
    } catch (error) {
      console.error('Error al registrar faltante:', error);
      alert('Error al registrar faltante');
    } finally {
      setProcesando(false);
      setItemSeleccionado(null);
    }
  };

  return (
    <div className="overflow-x-auto shadow-md rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th scope="col" className="py-3 px-2 md:px-4 text-left text-xs md:text-sm font-semibold text-gray-700">
              Producto
            </th>
            <th scope="col" className="py-3 px-2 md:px-4 text-center text-xs md:text-sm font-semibold text-gray-700">
              Stock Actual
            </th>
            <th scope="col" className="py-3 px-2 md:px-4 text-center text-xs md:text-sm font-semibold text-gray-700">
              Stock Mínimo
            </th>
            <th scope="col" className="py-3 px-2 md:px-4 text-center text-xs md:text-sm font-semibold text-gray-700">
              Faltante
            </th>
            {tienePermiso('Gestionar Stock') && (
              <th scope="col" className="py-3 px-2 md:px-4 text-center text-xs md:text-sm font-semibold text-gray-700">
                Acciones
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {faltantes.length > 0 ? (
            faltantes.map((item) => (
              <tr key={`${item.tipo}-${item.tipo === 'producto' ? item.producto_id : item.variante_id}`} className="hover:bg-gray-50">
                <td className="py-3 px-2 md:px-4 text-sm">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8 md:h-10 md:w-10">
                      <img 
                        className="h-full w-full rounded-full object-cover" 
                        src={item.imagen_url || 'https://via.placeholder.com/40'} 
                        alt={item.tipo === 'producto' ? item.nombre : item.variante_sku}
                      />
                    </div>
                    <div className="ml-2 md:ml-4">
                      <div className="text-xs md:text-sm font-medium text-gray-900 truncate max-w-[100px] md:max-w-[200px]">
                        {item.tipo === 'producto' ? item.nombre : item.producto_nombre}
                      </div>
                      {item.tipo === 'variante' && (
                        <div className="text-xs md:text-sm text-gray-500 truncate max-w-[100px] md:max-w-[200px]">
                          {item.atributos || `${item.atributo_nombre}: ${item.valor_nombre}`}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-3 px-2 md:px-4 text-xs md:text-sm text-gray-700 text-center">
                  <span className={`${item.stock_actual < item.stock_minimo ? 'text-red-600 font-bold' : 'text-gray-900'}`}>
                    {item.stock_actual}
                  </span>
                </td>
                <td className="py-3 px-2 md:px-4 text-xs md:text-sm text-gray-700 text-center">
                  {item.stock_minimo}
                </td>
                <td className="py-3 px-2 md:px-4 text-xs md:text-sm text-red-600 font-medium text-center">
                  {item.cantidad_faltante}
                </td>
                {tienePermiso('Gestionar Stock') && (
                  <td className="py-3 px-2 md:px-4 text-xs md:text-sm text-center">
                    <button
                      onClick={() => handleRegistrarFaltante(item)}
                      disabled={procesando && itemSeleccionado === (item.tipo === 'producto' ? item.producto_id : item.variante_id)}
                      className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded transition"
                    >
                      {procesando && itemSeleccionado === (item.tipo === 'producto' ? item.producto_id : item.variante_id) 
                        ? 'Registrando...' 
                        : 'Registrar'}
                    </button>
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={tienePermiso('Gestionar Stock') ? 5 : 4} className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">
                No hay productos con stock por debajo del mínimo
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TablaFaltantes;