import React from 'react';
import { origenesVenta } from '../../../api/ventasApi';

const DatosVenta = ({ 
  estadoPago, 
  onEstadoPagoChange,
  origen,
  onOrigenChange,
  nota,
  onNotaChange 
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
      {/* Estado de Pago */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-3">Estados del pago</h3>
        <div className="space-y-3">
          <div className="flex items-start">
            <input
              type="radio"
              id="pago-pendiente"
              name="estado-pago"
              value="pendiente"
              checked={estadoPago === 'pendiente'}
              onChange={() => onEstadoPagoChange('pendiente')}
              className="mt-1"
            />
            <label htmlFor="pago-pendiente" className="ml-2 cursor-pointer">
              <div className="font-medium">Pago pendiente</div>
              <div className="text-sm text-gray-600">
                Todavía no recibí el pago, pero quiero reservar el stock para mi cliente.
              </div>
            </label>
          </div>
          
          <div className="flex items-start">
            <input
              type="radio"
              id="pago-finalizado"
              name="estado-pago"
              value="abonado"
              checked={estadoPago === 'abonado'}
              onChange={() => onEstadoPagoChange('abonado')}
              className="mt-1"
            />
            <label htmlFor="pago-finalizado" className="ml-2 cursor-pointer">
              <div className="font-medium">Pago finalizado</div>
              <div className="text-sm text-gray-600">
                Ya recibí el dinero y quiero descontar el producto de mi stock.
              </div>
            </label>
          </div>
        </div>
      </div>
      
      {/* Origen de venta */}
      <div className="mb-4">
        <h3 className="text-lg font-bold mb-3">Origen de venta <span className="text-sm font-normal text-gray-500">(opcional)</span></h3>
        <select
          value={origen}
          onChange={(e) => onOrigenChange(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 w-full"
        >
          {origenesVenta.map((origen) => (
            <option key={origen.value} value={origen.value}>
              {origen.label}
            </option>
          ))}
        </select>
      </div>
      
      {/* Nota de venta */}
      <div>
        <h3 className="text-lg font-bold mb-3">Nota de venta <span className="text-sm font-normal text-gray-500">(opcional)</span></h3>
        <textarea
          value={nota}
          onChange={(e) => onNotaChange(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 w-full h-24 resize-none"
          placeholder="Ingrese observaciones adicionales..."
          maxLength={150}
        ></textarea>
        <div className="text-right text-sm text-gray-500">
          {nota.length}/150
        </div>
      </div>
    </div>
  );
};

export default DatosVenta;