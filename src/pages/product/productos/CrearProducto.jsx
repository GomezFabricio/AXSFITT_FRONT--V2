import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { crearProducto, obtenerImagenesTemporales, guardarImagenTemporal, moverImagenTemporal, eliminarImagenTemporal, cancelarProcesoAltaProducto } from '../../../api/productosApi';
import { getCategorias } from '../../../api/categoriasApi';
import ModalConfigurarAtributos from '../../../components/organisms/Modals/product/ModalConfigurarAtributos';
import GaleriaImagenesProducto from '../../../components/molecules/productos/GaleriaImagenesProducto';
import FormularioDatosProducto from '../../../components/molecules/productos/FormularioDatosProducto';
import FormularioAtributos from '../../../components/molecules/productos/FormularioAtributos';
import { z } from 'zod';
import { productoSchema } from '../../../validations/producto.schema';


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
  const [modalAtributosOpen, setModalAtributosOpen] = useState(false);
  const [mostrarFormularioAtributos, setMostrarFormularioAtributos] = useState(false);
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

  const handleMoverImagen = async (indexActual, indexNuevo) => {
    const token = sessionStorage.getItem('token');
    const imagenActual = imagenes[indexActual];
  
    if (!imagenActual || imagenActual.id === undefined) {
      console.error('La imagen actual no tiene un ID válido:', imagenActual);
      alert('Error al mover la imagen. La imagen no tiene un ID válido.');
      return;
    }
  
    console.log('Datos enviados a la API moverImagenProducto:', {
      producto_id,
      imagen_id: imagenActual.id,
      nuevo_orden: indexNuevo,
    });
  
    try {
      await moverImagenTemporal(
        {
          usuario_id,
          imagen_id: imagenActual.id,
          nuevo_orden: indexNuevo,
        },
        token
      );
  
      const nuevasImagenes = [...imagenes];
      nuevasImagenes.splice(indexActual, 1);
      nuevasImagenes.splice(indexNuevo, 0, imagenActual);
      setImagenes(nuevasImagenes);
  
      alert('Orden de la imagen actualizado correctamente.');
    } catch (error) {
      console.error('Error al mover la imagen:', error.response?.data || error);
      alert('Error al mover la imagen.');
    }
  };

  const handleEliminarImagen = async (index) => {
    const token = sessionStorage.getItem('token');
    const imagen = imagenes[index];
  
    try {
      await eliminarImagenTemporal({ usuario_id, imagen_id: imagen.id }, token);
  
      const newImages = [...imagenes];
      newImages.splice(index, 1);
      setImagenes(newImages);
  
      alert('Imagen eliminada correctamente.');
    } catch (error) {
      console.error('Error al eliminar la imagen:', error);
      alert('Error al eliminar la imagen.');
    }
  };

  const handleImagenChange = async (e) => {
    const files = Array.from(e.target.files);
    const validExtensions = ['image/jpeg', 'image/png', 'image/jpg'];
  
    if (imagenes.length + files.length > 6) {
      alert('Solo se permiten hasta 6 imágenes.');
      return;
    }
  
    const invalidFiles = files.filter((file) => !validExtensions.includes(file.type));
    if (invalidFiles.length > 0) {
      alert('Solo se permiten archivos de imagen (JPEG, PNG, JPG).');
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
        const response = await guardarImagenTemporal(formData, token);
        newImages.push({ id: response.imagen_id, url: response.imagen_url });
      } catch (error) {
        console.error('Error al guardar imagen temporal:', error);
        alert('Error al subir la imagen.');
      }
    }
  
    setImagenes(newImages);
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

  const handleEliminarVariante = (index) => {
    const newFormularios = [...formulariosVariantes];
    newFormularios.splice(index, 1); // Eliminar el formulario en el índice especificado
    setFormulariosVariantes(newFormularios); // Actualizar el estado con los formularios restantes
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (usarAtributos) {
      const algunaVarianteSinImagen = formulariosVariantes.some(
        (variante) => !variante.imagen_url
      );

      if (algunaVarianteSinImagen) {
        alert('Por favor, selecciona una imagen para cada variante.');
        return;
      }
    }
  
    const productoData = {
      usuario_id,
      producto_nombre: nombre,
      categoria_id: parseInt(categoriaId, 10), // Convertir a número entero
      producto_descripcion: descripcion || null,
      producto_precio_venta: usarAtributos ? null : precioVenta ? parseFloat(precioVenta) : null,
      producto_precio_costo: usarAtributos ? null : precioCosto ? parseFloat(precioCosto) : null,
      producto_precio_oferta: usarAtributos ? null : precioOferta ? parseFloat(precioOferta) : null,
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
  
    console.log('Datos del producto a enviar:', productoData);
  
    try {
      productoSchema.parse(productoData);
  
      const token = sessionStorage.getItem('token');
      console.log('Token a enviar:', token);
  
      console.log('Llamando a la API crearProducto con:', productoData, token);
      const response = await crearProducto(productoData, token);
  
      console.log('Respuesta de la API crearProducto:', response);
  
      if (response && response.producto_id) {
        alert('Producto creado exitosamente.');
        navigate('/productos');
      } else {
        alert('Error al crear producto: No se recibió el ID del producto.');
      }
  
      // Limpiar el formulario para permitir la creación de un nuevo producto
      setNombre('');
      setCategoriaId('');
      setDescripcion('');
      setPrecioVenta('');
      setPrecioCosto('');
      setPrecioOferta('');
      setStockGeneral('');
      setSkuGeneral('');
      setImagenes([]);
      setUsarAtributos(false);
      setAtributosConfigurados({ atributos: [], precioBase: '', precioCostoBase: '', stockBase: '' });
      setFormulariosVariantes([{}]);
      setErrores({});
    } catch (error) {
      console.error('Error en la función handleSubmit:', error);
      if (error instanceof z.ZodError) {
        const erroresMapeados = error.errors.reduce((acc, err) => {
          acc[err.path[0]] = err.message;
          return acc;
        }, {});
        setErrores(erroresMapeados);
        console.error('Errores de validación:', erroresMapeados);
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
          tienePermiso={tienePermiso} // Pasar la función tienePermiso
          usarAtributos={usarAtributos} // Pasar el estado de atributos activados
        />

        <div>
          <label className="block text-sm font-medium text-gray-700">¿Usar Atributos?</label>
          <select
            value={usarAtributos}
            onChange={(e) => setUsarAtributos(e.target.value === 'true')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="false">No</option>
            <option value="true">Sí</option>
          </select>
        </div>

        {usarAtributos && (
          <button
            type="button"
            onClick={() => setModalAtributosOpen(true)}
            className="px-4 py-2 border border-purple-600 text-purple-600 rounded-md text-sm hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500 mt-4"
          >
            Configurar Atributos
          </button>
        )}

        <GaleriaImagenesProducto
          imagenes={imagenes}
          onMoverImagen={handleMoverImagen}
          onEliminarImagen={handleEliminarImagen}
          onImagenChange={handleImagenChange}
        />

        {usarAtributos && mostrarFormularioAtributos && (
          <FormularioAtributos
            atributosConfigurados={atributosConfigurados}
            formulariosVariantes={formulariosVariantes}
            setFormulariosVariantes={setFormulariosVariantes}
            handleFormularioChange={handleFormularioChange}
            handleAgregarFormulario={handleAgregarFormulario}
            handleEliminarVariante={handleEliminarVariante}
            imagenes={imagenes}
            errores={errores}
            tienePermiso={tienePermiso} // Pasar la función tienePermiso
          />
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
      <ModalConfigurarAtributos
        isOpen={modalAtributosOpen}
        onClose={() => setModalAtributosOpen(false)}
        onSave={handleAtributosSave}
        initialAtributos={atributosConfigurados.atributos}
      />
    </div>
  );
};

export default CrearProducto;