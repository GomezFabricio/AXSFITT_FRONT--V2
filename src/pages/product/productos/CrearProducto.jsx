import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { crearProducto } from '../../../api/productosApi';
import { getCategorias } from '../../../api/categoriasApi';
import ModalConfigurarAtributos from '../../../components/organisms/Modals/ModalConfigurarAtributos';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

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
  const [formulariosVariantes, setFormulariosVariantes] = useState([{ }]); // Inicializamos con un formulario vacío
  const navigate = useNavigate();

  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const data = await getCategorias(token);
        setCategorias(data);
      } catch (error) {
        console.error('Error al cargar categorías:', error);
      }
    };
    cargarCategorias();
  }, []);

  const handleImagenChange = (e) => {
    const files = Array.from(e.target.files);
    if (imagenes.length + files.length > 6) {
      alert('Solo se permiten hasta 6 imágenes.');
      return;
    }
    const newImages = [...imagenes, ...files.map(file => URL.createObjectURL(file))];
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
    setFormulariosVariantes([{ }]); // Reiniciamos los formularios al guardar nuevos atributos
  };

  const handleFormularioChange = (index, field, value) => {
    const newFormularios = [...formulariosVariantes];
    newFormularios[index][field] = value;
    setFormulariosVariantes(newFormularios);
  };

  const handleAgregarFormulario = () => {
    setFormulariosVariantes([...formulariosVariantes, {}]);
  };

  const generarVariantes = () => {
    const nuevasVariantes = formulariosVariantes.map(formulario => {
      const valores = atributosConfigurados.atributos.map(atributo => formulario[atributo.atributo_nombre] || '');
      return {
        precioVenta: formulario.precioVenta || atributosConfigurados.precioBase || '',
        precioCosto: formulario.precioCosto || atributosConfigurados.precioCostoBase || '',
        precioOferta: formulario.precioOferta || '',
        stock: formulario.stock || atributosConfigurados.stockBase || '',
        sku: formulario.sku || '',
        imagenUrl: formulario.imagenUrl || '',
        valores: valores,
      };
    });
    setVariantes(nuevasVariantes);
  };

  const handleVarianteChange = (index, field, value) => {
    const newVariantes = [...variantes];
    newVariantes[index][field] = value;
    setVariantes(newVariantes);
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

    if (!nombre || !categoriaId) {
      alert('Por favor, complete el nombre y la categoría del producto.');
      return;
    }

    const productoData = {
      usuario_id: 1,
      producto_nombre: nombre,
      categoria_id: categoriaId,
      producto_descripcion: descripcion,
      producto_precio_venta: precioVenta,
      producto_precio_costo: precioCosto,
      producto_precio_oferta: precioOferta,
      producto_stock: stockGeneral,
      producto_sku: skuGeneral,
      imagenes: imagenes.map((url, index) => ({ url, orden: index })),
      atributos: atributosConfigurados.atributos,
      variantes: variantes.map(variante => ({
        precio_venta: variante.precioVenta,
        precio_costo: variante.precioCosto,
        precio_oferta: variante.precioOferta,
        stock: variante.stock,
        sku: variante.sku,
        imagen_url: variante.imagenUrl,
        valores: variante.valores,
      })),
    };

    try {
      const token = sessionStorage.getItem('token');
      const response = await crearProducto(productoData, token);
      alert(response.message);
      navigate('/productos');
    } catch (error) {
      console.error('Error al crear producto:', error);
      alert(error.message);
    }
  };

  const onDragEnd = (result) => {
    if (!result.destination) {
      return;
    }

    const items = Array.from(imagenes);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setImagenes(items);
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
          <ReactQuill
            value={descripcion}
            onChange={setDescripcion}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        {/* Subida de imágenes */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Imágenes (máx. 6):</label>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="imagenes" direction="horizontal">
              {(provided) => (
                <ul
                  className="flex space-x-4"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {imagenes.map((imagen, index) => (
                    <Draggable key={index} draggableId={`imagen-${index}`} index={index}>
                      {(provided) => (
                        <li
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="relative w-32 h-32 border-2 border-gray-400 rounded-md overflow-hidden"
                        >
                          <img src={imagen} alt={`Imagen ${index + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleEliminarImagen(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700"
                          >
                            X
                          </button>
                        </li>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  {imagenes.length < 6 && (
                    <li className="w-32 h-32 border-2 border-dashed border-gray-400 rounded-md flex items-center justify-center">
                      <label htmlFor="imagen-upload" className="cursor-pointer">
                        <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                        </svg>
                        <input
                          type="file"
                          id="imagen-upload"
                          accept="image/*"
                          multiple
                          onChange={handleImagenChange}
                          className="hidden"
                        />
                      </label>
                    </li>
                  )}
                </ul>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        {/* Precio, stock y SKU general */}
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
          <label className="block text-sm font-medium text-gray-700">Precio de Costo:</label>
          <input
            type="number"
            value={precioCosto}
            onChange={e => setPrecioCosto(e.target.value)}
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

        {/* Formularios de variantes */}
        {mostrarFormularioAtributos && (
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
                  <label className="block text-sm font-medium text-gray-700">Precio Venta:</label>
                  <input
                    type="number"
                    value={formulario.precioVenta || ''}
                    onChange={e => handleFormularioChange(index, 'precioVenta', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
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

        {/* Variantes */}
        {variantes.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900">Variantes:</h3>
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Atributos
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Precio Venta
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Precio Costo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Precio Oferta
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SKU
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Imagen
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {variantes.map((variante, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {variante.valores.join(', ')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {variante.precioVenta}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {variante.precioCosto}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {variante.precioOferta}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {variante.stock}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {variante.sku}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {variante.imagenUrl}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleEliminarVariante(index)}
                          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              type="button"
              onClick={handleAgregarVariante}
              className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300"
            >
              Agregar Variante
            </button>
          </div>
        )}

        {/* Botón de submit */}
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