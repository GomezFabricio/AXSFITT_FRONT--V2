import React, { useState } from 'react';
import { FiX, FiPlus, FiMinus, FiPackage, FiDollarSign, FiTag } from 'react-icons/fi';

const ProductoSinRegistrarForm = ({ open, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    precio: '',
    cantidad: 1,
    observaciones: '',
    variantes: []
  });
  
  const [variantes, setVariantes] = useState([]);
  const [showVariantes, setShowVariantes] = useState(false);
  const [errores, setErrores] = useState({});

  // Resetear formulario al abrir/cerrar
  React.useEffect(() => {
    if (open) {
      setFormData({
        nombre: '',
        precio: '',
        cantidad: 1,
        observaciones: '',
        variantes: []
      });
      setVariantes([]);
      setShowVariantes(false);
      setErrores({});
    }
  }, [open]);

  // Agregar nueva variante
  const agregarVariante = () => {
    setVariantes(prev => [...prev, {
      id: Date.now(),
      nombre: '',
      valor: '',
      precio_adicional: 0,
      cantidad: 1
    }]);
  };

  // Actualizar variante
  const actualizarVariante = (id, campo, valor) => {
    setVariantes(prev => prev.map(variante => 
      variante.id === id ? { ...variante, [campo]: valor } : variante
    ));
  };

  // Eliminar variante
  const eliminarVariante = (id) => {
    setVariantes(prev => prev.filter(variante => variante.id !== id));
  };

  // Validar formulario
  const validarFormulario = () => {
    const nuevosErrores = {};
    let esValido = true;

    // Validar campos básicos
    if (!formData.nombre?.trim()) {
      nuevosErrores.nombre = 'El nombre del producto es requerido';
      esValido = false;
    }

    const precio = parseFloat(formData.precio);
    if (!precio || precio <= 0) {
      nuevosErrores.precio = 'El precio debe ser mayor a 0';
      esValido = false;
    }

    const cantidad = parseInt(formData.cantidad);
    if (!cantidad || cantidad <= 0) {
      nuevosErrores.cantidad = 'La cantidad debe ser mayor a 0';
      esValido = false;
    }

    // Validar variantes si existen
    if (showVariantes && variantes.length > 0) {
      variantes.forEach((variante, index) => {
        if (!variante.nombre?.trim()) {
          nuevosErrores[`variante_nombre_${index}`] = 'El nombre de la variante es requerido';
          esValido = false;
        }
        
        if (!variante.valor?.trim()) {
          nuevosErrores[`variante_valor_${index}`] = 'El valor de la variante es requerido';
          esValido = false;
        }

        const cantidadVariante = parseInt(variante.cantidad);
        if (!cantidadVariante || cantidadVariante <= 0) {
          nuevosErrores[`variante_cantidad_${index}`] = 'La cantidad debe ser mayor a 0';
          esValido = false;
        }
      });
    }

    setErrores(nuevosErrores);
    return esValido;
  };

  // Calcular totales
  const calcularTotales = () => {
    const precioBase = parseFloat(formData.precio) || 0;
    const cantidadBase = parseInt(formData.cantidad) || 0;
    
    let totalSinVariantes = precioBase * cantidadBase;
    let totalConVariantes = 0;
    let cantidadTotalVariantes = 0;

    if (showVariantes && variantes.length > 0) {
      variantes.forEach(variante => {
        const precioVariante = precioBase + (parseFloat(variante.precio_adicional) || 0);
        const cantidadVariante = parseInt(variante.cantidad) || 0;
        totalConVariantes += precioVariante * cantidadVariante;
        cantidadTotalVariantes += cantidadVariante;
      });
    }

    return {
      totalSinVariantes,
      totalConVariantes,
      totalGeneral: showVariantes && variantes.length > 0 ? totalConVariantes : totalSinVariantes,
      cantidadTotal: showVariantes && variantes.length > 0 ? cantidadTotalVariantes : cantidadBase
    };
  };

  const totales = calcularTotales();

  // Manejar envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }

    const productoData = {
      nombre: formData.nombre.trim(),
      precio: parseFloat(formData.precio),
      cantidad: showVariantes && variantes.length > 0 ? totales.cantidadTotal : parseInt(formData.cantidad),
      observaciones: formData.observaciones?.trim() || '',
      variantes: showVariantes ? variantes.map(v => ({
        nombre: v.nombre.trim(),
        valor: v.valor.trim(),
        precio_adicional: parseFloat(v.precio_adicional) || 0,
        cantidad: parseInt(v.cantidad)
      })) : [],
      total: totales.totalGeneral,
      es_producto_sin_registrar: true
    };

    onSubmit(productoData);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden m-4">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <FiPackage className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Agregar Producto Sin Registrar</h2>
              <p className="text-gray-600">Producto nuevo para registrar durante la recepción</p>
            </div>
          </div>
          <button 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors" 
            onClick={onClose}
          >
            <FiX className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            
            {/* Información básica del producto */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Información Básica</h3>
              
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errores.nombre ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Ej: Proteína Whey sabor vainilla"
                />
                {errores.nombre && (
                  <p className="text-xs text-red-500 mt-1">{errores.nombre}</p>
                )}
              </div>

              {/* Precio y Cantidad */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Precio Unitario *
                  </label>
                  <div className="relative">
                    <FiDollarSign className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      value={formData.precio}
                      onChange={(e) => setFormData(prev => ({ ...prev, precio: e.target.value }))}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                        errores.precio ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  {errores.precio && (
                    <p className="text-xs text-red-500 mt-1">{errores.precio}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cantidad Recibida *
                  </label>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, cantidad: Math.max(1, prev.cantidad - 1) }))}
                      className="p-2 hover:bg-gray-100 border border-gray-300 rounded-lg"
                    >
                      <FiMinus className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      value={formData.cantidad}
                      onChange={(e) => setFormData(prev => ({ ...prev, cantidad: Math.max(1, parseInt(e.target.value) || 1) }))}
                      className={`flex-1 px-3 py-2 border rounded-lg text-center focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                        errores.cantidad ? 'border-red-300' : 'border-gray-300'
                      }`}
                      min="1"
                      disabled={showVariantes && variantes.length > 0}
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, cantidad: prev.cantidad + 1 }))}
                      className="p-2 hover:bg-gray-100 border border-gray-300 rounded-lg"
                      disabled={showVariantes && variantes.length > 0}
                    >
                      <FiPlus className="w-4 h-4" />
                    </button>
                  </div>
                  {errores.cantidad && (
                    <p className="text-xs text-red-500 mt-1">{errores.cantidad}</p>
                  )}
                  {showVariantes && variantes.length > 0 && (
                    <p className="text-xs text-amber-600 mt-1">Cantidad calculada por variantes</p>
                  )}
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Notas adicionales sobre el producto (opcional)..."
                />
              </div>
            </div>

            {/* Variantes */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Variantes del Producto</h3>
                  <p className="text-sm text-gray-600">Opcional: Agregar variantes como tallas, colores, sabores, etc.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowVariantes(!showVariantes)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    showVariantes 
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  {showVariantes ? 'Ocultar Variantes' : 'Agregar Variantes'}
                </button>
              </div>

              {showVariantes && (
                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={agregarVariante}
                    className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors flex items-center justify-center space-x-2 text-gray-600"
                  >
                    <FiPlus className="w-4 h-4" />
                    <span>Agregar Nueva Variante</span>
                  </button>

                  {variantes.map((variante, index) => (
                    <div key={variante.id} className="bg-gray-50 p-4 rounded-lg border">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-800 flex items-center">
                          <FiTag className="w-4 h-4 mr-2" />
                          Variante {index + 1}
                        </h4>
                        <button
                          type="button"
                          onClick={() => eliminarVariante(variante.id)}
                          className="p-1 text-red-500 hover:bg-red-100 rounded"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Atributo (ej: Talla, Color) *
                          </label>
                          <input
                            type="text"
                            value={variante.nombre}
                            onChange={(e) => actualizarVariante(variante.id, 'nombre', e.target.value)}
                            className={`w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-green-500 focus:border-green-500 ${
                              errores[`variante_nombre_${index}`] ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="Talla"
                          />
                          {errores[`variante_nombre_${index}`] && (
                            <p className="text-xs text-red-500 mt-1">{errores[`variante_nombre_${index}`]}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Valor (ej: XL, Rojo) *
                          </label>
                          <input
                            type="text"
                            value={variante.valor}
                            onChange={(e) => actualizarVariante(variante.id, 'valor', e.target.value)}
                            className={`w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-green-500 focus:border-green-500 ${
                              errores[`variante_valor_${index}`] ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="XL"
                          />
                          {errores[`variante_valor_${index}`] && (
                            <p className="text-xs text-red-500 mt-1">{errores[`variante_valor_${index}`]}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Precio Adicional
                          </label>
                          <input
                            type="number"
                            value={variante.precio_adicional}
                            onChange={(e) => actualizarVariante(variante.id, 'precio_adicional', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-green-500 focus:border-green-500"
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Cantidad *
                          </label>
                          <input
                            type="number"
                            value={variante.cantidad}
                            onChange={(e) => actualizarVariante(variante.id, 'cantidad', Math.max(1, parseInt(e.target.value) || 1))}
                            className={`w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-green-500 focus:border-green-500 ${
                              errores[`variante_cantidad_${index}`] ? 'border-red-300' : 'border-gray-300'
                            }`}
                            min="1"
                          />
                          {errores[`variante_cantidad_${index}`] && (
                            <p className="text-xs text-red-500 mt-1">{errores[`variante_cantidad_${index}`]}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Resumen */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-800 mb-2">Resumen del Producto</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">Cantidad Total:</span>
                  <span className="font-medium">{totales.cantidadTotal} unidades</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Precio Base:</span>
                  <span className="font-medium">${parseFloat(formData.precio || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-green-200 pt-1">
                  <span className="text-green-700 font-medium">Total:</span>
                  <span className="font-bold text-green-800">${totales.totalGeneral.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center space-x-2"
          >
            <FiPlus className="w-4 h-4" />
            <span>Agregar Producto</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductoSinRegistrarForm;