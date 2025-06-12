import React, { useState, useEffect } from 'react';
import { obtenerFaltantes } from '../../api/stockApi';
import config from '../../config/config';
import TablaFaltantes from '../../components/molecules/TablaFaltantes';
import ListaFaltantesPendientes from '../../components/molecules/ListaFaltantesPendientes';
import tienePermiso from '../../utils/tienePermiso';

const Faltantes = () => {
  const [faltantes, setFaltantes] = useState([]);
  const [faltantesRegistrados, setFaltantesRegistrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('porRegistrar'); // 'porRegistrar' o 'pendientes'

  useEffect(() => {
    cargarFaltantes();
  }, []);

  const cargarFaltantes = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token');
      const data = await obtenerFaltantes(token);

      // Procesar URLs de imágenes y separar faltantes
      const procesarUrl = item => ({
        ...item,
        imagen_url: item.imagen_url ? `${config.backendUrl}${item.imagen_url}` : null
      });

      // Separar faltantes por registrar de los ya registrados en la tabla faltantes
      const porRegistrar = [];
      const registrados = [];

      data.forEach(item => {
        const faltanteConUrl = procesarUrl(item);
        if (item.id_faltante) {
          registrados.push(faltanteConUrl);
        } else {
          porRegistrar.push(faltanteConUrl);
        }
      });

      setFaltantes(porRegistrar);
      setFaltantesRegistrados(registrados);
      setLoading(false);
    } catch (error) {
      console.error("Error al obtener faltantes:", error);
      setError("Error al cargar la lista de faltantes");
      setLoading(false);
    }
  };

  const handleRegistrarFaltanteExitoso = () => {
    // Recargar datos después de registrar un faltante
    cargarFaltantes();
  };

  const handleResolverFaltanteExitoso = () => {
    // Recargar datos después de marcar un faltante como resuelto
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
      
      {/* Tabs para cambiar entre "Por Registrar" y "Pendientes de Pedido" */}
      <div className="flex border-b mb-6">
        <button
          onClick={() => setActiveTab('porRegistrar')}
          className={`py-2 px-4 text-sm md:text-base font-medium ${
            activeTab === 'porRegistrar'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Por Registrar
        </button>
        <button
          onClick={() => setActiveTab('pendientes')}
          className={`py-2 px-4 text-sm md:text-base font-medium ${
            activeTab === 'pendientes'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Pendientes de Pedido
          {faltantesRegistrados.length > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
              {faltantesRegistrados.length}
            </span>
          )}
        </button>
      </div>
      
      {/* Contenido de las pestañas */}
      {activeTab === 'porRegistrar' ? (
        <>
          <h2 className="text-lg font-medium mb-4">Productos con Stock por Debajo del Mínimo</h2>
          {faltantes.length === 0 ? (
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <p className="text-gray-600">No hay productos con stock por debajo del mínimo.</p>
            </div>
          ) : (
            <TablaFaltantes 
              faltantes={faltantes} 
              onRegistrarExitoso={handleRegistrarFaltanteExitoso} 
            />
          )}
        </>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Faltantes Pendientes de Pedido</h2>
            {tienePermiso('Gestionar Stock') && faltantesRegistrados.length > 0 && (
              <button 
                onClick={() => {
                  if (window.confirm('¿Estás seguro de marcar todos los faltantes como pedidos?')) {
                    // Esta función se implementará en el componente ListaFaltantesPendientes
                    document.getElementById('marcarTodosPedidos').click();
                  }
                }}
                className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded text-sm md:text-base transition"
              >
                Pedir Todos
              </button>
            )}
          </div>
          
          {faltantesRegistrados.length === 0 ? (
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <p className="text-gray-600">No hay faltantes pendientes de pedido.</p>
            </div>
          ) : (
            <ListaFaltantesPendientes 
              faltantes={faltantesRegistrados} 
              onResolverExitoso={handleResolverFaltanteExitoso} 
            />
          )}
        </>
      )}
    </div>
  );
};

export default Faltantes;