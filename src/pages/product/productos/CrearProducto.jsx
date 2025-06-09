import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { crearProducto, obtenerImagenesTemporales, guardarImagenTemporal, moverImagenTemporal, eliminarImagenTemporal, cancelarProcesoAltaProducto } from '../../../api/productosApi';
import { getCategorias } from '../../../api/categoriasApi';
import GaleriaImagenesProducto from '../../../components/molecules/GaleriaImagenesProducto';
import FormularioDatosProducto from '../../../components/molecules/FormularioDatosProducto';
import FormularioAtributos from '../../../components/molecules/FormularioAtributos';
import { productoSchema } from '../../../validations/producto.schema';
import config from '../../../config/config';

const tienePermiso = (permisoDescripcion) => {
  const userData = JSON.parse(sessionStorage.getItem('userData'));
  if (!userData || !userData.modulos) return false;
  return userData.modulos.some(
    (m) => m.permisos && m.permisos.some((p) => p.permiso_descripcion === permisoDescripcion)
  );
};

const CrearProducto = () => {
  const [nombre, setNombre] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [imagenes, setImagenes] = useState([]);
  const [precioVenta, setPrecioVenta] = useState('');
  const [precioCosto, setPrecioCosto] = useState('');
  const [precioOferta, setPrecioOferta] = useState('');
  const [stockGeneral, setStockGeneral] = useState('');
  const [skuGeneral, setSkuGeneral] = useState('');
  const [usarAtributos, setUsarAtributos] = useState(false);
  const [atributosConfigurados, setAtributosConfigurados] = useState({ atributos: [], precioBase: '', precioCostoBase: '', stockBase: '' });
  const [categorias, setCategorias] = useState([]);
  const [formulariosVariantes, setFormulariosVariantes] = useState([{}]);
  const [errores, setErrores] = useState({});
  const navigate = useNavigate();

  const userData = JSON.parse(sessionStorage.getItem('userData'));
  const usuario_id = userData?.usuario_id;

  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const categoriasData = await getCategorias(token);

        const procesarCategorias = (categorias, padreId = null, nivel = 0) => {
          return categorias
            .filter((categoria) => categoria.categoria_padre_id === padreId)
            .reduce((acumulador, categoria) => {
              acumulador.push({
                categoria_id: categoria.categoria_id,
                nombreJerarquico: `${'>'.repeat(nivel)} ${categoria.categoria_nombre}`,
              });
              acumulador.push(...procesarCategorias(categorias, categoria.categoria_id, nivel + 1));
              return acumulador;
            }, []);
        };

        const categoriasPlanas = procesarCategorias(categoriasData);
        setCategorias(categoriasPlanas);
      } catch (error) {
        console.error('Error al cargar categorías:', error);
      }
    };

    const cargarImagenesTemporales = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const imagenesTemporales = await obtenerImagenesTemporales(usuario_id, token);

        const imagenesProcesadas = imagenesTemporales.map((img) => ({
          id: img.imagen_id,
          url: img.imagen_url,
        }));

        setImagenes(imagenesProcesadas);
      } catch (error) {
        console.error('Error al cargar imágenes temporales:', error);
      }
    };

    cargarCategorias();
    cargarImagenesTemporales();
  }, [usuario_id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const productoData = {
      usuario_id,
      producto_nombre: nombre,
      categoria_id: categoriaId,
      producto_descripcion: descripcion || null,
      producto_precio_venta: precioVenta ? parseFloat(precioVenta) : null,
      producto_precio_costo: precioCosto ? parseFloat(precioCosto) : null,
      producto_precio_oferta: precioOferta ? parseFloat(precioOferta) : null,
      producto_stock: usarAtributos ? null : stockGeneral ? parseInt(stockGeneral, 10) : null,
      producto_sku: skuGeneral || null,
      imagenes: imagenes.map((imagen, index) => ({ id: imagen.id, orden: index })),
      atributos: usarAtributos ? atributosConfigurados.atributos : [],
      variantes: usarAtributos
        ? formulariosVariantes.map((variante) => ({
            precio_venta: variante.precioVenta ? parseFloat(variante.precioVenta) : null,
            precio_costo: variante.precioCosto ? parseFloat(variante.precioCosto) : null,
            precio_oferta: variante.precioOferta ? parseFloat(variante.precioOferta) : null,
            stock: variante.stock ? parseInt(variante.stock, 10) : null,
            sku: variante.sku || null,
            imagen_url: variante.imagen_url || null,
            valores: atributosConfigurados.atributos.map((attr) => variante[attr.atributo_nombre] || null),
          }))
        : [],
    };

    try {
      productoSchema.parse(productoData);

      const token = sessionStorage.getItem('token');
      await crearProducto(productoData, token);

      alert('Producto creado exitosamente.');
      navigate('/productos');
    } catch (error) {
      if (error instanceof z.ZodError) {
        const erroresMapeados = error.errors.reduce((acc, err) => {
          acc[err.path[0]] = err.message;
          return acc;
        }, {});
        setErrores(erroresMapeados);
      } else {
        console.error('Error al crear producto:', error);
        alert('Error al crear producto.');
      }
    }
  };

  const handleCancelarProceso = async () => {
    const token = sessionStorage.getItem('token');

    try {
      await cancelarProcesoAltaProducto({ usuario_id }, token);
      alert('Proceso de alta cancelado correctamente.');
      navigate('/productos');
    } catch (error) {
      console.error('Error al cancelar el proceso de alta:', error);
      alert('Error al cancelar el proceso de alta.');
    }
  };

  return (
    <div className="container mx-auto mt-8">
      <h2 className="text-2xl font-semibold mb-4">Crear Nuevo Producto</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormularioDatosProducto
          nombre={nombre}
          setNombre={setNombre}
          categoriaId={categoriaId}
          setCategoriaId={setCategoriaId}
          descripcion={descripcion}
          setDescripcion={setDescripcion}
          precioVenta={precioVenta}
          setPrecioVenta={setPrecioVenta}
          precioCosto={precioCosto}
          setPrecioCosto={setPrecioCosto}
          precioOferta={precioOferta}
          setPrecioOferta={setPrecioOferta}
          stockGeneral={stockGeneral}
          setStockGeneral={setStockGeneral}
          skuGeneral={skuGeneral}
          setSkuGeneral={setSkuGeneral}
          categorias={categorias}
          errores={errores}
        />
        <GaleriaImagenesProducto
          imagenes={imagenes}
          onMoverImagen={() => {}}
          onEliminarImagen={() => {}}
          onImagenChange={() => {}}
        />
        <FormularioAtributos
          usarAtributos={usarAtributos}
          setUsarAtributos={setUsarAtributos}
          atributosConfigurados={atributosConfigurados}
          setAtributosConfigurados={setAtributosConfigurados}
          formulariosVariantes={formulariosVariantes}
          setFormulariosVariantes={setFormulariosVariantes}
          handleFormularioChange={() => {}}
          handleAgregarFormulario={() => {}}
          handleEliminarVariante={() => {}}
          imagenes={imagenes}
          errores={errores}
        />
        <div className="flex space-x-4">
          <button
            type="submit"
            className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md text-sm hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Agregar Producto
          </button>
          <button
            type="button"
            onClick={handleCancelarProceso}
            className="px-4 py-2 border border-red-600 text-red-600 rounded-md text-sm hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default CrearProducto;