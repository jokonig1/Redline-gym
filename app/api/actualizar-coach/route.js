import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireAuth } from '@/lib/auth'

export async function PATCH(request) {
  const { response } = await requireAuth(['admin'])
  if (response) return response

  const { id, nombre, telefono, color } = await request.json()
  if (!id) return Response.json({ error: 'Falta el id' }, { status: 400 })

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({
      nombre:   nombre   ?? undefined,
      telefono: telefono ?? undefined,
      color:    color    ?? null,
    })
    .eq('id', id)

  if (error) return Response.json({ error: 'Error al actualizar el coach' }, { status: 500 })
  return Response.json({ ok: true })
}
