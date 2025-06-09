import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { obtenerProductoPorId, actualizarProducto } from '../../../api/productosApi';
import { getCategorias } from '../../../api/categoriasApi';
import GaleriaImagenesProducto from '../../../components/molecules/GaleriaImagenesProducto';
import ModalConfigurarAtributos from '../../../components/organisms/Modals/ModalConfigurarAtributos';
import config from '../../../config/config';

const ModificarProducto = () => {
  const { producto_id } = useParams();
  const navigate = useNavigate();

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
  const [atributosConfigurados, setAtributosConfigurados] = useState({ atributos: [] });
  const [formulariosVariantes, setFormulariosVariantes] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [errores, setErrores] = useState({});
  const [mostrarFormularioAtributos, setMostrarFormularioAtributos] = useState(false);
  const [modalAtributosOpen, setModalAtributosOpen] = useState(false);

  useEffect(() => {
    const cargarProducto = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const datosProducto = await obtenerProductoPorId(producto_id, token);

        // Cargar datos del producto
        setNombre(datosProducto.producto.nombre);
        setCategoriaId(datosProducto.producto.categoria_id);
        setDescripcion(datosProducto.producto.producto_descripcion || '');
        setImagenes([
          {
            id: datosProducto.producto.imagen_id,
            url: `${config.backendUrl}${datosProducto.producto.imagen_url}`,
          },
        ]);
        setPrecioVenta(datosProducto.producto.producto_precio_venta || '');
        setPrecioCosto(datosProducto.producto.producto_precio_costo || '');
        setPrecioOferta(datosProducto.producto.producto_precio_oferta || '');
        setStockGeneral(datosProducto.producto.stock_total || '');
        setSkuGeneral(datosProducto.producto.producto_sku || '');

        // Cargar variantes
        if (datosProducto.variantes.length > 0) {
          setUsarAtributos(true);
          setFormulariosVariantes(
            datosProducto.variantes.map((variante) => ({
              precioVenta: variante.variante_precio_venta || '',
              precioCosto: variante.variante_precio_costo || '',
              precioOferta: variante.variante_precio_oferta || '',
              stock: variante.stock_total || '',
              sku: variante.variante_sku || '',
              imagen_url: variante.imagen_url ? `${config.backendUrl}${variante.imagen_url}` : '',
              atributos: variante.atributos || '',
            }))
          );
        }
      } catch (error) {
        console.error('Error al cargar producto:', error);
        alert('Error al cargar el producto.');
      }
    };

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

    cargarProducto();
    cargarCategorias();
  }, [producto_id]);

  const handleFormularioChange = (index, field, value) => {
    const newFormularios = [...formulariosVariantes];
    newFormularios[index][field] = value;
    setFormulariosVariantes(newFormularios);
  };

  const handleAgregarFormulario = () => {
    setFormulariosVariantes([...formulariosVariantes, {}]);
  };

  const handleEliminarVariante = (index) => {
    const newFormularios = [...formulariosVariantes];
    newFormularios.splice(index, 1);
    setFormulariosVariantes(newFormularios);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const productoData = {
      producto_nombre: nombre,
      categoria_id: categoriaId,
      producto_descripcion: descripcion || null,
      producto_precio_venta: precioVenta ? parseFloat(precioVenta) : null,
      producto_precio_costo: precioCosto ? parseFloat(precioCosto) : null,
      producto_precio_oferta: precioOferta ? parseFloat(precioOferta) : null,
      producto_stock: usarAtributos ? null : stockGeneral ? parseInt(stockGeneral, 10) : null,
      producto_sku: skuGeneral || null,
      imagenes: imagenes.map((imagen, index) => ({
        id: imagen.id,
        orden: index,
      })),
      variantes: usarAtributos
        ? formulariosVariantes.map((variante) => ({
            precio_venta: variante.precioVenta ? parseFloat(variante.precioVenta) : null,
            precio_costo: variante.precioCosto ? parseFloat(variante.precioCosto) : null,
            precio_oferta: variante.precioOferta ? parseFloat(variante.precioOferta) : null,
            stock: variante.stock ? parseInt(variante.stock, 10) : null,
            sku: variante.sku || null,
            imagen_url: variante.imagen_url || null,
            atributos: variante.atributos || '',
          }))
        : [],
    };

    try {
      const token = sessionStorage.getItem('token');
      await actualizarProducto(producto_id, productoData, token);
      alert('Producto actualizado exitosamente.');
      navigate('/productos');
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      alert('Error al actualizar producto.');
    }
  };

  return (
    <div className="container mx-auto mt-8">
      <h2 className="text-2xl font-semibold mb-4">Modificar Producto</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Información del producto */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Nombre del Producto:</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Categoría:</label>
          <select
            value={categoriaId}
            onChange={(e) => setCategoriaId(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          >
            <option value="">Seleccionar Categoría</option>
            {categorias.map((categoria) => (
              <option key={categoria.categoria_id} value={categoria.categoria_id}>
                {categoria.nombreJerarquico}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Descripción:</label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            rows="4"
          />
        </div>

        {/* Subida de imágenes */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Imágenes:</label>
          <GaleriaImagenesProducto
            imagenes={imagenes}
            onMoverImagen={() => {}}
            onEliminarImagen={() => {}}
            onImagenChange={() => {}}
          />
        </div>

        {/* Variantes */}
        {usarAtributos && (
          <div>
            <h3 className="text-lg font-medium text-gray-900">Variantes:</h3>
            {formulariosVariantes.map((formulario, index) => (
              <div key={index} className="mt-4 border p-4 rounded">
                <h4 className="text-md font-semibold">Variante {index + 1}</h4>
                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700">Precio Venta:</label>
                  <input
                    type="number"
                    value={formulario.precioVenta || ''}
                    onChange={(e) => handleFormularioChange(index, 'precioVenta', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700">Stock:</label>
                  <input
                    type="number"
                    value={formulario.stock || ''}
                    onChange={(e) => handleFormularioChange(index, 'stock', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700">SKU:</label>
                  <input
                    type="text"
                    value={formulario.sku || ''}
                    onChange={(e) => handleFormularioChange(index, 'sku', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700">Atributos:</label>
                  <p>{formulario.atributos}</p>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAgregarFormulario}
              className="px-4 py-2 border border-green-500 text-green-500 rounded-md text-sm hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-300 mt-2"
            >
              Agregar Variante
            </button>
          </div>
        )}

        <div className="flex space-x-4">
          <button
            type="submit"
            className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md text-sm hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Guardar Cambios
          </button>
          <button
            type="button"
            onClick={() => navigate('/productos')}
            className="px-4 py-2 border border-red-600 text-red-600 rounded-md text-sm hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default ModificarProducto;