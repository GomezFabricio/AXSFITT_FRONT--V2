import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { crearProducto, obtenerImagenesTemporales, guardarImagenTemporal, moverImagenTemporal, eliminarImagenTemporal, cancelarProcesoAltaProducto } from '../../../api/productosApi';
import { getCategorias } from '../../../api/categoriasApi';
import ModalConfigurarAtributos from '../../../components/organisms/Modals/ModalConfigurarAtributos';
import GaleriaImagenesProducto from '../../../components/molecules/GaleriaImagenesProducto';
import { z } from 'zod';
import { productoSchema } from '../../../validations/producto.schema';
import config from '../../../config/config';

const tienePermiso = (permisoDescripcion) => {
  const userData = JSON.parse(sessionStorage.getItem('userData'));
  if (!userData || !userData.modulos) return false;
  return userData.modulos.some(
    m => m.permisos && m.permisos.some(p => p.permiso_descripcion === permisoDescripcion)
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
  const [modalAtributosOpen, setModalAtributosOpen] = useState(false);
  const [mostrarFormularioAtributos, setMostrarFormularioAtributos] = useState(false);
  const [formulariosVariantes, setFormulariosVariantes] = useState([{}]); // Inicializamos con un formulario vacío
  const navigate = useNavigate();

  // Obtener el usuario_id desde sessionStorage
  const userData = JSON.parse(sessionStorage.getItem('userData'));
  const usuario_id = userData?.usuario_id;

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
        const imagenesTemporales = await obtenerImagenesTemporales(usuario_id, token);
    
        console.log('Imágenes cargadas desde el backend:', imagenesTemporales);
    
        const imagenesProcesadas = imagenesTemporales.map(img => ({
          id: img.imagen_id,
          url: img.imagen_url, // Usar directamente la ruta relativa
        }));
    
        setImagenes(imagenesProcesadas);
    
        console.log('Estado actualizado con imágenes:', imagenesProcesadas);
      } catch (error) {
        console.error('Error al cargar imágenes temporales:', error);
      }
    };

    cargarCategorias();
    cargarImagenesTemporales();
  }, [usuario_id]);

  const handleMoverImagen = async (fromIndex, toIndex) => {
    const token = sessionStorage.getItem('token');
  
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
  
      // Actualizar el estado local directamente
      const newImages = [...imagenes];
      const [movedImage] = newImages.splice(fromIndex, 1); // Remover la imagen del índice actual
      newImages.splice(toIndex, 0, movedImage); // Insertar la imagen en el nuevo índice
  
      setImagenes(newImages); // Actualizar el estado para forzar la re-renderización
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
  
    const token = sessionStorage.getItem('token');
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
        newImages.push({ id: response.imagen_id, url: response.imagen_url }); // Usar la ruta relativa
      } catch (error) {
        console.error('Error al guardar imagen temporal:', error);
        alert('Error al subir la imagen.');
      }
    }
  
    setImagenes(newImages);
  };

  const handleEliminarImagen = async (index) => {
    const token = sessionStorage.getItem('token');
    const imagen = imagenes[index];

    try {
      // Solicitud al backend para eliminar la imagen
      await eliminarImagenTemporal({ usuario_id, imagen_id: imagen.id }, token);

      // Actualizar el estado local eliminando la imagen
      const newImages = [...imagenes];
      newImages.splice(index, 1);
      setImagenes(newImages);

      alert('Imagen eliminada correctamente.');
    } catch (error) {
      console.error('Error al eliminar la imagen:', error);
      alert('Error al eliminar la imagen.');
    }
  };
  const handleAtributosSave = (data) => {
    setAtributosConfigurados(data);
    setMostrarFormularioAtributos(true);
    setFormulariosVariantes([{}]); // Reiniciamos los formularios al guardar nuevos atributos
  };

  const handleFormularioChange = (index, field, value) => {
    const newFormularios = [...formulariosVariantes];
    newFormularios[index][field] = value;
    console.log(`Formulario actualizado:`, newFormularios); // Depuración
    setFormulariosVariantes(newFormularios);
  };

  const handleAgregarFormulario = () => {
    setFormulariosVariantes([...formulariosVariantes, {}]);
  };

  const handleCancelarProceso = async () => {
    const token = sessionStorage.getItem('token');

    try {
      await cancelarProcesoAltaProducto({ usuario_id }, token);
      alert('Proceso de alta cancelado correctamente.');
      navigate('/productos'); // Redirigir al listado de productos
    } catch (error) {
      console.error('Error al cancelar el proceso de alta:', error);
      alert('Error al cancelar el proceso de alta.');
    }
  };

  const handleEliminarVariante = (index) => {
    const newFormularios = [...formulariosVariantes];
    newFormularios.splice(index, 1); // Eliminar la variante en el índice especificado
    setFormulariosVariantes(newFormularios); // Actualizar el estado
  };

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
      imagenes: imagenes.map((imagen, index) => ({
        id: imagen.id,
        orden: index,
      })),
      atributos: usarAtributos ? atributosConfigurados.atributos : [],
      variantes: usarAtributos
        ? formulariosVariantes.map(variante => {
            console.log('Variante imagen_url:', variante.imagen_url); // Depuración
      
            return {
              precio_venta: variante.precioVenta ? parseFloat(variante.precioVenta) : null,
              precio_costo: variante.precioCosto ? parseFloat(variante.precioCosto) : null,
              precio_oferta: variante.precioOferta ? parseFloat(variante.precioOferta) : null,
              stock: variante.stock ? parseInt(variante.stock, 10) : null,
              sku: variante.sku || null,
              imagen_url: variante.imagen_url || null, // Usar directamente la ruta relativa
              valores: atributosConfigurados.atributos.map(attr => variante[attr.atributo_nombre] || null),
            };
          })
        : [],
    };

    try {
      // Validar los datos del producto
      productoSchema.parse(productoData);

      const token = sessionStorage.getItem('token');
      await crearProducto(productoData, token);

      alert('Producto creado exitosamente.');
      navigate('/productos');
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Mostrar mensajes de error de validación
        alert(error.errors.map(err => err.message).join('\n'));
      } else {
        console.error('Error al crear producto:', error);
        alert('Error al crear producto.');
      }
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

        {!usarAtributos && tienePermiso('Definir Precio Producto') && (
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
            className="px-4 py-2 border border-purple-600 text-purple-600 rounded-md text-sm hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
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

                {tienePermiso('Definir Precio Producto') && (
                  <>

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
                  </>
                )}

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
                    value={formulario.imagen_url || ''}
                    onChange={e => handleFormularioChange(index, 'imagen_url', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="">Seleccionar Imagen</option>
                    {imagenes.map((imagen) => (
                      <option key={imagen.id} value={imagen.url}>
                        Imagen {imagen.id}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleEliminarVariante}
                  className="px-2 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Eliminar Variante
                </button>

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