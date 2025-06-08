import React, { useEffect, useState } from 'react';
import { obtenerProductos } from '../../../api/productosApi';
import config from '../../../config/config';
import TarjetaProducto from '../../../components/molecules/TarjetaProducto';

const VerProductos = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const token = sessionStorage.getItem('token'); // Obtener el token de sesión
        const productosData = await obtenerProductos(token);

        // Concatenar backendUrl con la ruta relativa de las imágenes
        const productosConUrlCompleta = productosData.map((producto) => ({
          ...producto,
          imagen_url: `${config.backendUrl}${producto.imagen_url}`,
        }));

        setProductos(productosConUrlCompleta);
      } catch (err) {
        setError('Error al cargar los productos.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductos();
  }, []);

  const handleEditar = (productoId) => {
    console.log(`Editar producto con ID: ${productoId}`);
    // Implementar lógica de edición
  };

  const handleEliminar = (productoId) => {
    console.log(`Eliminar producto con ID: ${productoId}`);
    // Implementar lógica de eliminación
  };

  const handleToggleVisible = (productoId) => {
    console.log(`Cambiar visibilidad del producto con ID: ${productoId}`);
    // Implementar lógica para cambiar visibilidad
  };

  const handleVerStock = (productoId) => {
    console.log(`Ver stock del producto con ID: ${productoId}`);
    // Implementar lógica para ver detalle de stock
  };

  if (loading) {
    return <p>Cargando productos...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div className="container mx-auto mt-8">
      <h2 className="text-2xl font-semibold mb-4">Lista de Productos</h2>
      <div className="space-y-4">
        {productos.map((producto) => (
          <TarjetaProducto
            key={producto.producto_id}
            nombre={producto.nombre}
            categoria={producto.categoria}
            marca={producto.marca || null} // Si no hay marca, pasar null
            stockTotal={producto.stock_total}
            imagenUrl={producto.imagen_url}
            visible={producto.visible}
            onEditar={() => handleEditar(producto.producto_id)}
            onEliminar={() => handleEliminar(producto.producto_id)}
            onToggleVisible={() => handleToggleVisible(producto.producto_id)}
            onVerStock={() => handleVerStock(producto.producto_id)}
          />
        ))}
      </div>
    </div>
  );
};

export default VerProductos;