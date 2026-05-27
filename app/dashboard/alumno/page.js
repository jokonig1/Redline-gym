'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import LoadingSpinner from '@/app/dashboard/_components/LoadingSpinner'

function formatFecha(fechaStr) {
  if (!fechaStr) return '—'
  const [y, m, d] = fechaStr.split('-')
  const meses = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']
  return `${parseInt(d)} ${meses[parseInt(m) - 1]} ${y}`
}

export default function AlumnoProgreso() {
  const [alumno,   setAlumno]   = useState(null)
  const [sesiones, setSesiones] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [expandida, setExpandida] = useState(null) // id de sesión expandida

  useEffect(() => {
    const supabase = createClient()
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) { setLoading(false); return }

      const [alumnoRes, sesionesRes] = await Promise.all([
        fetch(`/api/alumno/perfil?email=${encodeURIComponent(user.email)}`),
        // sesiones se cargan después de tener el alumno_id
        Promise.resolve(null),
      ])

      const alumnoData = alumnoRes.ok ? await alumnoRes.json() : null
      setAlumno(alumnoData)

      if (alumnoData?.id) {
        const sRes = await fetch(`/api/sesiones-rutina?alumno_id=${alumnoData.id}`)
        setSesiones(sRes.ok ? await sRes.json() : [])
      }

      setLoading(false)
    }
    init()
  }, [])

  if (loading) return <LoadingSpinner />

  if (!alumno) return (
    <div className="bg-[#141414] border border-white/5 rounded-xl p-8 text-center max-w-md">
      <div className="text-3xl mb-3">⚠️</div>
      <div className="text-white font-bold mb-1">Perfil no encontrado</div>
      <div className="text-zinc-500 text-sm">Contactá al administrador del gimnasio.</div>
    </div>
  )

  const totalSesiones  = sesiones.length
  const ultimaSesion   = sesiones[0]?.fecha
  const rutinasUnicas  = [...new Set(sesiones.map(s => s.rutina_nombre))]

  return (
    <div className="max-w-2xl space-y-5">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white">
          Hola, <span className="text-red-500">{alumno.nombre?.split(' ')[0]}</span>
        </h1>
        <p className="text-xs text-zinc-500 mt-1">Tu historial de entrenamiento</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Sesiones',      value: totalSesiones,          sub: 'registradas' },
          { label: 'Última sesión', value: ultimaSesion ? formatFecha(ultimaSesion) : '—', sub: '' },
          { label: 'Rutinas',       value: rutinasUnicas.length,   sub: 'distintas' },
        ].map(({ label, value, sub }) => (
          <div key={label} className="bg-[#141414] border border-white/5 rounded-xl p-4 text-center">
            <div className="text-xl sm:text-2xl font-black text-white leading-none">{value}</div>
            {sub && <div className="text-[10px] text-zinc-600 mt-1">{sub}</div>}
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Historial */}
      <div>
        <div className="text-xs text-zinc-500 uppercase tracking-widest mb-3">Historial de sesiones</div>

        {sesiones.length === 0 ? (
          <div className="bg-[#141414] border border-white/5 rounded-xl p-10 text-center">
            <div className="text-4xl mb-3">🏋️</div>
            <div className="text-white font-bold mb-1">Sin sesiones todavía</div>
            <div className="text-zinc-600 text-sm">Tus sesiones aparecerán aquí después de entrenar</div>
          </div>
        ) : (
          <div className="space-y-2">
            {sesiones.map(s => (
              <div key={s.id} className="bg-[#141414] border border-white/5 rounded-xl overflow-hidden">

                {/* Cabecera de la sesión */}
                <button
                  onClick={() => setExpandida(prev => prev === s.id ? null : s.id)}
                  className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-white/2 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-red-900/20 flex items-center justify-center shrink-0">
                      <span className="text-red-500 text-base">◈</span>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">{s.rutina_nombre}</div>
                      <div className="text-xs text-zinc-500">{formatFecha(s.fecha)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[10px] text-zinc-600">
                      {s.ejercicios?.length || 0} ejercicio{s.ejercicios?.length !== 1 ? 's' : ''}
                    </span>
                    <span className="text-zinc-600 text-sm">
                      {expandida === s.id ? '▲' : '▼'}
                    </span>
                  </div>
                </button>

                {/* Detalle expandible */}
                {expandida === s.id && (
                  <div className="border-t border-white/5 px-4 py-4 space-y-4">
                    {(s.ejercicios || []).map((ej, i) => (
                      <div key={i}>
                        <div className="text-xs font-semibold text-zinc-300 mb-2">{ej.nombre}</div>
                        <div className="flex flex-wrap gap-2">
                          {(ej.series || []).map((serie, j) => (
                            <div key={j} className="bg-white/5 border border-white/8 rounded-lg px-3 py-1.5 text-center">
                              <div className="text-[10px] text-zinc-500 mb-0.5">Serie {j + 1}</div>
                              <div className="text-xs font-bold text-white">
                                {serie.peso ? `${serie.peso} kg` : '—'}
                                <span className="text-zinc-500 font-normal"> × </span>
                                {serie.reps ? `${serie.reps} reps` : '—'}
                              </div>
                            </div>
                          ))}
                          {(!ej.series || ej.series.length === 0) && (
                            <span className="text-xs text-zinc-700">Sin series registradas</span>
                          )}
                        </div>
                      </div>
                    ))}

                    {s.notas && (
                      <div className="mt-2 pt-3 border-t border-white/5">
                        <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Notas</div>
                        <div className="text-xs text-zinc-400">{s.notas}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
