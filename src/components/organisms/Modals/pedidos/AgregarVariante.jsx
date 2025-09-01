import React from 'react';

/**
 * ModalAgregarVariante
 * Modal reutilizable para agregar o editar una variante de producto (atributos dinámicos, cantidad y precio_costo).
 * Props:
 * - isOpen: boolean
 * - atributos: array de atributos [{ atributo_nombre }]
 * - varianteDraft: objeto draft de la variante
 * - setVarianteDraft: setter para el draft
 * - onAgregar: función a ejecutar al agregar (ej: guardar variante)
 * - onClose: función para cerrar el modal
 * - loadingAgregar: boolean opcional para mostrar loading en el botón Agregar
 *
 * NOTA: Para que los campos cantidad y precio_costo estén vacíos al abrir el modal,
 * inicializa el draft así:
 *   const initial = {};
 *   atributos.forEach(a => { initial[a.atributo_nombre] = ''; });
 *   initial.cantidad = '';
 *   initial.precio_costo = '';
 *   setVarianteDraft(initial);
 * Así los inputs estarán vacíos y no mostrarán 1 ni 0 por defecto.
 */
const ModalAgregarVariante = ({
  isOpen,
  atributos = [],
  varianteDraft = {},
  setVarianteDraft,
  onAgregar,
  onClose,
  loadingAgregar = false
}) => {
  if (!isOpen) return null;

  // Orden de inputs para navegación con Enter
  const inputOrder = [
    ...atributos.map(a => a.atributo_nombre),
    'cantidad',
    'precio_costo'
  ];

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-lg font-semibold text-gray-800">Agregar Variante</h4>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-4">
          {atributos.map((attr, i) => (
            <div key={attr.atributo_nombre} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 capitalize">
                {attr.atributo_nombre}
              </label>
              <input
                type="text"
                className="w-full px-3 py-2.5 border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition duration-150 placeholder-gray-400"
                placeholder={`Ingrese ${attr.atributo_nombre}`}
                value={varianteDraft[attr.atributo_nombre] || ''}
                onChange={e => setVarianteDraft(v => ({ ...v, [attr.atributo_nombre]: e.target.value }))}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const idx = inputOrder.indexOf(attr.atributo_nombre);
                    const next = inputOrder[idx + 1];
                    if (next) {
                      const form = e.target.form;
                      const nextInput = form?.elements.namedItem(next);
                      if (nextInput) nextInput.focus();
                    } else {
                      onAgregar();
                    }
                  }
                }}
                name={attr.atributo_nombre}
              />
            </div>
          ))}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Cantidad</label>
              <input
                type="number"
                min="1"
                className="w-full px-3 py-2.5 border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition duration-150 placeholder-gray-400"
                placeholder="0"
                value={
                  varianteDraft.cantidad === undefined || varianteDraft.cantidad === null || varianteDraft.cantidad === ''
                    ? ''
                    : varianteDraft.cantidad
                }
                onChange={e => {
                  const val = e.target.value;
                  setVarianteDraft(v => ({ ...v, cantidad: val === '' ? '' : Number(val) }));
                }}
                onFocus={e => {
                  if (e.target.value === '0' || e.target.value === '1') {
                    e.target.value = '';
                    setVarianteDraft(v => ({ ...v, cantidad: '' }));
                  }
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const idx = inputOrder.indexOf('cantidad');
                    const next = inputOrder[idx + 1];
                    if (next) {
                      const form = e.target.form;
                      const nextInput = form?.elements.namedItem(next);
                      if (nextInput) nextInput.focus();
                    } else {
                      onAgregar();
                    }
                  }
                }}
                name="cantidad"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Precio Costo</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="w-full px-3 py-2.5 border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition duration-150 placeholder-gray-400"
                placeholder="0.00"
                value={
                  varianteDraft.precio_costo === undefined || varianteDraft.precio_costo === null || varianteDraft.precio_costo === ''
                    ? ''
                    : varianteDraft.precio_costo
                }
                onChange={e => {
                  const val = e.target.value;
                  setVarianteDraft(v => ({ ...v, precio_costo: val === '' ? '' : Number(val) }));
                }}
                onFocus={e => {
                  if (e.target.value === '0') {
                    e.target.value = '';
                    setVarianteDraft(v => ({ ...v, precio_costo: '' }));
                  }
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    onAgregar();
                  }
                }}
                name="precio_costo"
              />
            </div>
          </div>
        </div>
        
        <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
          <button 
            type="button" 
            className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg border border-gray-300 shadow-sm transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400" 
            onClick={onClose}
          >
            Cancelar
          </button>
          <button 
            type="button" 
            className="flex-1 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-medium rounded-lg shadow-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:cursor-not-allowed" 
            onClick={onAgregar} 
            disabled={loadingAgregar}
          >
            {loadingAgregar ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Agregando...
              </div>
            ) : (
              'Agregar Variante'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalAgregarVariante;
