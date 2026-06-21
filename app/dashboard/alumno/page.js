'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import LoadingSpinner from '@/app/dashboard/_components/LoadingSpinner'

// ── Helpers de fecha ──────────────────────────────────────────────────────────

function formatFechaCorta(fechaStr) {
  if (!fechaStr) return ''
  const [, m, d] = fechaStr.split('-')
  const meses = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']
  return `${parseInt(d)} ${meses[parseInt(m) - 1]}`
}

function formatFecha(fechaStr) {
  if (!fechaStr) return '—'
  const [y, m, d] = fechaStr.split('-')
  const meses = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']
  return `${parseInt(d)} ${meses[parseInt(m) - 1]} ${y}`
}

function getMesLabel(yearMonth) {
  const [year, month] = yearMonth.split('-')
  return new Date(parseInt(year), parseInt(month) - 1, 1)
    .toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })
}

function getWeekOfMonth(fechaStr) {
  return Math.ceil(parseInt(fechaStr.split('-')[2]) / 7)
}

// ── Historial de rutinas con vista por mes y semanas ──────────────────────────

function HistorialRutinas({ sesiones }) {
  const [abiertos, setAbiertos] = useState(() => {
    if (!sesiones.length) return {}
    return { [sesiones[0].fecha.substring(0, 7)]: true }
  })

  function toggle(mes) {
    setAbiertos(prev => ({ ...prev, [mes]: !prev[mes] }))
  }

  if (!sesiones.length) {
    return (
      <div className="bg-surface border border-border rounded-xl p-10 text-center">
        <div className="text-4xl mb-3">🏋️</div>
        <div className="text-foreground font-bold mb-1">Sin sesiones todavía</div>
        <div className="text-zinc-600 text-sm">Tus sesiones aparecerán aquí después de entrenar</div>
      </div>
    )
  }

  // Agrupar por mes
  const porMes = {}
  sesiones.forEach(s => {
    const mes = s.fecha.substring(0, 7)
    if (!porMes[mes]) porMes[mes] = []
    porMes[mes].push(s)
  })
  const meses = Object.keys(porMes).sort().reverse()

  return (
    <div className="space-y-2">
      {meses.map(mes => {
        const sesionsMes = porMes[mes]
        const isOpen = !!abiertos[mes]

        // Agrupar por semana del mes
        const porSemana = {}
        sesionsMes.forEach(s => {
          const w = getWeekOfMonth(s.fecha)
          if (!porSemana[w]) porSemana[w] = []
          porSemana[w].push(s)
        })
        const semanas = Object.keys(porSemana).map(Number).sort()

        return (
          <div key={mes} className="border border-border rounded-xl overflow-hidden">

            {/* Cabecera del mes */}
            <button
              onClick={() => toggle(mes)}
              className="w-full flex items-center justify-between px-4 py-3.5 bg-surface hover:bg-hover transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-foreground capitalize">
                  {getMesLabel(mes)}
                </span>
                <span className="text-[10px] bg-hover-md text-zinc-500 px-2 py-0.5 rounded-full">
                  {sesionsMes.length} {sesionsMes.length === 1 ? 'sesión' : 'sesiones'}
                </span>
              </div>
              <span className="text-zinc-500 text-xs">{isOpen ? '▲' : '▼'}</span>
            </button>

            {/* Cuerpo: columnas por semana en md+, filas en móvil */}
            {isOpen && (
              <div className="border-t border-border">
                <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-border">
                  {semanas.map(w => (
                    <div key={w} className="flex-1 flex flex-col">

                      {/* Cabecera de semana */}
                      <div className="px-3 py-2.5 bg-raised border-b border-border shrink-0">
                        <div className="text-[11px] font-bold text-foreground uppercase tracking-wider">
                          Semana {w}
                        </div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">
                          {porSemana[w].map(s => formatFechaCorta(s.fecha)).join(' · ')}
                        </div>
                      </div>

                      {/* Sesiones de la semana */}
                      <div className="p-3 space-y-4">
                        {porSemana[w].map((sesion, idx) => (
                          <div key={sesion.id}>
                            {idx > 0 && <div className="border-t border-border mb-4" />}

                            {/* Nombre de rutina + fecha */}
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[11px] font-bold text-red-500 uppercase tracking-wider leading-tight">
                                {sesion.rutina_nombre}
                              </span>
                              <span className="text-[9px] text-zinc-500 shrink-0 ml-1">
                                {formatFechaCorta(sesion.fecha)}
                              </span>
                            </div>

                            {/* Ejercicios */}
                            <div className="space-y-2.5">
                              {(sesion.ejercicios || []).map((ej, i) => (
                                <div key={i}>
                                  <div className="text-[10px] text-zinc-500 mb-1 truncate" title={ej.nombre}>
                                    {ej.nombre}
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {(ej.series || []).map((serie, j) => (
                                      <span
                                        key={j}
                                        className="text-[10px] font-bold text-foreground bg-hover-md border border-border px-1.5 py-0.5 rounded"
                                      >
                                        {serie.peso ? `${serie.peso}kg` : '—'}
                                        <span className="text-zinc-500 font-normal">×</span>
                                        {serie.reps || '—'}
                                      </span>
                                    ))}
                                    {(!ej.series || ej.series.length === 0) && (
                                      <span className="text-[10px] text-zinc-600">—</span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>

                            {sesion.notas && (
                              <div className="mt-2 pt-2 border-t border-border">
                                <span className="text-[9px] text-zinc-500 italic">{sesion.notas}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function AlumnoProgreso() {
  const [alumno,   setAlumno]   = useState(null)
  const [sesiones, setSesiones] = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    const supabase = createClient()
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) { setLoading(false); return }

      const alumnoRes = await fetch(`/api/alumno/perfil?email=${encodeURIComponent(user.email)}`)
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
    <div className="bg-surface border border-border rounded-xl p-8 text-center max-w-md">
      <div className="text-3xl mb-3">⚠️</div>
      <div className="text-foreground font-bold mb-1">Perfil no encontrado</div>
      <div className="text-zinc-500 text-sm">Contactá al administrador del gimnasio.</div>
    </div>
  )

  const totalSesiones = sesiones.length
  const ultimaSesion  = sesiones[0]?.fecha
  const rutinasUnicas = [...new Set(sesiones.map(s => s.rutina_nombre))]

  return (
    <div className="max-w-3xl space-y-5">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-foreground">
          Hola, <span className="text-red-500">{alumno.nombre?.split(' ')[0]}</span>
        </h1>
        <p className="text-xs text-zinc-500 mt-1">Tu historial de entrenamiento</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Sesiones',      value: totalSesiones,                                        sub: 'registradas' },
          { label: 'Última sesión', value: ultimaSesion ? formatFecha(ultimaSesion) : '—',       sub: '' },
          { label: 'Rutinas',       value: rutinasUnicas.length,                                 sub: 'distintas' },
        ].map(({ label, value, sub }) => (
          <div key={label} className="bg-surface border border-border rounded-xl p-4 text-center">
            <div className="text-xl sm:text-2xl font-black text-foreground leading-none">{value}</div>
            {sub && <div className="text-[10px] text-zinc-600 mt-1">{sub}</div>}
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Historial por mes y semana */}
      <div>
        <div className="text-xs text-zinc-500 uppercase tracking-widest mb-3">Historial de sesiones</div>
        <HistorialRutinas sesiones={sesiones} />
      </div>

    </div>
  )
}
