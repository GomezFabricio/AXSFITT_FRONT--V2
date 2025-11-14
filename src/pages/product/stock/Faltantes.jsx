import React, { useState, useEffect } from 'react';
import { obtenerFaltantes } from '../../../api/stockApi';
import config from '../../../config/config';
import ListaFaltantesPendientes from '../../../components/molecules/stock/ListaFaltantesPendientes';
import CarritoPedidosRapidos from '../../../components/organisms/CarritoPedidosRapidos';
import tienePermiso from '../../../utils/tienePermiso';
import { FiShoppingCart } from 'react-icons/fi';

const Faltantes = () => {
  const [faltantesDetectados, setFaltantesDetectados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [carritoOpen, setCarritoOpen] = useState(false);

  useEffect(() => {
    cargarFaltantes();
  }, []);

  const cargarFaltantes = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token');
      const data = await obtenerFaltantes(token);

      // Procesar URLs de imágenes y filtrar solo faltantes detectados
      const procesarUrl = item => ({
        ...item,
        imagen_url: item.imagen_url ? `${config.backendUrl}${item.imagen_url}` : null
      });

      // Solo mostrar faltantes con estado 'detectado'
      const faltantesDetectadosFiltrados = data
        .filter(item => item.faltante_estado === 'detectado')
        .map(procesarUrl);

      setFaltantesDetectados(faltantesDetectadosFiltrados);
      setLoading(false);
    } catch (error) {
      console.error("Error al obtener faltantes:", error);
      setError("Error al cargar la lista de faltantes");
      setLoading(false);
    }
  };

  const handlePedirFaltanteExitoso = () => {
    // Recargar datos después de pedir un faltante
    cargarFaltantes();
  };

  const agregarTodosAlCarrito = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch('/api/carrito-pedidos/carrito/agregar-todos', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        alert(`✅ ${data.data.faltantes_agregados} productos agregados al carrito`);
        setCarritoOpen(true);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al agregar productos al carrito');
      }
    } catch (error) {
      console.error('Error al agregar todos al carrito:', error);
      alert('Error: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4 text-red-500 bg-red-50 rounded-lg">
        <p className="font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="px-2 sm:px-4 md:px-6 py-4 md:py-8">
      <h1 className="text-xl md:text-2xl font-bold mb-4">Gestión de Faltantes</h1>
      
      {/* Encabezado con estadísticas */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-orange-800">
              Faltantes Detectados Automáticamente
            </h2>
            <p className="text-sm text-orange-600 mt-1">
              Productos y variantes con stock por debajo del mínimo
            </p>
          </div>
          {faltantesDetectados.length > 0 && (
            <div className="bg-orange-500 text-white text-sm rounded-full px-3 py-1 font-medium">
              {faltantesDetectados.length} faltante{faltantesDetectados.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>
      
      {/* Lista de faltantes para pedir */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-medium text-gray-700">Por Pedir</h3>
        {tienePermiso('Gestionar Stock') && faltantesDetectados.length > 0 && (
          <div className="flex space-x-2">
            <button 
              onClick={() => setCarritoOpen(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded text-sm md:text-base transition flex items-center space-x-2"
            >
              <FiShoppingCart size={16} />
              <span>Ver Carrito</span>
            </button>
            <button 
              onClick={agregarTodosAlCarrito}
              className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded text-sm md:text-base transition"
            >
              Pedir Todos
            </button>
          </div>
        )}
      </div>
      
      {/* Contenido principal */}
      {faltantesDetectados.length === 0 ? (
        <div className="bg-green-50 border border-green-200 p-6 rounded-lg text-center">
          <div className="text-green-600 text-4xl mb-2">✓</div>
          <p className="text-green-800 font-medium">¡Excelente!</p>
          <p className="text-green-600 text-sm mt-1">No hay faltantes detectados en este momento.</p>
        </div>
      ) : (
        <ListaFaltantesPendientes 
          faltantes={faltantesDetectados} 
          onPedirExitoso={handlePedirFaltanteExitoso}
          mostrarAcciones={true}
          tituloAccion="Pedir"
          onAgregarCarrito={setCarritoOpen}
        />
      )}

      {/* Modal del Carrito */}
      <CarritoPedidosRapidos 
        isOpen={carritoOpen}
        onClose={() => setCarritoOpen(false)}
        onPedidoCreado={(pedido) => {
          console.log('Pedido creado:', pedido);
          cargarFaltantes(); // Recargar faltantes después de crear pedido
        }}
      />
    </div>
  );
};

export default Faltantes;