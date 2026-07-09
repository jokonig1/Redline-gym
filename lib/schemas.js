/**
 * Schemas de validación Zod para todas las API routes.
 * Uso: const body = schema.parse(await req.json())
 *      catch (e) → return 400
 */
import { z } from 'zod'

// ── Primitivos reutilizables ──────────────────────────────────────────────────

export const uuid   = z.string().uuid('ID inválido')
export const fecha  = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)')
export const hora   = z.string().regex(/^\d{2}:\d{2}/, 'Formato de hora inválido (HH:MM)')

// ── Coaches ───────────────────────────────────────────────────────────────────

export const crearCoachSchema = z.object({
  nombre:   z.string().min(1, 'El nombre es obligatorio').max(100),
  email:    z.string().email('Email inválido'),
  password: z.string().min(6, 'Contraseña mínimo 6 caracteres').max(100),
  color:    z.number().int().min(0).max(10).nullable().optional(),
})

export const actualizarCoachSchema = z.object({
  id:       uuid,
  nombre:   z.string().min(1).max(100).optional(),
  telefono: z.string().max(20).nullable().optional(),
  color:    z.number().int().min(0).max(10).nullable().optional(),
})

// ── Alumnos ───────────────────────────────────────────────────────────────────

export const eliminarAlumnoSchema = z.object({
  id: uuid,
})

// ── Asistencias ───────────────────────────────────────────────────────────────

export const asistenciaSchema = z.object({
  alumno_id:         uuid.nullable().optional(),
  coach_id:          uuid,
  alumno_horario_id: uuid.optional().nullable(),
  fecha,
  hora:              hora.optional().nullable(),
  asistio:           z.boolean(),
  notas:             z.string().max(500).optional().nullable(),
})

// ── Excepciones de horario ────────────────────────────────────────────────────

export const excepcionSchema = z.object({
  alumno_horario_id: uuid,
  alumno_id:         uuid,
  fecha_original:    fecha,
  fecha_nueva:       fecha.optional().nullable(),
  hora_nueva:        hora.optional().nullable(),
  motivo:            z.string().max(500).optional(),
  cancelado:         z.boolean().optional(),
})

export const deshacerExcepcionSchema = z.object({
  id: uuid,
})

// ── Rutinas predefinidas ──────────────────────────────────────────────────────

const ejercicioPredefinidoSchema = z.object({
  nombre: z.string().min(1).max(200),
  orden:  z.number().int().min(0).optional(),
})

export const crearRutinaSchema = z.object({
  coach_id:   uuid,
  nombre:     z.string().min(1, 'El nombre es obligatorio').max(200),
  ejercicios: z.array(ejercicioPredefinidoSchema).max(50),
  orden:      z.number().int().min(0).optional(),
})

export const actualizarRutinaSchema = z.object({
  nombre:     z.string().min(1).max(200).optional(),
  ejercicios: z.array(ejercicioPredefinidoSchema).max(50).optional(),
})

// ── Sesiones de rutina ────────────────────────────────────────────────────────

const serieSchema = z.object({
  peso: z.union([z.number().min(0).max(999), z.string().max(10), z.null()]).optional(),
  reps: z.union([z.number().int().min(0).max(999), z.string().max(10), z.null()]).optional(),
})

const ejercicioSesionSchema = z.object({
  nombre: z.string().min(1).max(200),
  series: z.array(serieSchema).max(20).optional(),
})

export const sesionRutinaSchema = z.object({
  alumno_id:             uuid.nullable().optional(),
  coach_id:              uuid,
  alumno_horario_id:     uuid.optional().nullable(),
  fecha,
  rutina_nombre:         z.string().min(1).max(200),
  rutina_predefinida_id: uuid.optional().nullable(),
  ejercicios:            z.array(ejercicioSesionSchema).max(50),
  notas:                 z.string().max(1000).optional().nullable(),
})

// ── Catálogo de ejercicios ─────────────────────────────────────────────────────

export const ejercicioCatalogoSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio').max(200),
})

// ── Perfil de alumno ──────────────────────────────────────────────────────────

export const actualizarPerfilAlumnoSchema = z.object({
  email:    z.string().email('Email inválido'),
  coach_id: uuid.nullable().optional(),
})

// ── Peso corporal ─────────────────────────────────────────────────────────────

export const pesoSchema = z.object({
  alumno_id: uuid,
  fecha:     fecha.optional(),
  peso_kg:   z.number({ invalid_type_error: 'peso_kg debe ser un número' })
               .min(0.1, 'Peso mínimo 0.1 kg')
               .max(399.9, 'Peso máximo 399.9 kg'),
  notas:     z.string().max(500).optional().nullable(),
})

// ── Helper: parsear body y devolver 400 si falla ──────────────────────────────

export function parseBody(schema, data) {
  const result = schema.safeParse(data)
  if (!result.success) {
    const mensajes = result.error.errors.map(e => e.message).join(', ')
    return { data: null, error: Response.json({ error: mensajes }, { status: 400 }) }
  }
  return { data: result.data, error: null }
}
