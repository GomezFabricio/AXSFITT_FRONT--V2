// src/components/molecules/LoginForm.js
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '../../validations/login.schema'; // Importa el schema
import { useState } from 'react';
import Input from '../atoms/Input'; // Importa Input
import Button from '../atoms/Button'; // Importa Button
import ErrorMessage from '../atoms/ErrorMessage'; // Importa ErrorMessage

const LoginForm = ({ onLogin }) => {
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema), // Aplica el validador de Zod
  });

  const onSubmit = async (data) => {
    try {
      // Llama al handler que viene desde LoginPage
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
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
