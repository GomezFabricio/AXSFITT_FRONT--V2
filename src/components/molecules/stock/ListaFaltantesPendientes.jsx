import React, { useState } from 'react';
import { resolverFaltante, pedirFaltante } from '../../../api/stockApi';
import tienePermiso from '../../../utils/tienePermiso';

const ListaFaltantesPendientes = ({ 
  faltantes, 
  onResolverExitoso, 
  onPedirExitoso, 
  mostrarAcciones = false, 
  tituloAccion = "Marcar como Pedido",
  onAgregarCarrito
}) => {
  const [procesando, setProcesando] = useState(false);
  const [resolviendoTodo, setResolviendoTodo] = useState(false);
  const [itemsProcesados, setItemsProcesados] = useState([]);

  const agregarAlCarrito = async (faltante) => {
    try {
      setProcesando(true);
      const token = sessionStorage.getItem('token');
      
      const datosItem = {
        faltante_id: faltante.faltante_id,
        producto_id: faltante.faltante_producto_id,
        variante_id: faltante.faltante_variante_id,
        cantidad_necesaria: faltante.faltante_cantidad_faltante || 
                           Math.max(0, faltante.stock_minimo - faltante.stock_actual)
      };

      const response = await fetch('/api/carrito-pedidos/carrito/agregar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(datosItem)
      });

      if (response.ok) {
        alert('✅ Producto agregado al carrito');
        if (onAgregarCarrito) onAgregarCarrito(true); // Abrir carrito
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al agregar al carrito');
      }
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
      alert('Error: ' + error.message);
    } finally {
      setProcesando(false);
    }
  };

  const handleResolverFaltante = async (id) => {
    if (!tienePermiso('Gestionar Stock')) return;
    
    try {
      setProcesando(true);
      setItemsProcesados(prev => [...prev, id]);
      
      const token = sessionStorage.getItem('token');
      
      // Usar la función correcta según el contexto
      if (tituloAccion === "Pedir") {
        await pedirFaltante(id, token);
        if (onPedirExitoso) onPedirExitoso();
      } else {
        await resolverFaltante(id, token);
        if (onResolverExitoso) onResolverExitoso();
      }
      
    } catch (error) {
      console.error('Error al procesar faltante:', error);
      alert(`Error al ${tituloAccion.toLowerCase()} faltante`);
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
      
      // Procesar todos los faltantes secuencialmente
      for (const faltante of faltantes) {
        await handleResolverFaltante(faltante.faltante_id || faltante.id_faltante);
      }
      
      // Notificar al componente padre
      if (tituloAccion === "Pedir" && onPedirExitoso) {
        onPedirExitoso();
      } else if (onResolverExitoso) {
        onResolverExitoso();
      }
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
            <tr key={item.faltante_id || item.id_faltante} className="hover:bg-gray-50">
              <td className="py-3 px-2 md:px-4 text-sm">
                <div>
                  <div className="text-xs md:text-sm font-medium text-gray-900">
                    {item.producto_nombre || `Producto ID: ${item.faltante_producto_id || item.faltante_variante_id}`}
                  </div>
                  {item.valores_variante && (
                    <div className="text-xs text-gray-500">
                      {item.valores_variante}
                    </div>
                  )}
                </div>
              </td>
              <td className="py-3 px-2 md:px-4 text-xs md:text-sm text-gray-700 text-center">
                <span className="text-red-600 font-bold">
                  {item.stock_actual || 0}
                </span>
              </td>
              <td className="py-3 px-2 md:px-4 text-xs md:text-sm text-red-600 font-medium text-center">
                <span className="font-bold">
                  {item.faltante_cantidad_faltante || item.cantidad_faltante || 0}
                </span>
              </td>
              <td className="py-3 px-2 md:px-4 text-xs md:text-sm text-gray-700 text-center">
                {new Date(item.faltante_fecha_deteccion || item.fecha_deteccion).toLocaleDateString()}
              </td>
              {tienePermiso('Gestionar Stock') && (
                <td className="py-3 px-2 md:px-4 text-center">
                  <button
                    onClick={() => agregarAlCarrito(item)}
                    disabled={procesando}
                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-3 py-1 rounded text-xs md:text-sm transition-colors"
                  >
                    {procesando ? 'Agregando...' : 'Pedir'}
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