import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireAuth } from '@/lib/auth'
import { actualizarCoachSchema, parseBody } from '@/lib/schemas'

export async function PATCH(request) {
  const { response } = await requireAuth(['admin'])
  if (response) return response

  const { data: body, error: validationError } = parseBody(actualizarCoachSchema, await request.json())
  if (validationError) return validationError

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({
      nombre:   body.nombre   ?? undefined,
      telefono: body.telefono ?? undefined,
      color:    body.color    ?? null,
    })
    .eq('id', body.id)

  if (error) return Response.json({ error: 'Error al actualizar el coach' }, { status: 500 })
  return Response.json({ ok: true })
}
