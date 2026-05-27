'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import LoadingSpinner from '@/app/dashboard/_components/LoadingSpinner'
import StatusBadge from '@/app/dashboard/_components/StatusBadge'

export default function DetalleCoach() {
  const router = useRouter()
  const { id } = useParams()
  const [coach, setCoach] = useState(null)
  const [alumnos, setAlumnos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    async function fetchData() {
      const [{ data: c }, { data: a }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', id).single(),
        supabase.from('alumnos').select('*').eq('coach_id', id).order('nombre'),
      ])
      setCoach(c)
      setAlumnos(a || [])
      setLoading(false)
    }
    fetchData()
  }, [id])

  if (loading) return <LoadingSpinner />

  if (!coach) return (
    <div className="text-zinc-500 text-center py-12">Coach no encontrado</div>
  )

  const initials = coach.nombre?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  const activos  = alumnos.filter(a => a.activo).length

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="text-zinc-500 hover:text-white transition-colors text-sm">
          ← Volver
        </button>
      </div>

      {/* Header */}
      <div className="bg-[#141414] border border-white/5 rounded-xl p-5 mb-4 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-red-900/30 flex items-center justify-center text-xl font-black text-red-400">
          {initials}
        </div>
        <div className="flex-1">
          <h2 className="text-white font-bold text-lg">{coach.nombre}</h2>
          <div className="text-zinc-500 text-sm">{coach.email}</div>
          <div className="mt-1">
            <StatusBadge activo={coach.activo} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="bg-[#1c1c1c] rounded-lg px-4 py-3">
            <div className="text-2xl font-black text-white">{alumnos.length}</div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest">Total</div>
          </div>
          <div className="bg-[#1c1c1c] rounded-lg px-4 py-3">
            <div className="text-2xl font-black text-green-400">{activos}</div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest">Activos</div>
          </div>
        </div>
      </div>

      {/* Lista de alumnos */}
      <div className="bg-[#141414] border border-white/5 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5">
          <div className="text-xs text-zinc-500 uppercase tracking-widest">
            Alumnos asignados ({alumnos.length})
          </div>
        </div>

        {alumnos.length === 0 ? (
          <div className="text-center py-10 text-zinc-600 text-sm">
            Este coach no tiene alumnos asignados
          </div>
        ) : (
          alumnos.map(alumno => (
            <div
              key={alumno.id}
              className="flex items-center gap-3 px-5 py-3.5 border-b border-white/5 hover:bg-white/2 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400">
                {alumno.nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-white">{alumno.nombre}</div>
                <div className="text-xs text-zinc-500">{alumno.plan} · {alumno.email || '—'}</div>
              </div>
              <StatusBadge activo={alumno.activo} />
              <button
                onClick={() => router.push(`/dashboard/admin/alumnos/${alumno.id}`)}
                className="text-xs text-zinc-500 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
              >
                Ver →
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
