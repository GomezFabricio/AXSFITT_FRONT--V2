import React, { useState, useEffect } from 'react';
import useNotification from '../../../hooks/useNotification';
import config from '../../../config/config';

/**
 * Componente corregido para configuración de notificaciones
 * - NO envía cambios en tiempo real
 * - Maneja todo el formulario localmente
 * - Solo guarda cuando se presiona "Guardar"
 * - Carga la configuración actual al iniciar
 */
const ConfiguracionNotificacionesCorregida = () => {
  const { success, error: showError } = useNotification();
  
  // Estados principales
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Configuración guardada en la BD (para comparar cambios)
  const [configGuardada, setConfigGuardada] = useState({
    email: {
      activo: false,
      frecuencia: 'inmediata',
      diasSemana: ['1', '2', '3', '4', '5'],
      horaEnvio: '09:00',
      plantillaPersonalizada: ''
    },
    whatsapp: {
      activo: false,
      frecuencia: 'inmediata',
      diasSemana: ['1', '2', '3', '4', '5'],
      horaEnvio: '09:00',
      plantillaPersonalizada: ''
    }
  });

  // Configuración local del formulario (puede tener cambios sin guardar)
  const [configLocal, setConfigLocal] = useState(configGuardada);

  const [emailPrueba, setEmailPrueba] = useState('');

  const diasSemana = [
    { id: '1', nombre: 'Lunes', abrev: 'L' },
    { id: '2', nombre: 'Martes', abrev: 'M' },
    { id: '3', nombre: 'Miércoles', abrev: 'X' },
    { id: '4', nombre: 'Jueves', abrev: 'J' },
    { id: '5', nombre: 'Viernes', abrev: 'V' },
    { id: '6', nombre: 'Sábado', abrev: 'S' },
    { id: '7', nombre: 'Domingo', abrev: 'D' }
  ];

  // Cargar configuración inicial
  useEffect(() => {
    cargarConfiguracion();
  }, []);

  // Detectar cambios
  useEffect(() => {
    const hayDiferencias = JSON.stringify(configLocal) !== JSON.stringify(configGuardada);
    setHasChanges(hayDiferencias);
  }, [configLocal, configGuardada]);

  const cargarConfiguracion = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token');
      
      const response = await fetch(`${config.backendUrl}/api/notificaciones/configuracion`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('📋 Configuración cargada:', data);
        
        const configCargada = {
          email: {
            activo: data.email?.activo || false,
            frecuencia: data.email?.frecuencia || 'inmediata',
            diasSemana: data.email?.diasSemana || ['1', '2', '3', '4', '5'],
            horaEnvio: data.email?.horaEnvio || '09:00',
            plantillaPersonalizada: data.email?.plantillaPersonalizada || ''
          },
          whatsapp: {
            activo: data.whatsapp?.activo || false,
            frecuencia: data.whatsapp?.frecuencia || 'inmediata',
            diasSemana: data.whatsapp?.diasSemana || ['1', '2', '3', '4', '5'],
            horaEnvio: data.whatsapp?.horaEnvio || '09:00',
            plantillaPersonalizada: data.whatsapp?.plantillaPersonalizada || ''
          }
        };
        
        setConfigGuardada(configCargada);
        setConfigLocal(configCargada);
      } else {
        showError('Error al cargar configuración');
      }
    } catch (error) {
      console.error('Error cargando configuración:', error);
      showError('Error al cargar configuración');
    } finally {
      setLoading(false);
    }
  };

  // Actualizar configuración local (SIN enviar al backend)
  const actualizarConfigLocal = (tipo, campo, valor) => {
    setConfigLocal(prev => ({
      ...prev,
      [tipo]: {
        ...prev[tipo],
        [campo]: valor
      }
    }));
  };

  // Manejar selección de días de la semana
  const toggleDiaSemana = (tipo, diaId) => {
    const diasActuales = configLocal[tipo].diasSemana;
    let nuevosDias;
    
    if (diasActuales.includes(diaId)) {
      nuevosDias = diasActuales.filter(d => d !== diaId);
    } else {
      nuevosDias = [...diasActuales, diaId].sort();
    }
    
    actualizarConfigLocal(tipo, 'diasSemana', nuevosDias);
  };

  // Guardar configuración (enviar al backend)
  const guardarConfiguracion = async () => {
    try {
      setSaving(true);
      const token = sessionStorage.getItem('token');
      
      // Guardar email y whatsapp por separado
      for (const tipo of ['email', 'whatsapp']) {
        const configTipo = configLocal[tipo];
        
        const response = await fetch(`${config.backendUrl}/api/notificaciones/configuracion/${tipo}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            activo: configTipo.activo ? 1 : 0,
            frecuencia: configTipo.frecuencia,
            horaEnvio: configTipo.horaEnvio,
            diasSemana: configTipo.diasSemana,
            plantillaPersonalizada: configTipo.plantillaPersonalizada || null
          })
        });

        if (!response.ok) {
          throw new Error(`Error al guardar configuración de ${tipo}`);
        }
      }

      success('✅ Configuración guardada correctamente');
      
      // Recargar para mostrar lo que realmente quedó guardado
      await cargarConfiguracion();
      
    } catch (error) {
      console.error('Error guardando configuración:', error);
      showError('Error al guardar configuración: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  // Descartar cambios
  const descartarCambios = () => {
    setConfigLocal(configGuardada);
  };

  // Enviar email de prueba
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
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                🔔 Configuración de Notificaciones
              </h1>
              <p className="text-gray-600 mt-2">Configurar alertas de stock bajo y agotado</p>
            </div>
            
            {/* Controles de guardado */}
            <div className="flex items-center space-x-4">
              {hasChanges && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2">
                  <span className="text-yellow-800 text-sm font-medium">⚠️ Cambios sin guardar</span>
                </div>
              )}
              
              <button
                onClick={descartarCambios}
                disabled={!hasChanges || saving}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  hasChanges && !saving
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                }`}
              >
                Descartar
              </button>
              
              <button
                onClick={guardarConfiguracion}
                disabled={!hasChanges || saving}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  hasChanges && !saving
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {saving ? '💾 Guardando...' : '💾 Guardar Configuración'}
              </button>
            </div>
          </div>
        </div>

        {/* Configuración Email */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              📧 Notificaciones por Email
            </h2>
            
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={configLocal.email.activo}
                onChange={(e) => actualizarConfigLocal('email', 'activo', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              <span className="ml-3 text-sm font-medium text-gray-700">
                {configLocal.email.activo ? 'Activado' : 'Desactivado'}
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Frecuencia */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Frecuencia de Envío</h3>
              <div className="space-y-3">
                {[
                  { value: 'inmediata', label: 'Inmediata', desc: 'Email al momento que se detecta faltante' },
                  { value: 'diaria', label: 'Diaria', desc: 'Email todos los días seleccionados' },
                  { value: 'semanal', label: 'Semanal', desc: 'Email una vez por semana (primer día seleccionado)' }
                ].map((opcion) => (
                  <label key={opcion.value} className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg border hover:bg-blue-50 transition-colors">
                    <input
                      type="radio"
                      name="email-frecuencia"
                      value={opcion.value}
                      checked={configLocal.email.frecuencia === opcion.value}
                      onChange={(e) => actualizarConfigLocal('email', 'frecuencia', e.target.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700">{opcion.label}</span>
                      <p className="text-xs text-gray-500">{opcion.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Hora de envío */}
            {configLocal.email.frecuencia !== 'inmediata' && (
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-800 mb-3">Hora de Envío</h3>
                <input
                  type="time"
                  value={configLocal.email.horaEnvio}
                  onChange={(e) => actualizarConfigLocal('email', 'horaEnvio', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Los emails se enviarán a esta hora en los días configurados
                </p>
              </div>
            )}
          </div>

          {/* Días de la semana */}
          {configLocal.email.frecuencia !== 'inmediata' && (
            <div className="bg-gray-50 rounded-xl p-4 mt-6">
              <h3 className="font-semibold text-gray-800 mb-3">Días de Envío</h3>
              {configLocal.email.frecuencia === 'diaria' && (
                <p className="text-sm text-blue-600 mb-3 font-medium">
                  📧 Se enviará un email CADA DÍA seleccionado a la hora configurada
                </p>
              )}
              {configLocal.email.frecuencia === 'semanal' && (
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
                      configLocal.email.diasSemana.includes(dia.id)
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    <div>{dia.abrev}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Email de prueba */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">🧪 Probar Email</h3>
          <div className="flex gap-3">
            <input
              type="email"
              value={emailPrueba}
              onChange={(e) => setEmailPrueba(e.target.value)}
              placeholder="email@prueba.com"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={enviarEmailPrueba}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Enviar Prueba
            </button>
          </div>
        </div>

        {/* Debug info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-gray-100 rounded-xl p-4 mt-6 text-xs">
            <h4 className="font-bold mb-2">🔧 Debug Info:</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong>Config Guardada:</strong>
                <pre className="text-xs bg-white p-2 rounded mt-1">
                  {JSON.stringify(configGuardada.email, null, 2)}
                </pre>
              </div>
              <div>
                <strong>Config Local:</strong>
                <pre className="text-xs bg-white p-2 rounded mt-1">
                  {JSON.stringify(configLocal.email, null, 2)}
                </pre>
              </div>
            </div>
            <p className="mt-2">
              <strong>Cambios pendientes:</strong> {hasChanges ? '⚠️ SÍ' : '✅ NO'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfiguracionNotificacionesCorregida;