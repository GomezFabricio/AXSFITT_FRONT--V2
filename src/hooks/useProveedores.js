import { useState, useCallback } from 'react';
import {
  obtenerProveedores,
  obtenerProveedorPorId,
  crearProveedor,
  actualizarProveedor,
  eliminarProveedor
} from '../api/proveedoresApi';
import tienePermiso from '../utils/tienePermiso';

/**
 * Hook personalizado para la gestión de proveedores
 * Cumple los lineamientos: simplicidad, validación de permisos, sin lógica innecesaria
 */
const useProveedores = () => {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar todos los proveedores
  const cargarProveedores = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await obtenerProveedores();
      setProveedores(data);
    } catch (err) {
      setError(err.message || 'Error al cargar proveedores');
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear proveedor
  const handleCrearProveedor = useCallback(async (proveedorData) => {
    setLoading(true);
    setError(null);
    try {
      await crearProveedor(proveedorData);
      await cargarProveedores();
    } catch (err) {
      setError(err.message || 'Error al crear proveedor');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [cargarProveedores]);

  // Actualizar proveedor
  const handleActualizarProveedor = useCallback(async (id, proveedorData) => {
    setLoading(true);
    setError(null);
    try {
      await actualizarProveedor(id, proveedorData);
      await cargarProveedores();
    } catch (err) {
      setError(err.message || 'Error al actualizar proveedor');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [cargarProveedores]);

  // Eliminar proveedor
  const handleEliminarProveedor = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await eliminarProveedor(id);
      await cargarProveedores();
    } catch (err) {
      setError(err.message || 'Error al eliminar proveedor');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [cargarProveedores]);

  // Validación de permisos
  const puedeGestionar = tienePermiso('Gestionar Proveedores');
  const puedeAgregar = tienePermiso('Agregar Proveedor');
  const puedeModificar = tienePermiso('Modificar Proveedor');
  const puedeEliminar = tienePermiso('Eliminar Proveedor');

  return {
    proveedores,
    loading,
    error,
    cargarProveedores,
    handleCrearProveedor,
    handleActualizarProveedor,
    handleEliminarProveedor,
    puedeGestionar,
    puedeAgregar,
    puedeModificar,
    puedeEliminar,
  };
};

export default useProveedores;
