import { useState, useEffect } from 'react';
import { getPedidoPorId, modificarPedido } from '../api/pedidosApi';
import axios from 'axios';
import config from '../config/config';

const useEditarPedidoModal = (pedido) => {
  const [datosCompletos, setDatosCompletos] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Estados para agregar productos
  const [showSelector, setShowSelector] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [sugerencias, setSugerencias] = useState([]);
  const [loadingSugerencias, setLoadingSugerencias] = useState(false);
  const [seleccionados, setSeleccionados] = useState([]);
  const [productoDetalles, setProductoDetalles] = useState({});

  // Estados para productos sin registrar
  const [showProductoBorradorModal, setShowProductoBorradorModal] = useState(false);
  const [productosSinRegistrar, setProductosSinRegistrar] = useState([]);

  // Estados del formulario
  const [formData, setFormData] = useState({
    pedido_descuento: 0,
    pedido_costo_envio: 0,
    pedido_fecha_esperada_entrega: '',
    items: [],
    variantesBorrador: [],
    productosBorrador: [],
    // Estados para controlar eliminaciones
    itemsEliminados: [],
    variantesBorradorEliminadas: [],
    productosBorradorEliminados: []
  });

  const cargarDatosCompletos = async (pedidoId) => {
    if (!pedidoId) return;
    
    setLoading(true);
    setError(null);
    try {
      const datos = await getPedidoPorId(pedidoId);
      setDatosCompletos(datos);
      
      // Inicializar el formulario con los datos actuales
      setFormData({
        pedido_descuento: datos.pedido_descuento || 0,
        pedido_costo_envio: datos.pedido_costo_envio || 0,
        pedido_fecha_esperada_entrega: datos.pedido_fecha_esperada_entrega ? 
          new Date(datos.pedido_fecha_esperada_entrega).toISOString().split('T')[0] : '',
        items: datos.items || [],
        variantesBorrador: datos.variantesBorrador || [],
        productosBorrador: datos.productosBorrador || [],
        // Inicializar arrays de eliminados vacíos
        itemsEliminados: [],
        variantesBorradorEliminadas: [],
        productosBorradorEliminados: []
      });
    } catch (err) {
      setError(err.message || 'Error al cargar el pedido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pedido?.pedido_id) {
      cargarDatosCompletos(pedido.pedido_id);
    }
  }, [pedido?.pedido_id]);

  const handleInputChange = (...args) => {
    const [field, indexOrId, subField, value] = args;
    
    // Si es un campo simple (campo básico del pedido)
    if (args.length === 2) {
      const fieldValue = indexOrId;
      
      // Manejar acciones especiales
      switch (field) {
        case 'removeItem':
          setFormData(prev => ({
            ...prev,
            itemsEliminados: [...prev.itemsEliminados, fieldValue]
          }));
          return;
          
        case 'removeVarianteBorrador':
          setFormData(prev => ({
            ...prev,
            variantesBorradorEliminadas: [...prev.variantesBorradorEliminadas, fieldValue],
            variantesBorrador: prev.variantesBorrador.filter(v => v.vb_id !== fieldValue)
          }));
          return;
          
        case 'removeProductoBorrador':
          setFormData(prev => ({
            ...prev,
            productosBorradorEliminados: [...prev.productosBorradorEliminados, fieldValue],
            productosBorrador: prev.productosBorrador.filter(p => p.pbp_id !== fieldValue)
          }));
          return;
          
        case 'openProductSelector':
          setShowSelector(true);
          return;
          
        case 'openProductoBorradorModal':
          agregarProductoSinRegistrar();
          return;
          return;
          
        default:
          // Campo simple normal
          setFormData(prev => ({
            ...prev,
            [field]: fieldValue
          }));
          return;
      }
    }

    // Si es un campo de array
    setFormData(prev => {
      const newFormData = { ...prev };
      
      switch (field) {
        case 'items':
          // Para items usamos índice
          if (!newFormData.items[indexOrId]) {
            newFormData.items[indexOrId] = {};
          }
          newFormData.items[indexOrId][subField] = value;
          break;
          
        case 'variantesBorrador':
          // Para variantes borrador usamos vb_id
          const varianteIndex = newFormData.variantesBorrador.findIndex(v => v.vb_id === indexOrId);
          if (varianteIndex === -1) {
            // Si no existe, crear nueva entrada
            newFormData.variantesBorrador.push({
              vb_id: indexOrId,
              [subField]: value
            });
          } else {
            // Si existe, actualizar
            newFormData.variantesBorrador[varianteIndex][subField] = value;
          }
          break;
          
        case 'productosBorrador':
          // Para productos borrador usamos pbp_id
          const productoIndex = newFormData.productosBorrador.findIndex(p => p.pbp_id === indexOrId);
          if (productoIndex === -1) {
            // Si no existe, crear nueva entrada
            newFormData.productosBorrador.push({
              pbp_id: indexOrId,
              [subField]: value
            });
          } else {
            // Si existe, actualizar
            newFormData.productosBorrador[productoIndex][subField] = value;
          }
          break;
          
        default:
          console.warn(`Campo de array no reconocido: ${field}`);
      }
      
      return newFormData;
    });
  };

  const handleSave = async () => {
    if (!pedido?.pedido_id) {
      throw new Error('No se puede guardar: ID de pedido no encontrado');
    }

    try {
      setLoading(true);
      setError(null);
      
      const datos = {
        pedido_id: pedido.pedido_id,
        modificaciones: {
          // Campos básicos del pedido
          pedido_descuento: formData.pedido_descuento,
          pedido_costo_envio: formData.pedido_costo_envio,
          pedido_fecha_esperada_entrega: formData.pedido_fecha_esperada_entrega,
          
          // Productos modificados/agregados
          items: formData.items,
          variantesBorrador: formData.variantesBorrador,
          productosBorrador: formData.productosBorrador
        },
        
        // Productos eliminados (en el nivel superior, no dentro de modificaciones)
        itemsEliminados: formData.itemsEliminados,
        variantesBorradorEliminadas: formData.variantesBorradorEliminadas,
        productosBorradorEliminados: formData.productosBorradorEliminados,
        
        motivo: 'Modificación completa desde modal de edición'
      };
      
      const response = await modificarPedido(datos);
      
  // Recarga de datos se hará desde el componente luego de cerrar el mensaje de éxito
      
      return response;
    } catch (err) {
      setError(err.message || 'Error al guardar el pedido');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Función para buscar productos
  const buscarProductos = async (termino) => {
    if (!termino || termino.length < 2) {
      setSugerencias([]);
      return;
    }

    setLoadingSugerencias(true);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await axios.get(
        `${config.backendUrl}/api/productos/buscar?termino=${encodeURIComponent(termino)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSugerencias(response.data.data || []);
    } catch (error) {
      console.error('Error al buscar productos:', error);
      setSugerencias([]);
    } finally {
      setLoadingSugerencias(false);
    }
  };

  // Efecto para buscar productos cuando cambia la búsqueda
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      buscarProductos(busqueda);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [busqueda]);

  // Función para confirmar selección de productos
  const confirmarSeleccionProductos = () => {
    // Agregar los productos seleccionados a formData.items
    const nuevosItems = seleccionados.map(producto => ({
      ...producto,
      cantidad: 1,
      precio_unitario: producto.producto_precio_costo || 0
    }));

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, ...nuevosItems]
    }));

    // Limpiar selección y cerrar modal
    setSeleccionados([]);
    setShowSelector(false);
    setBusqueda('');
  };

  // Función para agregar producto sin registrar
  const agregarProductoSinRegistrar = () => {
    const nuevoProducto = {
      pbp_id: `nuevo_${Date.now()}`,
      pbp_nombre: '',
      pbp_precio_costo: '',
      pbp_cantidad: ''
    };

    setFormData(prev => ({
      ...prev,
      productosBorrador: [...prev.productosBorrador, nuevoProducto]
    }));
  };

  return {
    datosCompletos,
    loading,
    error,
    formData,
    handleInputChange,
    handleSave,
    cargarDatosCompletos,
    // Estados y funciones para agregar productos
    showSelector,
    setShowSelector,
    busqueda,
    setBusqueda,
    sugerencias,
    loadingSugerencias,
    seleccionados,
    setSeleccionados,
    productoDetalles,
    setProductoDetalles,
    confirmarSeleccionProductos,
    // Estados y funciones para productos sin registrar
    showProductoBorradorModal,
    setShowProductoBorradorModal,
    productosSinRegistrar,
    setProductosSinRegistrar,
    agregarProductoSinRegistrar
  };
};

export default useEditarPedidoModal;