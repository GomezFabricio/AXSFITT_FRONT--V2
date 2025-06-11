import React, { useEffect, useState, useCallback } from 'react';
import { obtenerProductos, eliminarProducto, cambiarVisibilidadProducto, obtenerDetallesStock, reactivarProducto, cambiarEstadoVariante } from '../../../api/productosApi';
import config from '../../../config/config';
import TarjetaProducto from '../../../components/molecules/TarjetaProducto';
import ModalEliminar from '../../../components/organisms/modals/ModalEliminar';
import ModalMensaje from '../../../components/organisms/Modals/ModalMensaje';
import DetallesStock from '../../../components/molecules/DetallesStock';
import { useNavigate } from 'react-router-dom';
import { RadioGroup } from '@headlessui/react'

const tienePermiso = (permisoDescripcion) => {
  const userData = JSON.parse(sessionStorage.getItem('userData'));
  if (!userData || !userData.modulos) return false;
  return userData.modulos.some(
    m => m.permisos && m.permisos.some(p => p.permiso_descripcion === permisoDescripcion)
  );
};

const estados = [
  { name: 'Activos', value: 'activos' },
  { name: 'Inactivos', value: 'inactivos' },
  { name: 'Pendientes', value: 'pendientes' },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

const VerProductos = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [productoAEliminar, setProductoAEliminar] = useState(null);
  const [modalMensajeOpen, setModalMensajeOpen] = useState(false);
  const [tipoMensaje, setTipoMensaje] = useState('error');
  const [mensaje, setMensaje] = useState('');
  const [detallesStock, setDetallesStock] = useState(null);
  const [estadoFiltro, setEstadoFiltro] = useState('activos'); // 'activos', 'inactivos', 'pendientes'
  const navigate = useNavigate()

  const fetchProductos = useCallback(async () => {
    try {
      const token = sessionStorage.getItem('token');
      // Pasar el estado seleccionado a la API
      const productosData = await obtenerProductos(token, estadoFiltro);

      const productosConUrlCompleta = productosData.map((producto) => ({
        ...producto,
        imagen_url: `${config.backendUrl}${producto.imagen_url}`,
        stock_total: Number(producto.stock_total),
        visible: producto.visible ?? true,
        precio_venta: producto.producto_precio_venta || null, // Asegúrate de tener el precio de venta
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
  }, [estadoFiltro]);

  useEffect(() => {
    fetchProductos();
  }, [fetchProductos]);

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
      setModalOpen(false);
      setProductoAEliminar(null);
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

  const handleModificar = (productoId) => {
    navigate(`/productos/modificar/${productoId}`);
  };

  const abrirModalEliminar = (producto) => {
    setProductoAEliminar(producto);
    setModalOpen(true);
  };

  const cerrarModalEliminar = () => {
    setModalOpen(false);
    setProductoAEliminar(null);
  };

  const handleVerStock = async (productoId) => {
    try {
      const token = sessionStorage.getItem('token');
      const detalles = await obtenerDetallesStock(productoId, token);

      const productoConUrlCompleta = {
        ...detalles.producto,
        imagen_url: `${config.backendUrl}${detalles.producto.imagen_url}`,
        stock_total: Number(detalles.producto.stock_total),
      };

      const variantesConUrlCompleta = detalles.variantes.map((variante) => ({
        ...variante,
        imagen_url: variante.imagen_url ? `${config.backendUrl}${variante.imagen_url}` : null,
        stock_total: Number(variante.stock_total),
      }));

      setDetallesStock({
        producto: productoConUrlCompleta,
        variantes: variantesConUrlCompleta,
      });
    } catch (error) {
      console.error('Error al obtener detalles de stock:', error);
      setTipoMensaje('error');
      setMensaje('No se pudo obtener los detalles de stock.');
      setModalMensajeOpen(true);
    }
  };

  const cerrarDetallesStock = () => {
    setDetallesStock(null);
  };

  // Handler para reactivar un producto
  const handleReactivarProducto = async (productoId) => {
    try {
      const token = sessionStorage.getItem('token');
      await reactivarProducto(productoId, token);
      setTipoMensaje('exito');
      setMensaje('Producto reactivado exitosamente.');
      setModalMensajeOpen(true);
    } catch (error) {
      console.error('Error al reactivar producto:', error);
      setTipoMensaje('error');
      setMensaje('No se pudo reactivar el producto.');
      setModalMensajeOpen(true);
    }
  };

  const cerrarModalMensaje = () => {
    setModalMensajeOpen(false);
    fetchProductos(); // Refrescar la lista de productos
  };

  const handleToggleEstadoVariante = async (varianteId, nuevoEstado) => {
    try {
      const token = sessionStorage.getItem('token');
      await cambiarEstadoVariante(varianteId, nuevoEstado, token);

      // Actualizar el estado local de las variantes en detallesStock
      setDetallesStock(prevDetallesStock => {
        if (!prevDetallesStock || !prevDetallesStock.variantes) return prevDetallesStock;

        const updatedVariantes = prevDetallesStock.variantes.map(variante => {
          if (variante.variante_id === varianteId) {
            return { ...variante, variante_estado: nuevoEstado };
          }
          return variante;
        });

        return { ...prevDetallesStock, variantes: updatedVariantes };
      });

      setTipoMensaje('exito');
      setMensaje(`Variante ${nuevoEstado === 'activo' ? 'activada' : 'deshabilitada'} correctamente.`);
      setModalMensajeOpen(true);
    } catch (error) {
      console.error('Error al cambiar estado de variante:', error);
      setTipoMensaje('error');
      setMensaje('No se pudo cambiar el estado de la variante.');
      setModalMensajeOpen(true);
    }
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

      {/* Selector de estado */}
      <div className="mb-4">
        <RadioGroup value={estadoFiltro} onChange={setEstadoFiltro} className="flex space-x-4">
          {estados.map((estado) => (
            <RadioGroup.Option
              key={estado.value}
              value={estado.value}
              className={({ active, checked }) =>
                classNames(
                  checked ? 'bg-indigo-100 text-indigo-700' : 'bg-white text-gray-500 hover:bg-gray-100',
                  'relative flex items-center rounded-md px-4 py-2 cursor-pointer focus:outline-none'
                )
              }
            >
              <span className="text-sm font-medium">{estado.name}</span>
            </RadioGroup.Option>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-4">
        {productos.map((producto) => (
          <div key={producto.producto_id}>
            <TarjetaProducto
              nombre={producto.nombre}
              categoria={producto.categoria}
              marca={producto.marca || null}
              stockTotal={producto.stock_total}
              imagenUrl={producto.imagen_url}
              visible={producto.visible}
              producto_estado={producto.producto_estado}
              onEditar={tienePermiso('Modificar Producto') ? () => handleModificar(producto.producto_id) : null}
              onEliminar={tienePermiso('Eliminar Producto') ? () => abrirModalEliminar(producto) : null}
              onReactivar={tienePermiso('Modificar Producto') ? () => handleReactivarProducto(producto.producto_id) : null}
              onToggleVisible={tienePermiso('Modificar Producto') ? () => handleToggleVisible(producto.producto_id, producto.visible) : null}
              onVerStock={() => handleVerStock(producto.producto_id)}
            />
            {detallesStock?.producto?.producto_id === producto.producto_id && (
              <DetallesStock
                detallesStock={detallesStock}
                onClose={cerrarDetallesStock}
                onToggleEstadoVariante={handleToggleEstadoVariante} // Pasar la función al componente
                tienePermiso={tienePermiso}
              />
            )}
          </div>
        ))}
      </div>
      <ModalEliminar
        isOpen={modalOpen}
        onClose={cerrarModalEliminar}
        onConfirm={handleEliminar}
        nombreEntidad={productoAEliminar?.nombre || 'producto'}
      />
      <ModalMensaje
        isOpen={modalMensajeOpen}
        onClose={() => cerrarModalMensaje()}
        tipo={tipoMensaje}
        mensaje={mensaje}
      />
    </div>
  );
};

export default VerProductos;