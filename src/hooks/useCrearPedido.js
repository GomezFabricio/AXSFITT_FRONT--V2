import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { buscarProductosPorNombreSinEstado, obtenerDetallesStock } from '../api/productosApi';

export default function useCrearPedido(pedido, cargarProveedores, formulariosVariantes = {}) {
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
    
    // 1. PRODUCTOS REGISTRADOS 
    productos.forEach((p) => {
      const det = productoDetalles[p.uniqueId] || {};
      const detallesStock = det.detallesStock;
      
      // Verificar si el producto tiene variantes en el sistema
      const tieneVariantesSistema = detallesStock?.variantes && detallesStock.variantes.length > 0;
      
      if (tieneVariantesSistema) {
        // CASO A: Producto con variantes existentes en el sistema
        const variantesPedido = det.variantesPedido || [];
        
        // Sumar todas las variantes incluidas en el pedido
        variantesPedido.forEach((vp) => {
          const cantidad = Number(vp.cantidad) || 0;
          const precio = Number(vp.precio_costo) || 0;
          if (cantidad > 0 && precio > 0) {
            subtotal += precio * cantidad;
          }
        });
        
      } else {
        // CASO B: Producto sin variantes en el sistema
        const atributosConfigurados = det.atributosConfigurados || { atributos: [] };
        const variantes = det.variantes || [];
        
        if (atributosConfigurados.atributos.length === 0) {
          // Sin atributos configurados: usar cantidad y precio directo
          const cantidad = Number(det.cantidad) || 0;
          const precio = Number(det.precio_costo) || 0;
          subtotal += precio * cantidad;
        } else {
          // Con atributos configurados: sumar todas las variantes creadas
          variantes.forEach((v) => {
            const cantidad = Number(v.cantidad) || 0;
            const precio = Number(v.precio_costo) || 0;
            subtotal += precio * cantidad;
          });
        }
      }
    });

    // 2. PRODUCTOS SIN REGISTRAR (legacy - productos completamente nuevos)
    productosSinRegistrar.forEach((p, idx) => {
      const tieneAtributos = !!p.atributosConfigurados && p.atributosConfigurados.atributos && p.atributosConfigurados.atributos.length > 0;
      
      if (!tieneAtributos) {
        // Producto sin atributos: usar cantidad y precio directo
        const cantidad = Number(p.cantidad) || 0;
        const precio = Number(p.precio_costo) || 0;
        subtotal += precio * cantidad;
      } else {
        // Producto con atributos: sumar todas sus variantes
        const variantes = formulariosVariantes[idx] || [];
        variantes.forEach((v) => {
          const cantidad = Number(v.cantidad) || 0;
          const precio = Number(v.precio_costo) || 0;
          subtotal += precio * cantidad;
        });
      }
    });

    // 3. VARIANTES BORRADOR (variantes nuevas de productos existentes)
    variantesBorrador.forEach((vb) => {
      const cantidad = Number(vb.vb_cantidad) || 0;
      const precio = Number(vb.vb_precio_unitario) || 0;
      subtotal += precio * cantidad;
    });

    // 4. PRODUCTOS BORRADOR (productos completamente nuevos)
    productosBorrador.forEach((pb) => {
      const cantidad = Number(pb.pbp_cantidad) || 0;
      const precio = Number(pb.pbp_precio_unitario) || 0;
      subtotal += precio * cantidad;
    });

    return subtotal;
  };
  const subtotal = calcularSubtotal();
  const descuentoPorcentaje = Number(descuento) || 0;
  const subtotalConEnvio = subtotal + (Number(costoEnvio) || 0);
  const descuentoMonto = subtotalConEnvio * (descuentoPorcentaje / 100);
  const total = Math.max(0, subtotalConEnvio - descuentoMonto);

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
      const detallesStock = det.detallesStock;
      const tieneVariantesSistema = detallesStock?.variantes && detallesStock.variantes.length > 0;
      
      if (tieneVariantesSistema) {
        // Producto con variantes existentes: enviar solo las variantesPedido con IDs reales
        const variantesPedido = det.variantesPedido || [];
        return variantesPedido
          .filter(vp => Number(vp.cantidad) > 0 && typeof vp.variante_id === 'number') // Solo IDs numéricos reales
          .map(vp => ({
            producto_id: p.producto_id,
            variante_id: vp.variante_id,
            cantidad: Number(vp.cantidad),
            precio_costo: Number(vp.precio_costo)
          }));
      } else {
        // Producto sin variantes: enviar como producto simple si no tiene atributos
        const atributosConfigurados = det.atributosConfigurados || { atributos: [] };
        
        if (atributosConfigurados.atributos.length === 0) {
          // Sin atributos: enviar producto simple
          const cantidad = Number(det.cantidad) || 0;
          const precio = Number(det.precio_costo) || 0;
          if (cantidad > 0 && precio > 0) {
            return [{
              producto_id: p.producto_id,
              variante_id: null,
              cantidad: cantidad,
              precio_costo: precio
            }];
          }
        }
        // Si tiene atributos configurados, las variantes se enviarán en variantesBorrador
        return [];
      }
    }).flat().filter(p => p && p.cantidad > 0);

    // Agregar variantes nuevas de productos registrados a variantesBorrador
    const variantesBorradorAdicionales = [];
    productos.forEach((p) => {
      const det = productoDetalles[p.uniqueId] || {};
      const detallesStock = det.detallesStock;
      const tieneVariantesSistema = detallesStock?.variantes && detallesStock.variantes.length > 0;
      
      if (tieneVariantesSistema) {
        // Para productos con variantes existentes: agregar las nuevas (IDs temporales)
        const variantesPedido = det.variantesPedido || [];
        variantesPedido.forEach((vp) => {
          // Si el variante_id es un string (como "nueva_0"), es una variante nueva
          if (typeof vp.variante_id === 'string' && vp.variante_id.startsWith('nueva_')) {
            const cantidad = Number(vp.cantidad) || 0;
            const precio = Number(vp.precio_costo) || 0;
            if (cantidad > 0 && precio > 0) {
              variantesBorradorAdicionales.push({
                vb_producto_id: p.producto_id,
                vb_atributos: vp.atributos || [], // Los atributos deberían estar en vp
                vb_cantidad: cantidad,
                vb_precio_unitario: precio
              });
            }
          }
        });
      } else {
        // Para productos sin variantes del sistema: agregar variantes locales creadas
        const atributosConfigurados = det.atributosConfigurados || { atributos: [] };
        const variantes = det.variantes || [];
        
        if (atributosConfigurados.atributos.length > 0) {
          variantes.forEach((v) => {
            const cantidad = Number(v.cantidad) || 0;
            const precio = Number(v.precio_costo) || 0;
            if (cantidad > 0 && precio > 0) {
              variantesBorradorAdicionales.push({
                vb_producto_id: p.producto_id,
                vb_atributos: atributosConfigurados.atributos.map(attr => ({
                  atributo_nombre: attr.atributo_nombre,
                  valor_nombre: v[attr.atributo_nombre] || ''
                })),
                vb_cantidad: cantidad,
                vb_precio_unitario: precio
              });
            }
          });
        }
      }
    });

    // Convertir variantes de productos sin registrar a productos borrador
    const productosBorradorAdicionales = [];
    const productosConVariantesMap = new Map();

    productosSinRegistrar.forEach((p, idx) => {
      const tieneAtributos = !!p.atributosConfigurados && p.atributosConfigurados.atributos && p.atributosConfigurados.atributos.length > 0;
      
      if (tieneAtributos) {
        // Producto con atributos: consolidar todas las variantes en un solo registro
        const variantes = formulariosVariantes[idx] || [];
        const variantesValidas = [];
        
        variantes.forEach((v) => {
          const cantidad = Number(v.cantidad) || 0;
          const precio = Number(v.precio_costo) || 0;
          if (cantidad > 0 && precio > 0) {
            // Crear objeto de variante con todos los atributos
            const varianteObj = {
              cantidad: cantidad,
              precio: precio // Cambiado de precio_costo a precio
            };
            
            // Agregar valores de atributos
            p.atributosConfigurados.atributos.forEach(attr => {
              varianteObj[attr.atributo_nombre] = v[attr.atributo_nombre] || '';
            });
            
            variantesValidas.push(varianteObj);
          }
        });

        if (variantesValidas.length > 0) {
          // Limpiar la estructura de atributos para solo incluir nombres sin valores ni campos base
          const atributosLimpios = {
            atributos: p.atributosConfigurados.atributos.map(attr => ({
              atributo_nombre: attr.atributo_nombre
            }))
          };

          productosBorradorAdicionales.push({
            pbp_nombre: p.nombre,
            pbp_cantidad: 1, // Cantidad base del producto
            pbp_precio_unitario: 0, // Precio se define por variantes
            pbp_atributos: atributosLimpios,
            pbp_variantes: variantesValidas
          });
        }
      }
    });

    onSubmit({
      proveedor_id: proveedorId,
      descuento: descuentoPorcentaje,
      descuento_monto: descuentoMonto,
      costo_envio: Number(costoEnvio) || 0,
      fecha_esperada_entrega: fechaEsperada || undefined,
      productos: productosAEnviar,
      productosSinRegistrar,
      variantesBorrador: [...variantesBorrador, ...variantesBorradorAdicionales],
      productosBorrador: [...productosBorrador, ...productosBorradorAdicionales]
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
