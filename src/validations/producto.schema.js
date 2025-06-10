import { z } from 'zod';

export const productoSchema = z.object({
  producto_nombre: z.string().min(2, { message: 'El nombre del producto es obligatorio y debe tener al menos 2 caracteres.' }),
  categoria_id: z.number().int().positive({ message: 'La categoría es obligatoria y debe ser un número positivo.' }),
  producto_descripcion: z.string().nullable(), // Permitir valores null
  producto_precio_venta: z.number().positive({ message: 'El precio de venta debe ser un número positivo.' }).nullable(),
  producto_precio_costo: z.number().positive({ message: 'El precio de costo debe ser un número positivo.' }).nullable(),
  producto_precio_oferta: z.number().positive({ message: 'El precio de oferta debe ser un número positivo.' }).nullable(),
  producto_stock: z.number().int().nonnegative({ message: 'El stock debe ser un número entero no negativo.' }).nullable(),
  producto_sku: z.string().nullable(), // Permitir valores null
});