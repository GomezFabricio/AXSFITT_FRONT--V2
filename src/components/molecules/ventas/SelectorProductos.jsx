import React, { useState, useEffect } from 'react';
import { buscarProductosParaVenta } from '../../../api/ventasApi';
import config from '../../../config/config';

const SelectorProductos = ({ onProductosSeleccionados }) => {
  const [showModal, setShowModal] = useState(false);
  const [productos, setProductos] = useState([]);
  const [seleccionados, setSeleccionados] = useState([]);
  const [termino, setTermino] = useState('');
  const [loading, setLoading] = useState(false);

  // Cargar productos iniciales cuando se abre el modal
  useEffect(() => {
    if (showModal) {
      cargarProductos();
    }
  }, [showModal]);

  // Buscar productos con término o cargar destacados si no hay término
  const cargarProductos = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token');
      const productosData = await buscarProductosParaVenta(termino, token);
      setProductos(productosData);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Buscar al escribir
  const handleSearchChange = (e) => {
    setTermino(e.target.value);
  };

  // Buscar al presionar enter o el botón
  const handleSearch = () => {
    cargarProductos();
  };

  // Seleccionar/deseleccionar un producto
  const toggleSeleccion = (producto) => {
    if (seleccionados.find(p => p.producto_id === producto.producto_id)) {
      setSeleccionados(prev => prev.filter(p => p.producto_id !== producto.producto_id));
    } else {
      setSeleccionados(prev => [...prev, producto]);
    }
  };

  // Confirmar selección y cerrar modal
  const confirmarSeleccion = () => {
    onProductosSeleccionados(seleccionados);
    setSeleccionados([]);
    setShowModal(false);
  };

  return (
    <>
      {/* Botón para abrir el modal */}
      <div className="mb-4">
        <button
          onClick={() => setShowModal(true)}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
        >
          Agregar producto
        </button>
      </div>

      {/* Modal de selección de productos */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Seleccionar Productos</h2>
            
            {/* Buscador de productos */}
            <div className="flex mb-4">
              <input
                type="text"
                value={termino}
                onChange={handleSearchChange}
                placeholder="Buscar productos..."
                className="border rounded-l px-4 py-2 w-full"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button 
                onClick={handleSearch}
                className="bg-blue-500 text-white px-4 py-2 rounded-r"
              >
                Buscar
              </button>
            </div>
            
            {/* Lista de productos */}
            <div className="mb-4 space-y-2">
              {loading ? (
                <p className="text-center">Cargando productos...</p>
              ) : productos.length > 0 ? (
                productos.map(producto => (
                  <div 
                    key={producto.producto_id}
                    className={`flex items-center p-2 border rounded ${
                      seleccionados.find(p => p.producto_id === producto.producto_id) 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={!!seleccionados.find(p => p.producto_id === producto.producto_id)}
                      onChange={() => toggleSeleccion(producto)}
                      className="mr-2"
                    />
                    <div className="flex items-center flex-1">
                      {producto.imagen_url && (
                        <img 
                          src={`${config.backendUrl}${producto.imagen_url}`} 
                          alt={producto.producto_nombre} 
                          className="w-12 h-12 object-cover rounded mr-3"
                        />
                      )}
                      <div>
                        <p className="font-medium">{producto.producto_nombre}</p>
                        <p className="text-sm text-gray-600">
                          ${(producto.producto_precio_oferta || producto.producto_precio_venta || 0).toLocaleString('es-AR', {minimumFractionDigits: 2})}
                          {producto.producto_precio_oferta && producto.producto_precio_venta && (
                            <span className="line-through ml-2 text-gray-500">
                              ${producto.producto_precio_venta.toLocaleString('es-AR', {minimumFractionDigits: 2})}
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500">Stock: {producto.stock || 0}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500">No se encontraron productos.</p>
              )}
            </div>
            
            {/* Botones de acción */}
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSeleccionados([]);
                }}
                className="px-4 py-2 border border-gray-300 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarSeleccion}
                disabled={seleccionados.length === 0}
                className={`px-4 py-2 rounded text-white ${
                  seleccionados.length > 0 
                    ? 'bg-blue-500 hover:bg-blue-600' 
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                Agregar {seleccionados.length > 0 && `(${seleccionados.length})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SelectorProductos;