'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import LoadingSpinner from '@/app/dashboard/_components/LoadingSpinner'

export default function AlumnoPerfil() {
  const [email,    setEmail]    = useState(null)
  const [alumno,   setAlumno]   = useState(null)
  const [coaches,  setCoaches]  = useState([])
  const [coachId,  setCoachId]  = useState('')
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [guardado, setGuardado] = useState(false)
  const [error,    setError]    = useState('')

  useEffect(() => {
    const supabase = createClient()
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) setEmail(user.email)
    }
    init()
  }, [])

  useEffect(() => {
    if (!email) return
    async function load() {
      const [alumnoRes, coachesRes] = await Promise.all([
        fetch(`/api/alumno/perfil?email=${encodeURIComponent(email)}`),
        fetch('/api/coaches'),
      ])
      const alumnoData  = alumnoRes.ok  ? await alumnoRes.json()  : null
      const coachesData = coachesRes.ok ? await coachesRes.json() : []

      setAlumno(alumnoData)
      setCoaches(coachesData)
      setCoachId(alumnoData?.coach_id || '')
      setLoading(false)
    }
    load()
  }, [email])

  async function handleGuardar() {
    if (!alumno) return
    setSaving(true)
    setError('')
    setGuardado(false)

    const res = await fetch('/api/alumno/perfil', {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, coach_id: coachId || null }),
    })

    if (res.ok) {
      const updated = await res.json()
      setAlumno(prev => ({ ...prev, coach_id: updated.coach_id, coach: updated.coach }))
      setGuardado(true)
      setTimeout(() => setGuardado(false), 3000)
    } else {
      const err = await res.json()
      setError(err.error || 'Error al guardar.')
    }
    setSaving(false)
  }

  if (loading) return <LoadingSpinner />

  if (!alumno) return (
    <div className="bg-surface border border-border rounded-xl p-8 text-center max-w-md">
      <div className="text-3xl mb-3">⚠️</div>
      <div className="text-foreground font-bold mb-1">Perfil no encontrado</div>
      <div className="text-zinc-500 text-sm">
        Tu cuenta no tiene un perfil de alumno asociado.<br />
        Contactá al administrador del gimnasio.
      </div>
    </div>
  )

  const initials = alumno.nombre?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="max-w-lg space-y-4">

      {/* Header */}
      <div className="bg-surface border border-border rounded-xl p-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-red-900/30 flex items-center justify-center text-xl font-black text-red-400 shrink-0">
          {initials}
        </div>
        <div>
          <h2 className="text-foreground font-bold text-lg leading-tight">{alumno.nombre}</h2>
          <div className="text-xs text-zinc-500 mt-0.5">{alumno.email}</div>
          <div className="text-xs text-zinc-600 mt-1">{alumno.plan || '—'}</div>
        </div>
      </div>

      {/* Elegir coach */}
      <div className="bg-surface border border-border rounded-xl p-5">
        <div className="text-xs text-zinc-500 uppercase tracking-widest mb-4">Mi coach</div>

        {alumno.coach?.nombre && (
          <div className="flex items-center gap-3 mb-4 p-3 bg-hover border border-border rounded-xl">
            <div className="w-8 h-8 rounded-full bg-red-900/30 flex items-center justify-center text-xs font-bold text-red-400 shrink-0">
              {alumno.coach.nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="text-sm font-medium text-foreground">{alumno.coach.nombre}</div>
              <div className="text-[10px] text-zinc-500">Coach actual</div>
            </div>
          </div>
        )}

        <label className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1.5">
          {alumno.coach?.nombre ? 'Cambiar coach' : 'Seleccionar coach'}
        </label>
        <select
          value={coachId}
          onChange={e => setCoachId(e.target.value)}
          className="w-full bg-raised border border-border text-foreground rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-red-600 transition-colors mb-4"
        >
          <option value="">Sin asignar</option>
          {coaches.map(c => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>

        {error && (
          <p className="text-xs text-red-400 bg-red-900/20 border border-red-900/30 rounded-lg px-3 py-2 mb-3">
            {error}
          </p>
        )}

        {guardado && (
          <p className="text-xs text-green-400 bg-green-900/20 border border-green-900/30 rounded-lg px-3 py-2 mb-3">
            ✓ Coach actualizado correctamente
          </p>
        )}

        <button
          onClick={handleGuardar}
          disabled={saving || coachId === (alumno.coach_id || '')}
          className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white text-sm font-bold py-2.5 rounded-xl transition-colors"
        >
          {saving ? 'Guardando…' : 'Guardar'}
        </button>
      </div>

      {/* Datos personales (solo lectura) */}
      <div className="bg-surface border border-border rounded-xl p-5">
        <div className="text-xs text-zinc-500 uppercase tracking-widest mb-4">Mis datos</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'Nombre',    value: alumno.nombre   },
            { label: 'RUT',       value: alumno.rut      },
            { label: 'Teléfono',  value: alumno.telefono },
            { label: 'Plan',      value: alumno.plan     },
          ].map(({ label, value }) => (
            <div key={label}>
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">{label}</div>
              <div className="text-sm text-foreground">{value || <span className="text-zinc-500">—</span>}</div>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-zinc-600 mt-4">
          Para modificar tus datos personales, contactá al administrador.
        </p>
      </div>

    </div>
  )
}
