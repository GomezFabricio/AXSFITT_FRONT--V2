import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  obtenerProductoPorId,
  actualizarProducto,
  moverImagenProducto,
  eliminarImagenProducto,
  subirImagenProducto,
  cancelarImagenesNuevas,
  // Eliminada la importación de verificarVentasVariante
} from '../../../api/productosApi';
import { getCategorias } from '../../../api/categoriasApi';
import ModalConfigurarAtributos from '../../../components/organisms/Modals/product/ModalConfigurarAtributos';
import GaleriaImagenesProducto from '../../../components/molecules/productos/GaleriaImagenesProducto';
import FormularioDatosProducto from '../../../components/molecules/productos/FormularioDatosProducto';
import FormularioAtributos from '../../../components/molecules/productos/FormularioAtributos';
import { z } from 'zod';
import { productoSchema } from '../../../validations/producto.schema';
import tienePermiso from '../../../utils/tienePermiso';

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
  const [categorias, setCategorias] = useState([]);
  const [atributosConfigurados, setAtributosConfigurados] = useState({ atributos: [], precioBase: '', precioCostoBase: '', stockBase: '' });
  const [formulariosVariantes, setFormulariosVariantes] = useState([]);
  // Eliminado el estado ventasPorVariante
  const [errores, setErrores] = useState({});
  const [cargando, setCargando] = useState(true);
  const [modalAtributosOpen, setModalAtributosOpen] = useState(false); // Estado para el modal

  // Estados para validación
  const [productoDuplicado, setProductoDuplicado] = useState(false);
  const [skuValido, setSkuValido] = useState(true);
  const [puedeModificar, setPuedeModificar] = useState(true);
  const [nombreOriginal, setNombreOriginal] = useState('');
  const [categoriaOriginal, setCategoriaOriginal] = useState('');
  const [skuOriginal, setSkuOriginal] = useState('');

  // useRef to store the previous formulariosVariantes
  const previousFormulariosVariantes = useRef(null);

  useEffect(() => {
    const cargarProducto = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const productoData = await obtenerProductoPorId(producto_id, token);

        if (!productoData || !productoData.producto) {
          console.error('El producto no tiene datos válidos:', productoData);
          alert('Error al cargar los datos del producto.');
          navigate('/productos');
          return;
        }

        const producto = productoData.producto;
        // Cargar datos del producto
        setNombre(producto.nombre);
        setCategoriaId(producto.categoria_id);
        setDescripcion(producto.producto_descripcion || '');
        setPrecioVenta(producto.producto_precio_venta || '');
        setPrecioCosto(producto.producto_precio_costo || '');
        setPrecioOferta(producto.producto_precio_oferta || '');
        setStockGeneral(producto.stock_total || '');
        setSkuGeneral(producto.producto_sku || '');
        setUsarAtributos(productoData.variantes && productoData.variantes.length > 0);

        // Guardar valores originales para validación
        setNombreOriginal(producto.nombre);
        setCategoriaOriginal(producto.categoria_id);
        setSkuOriginal(producto.producto_sku || '');

        // Cargar imágenes
        const imagenesProcesadas = producto.imagenes.map((imagen) => ({
          id: imagen.imagen_id, // Usar el ID real de la base de datos
          url: imagen.imagen_url, // La URL ya viene procesada desde el backend
        }));
        console.log('Imágenes procesadas:', imagenesProcesadas);
        setImagenes(imagenesProcesadas);

        // Cargar variantes
        if (productoData.variantes && productoData.variantes.length > 0) {
          const initialFormularios = productoData.variantes.map((variante) => ({
            variante_id: variante.variante_id,
            estado: variante.variante_estado || 'activo',
            precioVenta: variante.variante_precio_venta || '',
            precioCosto: variante.variante_precio_costo || '',
            precioOferta: variante.variante_precio_oferta || '',
            stock: variante.stock_total || '',
            sku: variante.variante_sku || '',
            imagen_url: variante.imagen_url || '',
            ...Array.isArray(variante.atributos)
              ? variante.atributos.reduce((acc, attr) => {
                acc[attr.atributo_nombre] = attr.valor_nombre;
                return acc;
              }, {})
              : {},
          }));
          setFormulariosVariantes(initialFormularios);
          previousFormulariosVariantes.current = initialFormularios; // Store initial values

          setAtributosConfigurados({
            atributos: Array.isArray(productoData.variantes[0]?.atributos)
              ? productoData.variantes[0].atributos.map((attr) => ({
                atributo_nombre: attr.atributo_nombre,
                valores: [],
              }))
              : [],
          });

          // Eliminada la llamada a verificarVentas
        } else {
          // Si no hay variantes, inicializar los formulariosVariantes con un objeto vacío
          setFormulariosVariantes([]);
          previousFormulariosVariantes.current = [];
          setAtributosConfigurados({ atributos: [], precioBase: '', precioCostoBase: '', stockBase: '' });
        }

        setCargando(false);
      } catch (error) {
        console.error('Error al cargar el producto:', error);
        alert('Error al cargar el producto.');
        navigate('/productos');
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

    cargarCategorias();
    cargarProducto();
  }, [producto_id, navigate]);

  useEffect(() => {
    return () => {
      // Al desmontarse el componente (cuando se sale de la pantalla de edición)
      const cancelarSiHayImagenesNuevas = async () => {
        const nuevas = imagenes.filter((img) => img.nueva === true || (!img.id)); // Filtramos imágenes sin ID o marcadas como nuevas
        if (nuevas.length === 0) return;

        try {
          const token = sessionStorage.getItem('token');
          const imagenIds = nuevas.map((img) => img.id).filter(Boolean);
          await cancelarImagenesNuevas(producto_id, imagenIds, token);
          console.log('Imágenes nuevas eliminadas automáticamente al salir');
        } catch (error) {
          console.error('Error al cancelar imágenes nuevas automáticamente:', error);
        }
      };

      cancelarSiHayImagenesNuevas();
    };
  }, [imagenes, producto_id]);

  const handleAtributosSave = (data) => {
    // Deep copy of formulariosVariantes
    const formulariosVariantesCopy = JSON.parse(JSON.stringify(formulariosVariantes));

    // Update atributosConfigurados
    setAtributosConfigurados(data);

    // Merge data back into formulariosVariantes
    if (formulariosVariantesCopy && formulariosVariantesCopy.length > 0) {
      const mergedFormularios = formulariosVariantesCopy.map(variante => {
        const newVariante = { ...variante };
        data.atributos.forEach(attr => {
          newVariante[attr.atributo_nombre] = variante[attr.atributo_nombre] || '';
        });
        return newVariante;
      });
      setFormulariosVariantes(mergedFormularios);
    } else {
      setFormulariosVariantes([{}]); // Reiniciar las variantes al guardar nuevos atributos
    }
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
    newFormularios.splice(index, 1);
    setFormulariosVariantes(newFormularios);
  };

  const handleMoverImagen = async (indexActual, indexNuevo) => {
    const token = sessionStorage.getItem('token');
    const imagenActual = imagenes[indexActual];

    console.log('🔄 Iniciando movimiento de imagen:', {
      indexActual,
      indexNuevo,
      imagenActual,
      totalImagenes: imagenes.length
    });

    if (!imagenActual || imagenActual.id === undefined) {
      console.error('❌ La imagen actual no tiene un ID válido:', imagenActual);
      alert('Error al mover la imagen. La imagen no tiene un ID válido.');
      return;
    }

    const datosAEnviar = {
      producto_id,
      imagen_id: imagenActual.id,
      nuevo_orden: indexNuevo,
    };

    console.log('📤 Datos enviados a la API moverImagenProducto:', datosAEnviar);

    try {
      const respuesta = await moverImagenProducto(datosAEnviar, token);
      console.log('✅ Respuesta del servidor:', respuesta);

      // Actualizar el estado local solo si el servidor confirma el éxito
      const nuevasImagenes = [...imagenes];
      nuevasImagenes.splice(indexActual, 1);
      nuevasImagenes.splice(indexNuevo, 0, imagenActual);
      setImagenes(nuevasImagenes);
      
      console.log('✅ Estado local actualizado');

    } catch (error) {
      console.error('❌ Error al mover la imagen:', error.response?.data || error);
      alert('Error al mover la imagen: ' + (error.message || 'Error desconocido'));
    }
  };

  const handleEliminarImagen = async (index) => {
    const token = sessionStorage.getItem('token');
    const imagen = imagenes[index];

    if (!imagen || !imagen.id) {
      console.error('La imagen no tiene un ID válido:', imagen);
      alert('Error al eliminar la imagen. La imagen no tiene un ID válido.');
      return;
    }

    console.log('Datos enviados a la API eliminarImagenProducto:', {
      producto_id,
      imagen_id: imagen.id,
    });

    try {
      // Llamar a la API para eliminar la imagen
      await eliminarImagenProducto(
        {
          producto_id,
          imagen_id: imagen.id,
        },
        token
      );

      // Actualizar el estado local de las imágenes
      const nuevasImagenes = [...imagenes];
      nuevasImagenes.splice(index, 1);
      setImagenes(nuevasImagenes);

      alert('Imagen eliminada correctamente.');
    } catch (error) {
      console.error('Error al eliminar la imagen:', error.response?.data || error);
      alert('Error al eliminar la imagen.');
    }
  };

  const handleSubirImagen = async (file) => {
    const token = sessionStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);

    console.log('Subiendo imagen:', file);

    try {
      const response = await subirImagenProducto(producto_id, formData, token);
      console.log('Respuesta completa del servidor:', response);
      
      // Extraer los datos correctamente de la respuesta
      const nuevaImagen = response.data || response;
      console.log('Datos de la nueva imagen:', nuevaImagen);
      
      setImagenes((prev) => [
        ...prev,
        { 
          id: nuevaImagen.imagen_id, 
          url: nuevaImagen.imagen_url, 
          nueva: true 
        },
      ]);
    } catch (error) {
      console.error('Error al subir imagen (completo):', error);
      alert(error?.response?.data?.message || error.message || 'No se pudo subir la imagen.');
    }
  };

  const handleCancelar = async () => {
    const token = sessionStorage.getItem('token');
    const imagenesNuevas = imagenes.filter((img) => img.id === null).map((img) => img.id);

    try {
      await cancelarImagenesNuevas(producto_id, imagenesNuevas, token);
      navigate('/productos');
    } catch (error) {
      console.error('Error al cancelar imágenes nuevas:', error);
    }
  };

  // Eliminada la función verificarVentas

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Verificar validaciones antes de proceder
    if (!puedeModificar) {
      if (productoDuplicado) {
        alert('No se puede modificar el producto: Ya existe un producto con ese nombre en la categoría seleccionada.');
        return;
      }
      if (!skuValido) {
        alert('No se puede modificar el producto: El SKU ya está en uso.');
        return;
      }
    }

    // Validar que todas las variantes tengan una imagen seleccionada
    if (usarAtributos) {
      const algunaVarianteSinImagen = formulariosVariantes.some(
        (variante) => !variante.imagen_url
      );

      if (algunaVarianteSinImagen) {
        alert('Por favor, selecciona una imagen para cada variante.');
        return;
      }
    }

    // Filtrar imágenes con URLs válidas
    const imagenesValidas = imagenes.filter((imagen) => imagen.url && imagen.url.trim() !== '');

    const productoData = {
      producto_nombre: nombre,
      categoria_id: parseInt(categoriaId, 10), // Convertir a número entero
      producto_descripcion: descripcion || null,
      producto_precio_venta: precioVenta ? parseFloat(precioVenta) : null,
      producto_precio_costo: precioCosto ? parseFloat(precioCosto) : null,
      producto_precio_oferta: precioOferta ? parseFloat(precioOferta) : null,
      producto_stock: usarAtributos ? null : stockGeneral ? parseInt(stockGeneral, 10) : null,
      producto_sku: skuGeneral || null,
      imagenes: imagenesValidas.map((imagen, index) => ({
        id: imagen.id,
        url: imagen.url,
        orden: index,
      })),
      variantes: usarAtributos
        ? formulariosVariantes.map((variante) => ({
          variante_id: variante.variante_id,
          precio_venta: variante.precioVenta ? parseFloat(variante.precioVenta) : null,
          precio_costo: variante.precioCosto ? parseFloat(variante.precioCosto) : null,
          precio_oferta: variante.precioOferta ? parseFloat(variante.precioOferta) : null,
          stock: variante.stock ? parseInt(variante.stock, 10) : null,
          sku: variante.sku || null,
          imagen_url: variante.imagen_url || null,
          valores: atributosConfigurados.atributos.map((attr) => ({
            atributo_nombre: attr.atributo_nombre,
            valor_nombre: variante[attr.atributo_nombre] || null,
          })),
        }))
        : [],
    };

    console.log('Datos enviados a la API de modificar producto:', productoData);

    try {
      // Validación con Zod
      productoSchema.parse(productoData);

      const token = sessionStorage.getItem('token');
      await actualizarProducto(producto_id, productoData, token);

      alert('Producto actualizado exitosamente.');
      navigate('/productos'); // Redirigir a la lista de productos
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Errores de validación Zod
        const erroresFormateados = error.errors.reduce((acc, curr) => {
          acc[curr.path[0]] = curr.message;
          return acc;
        }, {});
        setErrores(erroresFormateados);
        console.error('Errores de validación:', erroresFormateados);
      } else {
        // Errores de la API u otros
        console.error('Error al actualizar producto:', error.response?.data || error);
        alert('Error al actualizar el producto.');
      }
    }
  };

  // Callbacks para validaciones
  const handleDuplicateFound = (isDuplicate) => {
    // Solo es duplicado si cambió el nombre o categoría y es diferente al original
    const nombreCambio = nombre !== nombreOriginal;
    const categoriaCambio = categoriaId !== categoriaOriginal;
    
    if (nombreCambio || categoriaCambio) {
      setProductoDuplicado(isDuplicate);
    } else {
      setProductoDuplicado(false);
    }
  };

  const handleSkuValidated = (isValid) => {
    // Solo es inválido si cambió el SKU y es diferente al original
    const skuCambio = skuGeneral !== skuOriginal;
    
    if (skuCambio) {
      setSkuValido(isValid);
    } else {
      setSkuValido(true);
    }
  };

  // Actualizar si puede modificar basado en las validaciones
  React.useEffect(() => {
    setPuedeModificar(!productoDuplicado && skuValido);
  }, [productoDuplicado, skuValido]);

  if (cargando) {
    return <p>Cargando datos del producto...</p>;
  }

  return (
    <div className="container mx-auto mt-8">
      <h2 className="text-2xl font-semibold mb-4">Modificar Producto</h2>
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
          categorias={categorias} // Pasar las categorías cargadas
          errores={errores}
          usarAtributos={usarAtributos}
          tienePermiso={tienePermiso}
          onDuplicateFound={handleDuplicateFound}
          onSkuValidated={handleSkuValidated}
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
          onImagenChange={(e) => {
            const file = e.target?.files?.[0];
            if (file) {
              handleSubirImagen(file);
            }
          }}
        />

        {usarAtributos && (
          <FormularioAtributos
            atributosConfigurados={atributosConfigurados}
            formulariosVariantes={formulariosVariantes}
            setFormulariosVariantes={setFormulariosVariantes}
            handleFormularioChange={handleFormularioChange}
            handleAgregarFormulario={handleAgregarFormulario}
            handleEliminarVariante={handleEliminarVariante}
            imagenes={imagenes}
            errores={errores}
            tienePermiso={tienePermiso}
          />
        )}

        <div className="flex space-x-4">
          <button
            type="submit"
            className={`px-4 py-2 border border-blue-600 text-blue-600 rounded-md text-sm hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              !puedeModificar ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={!puedeModificar}
          >
            Guardar Cambios
          </button>
          <button
            type="button"
            onClick={handleCancelar}
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

export default ModificarProducto;