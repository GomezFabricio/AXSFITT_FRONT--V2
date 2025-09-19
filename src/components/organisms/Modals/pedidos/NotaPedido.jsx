import React, { useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const NotaPedido = ({ open, onClose, pedido }) => {
  const notaRef = useRef(null);
  const [exportando, setExportando] = React.useState(false);
  if (!open || !pedido) return null;

  // Agrupa productos y variantes igual que DetallePedidoModal, pero plano
  const agruparProductos = () => {
    const grupos = new Map();

    // 1. Productos registrados (items)
    pedido.items?.forEach(item => {
      const nombreProducto = item.producto_nombre || 'Producto sin nombre';
      if (!grupos.has(nombreProducto)) {
        grupos.set(nombreProducto, {
          nombre: nombreProducto,
          tipo: 'registrado',
          variantes: [],
          productoBase: null
        });
      }
      const grupo = grupos.get(nombreProducto);
      grupo.variantes.push({
        ...item,
        tipo: 'registrada',
        atributos: item.variante_atributos,
        cantidad: item.pd_cantidad_pedida,
        precio: item.pd_precio_unitario,
        subtotal: item.pd_subtotal || (item.pd_precio_unitario * item.pd_cantidad_pedida)
      });
    });

    // 2. Variantes borrador (nuevas variantes de productos existentes)
    pedido.variantesBorrador?.forEach(variante => {
      const nombreProducto = variante.producto_nombre || 'Producto sin nombre';
      if (!grupos.has(nombreProducto)) {
        grupos.set(nombreProducto, {
          nombre: nombreProducto,
          tipo: 'registrado',
          variantes: [],
          productoBase: null
        });
      }
      const grupo = grupos.get(nombreProducto);
      grupo.variantes.push({
        ...variante,
        tipo: 'borrador',
        atributos: variante.vb_atributos,
        cantidad: variante.vb_cantidad || 0,
        precio: variante.vb_precio_unitario || 0,
        subtotal: (Number(variante.vb_precio_unitario) || 0) * (Number(variante.vb_cantidad) || 0)
      });
    });

    // 3. Productos borrador (productos completamente nuevos)
    pedido.productosBorrador?.forEach(producto => {
      const nombreProducto = producto.pbp_nombre || 'Producto sin nombre';
      const variantesInternas = Array.isArray(producto.pbp_variantes) ? producto.pbp_variantes : [];
      grupos.set(`${nombreProducto}_borrador_${producto.pbp_id}`, {
        nombre: nombreProducto,
        tipo: 'borrador',
        variantes: [],
        productoBase: {
          ...producto,
          cantidad: producto.pbp_cantidad || 0,
          precio: producto.pbp_precio_unitario || 0,
          subtotal: producto.pbp_subtotal || (Number(producto.pbp_precio_unitario || 0) * Number(producto.pbp_cantidad || 0)),
          atributos: producto.pbp_atributos,
          variantes_internas: variantesInternas
        }
      });
    });

    return Array.from(grupos.values());
  };

  const productosAgrupados = agruparProductos();

  // Formatea atributos igual que DetallePedidoModal pero solo muestra sabor si existe
  const formatearAtributos = (atributos) => {
    if (!atributos) return '—';
    // Si es un string simple, devolverlo directamente
    if (typeof atributos === 'string') {
      return atributos;
    }
    // Si es un array (como vb_atributos del backend)
    if (Array.isArray(atributos)) {
      const saborObj = atributos.find(attr => (attr.atributo_nombre?.toLowerCase() === 'sabor' || attr.atributo_nombre?.toLowerCase() === 'sabor'));
      if (saborObj && saborObj.valor_nombre) return `sabor: ${saborObj.valor_nombre}`;
      return '—';
    }
    // Si es un objeto plano
    if (typeof atributos === 'object' && atributos !== null) {
      if (atributos.atributos && Array.isArray(atributos.atributos)) {
        const saborObj = atributos.atributos.find(attr => (attr.atributo_nombre?.toLowerCase() === 'sabor' || attr.atributo_nombre?.toLowerCase() === 'sabor'));
        if (saborObj && saborObj.valor_nombre) return `sabor: ${saborObj.valor_nombre}`;
        return '—';
      }
      if (atributos.sabor) return `sabor: ${atributos.sabor}`;
      return '—';
    }
    return '—';
  };

  // Exporta la nota como PDF
  const handleExportNotaPDF = async () => {
    setExportando(true);
    await new Promise(resolve => setTimeout(resolve, 100)); // Espera a que el botón se oculte
    if (!notaRef.current) {
      setExportando(false);
      return;
    }
    const canvas = await html2canvas(notaRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#fff',
    });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgWidth = pageWidth - 40;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 20, 20, imgWidth, imgHeight);
    pdf.save(`NotaPedido_${pedido.pedido_id}.pdf`);
    setExportando(false);
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 relative m-4" style={{ color: '#111' }}>
        <button 
          className="absolute top-4 right-4 bg-black text-white rounded-full text-xl w-8 h-8 flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg font-bold" 
          onClick={onClose}
        >
          ×
        </button>
        <div ref={notaRef} style={{ background: '#fff', color: '#111', padding: 0 }}>
          <h2 style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' }}>Nota de pedido</h2>
          <div style={{ marginBottom: 16 }}>
            <div><b>Proveedor:</b> {pedido.proveedor_nombre}</div>
            <div><b>Usuario:</b> {pedido.persona_nombre} {pedido.persona_apellido}</div>
            <div><b>Fecha:</b> {new Date(pedido.pedido_fecha_pedido).toLocaleString()}</div>
            <div><b>Entrega esperada:</b> {pedido.pedido_fecha_esperada_entrega ? new Date(pedido.pedido_fecha_esperada_entrega).toLocaleDateString() : '-'}</div>
          </div>
          <hr style={{ margin: '16px 0' }} />
          <h3 style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 10 }}>Productos</h3>
          <table style={{ width: '100%', fontSize: 15, borderCollapse: 'collapse', color: '#111' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #222' }}>
                <th style={{ textAlign: 'left', padding: 6 }}>Producto</th>
                <th style={{ textAlign: 'left', padding: 6 }}>Variante</th>
                <th style={{ textAlign: 'center', padding: 6 }}>Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {productosAgrupados.map((grupo, idx) => (
                <React.Fragment key={idx}>
                  {/* Producto borrador: mostrar una fila por cada variante */}
                  {grupo.tipo === 'borrador' && grupo.productoBase && Array.isArray(grupo.productoBase.variantes_internas) && grupo.productoBase.variantes_internas.length > 0
                    ? grupo.productoBase.variantes_internas.map((variante, vIdx) => {
                        // Buscar atributo_nombre desde pbp_atributos
                        let atributoNombre = '';
                        let valorAtributo = '';
                        const attrs = grupo.productoBase.atributos;
                        if (attrs && typeof attrs === 'object' && Array.isArray(attrs.atributos) && attrs.atributos.length > 0) {
                          atributoNombre = attrs.atributos[0].atributo_nombre || '';
                        }
                        // Buscar valor del atributo en la variante
                        valorAtributo = variante[atributoNombre] || variante.sabor || '';
                        return (
                          <tr key={vIdx} style={{ borderBottom: '1px solid #ccc' }}>
                            <td style={{ padding: 6 }}>{grupo.nombre}</td>
                            <td style={{ padding: 6 }}>{atributoNombre}: {valorAtributo}</td>
                            <td style={{ padding: 6, textAlign: 'center' }}>{variante.cantidad || 0}</td>
                          </tr>
                        );
                      })
                    : grupo.tipo === 'borrador' && grupo.productoBase && (
                        <tr style={{ borderBottom: '1px solid #ccc' }}>
                          <td style={{ padding: 6 }}>{grupo.nombre}</td>
                          <td style={{ padding: 6 }}>
                            {(() => {
                              const attrs = grupo.productoBase.atributos;
                              if (!attrs) return '—';
                              if (typeof attrs === 'object' && attrs.atributos && Array.isArray(attrs.atributos)) {
                                return attrs.atributos
                                  .filter(attr => attr.atributo_nombre && attr.valor_nombre)
                                  .map(attr => `${attr.atributo_nombre}: ${attr.valor_nombre}`)
                                  .join(', ');
                              }
                              if (Array.isArray(attrs)) {
                                return attrs
                                  .filter(attr => attr.atributo_nombre && attr.valor_nombre)
                                  .map(attr => `${attr.atributo_nombre}: ${attr.valor_nombre}`)
                                  .join(', ');
                              }
                              if (typeof attrs === 'object') {
                                return Object.entries(attrs)
                                  .filter(([key]) => key !== 'cantidad' && key !== 'precio')
                                  .map(([key, value]) => `${key}: ${value}`)
                                  .join(', ');
                              }
                              if (typeof attrs === 'string') return attrs;
                              return '—';
                            })()}
                          </td>
                          <td style={{ padding: 6, textAlign: 'center' }}>{grupo.productoBase.cantidad || 0}</td>
                        </tr>
                      )}
                  {/* Variantes de productos registrados y borrador */}
                  {grupo.variantes.map((variante, vIdx) => (
                    <tr key={vIdx} style={{ borderBottom: '1px solid #ccc' }}>
                      <td style={{ padding: 6 }}>{grupo.nombre}</td>
                      <td style={{ padding: 6 }}>{formatearAtributos(variante.atributos)}</td>
                      <td style={{ padding: 6, textAlign: 'center' }}>{variante.cantidad}</td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
          {!exportando && (
            <div style={{ marginTop: 24, textAlign: 'right', fontWeight: 'bold', fontSize: 16 }}>
              Total: ${Number(pedido.total || 0).toFixed(2)}
            </div>
          )}
          {!exportando && (
            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <button
                className="bg-black text-white rounded px-4 py-2 text-sm font-semibold shadow-lg"
                onClick={handleExportNotaPDF}
              >
                Exportar como PDF
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotaPedido;
