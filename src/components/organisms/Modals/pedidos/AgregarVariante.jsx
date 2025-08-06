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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 w-full max-w-xs flex flex-col gap-2">
        <h4 className="font-semibold mb-2">Agregar variante</h4>
        {atributos.map((attr, i) => (
          <div key={attr.atributo_nombre} className="flex flex-col mb-1">
            <label className="text-xs text-gray-600 mb-0.5">{attr.atributo_nombre}</label>
            <input
              type="text"
              className="input input-bordered input-xs"
              placeholder={attr.atributo_nombre}
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
        <div className="flex flex-col mb-1">
          <label className="text-xs text-gray-600 mb-0.5">Cantidad</label>
          <input
            type="number"
            min="1"
            className="input input-bordered input-xs"
            placeholder="Cantidad"
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
        <div className="flex flex-col mb-1">
          <label className="text-xs text-gray-600 mb-0.5">Precio costo</label>
          <input
            type="number"
            min="0"
            step="0.01"
            className="input input-bordered input-xs"
            placeholder="Precio costo"
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
        <div className="flex gap-2 mt-2">
          <button type="button" className="btn btn-xs btn-primary flex-1" onClick={onAgregar} disabled={loadingAgregar}>Agregar</button>
          <button type="button" className="btn btn-xs btn-outline flex-1" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
};

export default ModalAgregarVariante;
