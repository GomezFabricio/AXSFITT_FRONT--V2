import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getVentaPorId } from '../../../api/ventasApi';
import { FaArrowLeft, FaPrint } from 'react-icons/fa';
import config from '../../../config/config';
import { useReactToPrint } from 'react-to-print';

// Estilos de impresión mejorados
const printStyles = `
  @media print {
    @page { 
      size: A4; 
      margin: 0.5cm;
    }
    body * {
      visibility: hidden;
    }
    .print-container, .print-container * {
      visibility: visible;
    }
    .print-container {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: auto;
      page-break-after: avoid;
      page-break-before: avoid;
      box-shadow: none !important;
      border: none !important;
    }
    .no-print { 
      display: none !important; 
    }
    html, body {
      width: 210mm;
      height: auto;
      overflow: hidden;
    }
  }
`;

const FacturaPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [venta, setVenta] = useState(null);
    const [loading, setLoading] = useState(true);
    const facturaRef = useRef(null);

    // Método mejorado para imprimir solo la factura
    const handlePrintBetter = () => {
      // Usar setTimeout para asegurarse que los estilos se apliquen
      setTimeout(() => {
          window.print();
      }, 100);
    };

    // Mantener la versión react-to-print para compatibilidad
    const handlePrint = useReactToPrint({
        content: () => facturaRef.current,
        documentTitle: `Factura_${id}`,
        onBeforeGetContent: () => {
            return new Promise((resolve) => {
                console.log('Preparando documento para impresión...');
                setTimeout(resolve, 100);
            });
        },
        onAfterPrint: () => {
            console.log('Documento impreso exitosamente');
        }
    });

    useEffect(() => {
        const cargarVenta = async () => {
            try {
                const token = sessionStorage.getItem('token');
                const data = await getVentaPorId(id, token);
                setVenta(data);
                setLoading(false);
            } catch (error) {
                console.error('Error al cargar datos de venta:', error);
                alert('No se pudo cargar la información de la venta');
                navigate('/ventas');
            }
        };

        cargarVenta();
    }, [id, navigate]);

    // Resto del código sin cambios...
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        return new Date(dateString).toLocaleDateString('es-AR', options);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const generarNumeroFactura = (ventaId) => {
        const prefix = 'B';
        const puntoVenta = '0001';
        const numero = ventaId.toString().padStart(8, '0');
        return `${prefix} ${puntoVenta}-${numero}`;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-gray-700">Cargando factura...</span>
            </div>
        );
    }

    if (!venta) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    No se encontró la venta solicitada.
                </div>
                <div className="mt-4">
                    <Link to="/ventas" className="text-blue-600 hover:underline flex items-center">
                        <FaArrowLeft className="mr-2" /> Volver al listado de ventas
                    </Link>
                </div>
            </div>
        );
    }

    const tipoDocumento = venta.venta_estado_pago === 'abonado' ? 'FACTURA' : 'PRESUPUESTO';
    const numeroDocumento = generarNumeroFactura(venta.venta_id);

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Estilos de impresión */}
            <style>{printStyles}</style>

            <div className="mb-6 flex justify-between items-center no-print">
                <Link to={`/ventas/${id}`} className="text-blue-600 hover:underline flex items-center">
                    <FaArrowLeft className="mr-2" /> Volver al detalle
                </Link>
                <div className="flex space-x-2">
                    <button
                        onClick={handlePrintBetter}
                        className="flex items-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors shadow-sm"
                    >
                        <FaPrint className="mr-2" /> Imprimir Factura
                    </button>
                </div>
            </div>

            {/* Documento de factura para imprimir */}
            <div id="factura-imprimir" className="bg-white border border-gray-300 shadow-md mx-auto max-w-3xl print-container" ref={facturaRef}>
                
                {/* Encabezado de la factura */}
                <div className="border-b border-gray-300 p-6">
                    <div className="grid grid-cols-3 gap-4">
                        {/* Logo y datos de la empresa */}
                        <div className="col-span-1">
                            <div className="text-2xl font-bold text-purple-800 mb-2">AXSFITT</div>
                            <div className="text-xs">
                                <p className="font-bold">AXSFITT S.R.L.</p>
                                <p>CUIT: 30-71234567-8</p>
                                <p>Av. Corrientes 1234, CABA</p>
                                <p>Tel: (011) 4567-8900</p>
                                <p>info@axsfitt.com</p>
                            </div>
                        </div>

                        {/* Tipo de documento */}
                        <div className="col-span-1 flex flex-col items-center justify-center">
                            <div className="border-2 border-gray-800 px-4 py-2 rounded text-center w-full">
                                <p className="text-xl font-bold">{tipoDocumento}</p>
                                <p className="text-sm">{venta.venta_estado_pago === 'abonado' ? 'ORIGINAL' : 'NO VÁLIDO COMO FACTURA'}</p>
                                <p className="font-bold mt-1">{numeroDocumento}</p>
                            </div>
                        </div>

                        {/* Fecha e información adicional */}
                        <div className="col-span-1 text-xs text-right">
                            <p><span className="font-bold">Fecha de emisión:</span> {formatDate(venta.venta_fecha)}</p>
                            <p><span className="font-bold">CUIT:</span> 30-71234567-8</p>
                            <p><span className="font-bold">Ingresos Brutos:</span> 30-71234567-8</p>
                            <p><span className="font-bold">Inicio de Actividades:</span> 01/01/2020</p>
                            <p className="mt-2 font-bold">IVA RESPONSABLE INSCRIPTO</p>
                        </div>
                    </div>
                </div>

                {/* Datos del cliente */}
                <div className="border-b border-gray-300 p-6">
                    <h3 className="font-bold mb-2 text-sm">DATOS DEL CLIENTE:</h3>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                            <p><span className="font-bold">Razón Social:</span> {venta.cliente ? `${venta.cliente.persona_nombre || venta.cliente.nombre} ${venta.cliente.persona_apellido || venta.cliente.apellido}` : 'Consumidor Final'}</p>
                            <p><span className="font-bold">Domicilio:</span> {venta.envio ? `${venta.envio.calle} ${venta.envio.numero}, ${venta.envio.ciudad}` : 'No especificado'}</p>
                        </div>
                        <div>
                            <p><span className="font-bold">CUIT/DNI:</span> {venta.cliente?.persona_dni || 'No especificado'}</p>
                            <p><span className="font-bold">Cond. frente al IVA:</span> Consumidor Final</p>
                        </div>
                    </div>
                </div>

                {/* Detalle de productos */}
                <div className="p-6">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="border-b-2 border-gray-800">
                                <th className="py-2 text-left">Código</th>
                                <th className="py-2 text-left">Descripción</th>
                                <th className="py-2 text-right">Cantidad</th>
                                <th className="py-2 text-right">Precio Unit.</th>
                                <th className="py-2 text-right">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {venta.productos && venta.productos.map((producto) => (
                                <tr key={producto.vd_id} className="border-b border-gray-200">
                                    <td className="py-2">{producto.variante_sku || `PROD-${producto.producto_id}`}</td>
                                    <td className="py-2">
                                        {producto.producto_nombre}
                                        {producto.variante_descripcion && (
                                            <span className="text-gray-600"> ({producto.variante_descripcion})</span>
                                        )}
                                    </td>
                                    <td className="py-2 text-right">{producto.vd_cantidad}</td>
                                    <td className="py-2 text-right">{formatCurrency(producto.vd_precio_unitario)}</td>
                                    <td className="py-2 text-right">{formatCurrency(producto.vd_subtotal)}</td>
                                </tr>
                            ))}

                            {/* Filas vacías para llenar espacio */}
                            {venta.productos && venta.productos.length < 10 &&
                                Array(10 - venta.productos.length).fill().map((_, i) => (
                                    <tr key={`empty-${i}`} className="border-b border-gray-200">
                                        <td className="py-2">&nbsp;</td>
                                        <td className="py-2">&nbsp;</td>
                                        <td className="py-2">&nbsp;</td>
                                        <td className="py-2">&nbsp;</td>
                                        <td className="py-2">&nbsp;</td>
                                    </tr>
                                ))
                            }
                        </tbody>
                        <tfoot>
                            {venta.venta_monto_descuento > 0 && (
                                <tr>
                                    <td colSpan="3"></td>
                                    <td className="py-2 text-right font-bold">Descuento:</td>
                                    <td className="py-2 text-right">-{formatCurrency(venta.venta_monto_descuento)}</td>
                                </tr>
                            )}
                            <tr className="border-t-2 border-gray-800">
                                <td colSpan="3"></td>
                                <td className="py-2 text-right font-bold">TOTAL:</td>
                                <td className="py-2 text-right font-bold">{formatCurrency(venta.venta_monto_total)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Información adicional y condiciones */}
                <div className="p-6 border-t border-gray-300 text-xs">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="font-bold mb-1">Condiciones de pago:</p>
                            <p>Estado: {venta.venta_estado_pago === 'abonado' ? 'PAGADO' : 'PENDIENTE'}</p>
                            {venta.venta_nota && (
                                <>
                                    <p className="font-bold mt-2 mb-1">Observaciones:</p>
                                    <p>{venta.venta_nota}</p>
                                </>
                            )}
                        </div>
                        <div className="text-right">
                            <p>CAE N°: {venta.venta_estado_pago === 'abonado' ? '71234567890123' : 'NO APLICABLE'}</p>
                            {venta.venta_estado_pago === 'abonado' && (
                                <p>Fecha Vto. CAE: {formatDate(new Date(new Date(venta.venta_fecha).getTime() + 10 * 24 * 60 * 60 * 1000))}</p>
                            )}
                            <div className="mt-6">
                                {venta.venta_estado_pago === 'abonado' && (
                                    <img
                                        src="https://upload.wikimedia.org/wikipedia/commons/d/d1/QR_Code_Generator.svg"
                                        alt="Código QR AFIP"
                                        className="h-20 inline-block"
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pie de página */}
                <div className="p-4 bg-gray-100 text-center text-xs">
                    <p>Documento generado por sistema - {venta.venta_estado_pago === 'abonado' ? 'ORIGINAL' : 'NO VÁLIDO COMO FACTURA'}</p>
                </div>
            </div>
        </div>
    );
};

export default FacturaPage;