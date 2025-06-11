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
        // Agregar la URL base a las imágenes
        const productosConUrlCompleta = productosData.map(producto => ({
          ...producto,
          imagen_url: `${config.backendUrl}${producto.imagen_url}`
        }));
        setProductos(productosConUrlCompleta);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchProductos();
  }, []);

  const handleActualizarStockMinimoMaximo = async (productoId, stockMinimo, stockMaximo) => {
    try {
      const token = sessionStorage.getItem('token');
      await actualizarStockMinimoMaximo(productoId, stockMinimo, stockMaximo, token);
      // Actualizar el estado local para reflejar los cambios
      setProductos(prevProductos =>
        prevProductos.map(producto =>
          producto.producto_id === productoId
            ? { ...producto, stock_minimo: stockMinimo, stock_maximo: stockMaximo }
            : producto
        )
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