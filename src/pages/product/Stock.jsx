import React, { useState, useEffect } from 'react';
import { obtenerProductos } from '../../api/productosApi';
import { actualizarStockMinimoMaximo } from '../../api/stockApi';
import config from '../../config/config';
import ListaStock from '../../components/molecules/ListaStock';

const Stock = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const productosData = await obtenerProductos(token);

        // Process products and variants to include full image URLs
        const productosConStock = productosData.map(producto => {
          const productoConUrlCompleta = {
            ...producto,
            imagen_url: `${config.backendUrl}${producto.imagen_url}`,
            tipo: 'producto' // Add a type to differentiate products and variants
          };

          // Process variants if they exist
          let variantesConUrlCompleta = [];
          if (producto.variantes && producto.variantes.length > 0) {
            variantesConUrlCompleta = producto.variantes.map(variante => ({
              ...variante,
              imagen_url: variante.imagen_url ? `${config.backendUrl}${variante.imagen_url}` : null,
              producto_id: producto.producto_id, // Keep track of the parent product
              tipo: 'variante', // Mark as variant
              variante_estado: variante.variante_estado // Keep track of the variant state
            }));
          }

          return [productoConUrlCompleta, ...variantesConUrlCompleta]; // Flatten the array
        }).flat(); // Flatten the array of arrays

        setProductos(productosConStock);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchProductos();
  }, []);

  const handleActualizarStockMinimoMaximo = async (id, stockMinimo, stockMaximo, isVariant = false) => {
    try {
      const token = sessionStorage.getItem('token');
      await actualizarStockMinimoMaximo(id, stockMinimo, stockMaximo, token);

      // Update the state to reflect the changes
      setProductos(prevProductos =>
        prevProductos.map(item => {
          if (item.producto_id === id || item.variante_id === id) {
            return { ...item, stock_minimo: stockMinimo, stock_maximo: stockMaximo };
          }
          return item;
        })
      );
    } catch (error) {
      setError(error.message || 'Error al actualizar el stock.');
    }
  };

  if (loading) {
    return <p>Cargando productos...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="container mx-auto mt-8">
      <h2 className="text-2xl font-semibold mb-4">Gestionar Stock</h2>
      <ListaStock
        productos={productos}
        handleActualizarStockMinimoMaximo={handleActualizarStockMinimoMaximo}
      />
    </div>
  );
};

export default Stock;