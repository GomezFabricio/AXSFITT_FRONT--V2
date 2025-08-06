import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { buscarProductosPorNombreSinEstado, obtenerDetallesStock } from '../api/productosApi';

export default function useCrearPedido(pedido, cargarProveedores) {
  const [proveedorId, setProveedorId] = useState(pedido?.proveedor_id || '');
  const [productos, setProductos] = useState(pedido?.productos?.map(p => ({ ...p, uniqueId: uuidv4() })) || []);
  const [descuento, setDescuento] = useState(pedido?.descuento || 0);
  const [costoEnvio, setCostoEnvio] = useState(pedido?.costo_envio || 0);
  const [productosSinRegistrar, setProductosSinRegistrar] = useState(pedido?.productosSinRegistrar || []);
  const [fechaEsperada, setFechaEsperada] = useState(pedido?.fecha_esperada_entrega || '');
  const [error, setError] = useState(null);
  const [showSelector, setShowSelector] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [sugerencias, setSugerencias] = useState([]);
  const [loadingSugerencias, setLoadingSugerencias] = useState(false);
  const [seleccionados, setSeleccionados] = useState([]);
  const [productoDetalles, setProductoDetalles] = useState({});

  // Estado para variantes y productos en borrador
  const [variantesBorrador, setVariantesBorrador] = useState([]);
  const [productosBorrador, setProductosBorrador] = useState([]);

  // Handler para agregar variante en borrador
  const agregarVarianteBorrador = (vb) => {
    setVariantesBorrador(prev => [...prev, vb]);
  };
  const quitarVarianteBorrador = (idx) => {
    setVariantesBorrador(prev => prev.filter((_, i) => i !== idx));
  };
  // Handler para agregar producto en borrador
  const agregarProductoBorrador = (pb) => {
    setProductosBorrador(prev => [...prev, pb]);
  };
  const quitarProductoBorrador = (idx) => {
    setProductosBorrador(prev => prev.filter((_, i) => i !== idx));
  };

  // Calcular totales por línea (precio * cantidad por línea)
  const calcularSubtotal = () => {
    let subtotal = 0;
    productos.forEach((p) => {
      const det = productoDetalles[p.uniqueId] || {};
      const detallesStock = det.detallesStock;
      const varianteId = det.varianteId || '';
      const cantidad = Number(det.cantidad) || 1;
      let precio = Number(det.precio_costo);
      if (!precio && detallesStock) {
        const varianteSeleccionada = detallesStock?.variantes?.find(v => v.variante_id === varianteId);
        if (varianteSeleccionada && typeof varianteSeleccionada.variante_precio_costo === 'number') {
          precio = varianteSeleccionada.variante_precio_costo;
        } else if (varianteSeleccionada && varianteSeleccionada.variante_precio_costo) {
          precio = Number(varianteSeleccionada.variante_precio_costo);
        } else {
          precio = detallesStock?.precio_costo || 0;
        }
      }
      subtotal += (Number(precio) || 0) * cantidad;
    });
    return subtotal;
  };
  const subtotal = calcularSubtotal();
  const descuentoPorcentaje = Number(descuento) || 0;
  const descuentoMonto = subtotal * (descuentoPorcentaje / 100);
  const total = Math.max(0, subtotal - descuentoMonto) + (Number(costoEnvio) || 0);

  useEffect(() => { cargarProveedores && cargarProveedores(); }, [cargarProveedores]);

  useEffect(() => {
    if (!showSelector) return;
    if (busqueda.length < 2) { setSugerencias([]); return; }
    setLoadingSugerencias(true);
    let active = true;
    buscarProductosPorNombreSinEstado(busqueda, null, sessionStorage.getItem('token'))
      .then(res => { if (active) setSugerencias(res); })
      .catch(() => { if (active) setSugerencias([]); })
      .finally(() => { if (active) setLoadingSugerencias(false); });
    return () => { active = false; };
  }, [busqueda, showSelector]);

  useEffect(() => {
    seleccionados.forEach(sel => {
      const uniqueId = uuidv4();
      obtenerDetallesStock(sel.producto_id, sessionStorage.getItem('token'))
        .then(data => {
          setProductoDetalles(prev => ({
            ...prev,
            [uniqueId]: {
              detallesStock: data,
              varianteId: '',
              cantidad: 1,
              precio_costo: ''
            }
          }));
        });
    });
    // eslint-disable-next-line
  }, [seleccionados]);

  const confirmarSeleccion = () => {
    const nuevos = seleccionados.map(sel => {
      const uniqueId = uuidv4();
      obtenerDetallesStock(sel.producto_id, sessionStorage.getItem('token'))
        .then(data => {
          setProductoDetalles(prev => ({
            ...prev,
            [uniqueId]: {
              detallesStock: data,
              varianteId: '',
              cantidad: 1,
              precio_costo: ''
            }
          }));
        });
      return {
        producto_id: sel.producto_id,
        nombre: sel.producto_nombre,
        uniqueId
      };
    });
    setProductos(prev => [...prev, ...nuevos]);
    setSeleccionados([]);
    setShowSelector(false);
    setBusqueda('');
    setSugerencias([]);
  };

  const quitarProducto = idx => {
    const prod = productos[idx];
    setProductos(prev => prev.filter((_, i) => i !== idx));
    setProductoDetalles(prev => {
      const copy = { ...prev };
      delete copy[prod.uniqueId];
      return copy;
    });
  };
  const quitarProductoSinRegistrar = idx => setProductosSinRegistrar(prev => prev.filter((_, i) => i !== idx));

  const handleSubmit = (e, onSubmit) => {
    e.preventDefault();
    if (typeof onSubmit !== 'function') {
      setError('Error interno: onSubmit no es una función');
      return;
    }
    if (!proveedorId || (productos.length === 0 && productosSinRegistrar.length === 0 && variantesBorrador.length === 0 && productosBorrador.length === 0)) {
      setError('Debe seleccionar un proveedor y al menos un producto o variante.');
      return;
    }
    setError(null);
    const productosAEnviar = productos.map((p) => {
      const det = productoDetalles[p.uniqueId] || {};
      return {
        producto_id: p.producto_id,
        variante_id: det.varianteId || null,
        cantidad: det.cantidad || 1,
        precio_costo: det.precio_costo || undefined
      };
    });
    onSubmit({
      proveedor_id: proveedorId,
      descuento: descuentoPorcentaje,
      descuento_monto: descuentoMonto,
      costo_envio: Number(costoEnvio) || 0,
      fecha_esperada_entrega: fechaEsperada || undefined,
      productos: productosAEnviar,
      productosSinRegistrar,
      variantesBorrador,
      productosBorrador
    });
  };

  return {
    proveedorId, setProveedorId,
    productos, setProductos,
    descuento, setDescuento,
    costoEnvio, setCostoEnvio,
    productosSinRegistrar, setProductosSinRegistrar,
    fechaEsperada, setFechaEsperada,
    error, setError,
    showSelector, setShowSelector,
    busqueda, setBusqueda,
    sugerencias, setSugerencias,
    loadingSugerencias, setLoadingSugerencias,
    seleccionados, setSeleccionados,
    productoDetalles, setProductoDetalles,
    subtotal, descuentoPorcentaje, descuentoMonto, total,
    confirmarSeleccion, quitarProducto, quitarProductoSinRegistrar, handleSubmit,
    variantesBorrador, setVariantesBorrador, agregarVarianteBorrador, quitarVarianteBorrador,
    productosBorrador, setProductosBorrador, agregarProductoBorrador, quitarProductoBorrador
  };
}
