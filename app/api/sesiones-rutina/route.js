import { requireAuth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { sesionRutinaSchema, parseBody } from '@/lib/schemas'

export async function GET(req) {
  const { response } = await requireAuth(['admin', 'coach', 'alumno'])
  if (response) return response

  const { searchParams } = new URL(req.url)
  const alumnoId     = searchParams.get('alumno_id')
  const rutinaNombre = searchParams.get('rutina_nombre')
  const limit        = Math.min(parseInt(searchParams.get('limit') || '50'), 200)

  if (!alumnoId) return Response.json(rutinaNombre ? null : [])

  let query = supabaseAdmin
    .from('sesiones_rutina')
    .select('*')
    .eq('alumno_id', alumnoId)
    .order('fecha', { ascending: false })
    .order('created_at', { ascending: false })

  if (rutinaNombre) {
    const { data } = await query.eq('rutina_nombre', rutinaNombre).limit(1).maybeSingle()
    return Response.json(data)
  }

  const { data } = await query.limit(limit)
  return Response.json(data || [])
}

export async function POST(req) {
  const { response } = await requireAuth(['admin', 'coach'])
  if (response) return response

  const { data: body, error: validationError } = parseBody(sesionRutinaSchema, await req.json())
  if (validationError) return validationError

  const { data, error } = await supabaseAdmin
    .from('sesiones_rutina')
    .insert({
      alumno_id:             body.alumno_id,
      coach_id:              body.coach_id,
      alumno_horario_id:     body.alumno_horario_id || null,
      fecha:                 body.fecha,
      rutina_nombre:         body.rutina_nombre,
      rutina_predefinida_id: body.rutina_predefinida_id || null,
      ejercicios:            body.ejercicios || [],
      notas:                 body.notas || null,
    })
    .select()
    .single()

  if (error) return Response.json({ error: 'Error al guardar la sesión' }, { status: 500 })
  return Response.json(data)
}
