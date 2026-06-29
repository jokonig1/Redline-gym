import { requireAuth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { actualizarRutinaSchema, uuid, parseBody } from '@/lib/schemas'

export async function PUT(req, { params }) {
  const { response } = await requireAuth(['admin', 'coach'])
  if (response) return response

  const idResult = uuid.safeParse(params.id)
  if (!idResult.success) return Response.json({ error: 'ID inválido' }, { status: 400 })

  const { data: body, error: validationError } = parseBody(actualizarRutinaSchema, await req.json())
  if (validationError) return validationError

  const update = {}
  if (body.nombre     !== undefined) update.nombre     = body.nombre
  if (body.ejercicios !== undefined) update.ejercicios = body.ejercicios

  const { data, error } = await supabaseAdmin
    .from('rutinas_predefinidas')
    .update(update)
    .eq('id', idResult.data)
    .select()
    .single()

  if (error) return Response.json({ error: 'Error al actualizar la rutina' }, { status: 500 })
  return Response.json(data)
}

export async function DELETE(req, { params }) {
  const { response } = await requireAuth(['admin', 'coach'])
  if (response) return response

  const idResult = uuid.safeParse(params.id)
  if (!idResult.success) return Response.json({ error: 'ID inválido' }, { status: 400 })

  const { error } = await supabaseAdmin
    .from('rutinas_predefinidas')
    .update({ activo: false })
    .eq('id', idResult.data)

  if (error) return Response.json({ error: 'Error al eliminar la rutina' }, { status: 500 })
  return Response.json({ ok: true })
}
