import React, { useState, useEffect } from 'react';
import { obtenerStock } from '../../../api/stockApi';
import config from '../../../config/config';
import ListaStock from '../../../components/molecules/stock/ListaStock';
import ConfiguracionNotificacionesModerna from '../../../components/molecules/stock/ConfiguracionNotificacionesModerna';
import useNotification from '../../../hooks/useNotification';
import NotificationContainer from '../../../components/atoms/NotificationContainer';

const Stock = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [vistaActiva, setVistaActiva] = useState('inventario'); // 'inventario' o 'notificaciones'
  const { notifications, removeNotification } = useNotification();

  useEffect(() => {
    const fetchStock = async () => {
      try {
        setLoading(true);
        const token = sessionStorage.getItem('token');
        const productosData = await obtenerStock(token);

        // Procesar productos y variantes para incluir URLs completas de imágenes
        const productosConStock = productosData.map(producto => {
          const productoConUrlCompleta = {
            ...producto,
            imagen_url: `${config.backendUrl}${producto.imagen_url}`,
            tipo: 'producto'
          };

          // Procesar variantes si existen
          let variantesConUrlCompleta = [];
          if (producto.variantes && producto.variantes.length > 0) {
            variantesConUrlCompleta = producto.variantes.map(variante => ({
              ...variante,
              imagen_url: variante.imagen_url ? `${config.backendUrl}${variante.imagen_url}` : null,
              producto_id: producto.producto_id,
              producto_nombre: producto.nombre,
              tipo: 'variante',
              variante_estado: variante.variante_estado
            }));
          }

          return [productoConUrlCompleta, ...variantesConUrlCompleta];
        }).flat();

        setProductos(productosConStock);
        setLoading(false);
      } catch (error) {
        console.error("Error al obtener el stock:", error);
        setError(error.message || "Error al cargar el stock");
        setLoading(false);
      }
    };

    fetchStock();
  }, []);

  if (loading) {
    return <div className="text-center mt-10">Cargando inventario...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Gestionar Stock</h1>
      
      {/* Tabs de navegación */}
      <div className="mb-6">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setVistaActiva('inventario')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              vistaActiva === 'inventario'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            📦 Inventario de Productos
          </button>
          <button
            onClick={() => setVistaActiva('notificaciones')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              vistaActiva === 'notificaciones'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            🔔 Configurar Notificaciones
          </button>
        </nav>
      </div>

      {/* Contenido de las tabs */}
      {vistaActiva === 'inventario' && (
        <div>
          {loading && <div className="text-center mt-10">Cargando inventario...</div>}
          {error && <div className="text-center mt-10 text-red-500">Error: {error}</div>}
          {!loading && !error && <ListaStock productos={productos} />}
        </div>
      )}

      {vistaActiva === 'notificaciones' && (
        <ConfiguracionNotificacionesModerna />
      )}

      <NotificationContainer 
        notifications={notifications} 
        removeNotification={removeNotification} 
      />
    </div>
  );
};

export default Stock;