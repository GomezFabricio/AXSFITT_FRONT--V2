import React, { useState, useEffect } from 'react';
import { obtenerVariantesProducto } from '../../../api/ventasApi';
import config from '../../../config/config';

const DetalleProductos = ({ 
  productos, 
  onEliminarProducto, 
  onCantidadChange, 
  onVarianteChange,
  subtotal,
  descuento,
  onDescuentoChange
}) => {
  const total = (subtotal || 0) - ((subtotal || 0) * (descuento / 100));

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
      <h2 className="text-lg font-bold mb-4">Detalle de la orden</h2>
      
      {/* Lista de productos */}
      {productos.length === 0 ? (
        <p className="text-gray-500 italic">No hay productos seleccionados</p>
      ) : (
        <div className="space-y-4 mb-4">
          {productos.map(producto => (
            <ProductoItem 
              key={producto.uniqueId}
              producto={producto}
              onEliminarProducto={onEliminarProducto}
              onCantidadChange={onCantidadChange}
              onVarianteChange={onVarianteChange}
            />
          ))}
        </div>
      )}
      
      {/* Resumen de la orden */}
      <div className="border-t pt-4 mt-4">
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium">Subtotal:</span>
          <span>
            ${typeof subtotal === 'number' 
              ? subtotal.toLocaleString('es-AR', {minimumFractionDigits: 2}) 
              : '0.00'}
          </span>
        </div>
        
        {/* Input de descuento */}
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium">Descuento:</span>
          <div className="flex items-center">
            <input 
              type="number"
              value={descuento}
              onChange={(e) => onDescuentoChange(Number(e.target.value))}
              min="0"
              max="100"
              className="w-16 border rounded px-2 py-1 text-right"
            />
            <span className="ml-1">%</span>
            <span className="ml-2 text-gray-500">
              -${typeof subtotal === 'number' 
                ? ((subtotal * (descuento / 100)) || 0).toLocaleString('es-AR', {minimumFractionDigits: 2})
                : '0.00'}
            </span>
          </div>
        </div>
        
        {/* Total */}
        <div className="flex justify-between items-center font-bold text-lg border-t pt-2 mt-2">
          <span>Total:</span>
          <span>
            ${typeof total === 'number' 
              ? total.toLocaleString('es-AR', {minimumFractionDigits: 2})
              : '0.00'}
          </span>
        </div>
      </div>
    </div>
  );
};

// Subcomponente para cada producto en la lista
const ProductoItem = ({ producto, onEliminarProducto, onCantidadChange, onVarianteChange }) => {
  const [variantes, setVariantes] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Cargar variantes del producto si no están ya cargadas
  useEffect(() => {
    const cargarVariantes = async () => {
      // Si ya tenemos las variantes en el producto, no hace falta llamar a la API
      if (producto.variantes) {
        setVariantes(producto.variantes);
        return;
      }
      
      try {
        setLoading(true);
        const token = sessionStorage.getItem('token');
        const variantesData = await obtenerVariantesProducto(producto.producto_id, token);
        setVariantes(variantesData);
      } catch (error) {
        console.error('Error al cargar variantes:', error);
      } finally {
        setLoading(false);
      }
    };
    
    cargarVariantes();
  }, [producto.producto_id, producto.variantes]);

  // Asegurarnos que precio es un número válido
  const precio = typeof producto.precio === 'number' ? producto.precio : 
                 parseFloat(producto.precio) || 0;
                 
  // Calcular el subtotal correctamente
  const subtotal = precio * (producto.cantidad || 1);

  return (
    <div className="border rounded-md p-3">
      <div className="flex items-start">
        {/* Imagen del producto */}
        {producto.imagen_url && (
          <img 
            src={`${producto.imagen_url.startsWith('http') ? '' : config.backendUrl}${producto.imagen_url}`}
            alt={producto.nombre} 
            className="w-16 h-16 object-cover rounded mr-3"
          />
        )}
        
        <div className="flex-1">
          {/* Nombre y botón de eliminar */}
          <div className="flex justify-between">
            <h3 className="font-medium">{producto.nombre}</h3>
            <button
              onClick={() => onEliminarProducto(producto.uniqueId)}
              className="text-red-500 hover:text-red-700"
            >
              Eliminar
            </button>
          </div>
          
          {/* Selector de variante si hay variantes */}
          {variantes && variantes.length > 0 && (
            <div className="my-2">
              <label className="block text-sm text-gray-600 mb-1">Variante</label>
              <select 
                value={producto.variante_id || ''}
                onChange={(e) => onVarianteChange(producto.uniqueId, e.target.value)}
                className="border rounded px-2 py-1 w-full"
                required
              >
                <option value="">Seleccionar...</option>
                {variantes.map(variante => (
                  <option key={variante.variante_id} value={variante.variante_id}>
                    {variante.descripcion || variante.variante_sku} (Stock: {variante.stock})
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {/* Selector de cantidad y precio */}
          <div className="flex justify-between items-center mt-2">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Cantidad</label>
              <div className="flex items-center">
                <button
                  onClick={() => onCantidadChange(producto.uniqueId, Math.max(1, producto.cantidad - 1))}
                  className="border rounded-l px-2 py-1"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  value={producto.cantidad}
                  onChange={(e) => onCantidadChange(producto.uniqueId, Number(e.target.value))}
                  className="border-t border-b w-12 text-center py-1"
                />
                <button
                  onClick={() => {
                    const maxStock = producto.variante_id 
                      ? (variantes.find(v => v.variante_id === parseInt(producto.variante_id))?.stock || 0) 
                      : producto.stock;
                    onCantidadChange(producto.uniqueId, Math.min(maxStock, producto.cantidad + 1));
                  }}
                  className="border rounded-r px-2 py-1"
                >
                  +
                </button>
              </div>
            </div>
            
            <div className="text-right">
              <span className="block text-sm text-gray-600">Precio unitario</span>
              <span className="font-medium">
                ${precio.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </span>
            </div>
            
            <div className="text-right">
              <span className="block text-sm text-gray-600">Subtotal</span>
              <span className="font-medium">
                ${subtotal.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </span>
            </div>
          </div>
          
          {/* Mostrar stock disponible */}
          <div className="text-sm text-gray-500 mt-1">
            Stock disponible: {
              producto.variante_id 
                ? (variantes.find(v => v.variante_id === parseInt(producto.variante_id))?.stock || 0)
                : producto.stock
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetalleProductos;