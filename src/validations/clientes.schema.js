import * as z from 'zod';

export const clienteSchema = z.object({
  persona_nombre: z
    .string()
    .min(2, { message: 'El nombre debe tener al menos 2 caracteres' })
    .max(60, { message: 'El nombre no puede exceder los 60 caracteres' }),
  
  persona_apellido: z
    .string()
    .min(2, { message: 'El apellido debe tener al menos 2 caracteres' })
    .max(60, { message: 'El apellido no puede exceder los 60 caracteres' }),
  
  persona_dni: z
    .string()
    .min(7, { message: 'El DNI debe tener al menos 7 caracteres' })
    .max(10, { message: 'El DNI no puede exceder los 10 caracteres' })
    .regex(/^\d+$/, { message: 'El DNI debe contener solo números' }),
  
  persona_fecha_nac: z
    .string()
    .nullable()
    .optional()
    .refine(val => !val || new Date(val) < new Date(), {
      message: 'La fecha de nacimiento no puede ser futura',
    })
    .refine(val => !val || new Date(val) > new Date('1900-01-01'), {
      message: 'La fecha de nacimiento debe ser posterior a 1900',
    }),
  
  persona_domicilio: z
    .string()
    .max(255, { message: 'El domicilio no puede exceder los 255 caracteres' })
    .nullable()
    .optional(),
  
  persona_telefono: z
    .string()
    .length(10, { message: 'El teléfono debe tener exactamente 10 caracteres' })
    .regex(/^\d+$/, { message: 'El teléfono debe contener solo números' })
    .nullable()
    .optional(),
});