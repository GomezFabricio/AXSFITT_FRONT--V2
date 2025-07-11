// --- IMPORTACIONES ---
import React, { useState, useEffect, useCallback } from 'react';
import {
  getCategorias as fetchCategoriasApi,
  crearCategoria as crearCategoriaApi,
  modificarCategoria as modificarCategoriaApi,
  eliminarCategoria as eliminarCategoriaApi,
} from '../../../api/categoriasApi';
import { FaPlus, FaEdit, FaTrash, FaSpinner } from 'react-icons/fa';
import ModalGestionCategoria from '../../../components/organisms/Modals/categorias/ModalGestionCategoria';
import ModalEliminar from '../../../components/organisms/Modals/ModalEliminar';
import ModalMensaje from '../../../components/organisms/Modals/ModalMensaje';
import tienePermiso from '../../../utils/tienePermiso';

// --- COMPONENTE PRINCIPAL ---
const CategoriasPage = () => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showGestionModal, setShowGestionModal] = useState(false);
  const [modalMode, setModalMode] = useState('create_parent');
  const [currentCategoria, setCurrentCategoria] = useState(null);
  const [initialModalData, setInitialModalData] = useState({ categoria_nombre: '', categoria_descripcion: '' });
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [showEliminarModal, setShowEliminarModal] = useState(false);
  const [categoriaAEliminar, setCategoriaAEliminar] = useState(null);
  
  // Estados para el modal de mensaje
  const [modalMensajeOpen, setModalMensajeOpen] = useState(false);
  const [mensajeModal, setMensajeModal] = useState({ tipo: '', mensaje: '' });

  // --- CARGAR CATEGORÍAS ---
  const buildTree = (flatList) => {
    const map = {};
    const roots = [];

    flatList.forEach(cat => {
      map[cat.categoria_id] = { ...cat, subcategorias: [] };
    });

    flatList.forEach(cat => {
      if (cat.categoria_padre_id && map[cat.categoria_padre_id]) {
        map[cat.categoria_padre_id].subcategorias.push(map[cat.categoria_id]);
      } else if (!cat.categoria_padre_id) {
        roots.push(map[cat.categoria_id]);
      }
    });

    return roots;
  };

  const loadCategorias = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = sessionStorage.getItem('token');
      if (!token) throw new Error("Token no encontrado. Por favor, inicia sesión.");
      const flatList = await fetchCategoriasApi(token);
      setCategorias(buildTree(flatList));
    } catch (err) {
      setError(err.message || 'Ocurrió un error al cargar las categorías.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategorias();
  }, [loadCategorias]);

  // --- MANEJADORES DE MODALES ---
  const handleOpenGestionModal = (mode, categoria = null) => {
    setModalMode(mode);
    setCurrentCategoria(categoria);
    setInitialModalData(
      mode === 'edit' && categoria
        ? { categoria_nombre: categoria.categoria_nombre, categoria_descripcion: categoria.categoria_descripcion || '' }
        : { categoria_nombre: '', categoria_descripcion: '' }
    );
    setShowGestionModal(true);
  };

  const handleCloseGestionModal = () => {
    setShowGestionModal(false);
    setCurrentCategoria(null);
    setInitialModalData({ categoria_nombre: '', categoria_descripcion: '' });
  };

  const handleGestionFormSubmit = async (formData) => {
    setLoadingSubmit(true);
    const token = sessionStorage.getItem('token');
    if (!token) {
      setMensajeModal({
        tipo: 'error',
        mensaje: 'Token no encontrado. Por favor, inicia sesión.'
      });
      setModalMensajeOpen(true);
      setLoadingSubmit(false);
      return;
    }
    try {
      if (modalMode === 'edit' && currentCategoria) {
        const payload = {
          ...formData,
          categoria_padre_id: currentCategoria.categoria_padre_id || null, // Mantener el padre actual si existe
        };
        await modificarCategoriaApi(currentCategoria.categoria_id, payload, token);
        setMensajeModal({
          tipo: 'exito',
          mensaje: 'Categoría modificada exitosamente.'
        });
      } else {
        const payload = {
          ...formData,
          categoria_padre_id: modalMode === 'create_sub' && currentCategoria ? currentCategoria.categoria_id : null,
        };
        await crearCategoriaApi(payload, token);
        setMensajeModal({
          tipo: 'exito',
          mensaje: modalMode === 'create_sub' ? 'Subcategoría creada exitosamente.' : 'Categoría creada exitosamente.'
        });
      }
      handleCloseGestionModal();
      loadCategorias();
      setModalMensajeOpen(true);
    } catch (err) {
      setMensajeModal({
        tipo: 'error',
        mensaje: err.message || 'Ocurrió un error al guardar la categoría.'
      });
      setModalMensajeOpen(true);
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleOpenEliminarModal = (categoria) => {
    setCategoriaAEliminar(categoria);
    setShowEliminarModal(true);
  };

  const handleConfirmEliminarCategoria = async () => {
    if (!categoriaAEliminar) return;
    setLoadingSubmit(true);
    const token = sessionStorage.getItem('token');
    if (!token) {
      setError("Token no encontrado. Por favor, inicia sesión.");
      setLoadingSubmit(false);
      return;
    }
    try {
      await eliminarCategoriaApi(categoriaAEliminar.categoria_id, token);
      loadCategorias();
    } catch (err) {
      setError(err.message || 'Ocurrió un error al eliminar la categoría.');
    } finally {
      setShowEliminarModal(false);
      setCategoriaAEliminar(null);
      setLoadingSubmit(false);
    }
  };

  // --- FUNCIÓN DE RENDERIZADO ---
  const renderCategoria = (cat, isSubcategoria = false) => (
    <div key={cat.categoria_id} className={`p-4 mb-3 border border-violet-200 rounded-lg shadow-md bg-white ${isSubcategoria ? 'ml-6' : ''}`}>
      <div className="flex justify-between items-center">
        <span className="font-semibold text-purple-800 text-lg">{cat.categoria_nombre}</span>
        <div className="space-x-2">
          {tienePermiso('Modificar Categoria') && (
            <button onClick={() => handleOpenGestionModal('edit', cat)} className="text-blue-500 hover:text-blue-700">
              <FaEdit />
            </button>
          )}
          {tienePermiso('Eliminar Categoria') && (
            <button onClick={() => handleOpenEliminarModal(cat)} className="text-red-500 hover:text-red-700">
              <FaTrash />
            </button>
          )}
          {tienePermiso('Agregar Categoria') && (
            <button onClick={() => handleOpenGestionModal('create_sub', cat)} className="text-green-500 hover:text-green-700">
              <FaPlus />
            </button>
          )}
        </div>
      </div>
      {cat.categoria_descripcion && <p className="text-sm text-gray-600 mt-2">{cat.categoria_descripcion}</p>}
      {cat.subcategorias && cat.subcategorias.length > 0 && (
        <div className="mt-3">
          {cat.subcategorias.map(subCat => renderCategoria(subCat, true))}
        </div>
      )}
    </div>
  );

  // --- RENDERIZADO PRINCIPAL ---
  if (loading) return <div className="flex justify-center items-center h-screen"><FaSpinner className="animate-spin text-purple-600 text-4xl" /></div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-purple-800">Administración de Categorías</h1>
        {tienePermiso('Agregar Categoria') && (
          <button onClick={() => handleOpenGestionModal('create_parent')} className="bg-purple-600 text-white px-4 py-2 rounded">
            <FaPlus className="inline mr-2" /> Nueva Categoría
          </button>
        )}
      </div>
      <div>
        {categorias.length > 0 ? categorias.map(cat => renderCategoria(cat)) : <p className="text-center text-gray-500">No hay categorías disponibles.</p>}
      </div>
      <ModalGestionCategoria
        isOpen={showGestionModal}
        onClose={handleCloseGestionModal}
        onSubmit={handleGestionFormSubmit}
        initialData={initialModalData}
        mode={modalMode}
        parentCategoriaNombre={modalMode === 'create_sub' && currentCategoria ? currentCategoria.categoria_nombre : null}
        loadingSubmit={loadingSubmit}
      />
      <ModalEliminar
        isOpen={showEliminarModal}
        onClose={() => setShowEliminarModal(false)}
        onConfirm={handleConfirmEliminarCategoria}
        nombreEntidad={categoriaAEliminar ? `la categoría "${categoriaAEliminar.categoria_nombre}"` : 'el elemento'}
      />
      {modalMensajeOpen && (
        <ModalMensaje
          isOpen={modalMensajeOpen}
          onClose={() => setModalMensajeOpen(false)}
          mensaje={mensajeModal.mensaje}
          tipo={mensajeModal.tipo}
        />
      )}
    </div>
  );
};

export default CategoriasPage;