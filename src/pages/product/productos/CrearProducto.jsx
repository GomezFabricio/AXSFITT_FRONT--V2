import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { crearProducto, obtenerImagenesTemporales, guardarImagenTemporal, moverImagenTemporal } from '../../../api/productosApi';
import { getCategorias } from '../../../api/categoriasApi';
import ModalConfigurarAtributos from '../../../components/organisms/Modals/ModalConfigurarAtributos';
import GaleriaImagenesProducto from '../../../components/molecules/GaleriaImagenesProducto';
import config from '../../../config/config';

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
  const [variantes, setVariantes] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [modalAtributosOpen, setModalAtributosOpen] = useState(false);
  const [mostrarFormularioAtributos, setMostrarFormularioAtributos] = useState(false);
  const [formulariosVariantes, setFormulariosVariantes] = useState([{}]); // Inicializamos con un formulario vacío
  const navigate = useNavigate();

  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const categoriasData = await getCategorias(token);
        console.log('Categorías obtenidas:', categoriasData); // Verifica la respuesta
        setCategorias(categoriasData);
      } catch (error) {
        console.error('Error al cargar categorías:', error);
      }
    };

    const cargarImagenesTemporales = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const usuario_id = 1; // Reemplazar con el ID del usuario actual
        const imagenesTemporales = await obtenerImagenesTemporales(usuario_id, token);

        console.log('Imágenes cargadas desde el backend:', imagenesTemporales);

        const imagenesProcesadas = imagenesTemporales.map(img => ({
          id: img.imagen_id,
          url: `${config.backendUrl}${img.imagen_url}`,
        }));

        setImagenes(imagenesProcesadas);

        console.log('Estado actualizado con imágenes:', imagenesProcesadas);
      } catch (error) {
        console.error('Error al cargar imágenes temporales:', error);
      }
    };

    cargarCategorias();
    cargarImagenesTemporales();
  }, []);

  const handleMoverImagen = async (fromIndex, toIndex) => {
    const token = sessionStorage.getItem('token'); // Obtener el token del usuario
    const usuario_id = 1; // Reemplazar con el ID del usuario actual

    try {
      // Actualizar el orden en el backend
      await moverImagenTemporal(
        {
          usuario_id,
          imagen_id: imagenes[fromIndex].id,
          nuevo_orden: toIndex,
        },
        token
      );

      // Recargar las imágenes desde el backend
      const imagenesTemporales = await obtenerImagenesTemporales(usuario_id, token);
      setImagenes(imagenesTemporales.map(img => ({ id: img.imagen_id, url: `${config.backendUrl}${img.imagen_url}` })));
    } catch (error) {
      console.error('Error al mover imagen:', error);
      alert('Error al mover la imagen.');
    }
  };

  const handleImagenChange = async (e) => {
    const files = Array.from(e.target.files);
    if (imagenes.length + files.length > 6) {
      alert('Solo se permiten hasta 6 imágenes.');
      return;
    }

    const token = sessionStorage.getItem('token'); // Obtener el token del usuario
    const usuario_id = 1; // Reemplazar con el ID del usuario actual
    const newImages = [...imagenes];

    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('usuario_id', usuario_id);
      formData.append('imagen_orden', newImages.length);

      try {
        // Subir la imagen al servidor y guardar en la tabla temporal
        const response = await guardarImagenTemporal(formData, token);

        // Agregar la imagen al estado local
        newImages.push({ id: response.imagen_id, url: `${config.backendUrl}${response.imagen_url}` });
      } catch (error) {
        console.error('Error al guardar imagen temporal:', error);
        alert('Error al subir la imagen.');
      }
    }

    setImagenes(newImages);
  };

  const handleEliminarImagen = (index) => {
    const newImages = [...imagenes];
    newImages.splice(index, 1);
    setImagenes(newImages);
  };

  const handleAtributosSave = (data) => {
    setAtributosConfigurados(data);
    setMostrarFormularioAtributos(true);
    setFormulariosVariantes([{}]); // Reiniciamos los formularios al guardar nuevos atributos
  };

  const handleFormularioChange = (index, field, value) => {
    const newFormularios = [...formulariosVariantes];
    newFormularios[index][field] = value;
    setFormulariosVariantes(newFormularios);
  };

  const handleAgregarFormulario = () => {
    setFormulariosVariantes([...formulariosVariantes, {}]);
  };

  const handleAgregarVariante = () => {
    setVariantes([
      ...variantes,
      { precioVenta: '', precioCosto: '', precioOferta: '', stock: '', sku: '', imagenUrl: '', valores: [] },
    ]);
  };

  const handleEliminarVariante = (index) => {
    const newVariantes = [...variantes];
    newVariantes.splice(index, 1);
    setVariantes(newVariantes);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = sessionStorage.getItem('token');
    const productoData = {
      usuario_id: 1,
      producto_nombre: nombre,
      categoria_id: categoriaId,
      producto_descripcion: descripcion,
      producto_precio_venta: precioVenta,
      producto_precio_costo: precioCosto,
      producto_precio_oferta: precioOferta,
      producto_stock: usarAtributos ? null : stockGeneral, // Solo enviar stock general si no se usan atributos
      producto_sku: skuGeneral,
      imagenes: imagenes.map((imagen, index) => ({
        id: imagen.id,
        orden: index,
      })),
      atributos: usarAtributos ? atributosConfigurados.atributos : [],
      variantes: usarAtributos
        ? variantes.map(variante => ({
          precio_venta: variante.precioVenta,
          precio_costo: variante.precioCosto,
          precio_oferta: variante.precioOferta,
          stock: variante.stock,
          sku: variante.sku,
          imagen_id: variante.imagenId,
          valores: variante.valores,
        }))
        : [],
    };

    try {
      await crearProducto(productoData, token);
      alert('Producto creado exitosamente.');
      navigate('/productos');
    } catch (error) {
      console.error('Error al crear producto:', error);
      alert('Error al crear producto.');
    }
  };

  return (
    <div className="container mx-auto mt-8">
      <h2 className="text-2xl font-semibold mb-4">Crear Nuevo Producto</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Información del producto */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Nombre del Producto:</label>
          <input
            type="text"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Categoría:</label>
          <select
            value={categoriaId}
            onChange={e => setCategoriaId(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          >
            <option value="">Seleccionar Categoría</option>
            {categorias.map(categoria => (
              <option key={categoria.categoria_id} value={categoria.categoria_id}>
                {categoria.categoria_nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Descripción:</label>
          <textarea
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            rows="4"
          />
        </div>

        {/* Subida de imágenes */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Imágenes (máx. 6):</label>
          <GaleriaImagenesProducto
            imagenes={imagenes}
            onMoverImagen={handleMoverImagen}
            onEliminarImagen={handleEliminarImagen}
            onImagenChange={handleImagenChange}
          />
        </div>

        {!usarAtributos && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">Precio de Costo:</label>
              <input
                type="number"
                value={precioCosto}
                onChange={e => setPrecioCosto(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>


            <div>
              <label className="block text-sm font-medium text-gray-700">Precio de Venta:</label>
              <input
                type="number"
                value={precioVenta}
                onChange={e => setPrecioVenta(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>



            <div>
              <label className="block text-sm font-medium text-gray-700">Precio de Oferta (Opcional):</label>
              <input
                type="number"
                value={precioOferta}
                onChange={e => setPrecioOferta(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>


            <div>
              <label className="block text-sm font-medium text-gray-700">Stock General:</label>
              <input
                type="number"
                value={stockGeneral}
                onChange={e => setStockGeneral(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>


            <div>
              <label className="block text-sm font-medium text-gray-700">SKU General:</label>
              <input
                type="text"
                value={skuGeneral}
                onChange={e => setSkuGeneral(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </>
        )}


        {/* Activar atributos */}
        <div>
          <label className="block text-sm font-medium text-gray-700">¿Usar Atributos?</label>
          <select
            value={usarAtributos}
            onChange={e => setUsarAtributos(e.target.value === 'true')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="false">No</option>
            <option value="true">Sí</option>
          </select>
        </div>

        {/* Modal de configuración de atributos */}
        {usarAtributos && (
          <ModalConfigurarAtributos
            isOpen={modalAtributosOpen}
            onClose={() => setModalAtributosOpen(false)}
            onSave={handleAtributosSave}
            initialAtributos={atributosConfigurados.atributos}
          />
        )}

        {usarAtributos && (
          <button
            type="button"
            onClick={() => setModalAtributosOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Configurar Atributos
          </button>
        )}

        {usarAtributos && mostrarFormularioAtributos && (
          <div>
            <h3 className="text-lg font-medium text-gray-900">Valores de Atributos:</h3>
            {formulariosVariantes.map((formulario, index) => (
              <div key={index} className="mt-4 border p-4 rounded">
                <h4 className="text-md font-semibold">Variante {index + 1}</h4>
                {atributosConfigurados.atributos.map(atributo => (
                  <div key={atributo.atributo_nombre} className="mb-2">
                    <label className="block text-sm font-medium text-gray-700">{atributo.atributo_nombre}:</label>
                    <input
                      type="text"
                      value={formulario[atributo.atributo_nombre] || ''}
                      onChange={e => handleFormularioChange(index, atributo.atributo_nombre, e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                ))}

                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700">Precio Costo:</label>
                  <input
                    type="number"
                    value={formulario.precioCosto || ''}
                    onChange={e => handleFormularioChange(index, 'precioCosto', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700">Precio Venta:</label>
                  <input
                    type="number"
                    value={formulario.precioVenta || ''}
                    onChange={e => handleFormularioChange(index, 'precioVenta', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700">Precio Oferta:</label>
                  <input
                    type="number"
                    value={formulario.precioOferta || ''}
                    onChange={e => handleFormularioChange(index, 'precioOferta', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700">Stock:</label>
                  <input
                    type="number"
                    value={formulario.stock || ''}
                    onChange={e => handleFormularioChange(index, 'stock', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700">SKU:</label>
                  <input
                    type="text"
                    value={formulario.sku || ''}
                    onChange={e => handleFormularioChange(index, 'sku', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700">Imagen:</label>
                  <select
                    value={formulario.imagenId || ''}
                    onChange={e => handleFormularioChange(index, 'imagenId', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="">Seleccionar Imagen</option>
                    {imagenes.map((imagen) => (
                      <option key={imagen.id} value={imagen.id}>
                        Imagen {imagen.id}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAgregarFormulario}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300 mt-4"
            >
              Agregar Variante
            </button>
          </div>
        )}

        <div>
          <button
            type="submit"
            className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Agregar Producto
          </button>
        </div>
      </form>
    </div>
  );
};

export default CrearProducto;