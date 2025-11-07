import React, { useState, useEffect } from 'react';
import useNotification from '../../../hooks/useNotification';
import config from '../../../config/config';

const ConfiguracionNotificaciones = () => {
  const { success, error: showError } = useNotification();
  
  // Estados principales
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('contactos');
  const [contactos, setContactos] = useState([]);
  const [configuracion, setConfiguracion] = useState({
    email: {
      activo: false,
      frecuencia: 'inmediata',
      diasSemana: ['1', '2', '3', '4', '5'],
      horaEnvio: '09:00'
    },
    whatsapp: {
      activo: false,
      frecuencia: 'inmediata',
      diasSemana: ['1', '2', '3', '4', '5'],
      horaEnvio: '09:00'
    }
  });
  
  // Estados para formularios
  const [nuevoContacto, setNuevoContacto] = useState({
    nombre: '',
    email: '',
    telefono: '',
    tipo: 'email'
  });
  const [editandoContacto, setEditandoContacto] = useState(null);
  const [emailPrueba, setEmailPrueba] = useState('');
  const [showAddContact, setShowAddContact] = useState(false);
  const [showEditContact, setShowEditContact] = useState(false);

  const diasSemana = [
    { id: '1', nombre: 'Lunes', abrev: 'L' },
    { id: '2', nombre: 'Martes', abrev: 'M' },
    { id: '3', nombre: 'Miércoles', abrev: 'X' },
    { id: '4', nombre: 'Jueves', abrev: 'J' },
    { id: '5', nombre: 'Viernes', abrev: 'V' },
    { id: '6', nombre: 'Sábado', abrev: 'S' },
    { id: '7', nombre: 'Domingo', abrev: 'D' }
  ];

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token');
      
      // Cargar contactos
      const contactosRes = await fetch(`${config.backendUrl}/api/notificaciones/contactos`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (contactosRes.ok) {
        const contactosData = await contactosRes.json();
        setContactos(contactosData.data || []);
      }
      
      // Cargar configuración
      const configRes = await fetch(`${config.backendUrl}/api/notificaciones/configuracion`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (configRes.ok) {
        const configData = await configRes.json();
        // Procesar configuración aquí si es necesario
      }
      
    } catch (error) {
      console.error('Error cargando datos:', error);
      showError('Error al cargar configuraciones');
    } finally {
      setLoading(false);
    }
  };

  const agregarContacto = async () => {
    if (!nuevoContacto.nombre.trim() || !nuevoContacto.email.trim()) {
      showError('Nombre y email son requeridos');
      return;
    }

    if (nuevoContacto.tipo === 'whatsapp' && !nuevoContacto.telefono.trim()) {
      showError('El teléfono es requerido para notificaciones por WhatsApp');
      return;
    }

    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${config.backendUrl}/api/notificaciones/contactos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(nuevoContacto)
      });

      if (response.ok) {
        success('Contacto agregado correctamente');
        setNuevoContacto({
          nombre: '',
          email: '',
          telefono: '',
          tipo: 'email'
        });
        setShowAddContact(false);
        cargarDatos();
      } else {
        throw new Error('Error al agregar contacto');
      }
    } catch (error) {
      console.error('Error:', error);
      showError('Error al agregar contacto');
    }
  };

  const eliminarContacto = async (contactoId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar permanentemente este contacto?')) {
      return;
    }

    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${config.backendUrl}/api/notificaciones/contactos/${contactoId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        success('Contacto eliminado permanentemente');
        cargarDatos();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al eliminar contacto');
      }
    } catch (error) {
      console.error('Error:', error);
      showError('Error al eliminar contacto: ' + error.message);
    }
  };

  const editarContacto = (contacto) => {
    setEditandoContacto({
      id: contacto.contacto_id,
      nombre: contacto.contacto_nombre,
      email: contacto.contacto_email,
      telefono: contacto.contacto_telefono || '',
      tipo: contacto.contacto_tipo
    });
    setShowEditContact(true);
  };

  const actualizarContacto = async () => {
    if (!editandoContacto.nombre.trim() || !editandoContacto.email.trim()) {
      showError('Nombre y email son requeridos');
      return;
    }

    if (editandoContacto.tipo === 'whatsapp' && !editandoContacto.telefono.trim()) {
      showError('El teléfono es requerido para notificaciones por WhatsApp');
      return;
    }

    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${config.backendUrl}/api/notificaciones/contactos/${editandoContacto.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nombre: editandoContacto.nombre,
          email: editandoContacto.email,
          telefono: editandoContacto.telefono,
          tipo: editandoContacto.tipo,
          activo: 1
        })
      });

      if (response.ok) {
        success('Contacto actualizado correctamente');
        setEditandoContacto(null);
        setShowEditContact(false);
        cargarDatos();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar contacto');
      }
    } catch (error) {
      console.error('Error:', error);
      showError('Error al actualizar contacto: ' + error.message);
    }
  };

  const toggleContactoActivo = async (contactoId, estadoActual) => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${config.backendUrl}/api/notificaciones/contactos/${contactoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ activo: !estadoActual })
      });

      if (response.ok) {
        success(`Contacto ${!estadoActual ? 'activado' : 'desactivado'} correctamente`);
        cargarDatos();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al cambiar estado del contacto');
      }
    } catch (error) {
      console.error('Error:', error);
      showError('Error al cambiar estado del contacto: ' + error.message);
    }
  };

  const toggleNotificacion = async (tipo) => {
    try {
      const token = sessionStorage.getItem('token');
      const nuevoEstado = !configuracion[tipo].activo;
      
      const response = await fetch(`${config.backendUrl}/api/notificaciones/toggle/${tipo}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ activo: nuevoEstado })
      });

      if (response.ok) {
        setConfiguracion(prev => ({
          ...prev,
          [tipo]: { ...prev[tipo], activo: nuevoEstado }
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

  const actualizarConfiguracion = async (tipo, campo, valor) => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${config.backendUrl}/api/notificaciones/configuracion/${tipo}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ [campo]: valor })
      });

      if (response.ok) {
        setConfiguracion(prev => ({
          ...prev,
          [tipo]: { ...prev[tipo], [campo]: valor }
        }));
        success('Configuración actualizada');
      } else {
        throw new Error('Error al actualizar configuración');
      }
    } catch (error) {
      console.error('Error:', error);
      showError('Error al actualizar configuración');
    }
  };

  const enviarEmailPrueba = async () => {
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

  const toggleDiaSemana = (tipo, dia) => {
    const diasActuales = configuracion[tipo].diasSemana;
    let nuevosDias;
    
    if (diasActuales.includes(dia)) {
      nuevosDias = diasActuales.filter(d => d !== dia);
    } else {
      nuevosDias = [...diasActuales, dia].sort();
    }
    
    actualizarConfiguracion(tipo, 'diasSemana', nuevosDias);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 flex items-center space-x-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600 font-medium">Cargando configuraciones...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                Configuración de Notificaciones
              </h1>
              <p className="text-gray-600 mt-2">
                Gestiona contactos y configura cuando recibir alertas de stock bajo
              </p>
            </div>
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg">
              <span className="font-semibold">Sistema Activo</span>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-xl shadow-lg mb-6">
          <div className="flex border-b border-gray-200">
            {[
              { id: 'contactos', label: 'Contactos', icon: '👥' },
              { id: 'email', label: 'Email', icon: '📧' },
              { id: 'whatsapp', label: 'WhatsApp', icon: '📱' },
              { id: 'pruebas', label: 'Pruebas', icon: '🧪' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-6 py-4 text-center font-medium text-sm transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="text-lg mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          {/* Contactos Tab */}
          {activeTab === 'contactos' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">Gestión de Contactos</h2>
                <button
                  onClick={() => setShowAddContact(true)}
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center space-x-2"
                >
                  <span>+</span>
                  <span>Agregar Contacto</span>
                </button>
              </div>

              {/* Lista de Contactos */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {contactos.map((contacto) => (
                  <div key={contacto.contacto_id} className={`rounded-xl p-4 border hover:shadow-md transition-all duration-200 ${
                    contacto.contacto_activo 
                      ? 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200' 
                      : 'bg-gradient-to-br from-red-50 to-red-100 border-red-200'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                            contacto.contacto_activo 
                              ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
                              : 'bg-gradient-to-br from-gray-400 to-gray-500'
                          }`}>
                            {contacto.contacto_nombre.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className={`font-semibold ${contacto.contacto_activo ? 'text-gray-900' : 'text-gray-500'}`}>
                              {contacto.contacto_nombre}
                            </h3>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              contacto.contacto_activo 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {contacto.contacto_activo ? 'Activo' : 'Inactivo'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-1 text-sm">
                          <p className={`flex items-center ${contacto.contacto_activo ? 'text-gray-600' : 'text-gray-400'}`}>
                            <span className="mr-2">✉</span>
                            {contacto.contacto_email}
                          </p>
                          {contacto.contacto_telefono && (
                            <p className={`flex items-center ${contacto.contacto_activo ? 'text-gray-600' : 'text-gray-400'}`}>
                              <span className="mr-2">📱</span>
                              {contacto.contacto_telefono}
                            </p>
                          )}
                        </div>
                        
                        <div className="mt-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            contacto.contacto_tipo === 'email' 
                              ? 'bg-blue-100 text-blue-800' 
                              : contacto.contacto_tipo === 'whatsapp'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {contacto.contacto_tipo}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-1">
                        <button
                          onClick={() => toggleContactoActivo(contacto.contacto_id, contacto.contacto_activo)}
                          className={`p-1 transition-colors duration-200 ${
                            contacto.contacto_activo 
                              ? 'text-yellow-500 hover:text-yellow-700' 
                              : 'text-green-500 hover:text-green-700'
                          }`}
                          title={contacto.contacto_activo ? 'Desactivar' : 'Activar'}
                        >
                          {contacto.contacto_activo ? '⏸' : '▶'}
                        </button>
                        <button
                          onClick={() => editarContacto(contacto)}
                          className="text-blue-500 hover:text-blue-700 transition-colors duration-200 p-1"
                          title="Editar"
                        >
                          ✏
                        </button>
                        <button
                          onClick={() => eliminarContacto(contacto.contacto_id)}
                          className="text-red-500 hover:text-red-700 transition-colors duration-200 p-1"
                          title="Eliminar permanentemente"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Modal Agregar Contacto */}
              {showAddContact && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Agregar Nuevo Contacto</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
                        <input
                          type="text"
                          value={nuevoContacto.nombre}
                          onChange={(e) => setNuevoContacto({...nuevoContacto, nombre: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Ej: Juan Pérez"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          value={nuevoContacto.email}
                          onChange={(e) => setNuevoContacto({...nuevoContacto, email: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="juan@empresa.com"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono/Celular</label>
                        <input
                          type="tel"
                          value={nuevoContacto.telefono}
                          onChange={(e) => setNuevoContacto({...nuevoContacto, telefono: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="+54911234567"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de notificación</label>
                        <select
                          value={nuevoContacto.tipo}
                          onChange={(e) => setNuevoContacto({...nuevoContacto, tipo: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="email">Email</option>
                          <option value="whatsapp">WhatsApp</option>
                          <option value="ambos">Ambos</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="flex space-x-3 mt-6">
                      <button
                        onClick={() => setShowAddContact(false)}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={agregarContacto}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
                      >
                        Agregar
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Editar Contacto */}
              {showEditContact && editandoContacto && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Editar Contacto</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
                        <input
                          type="text"
                          value={editandoContacto.nombre}
                          onChange={(e) => setEditandoContacto({...editandoContacto, nombre: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Ej: Juan Pérez"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          value={editandoContacto.email}
                          onChange={(e) => setEditandoContacto({...editandoContacto, email: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="juan@empresa.com"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono/Celular</label>
                        <input
                          type="tel"
                          value={editandoContacto.telefono}
                          onChange={(e) => setEditandoContacto({...editandoContacto, telefono: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="+54911234567"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de notificación</label>
                        <select
                          value={editandoContacto.tipo}
                          onChange={(e) => setEditandoContacto({...editandoContacto, tipo: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="email">Email</option>
                          <option value="whatsapp">WhatsApp</option>
                          <option value="ambos">Ambos</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="flex space-x-3 mt-6">
                      <button
                        onClick={() => {
                          setShowEditContact(false);
                          setEditandoContacto(null);
                        }}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={actualizarContacto}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200"
                      >
                        Actualizar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Email Tab */}
          {activeTab === 'email' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">Configuración de Email</h2>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={configuracion.email.activo}
                    onChange={() => toggleNotificacion('email')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm font-medium text-gray-700">
                    {configuracion.email.activo ? 'Activado' : 'Desactivado'}
                  </span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Frecuencia */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-800 mb-3">Frecuencia de Envío</h3>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg border hover:bg-blue-50 transition-colors">
                      <input
                        type="radio"
                        name="email-frecuencia"
                        value="inmediata"
                        checked={configuracion.email.frecuencia === 'inmediata'}
                        onChange={(e) => actualizarConfiguracion('email', 'frecuencia', e.target.value)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-700">Inmediata</span>
                        <p className="text-xs text-gray-500">Email al momento que se detecta faltante</p>
                      </div>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg border hover:bg-blue-50 transition-colors">
                      <input
                        type="radio"
                        name="email-frecuencia"
                        value="diaria"
                        checked={configuracion.email.frecuencia === 'diaria'}
                        onChange={(e) => actualizarConfiguracion('email', 'frecuencia', e.target.value)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-700">Diaria</span>
                        <p className="text-xs text-gray-500">Email todos los días seleccionados</p>
                      </div>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg border hover:bg-blue-50 transition-colors">
                      <input
                        type="radio"
                        name="email-frecuencia"
                        value="semanal"
                        checked={configuracion.email.frecuencia === 'semanal'}
                        onChange={(e) => actualizarConfiguracion('email', 'frecuencia', e.target.value)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-700">Semanal</span>
                        <p className="text-xs text-gray-500">Email una vez por semana (primer día seleccionado)</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Hora de envío - Solo se muestra si NO es inmediata */}
                {configuracion.email.frecuencia !== 'inmediata' && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-800 mb-3">Hora de Envío</h3>
                    <input
                      type="time"
                      value={configuracion.email.horaEnvio}
                      onChange={(e) => actualizarConfiguracion('email', 'horaEnvio', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Los emails se enviarán a esta hora en los días configurados
                    </p>
                  </div>
                )}

                {/* Info adicional para modo inmediato */}
                {configuracion.email.frecuencia === 'inmediata' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <h3 className="font-semibold text-blue-800 mb-2">Modo Inmediato Activo</h3>
                    <div className="text-sm text-blue-700 space-y-1">
                      <p>• Los emails se envían automáticamente cuando se detecta un faltante</p>
                      <p>• No se requiere configurar hora específica</p>
                      <p>• La notificación llega en tiempo real</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Días de la semana */}
              {configuracion.email.frecuencia !== 'inmediata' && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-800 mb-3">Días de Envío</h3>
                  {configuracion.email.frecuencia === 'diaria' && (
                    <p className="text-sm text-blue-600 mb-3 font-medium">
                      📧 Se enviará un email CADA DÍA seleccionado a la hora configurada
                    </p>
                  )}
                  {configuracion.email.frecuencia === 'semanal' && (
                    <p className="text-sm text-green-600 mb-3 font-medium">
                      📅 Se enviará un email UNA VEZ por semana en el primer día seleccionado
                    </p>
                  )}
                  <div className="grid grid-cols-7 gap-2">
                    {diasSemana.map((dia) => (
                      <button
                        key={dia.id}
                        onClick={() => toggleDiaSemana('email', dia.id)}
                        className={`aspect-square rounded-lg font-semibold text-sm transition-all duration-200 ${
                          configuracion.email.diasSemana.includes(dia.id)
                            ? 'bg-blue-500 text-white shadow-md'
                            : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        <div>{dia.abrev}</div>
                      </button>
                    ))}
                  </div>
                  {configuracion.email.frecuencia === 'diaria' && (
                    <p className="text-xs text-gray-500 mt-2">
                      Días seleccionados: {configuracion.email.diasSemana.map(id => 
                        diasSemana.find(d => d.id === id)?.nombre
                      ).join(', ')} (se enviará en todos estos días)
                    </p>
                  )}
                  {configuracion.email.frecuencia === 'semanal' && configuracion.email.diasSemana.length > 0 && (
                    <p className="text-xs text-gray-500 mt-2">
                      Se enviará solo los {diasSemana.find(d => d.id === configuracion.email.diasSemana[0])?.nombre}
                      {configuracion.email.diasSemana.length > 1 && ' (otros días seleccionados serán ignorados)'}
                    </p>
                  )}
                </div>
              )}

              {/* Información sobre el sistema de faltantes */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h3 className="font-semibold text-gray-800 mb-2">Sistema de Detección de Faltantes</h3>
                <p className="text-sm text-gray-700 mb-2">
                  Las notificaciones se envían automáticamente cuando los productos caen por debajo de su 
                  <strong> stock mínimo configurado</strong> y son registrados en la tabla de faltantes.
                </p>
                <ul className="text-sm text-gray-600 space-y-1 ml-4">
                  <li>• Se basa en los valores de stock mínimo de cada producto</li>
                  <li>• Los productos faltantes se detectan automáticamente por trigger</li>
                  <li>• Solo se notifican productos registrados en la tabla faltantes</li>
                </ul>
              </div>
            </div>
          )}

          {/* WhatsApp Tab */}
          {activeTab === 'whatsapp' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">Configuración de WhatsApp</h2>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={configuracion.whatsapp.activo}
                    onChange={() => toggleNotificacion('whatsapp')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  <span className="ml-3 text-sm font-medium text-gray-700">
                    {configuracion.whatsapp.activo ? 'Activado' : 'Desactivado'}
                  </span>
                </label>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <div className="flex items-center">
                  <span className="text-yellow-600 text-lg mr-2">!</span>
                  <p className="text-yellow-800 text-sm">
                    <strong>Próximamente:</strong> La integración con WhatsApp estará disponible en la próxima versión.
                    Por ahora, puedes configurar las notificaciones por email.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Pruebas Tab */}
          {activeTab === 'pruebas' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">Pruebas de Notificación</h2>
              
              <div className="bg-blue-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Enviar Email de Prueba</h3>
                <div className="flex space-x-3">
                  <input
                    type="email"
                    value={emailPrueba}
                    onChange={(e) => setEmailPrueba(e.target.value)}
                    placeholder="email@prueba.com"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={enviarEmailPrueba}
                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
                  >
                    Enviar
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  Envía un email de prueba para verificar que la configuración funciona correctamente.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfiguracionNotificaciones;