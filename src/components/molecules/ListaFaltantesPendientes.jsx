import React, { useState } from 'react';
import { resolverFaltante } from '../../api/stockApi';
import tienePermiso from '../../utils/tienePermiso';

const ListaFaltantesPendientes = ({ faltantes, onResolverExitoso }) => {
  const [procesando, setProcesando] = useState(false);
  const [resolviendoTodo, setResolviendoTodo] = useState(false);
  const [itemsProcesados, setItemsProcesados] = useState([]);

  const handleResolverFaltante = async (id) => {
    if (!tienePermiso('Gestionar Stock')) return;
    
    try {
      setProcesando(true);
      setItemsProcesados(prev => [...prev, id]);
      
      const token = sessionStorage.getItem('token');
      await resolverFaltante(id, token);
      
      // Notificar al componente padre
      onResolverExitoso();
    } catch (error) {
      console.error('Error al resolver faltante:', error);
      alert('Error al marcar faltante como pedido');
    } finally {
      if (!resolviendoTodo) {
        setProcesando(false);
        setItemsProcesados([]);
      }
    }
  };

  const handleResolverTodos = async () => {
    if (!tienePermiso('Gestionar Stock') || faltantes.length === 0) return;
    
    try {
      setProcesando(true);
      setResolviendoTodo(true);
      
      // Resolver todos los faltantes secuencialmente
      for (const faltante of faltantes) {
        await handleResolverFaltante(faltante.id_faltante);
      }
      
      // Notificar al componente padre
      onResolverExitoso();
    } catch (error) {
      console.error('Error al resolver todos los faltantes:', error);
      alert('Error al marcar todos los faltantes como pedidos');
    } finally {
      setProcesando(false);
      setResolviendoTodo(false);
      setItemsProcesados([]);
    }
  };

  return (
    <div className="overflow-x-auto shadow-md rounded-lg">
      {/* Botón oculto para activar la función de marcar todos desde el componente padre */}
      <button 
        id="marcarTodosPedidos" 
        onClick={handleResolverTodos} 
        className="hidden"
      >
        Pedir Todos
      </button>
      
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
              Cantidad Faltante
            </th>
            <th scope="col" className="py-3 px-2 md:px-4 text-center text-xs md:text-sm font-semibold text-gray-700">
              Fecha Detección
            </th>
            {tienePermiso('Gestionar Stock') && (
              <th scope="col" className="py-3 px-2 md:px-4 text-center text-xs md:text-sm font-semibold text-gray-700">
                Acciones
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {faltantes.map((item) => (
            <tr key={item.id_faltante} className="hover:bg-gray-50">
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
                <span className="text-red-600 font-bold">
                  {item.stock_actual}
                </span>
              </td>
              <td className="py-3 px-2 md:px-4 text-xs md:text-sm text-red-600 font-medium text-center">
                {item.cantidad_faltante}
              </td>
              <td className="py-3 px-2 md:px-4 text-xs md:text-sm text-gray-700 text-center">
                {new Date(item.fecha_deteccion).toLocaleDateString()}
              </td>
              {tienePermiso('Gestionar Stock') && (
                <td className="py-3 px-2 md:px-4 text-xs md:text-sm text-center">
                  <button
                    onClick={() => handleResolverFaltante(item.id_faltante)}
                    disabled={procesando}
                    className={`text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded transition
                      ${itemsProcesados.includes(item.id_faltante) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {itemsProcesados.includes(item.id_faltante) ? 'Procesando...' : 'Marcar como Pedido'}
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ListaFaltantesPendientes;