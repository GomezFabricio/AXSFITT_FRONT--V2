import React, { useState } from 'react';
import { buscarClientes } from '../../../api/clientesApi';

const DatosCliente = ({ 
  cliente, 
  onClienteChange, 
  clienteSeleccionado, 
  onClienteSeleccionado,
  errores
}) => {
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
  const [buscando, setBuscando] = useState(false);

  // Función para buscar clientes
  const buscarClientePorTermino = async () => {
    if (!terminoBusqueda) return;
    
    try {
      setBuscando(true);
      const token = sessionStorage.getItem('token');
      const clientes = await buscarClientes(terminoBusqueda, token);
      setResultadosBusqueda(clientes);
    } catch (error) {
      console.error('Error al buscar clientes:', error);
    } finally {
      setBuscando(false);
    }
  };

  // Seleccionar un cliente de los resultados
  const seleccionarCliente = (cliente) => {
    onClienteSeleccionado(cliente);
    onClienteChange('nombre', cliente.persona_nombre);
    onClienteChange('apellido', cliente.persona_apellido);
    onClienteChange('email', cliente.cliente_email);
    onClienteChange('telefono', cliente.persona_telefono || '');
    onClienteChange('dni', cliente.persona_dni || '');
    
    // Limpiar búsqueda
    setTerminoBusqueda('');
    setResultadosBusqueda([]);
  };

  // Limpiar cliente seleccionado
  const limpiarSeleccion = () => {
    onClienteSeleccionado(null);
    
    // Limpiar formulario
    onClienteChange('nombre', '');
    onClienteChange('apellido', '');
    onClienteChange('email', '');
    onClienteChange('telefono', '');
    onClienteChange('dni', '');
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
      <h2 className="text-lg font-bold mb-4">Datos del cliente</h2>

      {/* Buscador de clientes */}
      <div className="mb-4">
        <div className="flex mb-2">
          <input
            type="text"
            value={terminoBusqueda}
            onChange={(e) => setTerminoBusqueda(e.target.value)}
            className="border rounded-l px-3 py-2 w-full"
            placeholder="Buscar cliente por nombre, email o DNI..."
            onKeyDown={(e) => e.key === 'Enter' && buscarClientePorTermino()}
          />
          <button
            onClick={buscarClientePorTermino}
            className="bg-blue-500 text-white px-4 py-2 rounded-r"
            disabled={buscando}
          >
            {buscando ? 'Buscando...' : 'Buscar'}
          </button>
        </div>

        {/* Resultados de búsqueda */}
        {resultadosBusqueda.length > 0 && (
          <div className="border rounded-md overflow-hidden mb-4">
            <div className="max-h-48 overflow-y-auto">
              {resultadosBusqueda.map((cliente) => (
                <div
                  key={cliente.cliente_id}
                  className="p-2 border-b hover:bg-gray-100 cursor-pointer"
                  onClick={() => seleccionarCliente(cliente)}
                >
                  <p className="font-medium">{cliente.persona_nombre} {cliente.persona_apellido}</p>
                  <p className="text-sm text-gray-600">{cliente.cliente_email}</p>
                  {cliente.persona_dni && (
                    <p className="text-sm text-gray-600">DNI: {cliente.persona_dni}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Cliente seleccionado */}
        {clienteSeleccionado && (
          <div className="p-2 border rounded-md bg-blue-50 mb-4 flex justify-between items-center">
            <div>
              <p className="font-medium">Cliente seleccionado:</p>
              <p>{clienteSeleccionado.persona_nombre} {clienteSeleccionado.persona_apellido}</p>
              <p className="text-sm">{clienteSeleccionado.cliente_email}</p>
            </div>
            <button
              onClick={limpiarSeleccion}
              className="text-red-500 hover:text-red-700"
            >
              Cambiar cliente
            </button>
          </div>
        )}
      </div>

      {/* Formulario de datos del cliente */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
          <input
            type="text"
            value={cliente.nombre}
            onChange={(e) => onClienteChange('nombre', e.target.value)}
            className={`border rounded w-full px-3 py-2 ${
              errores.nombre ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={!!clienteSeleccionado}
            required
          />
          {errores.nombre && (
            <p className="text-red-500 text-sm mt-1">{errores.nombre}</p>
          )}
        </div>
        
        {/* Apellido */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
          <input
            type="text"
            value={cliente.apellido}
            onChange={(e) => onClienteChange('apellido', e.target.value)}
            className={`border rounded w-full px-3 py-2 ${
              errores.apellido ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={!!clienteSeleccionado}
            required
          />
          {errores.apellido && (
            <p className="text-red-500 text-sm mt-1">{errores.apellido}</p>
          )}
        </div>
        
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={cliente.email}
            onChange={(e) => onClienteChange('email', e.target.value)}
            className={`border rounded w-full px-3 py-2 ${
              errores.email ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={!!clienteSeleccionado}
            required
          />
          {errores.email && (
            <p className="text-red-500 text-sm mt-1">{errores.email}</p>
          )}
        </div>
        
        {/* Teléfono */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
          <input
            type="tel"
            value={cliente.telefono}
            onChange={(e) => onClienteChange('telefono', e.target.value)}
            className={`border rounded w-full px-3 py-2 ${
              errores.telefono ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={!!clienteSeleccionado}
            required
          />
          {errores.telefono && (
            <p className="text-red-500 text-sm mt-1">{errores.telefono}</p>
          )}
        </div>
        
        {/* DNI/CUIT */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">DNI o CUIT</label>
          <input
            type="text"
            value={cliente.dni}
            onChange={(e) => onClienteChange('dni', e.target.value)}
            className={`border rounded w-full px-3 py-2 ${
              errores.dni ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={!!clienteSeleccionado}
            required
          />
          {errores.dni && (
            <p className="text-red-500 text-sm mt-1">{errores.dni}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DatosCliente;