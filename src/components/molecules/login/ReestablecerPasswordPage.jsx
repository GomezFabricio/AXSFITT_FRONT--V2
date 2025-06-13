import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { verificarTokenRecuperacion, restablecerPassword } from '../../api/loginApi';
import Input from '../../components/atoms/Input';
import Button from '../../components/atoms/Button';

// Esquema de validación
const passwordSchema = z.object({
  password: z.string()
    .min(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
    .regex(/[A-Z]/, { message: 'La contraseña debe tener al menos una letra mayúscula' })
    .regex(/[a-z]/, { message: 'La contraseña debe tener al menos una letra minúscula' })
    .regex(/[0-9]/, { message: 'La contraseña debe tener al menos un número' }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

const RestablecerPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [tokenValido, setTokenValido] = useState(false);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ type: '', message: '' });
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  useEffect(() => {
    const validarToken = async () => {
      try {
        await verificarTokenRecuperacion(token);
        setTokenValido(true);
      } catch (error) {
        setStatus({
          type: 'error',
          message: 'El enlace de recuperación es inválido o ha expirado.'
        });
      } finally {
        setLoading(false);
      }
    };

    validarToken();
  }, [token]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await restablecerPassword(token, data.password);
      setStatus({
        type: 'success',
        message: 'Tu contraseña ha sido restablecida exitosamente.'
      });
      
      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.response?.data?.message || 'Ocurrió un error al restablecer tu contraseña.'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando enlace de recuperación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">Restablecer Contraseña</h2>
        
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
        
        {tokenValido && status.type !== 'success' && (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-4">
                Ingresa tu nueva contraseña.
              </p>
              <Input
                id="password"
                label="Nueva contraseña"
                type="password"
                register={register}
                error={errors.password}
              />
            </div>
            
            <div className="mb-4">
              <Input
                id="confirmPassword"
                label="Confirmar contraseña"
                type="password"
                register={register}
                error={errors.confirmPassword}
              />
            </div>
            
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar nueva contraseña'}
            </Button>
          </form>
        )}
        
        {(!tokenValido || status.type === 'success') && (
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

export default RestablecerPasswordPage;