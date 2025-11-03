import React, { useState } from 'react';
import { FiX, FiPackage, FiDollarSign, FiCheck, FiPlus, FiMinus } from 'react-icons/fi';

const RegistrarProductoBorradorModal = ({ open, onClose, onSubmit, producto, tipo }) => {
  const [formData, setFormData] = useState({
    nombre: producto?.nombre || '',
    precio_costo: producto?.precio || '',
    cantidad: producto?.cantidad || 1,
    categoria_id: '',
    observaciones: ''
  });
  
  const [atributos, setAtributos] = useState(
    producto?.atributos ? Object.entries(producto.atributos).map(([key, value]) => ({ nombre: key, valor: value })) : []
  );
  
  const [errores, setErrores] = useState({});

  // Resetear formulario al abrir
  React.useEffect(() => {
    if (open && producto) {
      setFormData({
        nombre: producto.nombre || '',
        precio_costo: producto.precio || '',
        cantidad: producto.cantidad || 1,
        categoria_id: '',
        observaciones: producto.observaciones || ''
      });
      
      if (producto.atributos) {
        setAtributos(Object.entries(producto.atributos).map(([key, value]) => ({ nombre: key, valor: value })));
      }
    }
  }, [open, producto]);

  // Validar formulario
  const validarFormulario = () => {
    const nuevosErrores = {};
    let esValido = true;

    if (!formData.nombre?.trim()) {
      nuevosErrores.nombre = 'El nombre del producto es requerido';
      esValido = false;
    }

    const precio = parseFloat(formData.precio_costo);
    if (!precio || precio <= 0) {
      nuevosErrores.precio_costo = 'El precio de costo debe ser mayor a 0';
      esValido = false;
    }

    setErrores(nuevosErrores);
    return esValido;
  };

  // Agregar nuevo atributo
  const agregarAtributo = () => {
    setAtributos(prev => [...prev, { nombre: '', valor: '' }]);
  };

  // Actualizar atributo
  const actualizarAtributo = (index, campo, valor) => {
    setAtributos(prev => prev.map((attr, i) => 
      i === index ? { ...attr, [campo]: valor } : attr
    ));
  };

  // Eliminar atributo
  const eliminarAtributo = (index) => {
    setAtributos(prev => prev.filter((_, i) => i !== index));
  };

  // Manejar envío
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }

    // Convertir atributos a objeto
    const atributosObj = {};
    atributos.forEach(attr => {
      if (attr.nombre?.trim() && attr.valor?.trim()) {
        atributosObj[attr.nombre.trim()] = attr.valor.trim();
      }
    });

    const productoData = {
      nombre: formData.nombre.trim(),
      precio_costo: parseFloat(formData.precio_costo),
      cantidad: parseInt(formData.cantidad),
      categoria_id: formData.categoria_id || null,
      observaciones: formData.observaciones?.trim() || '',
      atributos: atributosObj,
      tipo_registro: tipo // 'producto_completo' o 'variante_nueva'
    };

    onSubmit(productoData);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl max-w-xl w-full max-h-[90vh] overflow-hidden m-4">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FiPackage className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {tipo === 'variante_nueva' ? 'Registrar Nueva Variante' : 'Registrar Producto Completo'}
              </h2>
              <p className="text-sm text-gray-600">
                {tipo === 'variante_nueva' 
                  ? 'Agregar variante a producto existente'
                  : 'Crear producto nuevo en el sistema'
                }
              </p>
            </div>
          </div>
          <button 
            className="p-1 hover:bg-gray-100 rounded" 
            onClick={onClose}
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          
          {/* Información básica */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-800">Información Básica</h3>
            
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Producto *
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errores.nombre ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Nombre del producto"
                disabled={tipo === 'variante_nueva'} // Solo lectura para variantes
              />
              {errores.nombre && (
                <p className="text-xs text-red-500 mt-1">{errores.nombre}</p>
              )}
            </div>

            {/* Precio y Cantidad */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio de Costo *
                </label>
                <div className="relative">
                  <FiDollarSign className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    value={formData.precio_costo}
                    onChange={(e) => setFormData(prev => ({ ...prev, precio_costo: e.target.value }))}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errores.precio_costo ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
                {errores.precio_costo && (
                  <p className="text-xs text-red-500 mt-1">{errores.precio_costo}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cantidad Recibida
                </label>
                <input
                  type="number"
                  value={formData.cantidad}
                  onChange={(e) => setFormData(prev => ({ ...prev, cantidad: Math.max(1, parseInt(e.target.value) || 1) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                  readOnly // Solo lectura, se toma del pedido
                />
              </div>
            </div>

            {/* Observaciones */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observaciones
              </label>
              <textarea
                value={formData.observaciones}
                onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Notas adicionales (opcional)"
              />
            </div>
          </div>

          {/* Atributos/Variantes */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-800">
                {tipo === 'variante_nueva' ? 'Atributos de la Variante' : 'Atributos del Producto'}
              </h3>
              <button
                type="button"
                onClick={agregarAtributo}
                className="text-sm px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition-colors flex items-center space-x-1"
              >
                <FiPlus className="w-3 h-3" />
                <span>Agregar</span>
              </button>
            </div>

            <div className="space-y-2">
              {atributos.map((attr, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={attr.nombre}
                    onChange={(e) => actualizarAtributo(index, 'nombre', e.target.value)}
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ej: Sabor, Talla, Color"
                  />
                  <span className="text-gray-400">:</span>
                  <input
                    type="text"
                    value={attr.valor}
                    onChange={(e) => actualizarAtributo(index, 'valor', e.target.value)}
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ej: Chocolate, XL, Azul"
                  />
                  <button
                    type="button"
                    onClick={() => eliminarAtributo(index)}
                    className="p-1 text-red-500 hover:bg-red-100 rounded"
                  >
                    <FiMinus className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              {atributos.length === 0 && (
                <div className="text-sm text-gray-500 italic text-center py-2">
                  No hay atributos definidos. Los atributos ayudan a diferenciar variantes.
                </div>
              )}
            </div>
          </div>

          {/* Resumen */}
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-1">Resumen</h4>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">Producto:</span>
                <span className="font-medium">{formData.nombre || 'Sin nombre'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Precio de costo:</span>
                <span className="font-medium">${parseFloat(formData.precio_costo || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cantidad:</span>
                <span className="font-medium">{formData.cantidad} unidades</span>
              </div>
              <div className="flex justify-between border-t border-blue-200 pt-1">
                <span className="text-blue-700 font-medium">Subtotal:</span>
                <span className="font-bold text-blue-800">
                  ${(parseFloat(formData.precio_costo || 0) * parseInt(formData.cantidad || 0)).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-4 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
          >
            <FiCheck className="w-4 h-4" />
            <span>
              {tipo === 'variante_nueva' ? 'Registrar Variante' : 'Registrar Producto'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegistrarProductoBorradorModal;