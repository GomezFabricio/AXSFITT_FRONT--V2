import React, { useEffect, useState } from 'react';
import { obtenerProductos, eliminarProducto, cambiarVisibilidadProducto } from '../../../api/productosApi';
import config from '../../../config/config';
import TarjetaProducto from '../../../components/molecules/TarjetaProducto';
import ModalEliminar from '../../../components/organisms/modals/ModalEliminar';
import ModalMensaje from '../../../components/organisms/Modals/ModalMensaje';

const VerProductos = () => {
  const [productos, setProductos] = useState([]); // Estado para la lista de productos
  const [loading, setLoading] = useState(true); // Estado para mostrar el indicador de carga
  const [error, setError] = useState(null); // Estado para manejar errores
  const [modalOpen, setModalOpen] = useState(false); // Estado para controlar el modal de eliminación
  const [productoAEliminar, setProductoAEliminar] = useState(null); // Estado para el producto a eliminar
  const [modalMensajeOpen, setModalMensajeOpen] = useState(false); // Estado para controlar el modal de mensaje
  const [tipoMensaje, setTipoMensaje] = useState('error'); // Tipo de mensaje: 'error' o 'exito'
  const [mensaje, setMensaje] = useState(''); // Mensaje a mostrar en el modal

  // Cargar productos al montar el componente
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const token = sessionStorage.getItem('token'); // Obtener el token de sesión
        const productosData = await obtenerProductos(token);

        // Concatenar backendUrl con la ruta relativa de las imágenes y corregir tipos
        const productosConUrlCompleta = productosData.map((producto) => ({
          ...producto,
          imagen_url: `${config.backendUrl}${producto.imagen_url}`,
          stock_total: Number(producto.stock_total), // Convertir stock_total a número
          visible: producto.visible ?? true, // Asignar valor por defecto si visible es undefined
        }));

        setProductos(productosConUrlCompleta);
      } catch (err) {
        setError('Error al cargar los productos.');
        setTipoMensaje('error');
        setMensaje('Error al cargar los productos.');
        setModalMensajeOpen(true);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductos();
  }, []);

  // Handler para eliminar un producto
  const handleEliminar = async () => {
    if (!productoAEliminar) {
      console.error('No hay producto seleccionado para eliminar.');
      return;
    }

    try {
      const token = sessionStorage.getItem('token');
      await eliminarProducto(productoAEliminar.producto_id, token);
      setProductos((prevProductos) =>
        prevProductos.filter((producto) => producto.producto_id !== productoAEliminar.producto_id)
      );
      setModalOpen(false); // Cerrar el modal después de eliminar
      setProductoAEliminar(null); // Limpiar el producto a eliminar
      setTipoMensaje('exito');
      setMensaje('Producto eliminado exitosamente.');
      setModalMensajeOpen(true);
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      setTipoMensaje('error');
      setMensaje('No se pudo eliminar el producto.');
      setModalMensajeOpen(true);
    }
  };

  // Handler para cambiar la visibilidad de un producto
  const handleToggleVisible = async (productoId, visible) => {
    try {
      const token = sessionStorage.getItem('token');
      await cambiarVisibilidadProducto(productoId, !visible, token);
      setProductos((prevProductos) =>
        prevProductos.map((producto) =>
          producto.producto_id === productoId ? { ...producto, visible: !visible } : producto
        )
      );
      setTipoMensaje('exito');
      setMensaje('Visibilidad del producto actualizada.');
      setModalMensajeOpen(true);
    } catch (error) {
      console.error('Error al cambiar visibilidad del producto:', error);
      setTipoMensaje('error');
      setMensaje('No se pudo cambiar la visibilidad del producto.');
      setModalMensajeOpen(true);
    }
  };

  // Handler para abrir el modal de eliminación
  const abrirModalEliminar = (producto) => {
    setProductoAEliminar(producto); // Establecer el producto a eliminar
    setModalOpen(true); // Abrir el modal
  };

  // Handler para cerrar el modal de eliminación
  const cerrarModalEliminar = () => {
    setModalOpen(false); // Cerrar el modal
    setProductoAEliminar(null); // Limpiar el producto a eliminar
  };

  // Handler para editar un producto
  const handleEditar = (productoId) => {
    console.log(`Editar producto con ID: ${productoId}`);
    // Implementar lógica de edición
  };

  // Handler para ver el stock de un producto
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
            marca={producto.marca || null}
            stockTotal={producto.stock_total} // stock_total ahora es un número
            imagenUrl={producto.imagen_url}
            visible={producto.visible} // visible ahora tiene un valor por defecto
            onEditar={() => handleEditar(producto.producto_id)}
            onEliminar={() => abrirModalEliminar(producto)} // Abrir el modal al intentar eliminar
            onToggleVisible={() => handleToggleVisible(producto.producto_id, producto.visible)}
            onVerStock={() => handleVerStock(producto.producto_id)}
          />
        ))}
      </div>
      {/* Modal para confirmar eliminación */}
      <ModalEliminar
        isOpen={modalOpen}
        onClose={cerrarModalEliminar} // Usar la función para cerrar el modal
        onConfirm={handleEliminar} // Usar la función para confirmar la eliminación
        nombreEntidad={productoAEliminar?.nombre || 'producto'}
      />
      {/* Modal para mostrar mensajes */}
      <ModalMensaje
        isOpen={modalMensajeOpen}
        onClose={() => setModalMensajeOpen(false)} // Cerrar el modal de mensaje
        tipo={tipoMensaje} // Tipo de mensaje: 'error' o 'exito'
        mensaje={mensaje} // Mensaje a mostrar
      />
    </div>
  );
};

export default VerProductos;