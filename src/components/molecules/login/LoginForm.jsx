import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '../../../validations/login.schema';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Input from '../../atoms/Input';
import Button from '../../atoms/Button';
import ErrorMessage from '../../atoms/ErrorMessage';

const LoginForm = ({ onLogin }) => {
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      await onLogin(data.email, data.password);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-box">
      <div className="login-logo">
      </div>
      <div className="card">
        <div className="card-body login-card-body">
          <form onSubmit={handleSubmit(onSubmit)}>
            <Input
              id="email"
              label="Email"
              register={register}
              error={errors.email}
            />
            <Input
              id="password"
              label="Contraseña"
              type="password"
              register={register}
              error={errors.password}
            />
            <ErrorMessage message={error} />
            <Button type="submit">Ingresar</Button>
            
            {/* Botón de recuperación de contraseña */}
            <div className="mt-4 text-center">
              <Link 
                to="/recuperar-password" 
                className="text-sm text-violet-600 hover:text-violet-800 hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;