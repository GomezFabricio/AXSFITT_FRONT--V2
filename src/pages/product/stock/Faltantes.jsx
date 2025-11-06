import React, { useState, useEffect } from 'react';
import { obtenerFaltantes } from '../../../api/stockApi';
import config from '../../../config/config';
import ListaFaltantesPendientes from '../../../components/molecules/stock/ListaFaltantesPendientes';
import tienePermiso from '../../../utils/tienePermiso';

const Faltantes = () => {
  const [faltantesDetectados, setFaltantesDetectados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
          <button 
            onClick={() => {
              if (window.confirm('¿Estás seguro de marcar todos los faltantes como pedidos?')) {
                // Esta función se implementará en el componente ListaFaltantesPendientes
                document.getElementById('marcarTodosPedidos')?.click();
              }
            }}
            className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded text-sm md:text-base transition"
          >
            Pedir Todos
          </button>
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
        />
      )}
    </div>
  );
};

export default Faltantes;