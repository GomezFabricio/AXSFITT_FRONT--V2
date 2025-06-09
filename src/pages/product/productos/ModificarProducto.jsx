import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  obtenerProductoPorId,
  actualizarProducto,
} from '../../../api/productosApi';
import { getCategorias } from '../../../api/categoriasApi';
import GaleriaImagenesProducto from '../../../components/molecules/GaleriaImagenesProducto';
import ModalConfigurarAtributos from '../../../components/organisms/Modals/ModalConfigurarAtributos';
import config from '../../../config/config';
import { z } from 'zod';
import { productoSchema } from '../../../validations/producto.schema';

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
  const [formulariosVariantes, setFormulariosVariantes] = useState([{}]);
  const [categorias, setCategorias] = useState([]);
  const [modalAtributosOpen, setModalAtributosOpen] = useState(false);
  const [mostrarFormularioAtributos, setMostrarFormularioAtributos] = useState(false);
  const [errores, setErrores] = useState({});
  const userData = JSON.parse(sessionStorage.getItem('userData'));
  const usuario_id = userData?.usuario_id;

  const tienePermiso = (permisoDescripcion) => {
    if (!userData || !userData.modulos) return false;
    return userData.modulos.some(
      m => m.permisos && m.permisos.some(p => p.permiso_descripcion === permisoDescripcion)
    );
  };

  useEffect(() => {
    const cargarProducto = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const datos = await obtenerProductoPorId(producto_id, token);

        console.log('Datos del producto:', datos); // Depuración

        const { producto, variantes } = datos;

        // Cargar datos del producto
        setNombre(producto.nombre);
        setCategoriaId(producto.categoria_id);
        setDescripcion(producto.producto_descripcion || '');
        setPrecioVenta(producto.producto_precio_venta || '');
        setPrecioCosto(producto.producto_precio_costo || '');
        setPrecioOferta(producto.producto_precio_oferta || '');
        setStockGeneral(producto.stock_total || '');
        setSkuGeneral(producto.producto_sku || '');

        // Cargar imágenes
        const imagenesCompletas = [
          {
            id: producto.imagen_id,
            url: producto.imagen_url,
          },
          ...variantes.map((v) => ({
            id: v.imagen_id,
            url: v.imagen_url,
          })),
        ];
        setImagenes(imagenesCompletas);

        // Cargar variantes
        if (variantes?.length > 0) {
          setUsarAtributos(true);
          setMostrarFormularioAtributos(true);
          const nuevasVariantes = variantes.map((variante) => {
            const atributosProcesados = {};
            if (variante.atributos) {
              variante.atributos.split(', ').forEach((atributo) => {
                const [clave, valor] = atributo.split(': ');
                atributosProcesados[clave] = valor;
              });
            }

            return {
              ...atributosProcesados,
              precioVenta: variante.variante_precio_venta || '',
              precioCosto: variante.variante_precio_costo || '',
              precioOferta: variante.variante_precio_oferta || '',
              stock: variante.stock_total || '',
              sku: variante.variante_sku || '',
              imagen_url: variante.imagen_url ? `${config.backendUrl}${variante.imagen_url}` : '',
            };
          });

          setFormulariosVariantes(nuevasVariantes);
        }
      } catch (error) {
        console.error('Error al cargar el producto:', error);
        alert('Error al cargar el producto.');
      }
    };

    const cargarCategorias = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const categoriasData = await getCategorias(token);
        const procesarCategorias = (categorias, padreId = null, nivel = 0) => {
          return categorias
            .filter(c => c.categoria_padre_id === padreId)
            .reduce((acc, c) => {
              acc.push({ categoria_id: c.categoria_id, nombreJerarquico: `${'>'.repeat(nivel)} ${c.categoria_nombre}` });
              acc.push(...procesarCategorias(categorias, c.categoria_id, nivel + 1));
              return acc;
            }, []);
        };
        setCategorias(procesarCategorias(categoriasData));
      } catch (error) {
        console.error('Error al cargar categorías:', error);
      }
    };

    cargarProducto();
    cargarCategorias();
  }, [producto_id]);


  const handleFormularioChange = (index, field, value) => {
    const nuevos = [...formulariosVariantes];
    nuevos[index][field] = value;
    setFormulariosVariantes(nuevos);
  };

  const handleAgregarFormulario = () => setFormulariosVariantes([...formulariosVariantes, {}]);
  const handleEliminarVariante = (index) => {
    const nuevos = [...formulariosVariantes];
    nuevos.splice(index, 1);
    setFormulariosVariantes(nuevos);
  };

  const handleAtributosSave = (nuevosAtributos) => {
    setAtributosConfigurados({ atributos: nuevosAtributos });
    setMostrarFormularioAtributos(true);
    setModalAtributosOpen(false);
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
      imagenes: imagenes.map((imagen, index) => ({ id: imagen.id, orden: index })),
      atributos: usarAtributos ? atributosConfigurados.atributos : [],
      variantes: usarAtributos
        ? formulariosVariantes.map(variante => ({
          precio_venta: parseFloat(variante.precioVenta),
          precio_costo: parseFloat(variante.precioCosto),
          precio_oferta: parseFloat(variante.precioOferta),
          stock: parseInt(variante.stock),
          sku: variante.sku,
          imagen_url: variante.imagen_url,
          valores: atributosConfigurados.atributos.map(attr => variante[attr.atributo_nombre] || null)
        }))
        : [],
    };

    try {
      productoSchema.parse(productoData);
      const token = sessionStorage.getItem('token');
      await actualizarProducto(producto_id, productoData, token);
      alert('Producto actualizado exitosamente.');
      navigate('/productos');
    } catch (error) {
      if (error instanceof z.ZodError) {
        const erroresMapeados = error.errors.reduce((acc, err) => {
          acc[err.path[0]] = err.message;
          return acc;
        }, {});
        setErrores(erroresMapeados);
      } else {
        console.error('Error al actualizar producto:', error);
        alert('Error al actualizar producto.');
      }
    }
  };

  return (
    <div className="container mx-auto mt-8">
      <h2 className="text-2xl font-semibold mb-4">Modificar Producto</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nombre del Producto:</label>
          <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Categoría:</label>
          <select value={categoriaId} onChange={e => setCategoriaId(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required>
            <option value="">Seleccionar Categoría</option>
            {categorias.map(c => <option key={c.categoria_id} value={c.categoria_id}>{c.nombreJerarquico}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Descripción:</label>
          <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" rows="4" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Imágenes:</label>
          <GaleriaImagenesProducto
            imagenes={imagenes}
            onMoverImagen={() => { }}
            onEliminarImagen={() => { }}
            onImagenChange={() => { }}
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
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${errores.producto_precio_costo ? 'border-red-500' : ''
                  }`}
              />
              {errores.producto_precio_costo && (
                <p className="text-sm text-red-500 mt-1">{errores.producto_precio_costo}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Precio de Venta:</label>
              <input
                type="number"
                value={precioVenta}
                onChange={e => setPrecioVenta(e.target.value)}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${errores.producto_precio_venta ? 'border-red-500' : ''
                  }`}
              />
              {errores.producto_precio_venta && (
                <p className="text-sm text-red-500 mt-1">{errores.producto_precio_venta}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Precio de Oferta (Opcional):</label>
              <input
                type="number"
                value={precioOferta}
                onChange={e => setPrecioOferta(e.target.value)}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${errores.producto_precio_oferta ? 'border-red-500' : ''
                  }`}
              />
              {errores.producto_precio_oferta && (
                <p className="text-sm text-red-500 mt-1">{errores.producto_precio_oferta}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Stock General:</label>
              <input
                type="number"
                value={stockGeneral}
                onChange={e => setStockGeneral(e.target.value)}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${errores.producto_stock ? 'border-red-500' : ''
                  }`}
              />
              {errores.producto_stock && (
                <p className="text-sm text-red-500 mt-1">{errores.producto_stock}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">SKU General:</label>
              <input
                type="text"
                value={skuGeneral}
                onChange={e => setSkuGeneral(e.target.value)}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${errores.producto_sku ? 'border-red-500' : ''
                  }`}
              />
              {errores.producto_sku && (
                <p className="text-sm text-red-500 mt-1">{errores.producto_sku}</p>
              )}
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
                {Object.keys(formulario || {}).map((atributo) => (
                  atributo !== 'precioVenta' &&
                  atributo !== 'precioCosto' &&
                  atributo !== 'precioOferta' &&
                  atributo !== 'stock' &&
                  atributo !== 'sku' &&
                  atributo !== 'imagen_url' && (
                    <div key={atributo} className="mb-2">
                      <label className="block text-sm font-medium text-gray-700">{atributo}:</label>
                      <input
                        type="text"
                        value={formulario[atributo] || ''}
                        onChange={(e) => handleFormularioChange(index, atributo, e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                  )
                ))}

                {tienePermiso('Definir Precio Producto') && (
                  <>

                    <div className="mb-2">
                      <label className="block text-sm font-medium text-gray-700">Precio Costo:</label>
                      <input
                        type="number"
                        value={formulario.precioCosto || ''}
                        onChange={e => handleFormularioChange(index, 'precioCosto', e.target.value)}
                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${errores[`formulario_${index}_precioCosto`] ? 'border-red-500' : ''
                          }`}
                      />
                      {errores[`formulario_${index}_precioCosto`] && (
                        <p className="text-sm text-red-500 mt-1">{errores[`formulario_${index}_precioCosto`]}</p>
                      )}
                    </div>

                    <div className="mb-2">
                      <label className="block text-sm font-medium text-gray-700">Precio Venta:</label>
                      <input
                        type="number"
                        value={formulario.precioVenta || ''}
                        onChange={e => handleFormularioChange(index, 'precioVenta', e.target.value)}
                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${errores[`formulario_${index}_precioVenta`] ? 'border-red-500' : ''
                          }`}
                      />
                      {errores[`formulario_${index}_precioVenta`] && (
                        <p className="text-sm text-red-500 mt-1">{errores[`formulario_${index}_precioVenta`]}</p>
                      )}
                    </div>

                    <div className="mb-2">
                      <label className="block text-sm font-medium text-gray-700">Precio Oferta:</label>
                      <input
                        type="number"
                        value={formulario.precioOferta || ''}
                        onChange={e => handleFormularioChange(index, 'precioOferta', e.target.value)}
                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${errores[`formulario_${index}_precioOferta`] ? 'border-red-500' : ''
                          }`}
                      />
                      {errores[`formulario_${index}_precioOferta`] && (
                        <p className="text-sm text-red-500 mt-1">{errores[`formulario_${index}_precioOferta`]}</p>
                      )}
                    </div>
                  </>
                )}

                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700">Stock:</label>
                  <input
                    type="number"
                    value={formulario.stock || ''}
                    onChange={e => handleFormularioChange(index, 'stock', e.target.value)}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${errores[`formulario_${index}_stock`] ? 'border-red-500' : ''
                      }`}
                  />
                  {errores[`formulario_${index}_stock`] && (
                    <p className="text-sm text-red-500 mt-1">{errores[`formulario_${index}_stock`]}</p>
                  )}
                </div>

                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700">SKU:</label>
                  <input
                    type="text"
                    value={formulario.sku || ''}
                    onChange={e => handleFormularioChange(index, 'sku', e.target.value)}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${errores[`formulario_${index}_sku`] ? 'border-red-500' : ''
                      }`}
                  />
                  {errores[`formulario_${index}_sku`] && (
                    <p className="text-sm text-red-500 mt-1">{errores[`formulario_${index}_sku`]}</p>
                  )}
                </div>

                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700">Imagen:</label>
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    {imagenes.map((imagen) => (
                      <div
                        key={imagen.id}
                        className={`cursor-pointer border rounded-md p-1 ${formulario.imagen_url === imagen.url ? 'border-blue-500' : 'border-gray-300'
                          }`}
                        onClick={() => handleFormularioChange(index, 'imagen_url', imagen.url)}
                        style={{ width: '100px', height: '100px' }} // Contenedor cuadrado
                      >
                        <img
                          src={`${config.backendUrl}${imagen.url}`}
                          alt={`Imagen ${imagen.id}`}
                          className="w-full h-full object-cover rounded-md" // Imagen ajustada al contenedor
                        />
                      </div>
                    ))}
                  </div>
                  {formulario.imagen_url && (
                    <p className="text-sm text-gray-600 mt-2">Imagen seleccionada: {formulario.imagen_url}</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleEliminarVariante(index)}
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
          <button type="submit" className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md text-sm hover:bg-blue-100">Guardar Cambios</button>
          <button type="button" onClick={() => navigate('/productos')} className="px-4 py-2 border border-red-600 text-red-600 rounded-md text-sm hover:bg-red-100">Cancelar</button>
        </div>
      </form>
    </div>
  );
};

export default ModificarProducto;
