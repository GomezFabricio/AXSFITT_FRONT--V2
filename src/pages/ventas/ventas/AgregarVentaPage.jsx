import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { crearVenta, verificarStock, obtenerVariantesProducto } from '../../../api/ventasApi';
import config from '../../../config/config';

// Importar componentes
import SelectorProductos from '../../../components/molecules/ventas/SelectorProductos';
import DetalleProductos from '../../../components/molecules/ventas/DetalleProductos';
import DatosCliente from '../../../components/molecules/ventas/DatosCliente';
import DatosVenta from '../../../components/molecules/ventas/DatosVenta';
import InformacionEnvio from '../../../components/molecules/ventas/InformacionEnvio';
import ModalMensaje from '../../../components/organisms/Modals/ModalMensaje';

const AgregarVentaPage = () => {
  const navigate = useNavigate();

  // Estados para la venta
  const [productos, setProductos] = useState([]);
  const [datosCliente, setDatosCliente] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    dni: ''
  });
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [estadoPago, setEstadoPago] = useState('pendiente');
  const [origenVenta, setOrigenVenta] = useState('Venta Manual');
  const [notaVenta, setNotaVenta] = useState('');
  const [descuento, setDescuento] = useState(0);

  // Estados para el envío
  const [mostrarEnvio, setMostrarEnvio] = useState(false);
  const [datosEnvio, setDatosEnvio] = useState({
    calle: '',
    numero: '',
    cp: '',
    piso: '',
    depto: '',
    ciudad: '',
    provincia: ''
  });

  // Estados para UI
  const [modalMensajeOpen, setModalMensajeOpen] = useState(false);
  const [mensajeModal, setMensajeModal] = useState({ tipo: 'success', mensaje: '' });
  const [loading, setLoading] = useState(false);
  const [errores, setErrores] = useState({});

  // Calcular subtotal
  const subtotal = productos.reduce((sum, prod) => sum + (prod.precio * prod.cantidad), 0);

  // Manejo de productos
  const handleAgregarProductos = async (productosSeleccionados) => {
    const nuevosProductos = [...productos];

    for (const prod of productosSeleccionados) {
      if (!nuevosProductos.some(p => p.producto_id === prod.producto_id)) {
        try {
          const token = sessionStorage.getItem('token');
          const variantes = await obtenerVariantesProducto(prod.producto_id, token);

          nuevosProductos.push({
            uniqueId: uuidv4(),
            producto_id: prod.producto_id,
            nombre: prod.producto_nombre,
            precio: prod.producto_precio_oferta || prod.producto_precio_venta,
            cantidad: 1,
            imagen_url: prod.imagen_url ? `${config.backendUrl}${prod.imagen_url}` : null,
            stock: prod.stock,
            variantes: variantes,
            variante_id: null
          });
        } catch (error) {
          console.error('Error al obtener variantes:', error);
        }
      }
    }

    setProductos(nuevosProductos);
  };

  const handleEliminarProducto = (uniqueId) => {
    setProductos(prev => prev.filter(p => p.uniqueId !== uniqueId));
  };

  const handleCantidadChange = (uniqueId, cantidad) => {
    if (cantidad < 1) return;

    setProductos(prev => prev.map(prod => {
      if (prod.uniqueId === uniqueId) {
        const stockDisponible = prod.variante_id
          ? (prod.variantes.find(v => v.variante_id === prod.variante_id)?.stock || 0)
          : prod.stock;

        return { ...prod, cantidad: Math.min(cantidad, stockDisponible) };
      }
      return prod;
    }));
  };

  const handleVarianteChange = (uniqueId, varianteId) => {
    setProductos(prev => prev.map(prod => {
      if (prod.uniqueId === uniqueId) {
        const varianteSeleccionada = prod.variantes.find(v => v.variante_id === parseInt(varianteId));
        return {
          ...prod,
          variante_id: parseInt(varianteId),
          precio: varianteSeleccionada?.variante_precio_oferta || varianteSeleccionada?.variante_precio_venta || prod.precio,
          cantidad: 1
        };
      }
      return prod;
    }));
  };

  // Manejo del cliente
  const handleClienteChange = (campo, valor) => {
    setDatosCliente(prev => ({ ...prev, [campo]: valor }));

    if (errores[campo]) {
      setErrores(prev => ({ ...prev, [campo]: null }));
    }
  };

  // Manejo del envío
  const handleEnvioChange = (campo, valor) => {
    setDatosEnvio(prev => ({ ...prev, [campo]: valor }));

    if (errores[`envio_${campo}`]) {
      setErrores(prev => ({ ...prev, [`envio_${campo}`]: null }));
    }
  };

  // Validación del formulario
  const validarFormulario = () => {
    const nuevosErrores = {};

    // Validar productos
    if (productos.length === 0) {
      nuevosErrores.productos = 'Debe agregar al menos un producto';
    } else {
      const sinVarianteSeleccionada = productos.find(p => p.variantes?.length > 0 && !p.variante_id);
      if (sinVarianteSeleccionada) {
        nuevosErrores.productos = 'Todos los productos con variantes deben tener una variante seleccionada';
      }
    }

    // Validar cliente
    if (!datosCliente.nombre) nuevosErrores.nombre = 'El nombre es obligatorio';
    if (!datosCliente.apellido) nuevosErrores.apellido = 'El apellido es obligatorio';
    if (!datosCliente.email) nuevosErrores.email = 'El email es obligatorio';
    if (!datosCliente.telefono) nuevosErrores.telefono = 'El teléfono es obligatorio';
    if (!datosCliente.dni) nuevosErrores.dni = 'El DNI es obligatorio';

    // Validar envío si está visible
    if (mostrarEnvio) {
      if (!datosEnvio.calle) nuevosErrores.envio_calle = 'La calle es obligatoria';
      if (!datosEnvio.numero) nuevosErrores.envio_numero = 'El número es obligatorio';
      if (!datosEnvio.cp) nuevosErrores.envio_cp = 'El código postal es obligatorio';
      if (!datosEnvio.ciudad) nuevosErrores.envio_ciudad = 'La ciudad es obligatoria';
      if (!datosEnvio.provincia) nuevosErrores.envio_provincia = 'La provincia es obligatoria';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  // Enviar formulario
  const handleSubmit = async () => {
    if (!validarFormulario()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      setLoading(true);

      // Verificar stock
      const token = sessionStorage.getItem('token');
      const productosVerificar = productos.map(p => ({
        producto_id: p.producto_id,
        variante_id: p.variante_id,
        cantidad: p.cantidad
      }));

      const verificacion = await verificarStock(productosVerificar, token);

      if (!verificacion.todosDisponibles) {
        setMensajeModal({
          tipo: 'error',
          mensaje: 'No hay suficiente stock para completar la venta'
        });
        setModalMensajeOpen(true);
        return;
      }

      // Calcular monto descuento
      const montoDescuento = subtotal * (descuento / 100);
      const total = subtotal - montoDescuento;

      // Preparar datos para la API
      const datosVenta = {
        venta: {
          cliente_id: clienteSeleccionado?.cliente_id || null,
          venta_estado_pago: estadoPago,
          venta_estado_envio: 'pendiente',
          venta_monto_total: total,
          venta_monto_descuento: montoDescuento,
          venta_origen: origenVenta,
          venta_nota: notaVenta || null
        },
        productos: productos.map(p => ({
          producto_id: p.producto_id,
          variante_id: p.variante_id,
          cantidad: p.cantidad,
          precio_unitario: p.precio
        })),
        cliente_invitado: !clienteSeleccionado ? {
          nombre: datosCliente.nombre,
          apellido: datosCliente.apellido,
          email: datosCliente.email,
          telefono: datosCliente.telefono,
          dni: datosCliente.dni
        } : null,
        envio: mostrarEnvio ? datosEnvio : null
      };

      await crearVenta(datosVenta, token);

      setMensajeModal({
        tipo: 'exito',
        mensaje: 'Venta creada exitosamente'
      });
      setModalMensajeOpen(true);

      setTimeout(() => {
        // Reiniciar el formulario
        setProductos([]);
        setDatosCliente({
          nombre: '',
          apellido: '',
          email: '',
          telefono: '',
          dni: ''
        });
        setClienteSeleccionado(null);
        setEstadoPago('pendiente');
        setOrigenVenta('Venta Manual');
        setNotaVenta('');
        setDescuento(0);
        setMostrarEnvio(false);
        setDatosEnvio({
          calle: '',
          numero: '',
          cp: '',
          piso: '',
          depto: '',
          ciudad: '',
          provincia: ''
        });
      }, 2000);

    } catch (error) {
      console.error('Error al crear venta:', error);
      setMensajeModal({
        tipo: 'error',
        mensaje: error.message || 'Error al crear la venta'
      });
      setModalMensajeOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Agregar Venta</h1>

      {/* Selector de Productos */}
      <SelectorProductos onProductosSeleccionados={handleAgregarProductos} />

      {/* Visualización de Productos Seleccionados */}
      <DetalleProductos
        productos={productos}
        onEliminarProducto={handleEliminarProducto}
        onCantidadChange={handleCantidadChange}
        onVarianteChange={handleVarianteChange}
        subtotal={subtotal}
        descuento={descuento}
        onDescuentoChange={setDescuento}
      />

      {/* Errores de productos */}
      {errores.productos && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{errores.productos}</p>
        </div>
      )}

      {/* Datos del Cliente */}
      <DatosCliente
        cliente={datosCliente}
        onClienteChange={handleClienteChange}
        clienteSeleccionado={clienteSeleccionado}
        onClienteSeleccionado={setClienteSeleccionado}
        errores={errores}
      />

      {/* Datos Adicionales de Venta */}
      <DatosVenta
        estadoPago={estadoPago}
        onEstadoPagoChange={setEstadoPago}
        origen={origenVenta}
        onOrigenChange={setOrigenVenta}
        nota={notaVenta}
        onNotaChange={setNotaVenta}
      />

      {/* Información de Envío */}
      <InformacionEnvio
        mostrar={mostrarEnvio}
        onToggleMostrar={() => setMostrarEnvio(!mostrarEnvio)}
        datosEnvio={datosEnvio}
        onEnvioChange={handleEnvioChange}
        errores={errores}
      />

      {/* Botón de Envío */}
      <div className="mt-6">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
        >
          {loading ? 'Procesando...' : 'Agregar venta'}
        </button>
      </div>

      {/* Modal de Mensaje */}
      <ModalMensaje
        isOpen={modalMensajeOpen}
        onClose={() => setModalMensajeOpen(false)}
        mensaje={mensajeModal.mensaje}
        tipo={mensajeModal.tipo}
      />
    </div>
  );
};

export default AgregarVentaPage;