import { requireAuth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { crearRutinaSchema, parseBody } from '@/lib/schemas'

export async function GET(req) {
  const { response } = await requireAuth(['admin', 'coach', 'alumno'])
  if (response) return response

  const { searchParams } = new URL(req.url)
  const coachId = searchParams.get('coach_id')
  if (!coachId) return Response.json([])

  const { data } = await supabaseAdmin
    .from('rutinas_predefinidas')
    .select('*')
    .eq('coach_id', coachId)
    .eq('activo', true)
    .order('orden')
    .order('created_at')

  return Response.json(data || [])
}

export async function POST(req) {
  const { response } = await requireAuth(['admin', 'coach', 'alumno'])
  if (response) return response

  const { data: body, error: validationError } = parseBody(crearRutinaSchema, await req.json())
  if (validationError) return validationError

  const { data, error } = await supabaseAdmin
    .from('rutinas_predefinidas')
    .insert({
      coach_id:   body.coach_id,
      nombre:     body.nombre,
      ejercicios: body.ejercicios,
      orden:      body.orden ?? 0,
    })
    .select()
    .single()

  if (error) return Response.json({ error: 'Error al crear la rutina' }, { status: 500 })
  return Response.json(data)
}
