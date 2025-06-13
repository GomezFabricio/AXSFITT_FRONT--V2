import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { solicitarRecuperacionPassword } from '../../api/loginApi';
import Input from '../../components/atoms/Input';
import Button from '../../components/atoms/Button';

// Esquema de validación
const recuperarSchema = z.object({
  email: z.string().email({ message: 'Ingresa un email válido' }),
});

const RecuperarPasswordPage = () => {
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(recuperarSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await solicitarRecuperacionPassword(data.email);
      setStatus({
        type: 'success',
        message: 'Te hemos enviado un correo con instrucciones para recuperar tu contraseña.',
      });
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.response?.data?.message || 'Ocurrió un error al procesar tu solicitud.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">Recuperar Contraseña</h2>
        
        {status.message && (
          <div 
            className={`mb-4 text-sm p-3 rounded ${
              status.type === 'success' 
                ? 'text-green-600 bg-green-100' 
                : 'text-red-600 bg-red-100'
            }`}
          >
            {status.message}
          </div>
        )}
        
        {status.type !== 'success' && (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-4">
                Ingresa tu dirección de correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
              </p>
              <Input
                id="email"
                label="Email"
                register={register}
                error={errors.email}
              />
            </div>
            
            <Button type="submit" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
            </Button>
            
            <div className="mt-4 text-center">
              <Link 
                to="/login" 
                className="text-sm text-violet-600 hover:text-violet-800 hover:underline"
              >
                Volver a Iniciar Sesión
              </Link>
            </div>
          </form>
        )}
        
        {status.type === 'success' && (
          <div className="mt-4 text-center">
            <Link 
              to="/login" 
              className="text-violet-600 hover:text-violet-800 hover:underline"
            >
              Volver a Iniciar Sesión
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecuperarPasswordPage;