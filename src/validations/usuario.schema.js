import { z } from 'zod';

export const usuarioSchema = z.object({
  persona_nombre: z.string().min(2, { message: 'El nombre es obligatorio' }),
  persona_apellido: z.string().min(2, { message: 'El apellido es obligatorio' }),
  persona_dni: z.string().min(6, { message: 'El DNI es obligatorio' }),
  persona_fecha_nac: z.string().optional(),
  persona_domicilio: z.string().optional(),
  persona_telefono: z.string().optional(),
  persona_cuit: z.string().optional(),
  usuario_email: z.string().email({ message: 'Email inválido' }),
  usuario_pass: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres' }),
});