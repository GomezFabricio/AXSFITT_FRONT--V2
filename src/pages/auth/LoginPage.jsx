import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../../components/molecules/login/LoginForm';
import { login } from '../../api/loginApi';

const LoginPage = () => {
  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (email, password) => {
    try {
      const data = await login(email, password);
      console.log('Login exitoso', data);

      // Guardar el token en sessionStorage
      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('userData', JSON.stringify(data.usuario));

      // Redirigir al usuario a la página principal
      navigate('/');
    } catch (error) {
      console.log('Error capturado:', error);

      // Si el error tiene un mensaje específico del backend
      if (error.message === 'Usuario no encontrado') {
        setErrorMessage('Usuario no encontrado. Por favor, regístrate.');
      } else if (error.message === 'Contraseña incorrecta') {
        setErrorMessage('Contraseña incorrecta. Por favor, inténtalo nuevamente.');
      } else if (error.message === 'Usuario inactivo o bloqueado') {
        setErrorMessage('Tu cuenta está inactiva o bloqueada. Contacta al soporte.');
      } else {
        setErrorMessage('Ocurrió un error inesperado. Intenta nuevamente.');
      }
    }
  };

  return (
    <div className="flex min-h-screen overflow-hidden">
      {/* Lado izquierdo - Diseño visual */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 relative overflow-hidden">
        {/* Elementos decorativos animados */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-yellow-300/20 rounded-full blur-lg animate-bounce"></div>
        <div className="absolute bottom-32 left-16 w-40 h-40 bg-pink-300/15 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 right-20 w-28 h-28 bg-blue-300/20 rounded-full blur-xl animate-bounce delay-500"></div>
        
        {/* Contenido principal del lado visual */}
        <div className="flex flex-col justify-center items-center w-full p-12 relative z-10">
          {/* Logo/Marca principal */}
          <div className="mb-8">
            <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mb-6 shadow-2xl">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-white text-center leading-tight">
              AXSFITT
            </h2>
            <p className="text-xl text-white/80 text-center mt-2 font-light">
              Sistema de Gestión
            </p>
          </div>
          
          {/* Características destacadas */}
          <div className="space-y-6 max-w-sm">
            <div className="flex items-center space-x-4 text-white/90">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-lg">Gestión completa de inventario</span>
            </div>
            <div className="flex items-center space-x-4 text-white/90">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <span className="text-lg">Reportes y analytics avanzados</span>
            </div>
            <div className="flex items-center space-x-4 text-white/90">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <span className="text-lg">Seguridad empresarial</span>
            </div>
          </div>
          
          {/* Decoración inferior */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/20 to-transparent"></div>
        </div>
      </div>
      
      {/* Lado derecho - Formulario */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 p-8">
        <div className="w-full max-w-md">
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
            {/* Header del formulario */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
                Bienvenido
              </h1>
              <p className="text-gray-600 text-sm">Inicia sesión para acceder a tu cuenta</p>
            </div>
            
            {/* Mensaje de error */}
            {errorMessage && (
              <div className="mb-6 relative">
                <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl shadow-sm">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">{errorMessage}</span>
                  </div>
                </div>
              </div>
            )}
            
            <LoginForm onLogin={handleLogin} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;