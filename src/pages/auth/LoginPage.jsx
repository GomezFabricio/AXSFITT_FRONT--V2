import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../../components/molecules/LoginForm';
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
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">Iniciar sesión</h2>
        {errorMessage && (
          <div className="mb-4 text-sm text-red-600 bg-red-100 p-3 rounded">
            {errorMessage}
          </div>
        )}
        <LoginForm onLogin={handleLogin} />
      </div>
    </div>
  );
};

export default LoginPage;