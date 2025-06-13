import React, { useState, useEffect } from 'react';
import { obtenerStock } from '../../../api/stockApi';
import config from '../../../config/config';
import ListaStock from '../../../components/molecules/stock/ListaStock';

const Stock = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      <h1 className="text-2xl font-bold mb-6">Inventario de Productos</h1>
      <ListaStock productos={productos} />
    </div>
  );
};

export default Stock;