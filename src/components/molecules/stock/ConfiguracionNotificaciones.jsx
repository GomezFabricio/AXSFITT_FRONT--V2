import React, { useState, useEffect } from 'react';
import useNotification from '../../../hooks/useNotification';
import config from '../../../config/config';

const ConfiguracionNotificaciones = () => {
  const { success, error: showError } = useNotification();
  const [contactos, setContactos] = useState([]);
  const [configuraciones, setConfiguraciones] = useState({
    email: {
      activo: false,
      frecuencia: 'inmediata',
      horaEnvio: '09:00'
    },
    whatsapp: {
      activo: false,
      frecuencia: 'inmediata',
      horaEnvio: '09:00'
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [mostrarFormContacto, setMostrarFormContacto] = useState(false);
  const [contactoEditando, setContactoEditando] = useState(null);
  const [formContacto, setFormContacto] = useState({
    nombre: '',
    email: '',
    telefono: '',
    tipo: 'email'
  });
  const [emailPrueba, setEmailPrueba] = useState('');

  useEffect(() => {
    cargarConfiguraciones();
  }, []);

  const cargarConfiguraciones = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token');
      
      // Cargar contactos
      const contactosResponse = await fetch(`${config.backendUrl}/api/notificaciones/contactos`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (contactosResponse.ok) {
        const contactosData = await contactosResponse.json();
        setContactos(contactosData.data || []);
      }
      
      // Cargar configuración general
      const configResponse = await fetch(`${config.backendUrl}/api/notificaciones/configuracion`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (configResponse.ok) {
        const configData = await configResponse.json();
        const nuevasConfiguraciones = {};
        
        configData.forEach(config => {
          nuevasConfiguraciones[config.config_tipo] = {
            activo: config.config_activo === 1,
            frecuencia: config.config_frecuencia || 'inmediata',
            horaEnvio: config.config_hora_envio || '09:00'
          };
        });
        
        setConfiguraciones(prev => ({
          ...prev,
          ...nuevasConfiguraciones
        }));
      }
      
    } catch (error) {
      console.error('Error cargando configuraciones:', error);
      showError('Error al cargar configuraciones');
    } finally {
      setLoading(false);
    }
  };

  const agregarDestinatario = async () => {
    if (!nuevoDestinatario.trim()) {
      showError('Por favor ingresa un destinatario válido');
      return;
    }
    
    // Validación básica de email si es tipo email
    if (tipoSeleccionado === 'email' && !nuevoDestinatario.includes('@')) {
      showError('Por favor ingresa un email válido');
      return;
    }
    
    try {
      const token = sessionStorage.getItem('token');
      const nuevosDestinatarios = [...configuraciones[tipoSeleccionado].destinatarios, nuevoDestinatario];
      
      const response = await fetch(`${config.backendUrl}/api/notificaciones/destinatarios/${tipoSeleccionado}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ destinatarios: nuevosDestinatarios })
      });
      
      if (response.ok) {
        setConfiguraciones(prev => ({
          ...prev,
          [tipoSeleccionado]: {
            ...prev[tipoSeleccionado],
            destinatarios: nuevosDestinatarios
          }
        }));
        setNuevoDestinatario('');
        success('Destinatario agregado correctamente');
      } else {
        throw new Error('Error al agregar destinatario');
      }
    } catch (error) {
      console.error('Error:', error);
      showError('Error al agregar destinatario');
    }
  };

  const eliminarDestinatario = async (tipo, index) => {
    try {
      const token = sessionStorage.getItem('token');
      const nuevosDestinatarios = configuraciones[tipo].destinatarios.filter((_, i) => i !== index);
      
      const response = await fetch(`${config.backendUrl}/api/notificaciones/destinatarios/${tipo}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ destinatarios: nuevosDestinatarios })
      });
      
      if (response.ok) {
        setConfiguraciones(prev => ({
          ...prev,
          [tipo]: {
            ...prev[tipo],
            destinatarios: nuevosDestinatarios
          }
        }));
        success('Destinatario eliminado correctamente');
      } else {
        throw new Error('Error al eliminar destinatario');
      }
    } catch (error) {
      console.error('Error:', error);
      showError('Error al eliminar destinatario');
    }
  };

  const toggleNotificaciones = async (tipo) => {
    try {
      const token = sessionStorage.getItem('token');
      const nuevoEstado = !configuraciones[tipo].activo;
      
      const response = await fetch(`${config.backendUrl}/api/notificaciones/toggle/${tipo}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ activo: nuevoEstado })
      });
      
      if (response.ok) {
        setConfiguraciones(prev => ({
          ...prev,
          [tipo]: {
            ...prev[tipo],
            activo: nuevoEstado
          }
        }));
        success(`Notificaciones ${tipo} ${nuevoEstado ? 'activadas' : 'desactivadas'}`);
      } else {
        throw new Error('Error al cambiar estado');
      }
    } catch (error) {
      console.error('Error:', error);
      showError('Error al cambiar estado de notificaciones');
    }
  };

  const enviarPrueba = async () => {
    if (!emailPrueba.trim()) {
      showError('Por favor ingresa un email para la prueba');
      return;
    }
    
    try {
      const token = sessionStorage.getItem('token');
      
      const response = await fetch(`${config.backendUrl}/api/notificaciones/prueba`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          tipo: 'email',
          destinatario: emailPrueba
        })
      });
      
      if (response.ok) {
        success('Email de prueba enviado correctamente');
        setEmailPrueba('');
      } else {
        throw new Error('Error al enviar email de prueba');
      }
    } catch (error) {
      console.error('Error:', error);
      showError('Error al enviar email de prueba');
    }
  };

  // Funciones para gestionar contactos
  const abrirFormContacto = (contacto = null) => {
    if (contacto) {
      setContactoEditando(contacto);
      setFormContacto({
        nombre: contacto.contacto_nombre,
        email: contacto.contacto_email || '',
        telefono: contacto.contacto_telefono || '',
        tipo: contacto.contacto_tipo
      });
    } else {
      setContactoEditando(null);
      setFormContacto({
        nombre: '',
        email: '',
        telefono: '',
        tipo: 'email'
      });
    }
    setMostrarFormContacto(true);
  };

  const guardarContacto = async () => {
    if (!formContacto.nombre.trim()) {
      showError('El nombre es requerido');
      return;
    }
    
    if (formContacto.tipo === 'email' && !formContacto.email.trim()) {
      showError('El email es requerido para contactos de email');
      return;
    }
    
    if (formContacto.tipo === 'whatsapp' && !formContacto.telefono.trim()) {
      showError('El teléfono es requerido para contactos de WhatsApp');
      return;
    }

    try {
      const token = sessionStorage.getItem('token');
      const method = contactoEditando ? 'PUT' : 'POST';
      const url = contactoEditando 
        ? `${config.backendUrl}/api/notificaciones/contactos/${contactoEditando.contacto_id}`
        : `${config.backendUrl}/api/notificaciones/contactos`;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nombre: formContacto.nombre,
          email: formContacto.email || null,
          telefono: formContacto.telefono || null,
          tipo: formContacto.tipo,
          activo: true
        })
      });

      if (response.ok) {
        await cargarConfiguraciones();
        setMostrarFormContacto(false);
        success(contactoEditando ? 'Contacto actualizado' : 'Contacto creado');
      } else {
        throw new Error('Error al guardar contacto');
      }
    } catch (error) {
      console.error('Error:', error);
      showError('Error al guardar contacto');
    }
  };

  const eliminarContacto = async (contactoId) => {
    if (!window.confirm('¿Está seguro de eliminar este contacto?')) {
      return;
    }

    try {
      const token = sessionStorage.getItem('token');
      
      const response = await fetch(`${config.backendUrl}/api/notificaciones/contactos/${contactoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await cargarConfiguraciones();
        success('Contacto eliminado correctamente');
      } else {
        throw new Error('Error al eliminar contacto');
      }
    } catch (error) {
      console.error('Error:', error);
      showError('Error al eliminar contacto');
    }
  };

  const actualizarFrecuencia = async (tipo, frecuencia) => {
    try {
      const token = sessionStorage.getItem('token');
      
      const response = await fetch(`${config.backendUrl}/api/notificaciones/frecuencia/${tipo}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          frecuencia,
          horaEnvio: configuraciones[tipo].horaEnvio
        })
      });

      if (response.ok) {
        setConfiguraciones(prev => ({
          ...prev,
          [tipo]: {
            ...prev[tipo],
            frecuencia
          }
        }));
        success('Frecuencia actualizada correctamente');
      } else {
        throw new Error('Error al actualizar frecuencia');
      }
    } catch (error) {
      console.error('Error:', error);
      showError('Error al actualizar frecuencia');
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="text-center">Cargando configuraciones...</div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-6 text-gray-800">
        🔔 Configuración de Notificaciones
      </h2>

      {/* Gestión de Contactos */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-700">👥 Contactos</h3>
          <button
            onClick={() => abrirFormContacto()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            + Agregar Contacto
          </button>
        </div>

        <div className="space-y-3">
          {contactos.map((contacto) => (
            <div key={contacto.contacto_id} className="flex items-center justify-between bg-gray-50 p-3 rounded">
              <div>
                <span className="font-medium text-gray-700">{contacto.contacto_nombre}</span>
                <div className="text-sm text-gray-500">
                  {contacto.contacto_email && (
                    <span className="mr-4">📧 {contacto.contacto_email}</span>
                  )}
                  {contacto.contacto_telefono && (
                    <span>📱 {contacto.contacto_telefono}</span>
                  )}
                </div>
                <span className={`inline-block px-2 py-1 text-xs rounded ${
                  contacto.contacto_tipo === 'email' ? 'bg-blue-100 text-blue-800' :
                  contacto.contacto_tipo === 'whatsapp' ? 'bg-green-100 text-green-800' :
                  'bg-purple-100 text-purple-800'
                }`}>
                  {contacto.contacto_tipo}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => abrirFormContacto(contacto)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  ✏️
                </button>
                <button
                  onClick={() => eliminarContacto(contacto.contacto_id)}
                  className="text-red-500 hover:text-red-700"
                >
                  ❌
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Email Notifications */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-700">📧 Notificaciones por Email</h3>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={configuraciones.email.activo}
              onChange={() => toggleNotificaciones('email')}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Frecuencia de envío:
          </label>
          <select
            value={configuraciones.email.frecuencia}
            onChange={(e) => actualizarFrecuencia('email', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="inmediata">Inmediata (cuando ocurre el faltante)</option>
            <option value="diaria">Diaria (resumen a las 9:00 AM)</option>
            <option value="semanal">Semanal (los lunes a las 9:00 AM)</option>
          </select>
        </div>

        <div className="text-sm text-gray-600">
          Contactos que recibirán emails: {contactos.filter(c => c.contacto_tipo === 'email' || c.contacto_tipo === 'ambos').length}
        </div>
      </div>

      {/* WhatsApp Notifications */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-700">📱 Notificaciones por WhatsApp</h3>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={configuraciones.whatsapp.activo}
              onChange={() => toggleNotificaciones('whatsapp')}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
          </label>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Frecuencia de envío:
          </label>
          <select
            value={configuraciones.whatsapp.frecuencia}
            onChange={(e) => actualizarFrecuencia('whatsapp', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="inmediata">Inmediata (cuando ocurre el faltante)</option>
            <option value="diaria">Diaria (resumen a las 9:00 AM)</option>
            <option value="semanal">Semanal (los lunes a las 9:00 AM)</option>
          </select>
        </div>

        <div className="text-sm text-gray-600">
          Contactos que recibirán WhatsApp: {contactos.filter(c => c.contacto_tipo === 'whatsapp' || c.contacto_tipo === 'ambos').length}
        </div>
      </div>

      {/* Test Email */}
      <div className="bg-blue-50 p-4 rounded">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">🧪 Probar Email</h3>
        <div className="flex gap-2">
          <input
            type="email"
            value={emailPrueba}
            onChange={(e) => setEmailPrueba(e.target.value)}
            placeholder="email@prueba.com"
            className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={enviarPrueba}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Enviar Prueba
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Envía un email de prueba para verificar que la configuración funciona correctamente.
        </p>
      </div>

      {/* Modal para agregar/editar contacto */}
      {mostrarFormContacto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-bold mb-4">
              {contactoEditando ? 'Editar Contacto' : 'Nuevo Contacto'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  value={formContacto.nombre}
                  onChange={(e) => setFormContacto(prev => ({...prev, nombre: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Juan Pérez"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de contacto *
                </label>
                <select
                  value={formContacto.tipo}
                  onChange={(e) => setFormContacto(prev => ({...prev, tipo: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="email">Solo Email</option>
                  <option value="whatsapp">Solo WhatsApp</option>
                  <option value="ambos">Email y WhatsApp</option>
                </select>
              </div>

              {(formContacto.tipo === 'email' || formContacto.tipo === 'ambos') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formContacto.email}
                    onChange={(e) => setFormContacto(prev => ({...prev, email: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="contacto@ejemplo.com"
                  />
                </div>
              )}

              {(formContacto.tipo === 'whatsapp' || formContacto.tipo === 'ambos') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono/WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={formContacto.telefono}
                    onChange={(e) => setFormContacto(prev => ({...prev, telefono: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="+54911234567"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={guardarContacto}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                {contactoEditando ? 'Actualizar' : 'Crear'}
              </button>
              <button
                onClick={() => setMostrarFormContacto(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfiguracionNotificaciones;