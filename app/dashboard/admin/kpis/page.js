'use client'
import { useEffect, useState } from 'react'
import LoadingSpinner from '@/app/dashboard/_components/LoadingSpinner'
import { COLORES_COACH } from '@/lib/constants'

function Ring({ pct, color, size = 88, stroke = 9 }) {
  const r    = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const dash = ((pct ?? 0) / 100) * circ
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(128,128,128,0.15)" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color}
        strokeWidth={stroke} strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.8s ease' }} />
    </svg>
  )
}

function StatCard({ tag, label, value, sub, color = '#ef4444', note }) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-5 flex flex-col gap-1"
      style={{ borderTop: `2px solid ${color}` }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
          style={{ background: `${color}20`, color }}>
          {tag}
        </span>
        {note && <span className="text-[10px] text-zinc-600">{note}</span>}
      </div>
      <div className="text-3xl font-black leading-none" style={{ color }}>{value}</div>
      <div className="text-xs text-zinc-500 mt-1">{label}</div>
      {sub && <div className="text-[10px] text-zinc-600">{sub}</div>}
    </div>
  )
}

function BarRow({ label, value, max, colorHex, pct }) {
  const width = max > 0 ? Math.round((value / max) * 100) : (pct ?? 0)
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-sm text-foreground truncate max-w-[65%]">{label}</span>
        <span className="text-sm font-bold text-foreground shrink-0">{value}</span>
      </div>
      <div className="h-2.5 bg-hover-md rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${width}%`, background: colorHex, transition: 'width 0.8s ease' }}
        />
      </div>
    </div>
  )
}

function SectionTitle({ children }) {
  return (
    <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-4">{children}</div>
  )
}

const PLAN_COLORS = {
  '2x/sem':       '#2563eb',
  '3x/sem':       '#16a34a',
  'Full':         '#dc2626',
  'Personalizado':'#7c3aed',
  'Sin plan':     '#52525b',
}

export default function AdminMetricas() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    fetch('/api/admin/metricas')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => { setError('Error al cargar métricas.'); setLoading(false) })
  }, [])

  if (loading) return <LoadingSpinner />
  if (error)   return <div className="text-red-400 text-sm">{error}</div>

  const { alumnos, asistencia, excepciones, porPlan, porCoach, sesionesRutina, coaches, semana } = data
  const capacidadMax  = data.capacidadMax ?? 100
  const tasaOcupacion = Math.round(alumnos.activos / capacidadMax * 100)
  const maxPlan  = Math.max(...porPlan.map(p => p.count), 1)
  const maxCoach = Math.max(...porCoach.map(c => c.count), 1)

  function fmtFecha(str) {
    if (!str) return ''
    const [, m, d] = str.split('-')
    const meses = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']
    return `${parseInt(d)} ${meses[parseInt(m) - 1]}`
  }

  return (
    <div className="max-w-4xl space-y-6">

      {/* Encabezado */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-black text-foreground">Métricas</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Semana: {fmtFecha(semana.inicio)} — {fmtFecha(semana.fin)}
          </p>
        </div>
        <span className="text-[10px] text-zinc-600 bg-hover border border-border px-3 py-1.5 rounded-full">
          Actualizado ahora
        </span>
      </div>

      {/* Fila 1: Stats principales */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        <StatCard tag="Alumnos" label="Alumnos activos" value={alumnos.activos} color="#22c55e"
          sub={`${alumnos.inactivos} inactivos`} />
        <StatCard tag="Rutinas" label="Sesiones registradas esta semana" value={sesionesRutina} color="#a78bfa"
          note="semana" />
        <StatCard tag="Cancelaciones" label="Cancelaciones esta semana" value={excepciones.cancelaciones}
          color={excepciones.cancelaciones > 3 ? '#f87171' : '#71717a'}
          sub={`${excepciones.reagendamientos} reagendadas`} />
        <StatCard tag="Nuevos" label="Nuevos alumnos este mes" value={alumnos.nuevosEsteMes} color="#fbbf24" />
      </div>

      {/* Fila 2: Asistencia + Ocupación */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        <div className="bg-surface border border-border rounded-2xl p-5">
          <SectionTitle>Tasa de asistencia semanal</SectionTitle>
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <Ring pct={asistencia.tasa ?? 0} color="#22c55e" size={80} stroke={8} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-black text-foreground">
                  {asistencia.tasa !== null ? `${asistencia.tasa}%` : '—'}
                </span>
              </div>
            </div>
            <div className="flex gap-4 flex-1 flex-wrap">
              <div>
                <div className="text-2xl font-black text-green-400">{asistencia.asistieron}</div>
                <div className="text-xs text-zinc-500">asistencias</div>
              </div>
              <div>
                <div className="text-2xl font-black text-red-400">{asistencia.total - asistencia.asistieron}</div>
                <div className="text-xs text-zinc-500">inasistencias</div>
              </div>
              {asistencia.total === 0 && (
                <div className="text-xs text-zinc-600 italic self-center">Sin registros</div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-5">
          <SectionTitle>Tasa de ocupación</SectionTitle>
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <Ring pct={tasaOcupacion ?? 0} color="#06b6d4" size={80} stroke={8} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-black text-foreground">
                  {tasaOcupacion !== null ? `${tasaOcupacion}%` : '—'}
                </span>
              </div>
            </div>
            <div className="flex gap-4 flex-1 flex-wrap">
              <div>
                <div className="text-2xl font-black text-cyan-400">{alumnos.activos}</div>
                <div className="text-xs text-zinc-500">activos</div>
              </div>
              <div>
                <div className="text-2xl font-black text-zinc-400">{capacidadMax - (alumnos.activos ?? 0)}</div>
                <div className="text-xs text-zinc-500">cupos libres</div>
              </div>
              <div className="text-[10px] text-zinc-500 self-end">máx: {capacidadMax}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Fila 3: Por plan + Por coach */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-surface border border-border rounded-2xl p-5">
          <SectionTitle>Alumnos por plan</SectionTitle>
          <div className="space-y-3.5">
            {porPlan.filter(p => p.count > 0).length === 0 ? (
              <p className="text-xs text-zinc-600 italic">Sin datos</p>
            ) : (
              porPlan
                .filter(p => p.count > 0)
                .sort((a, b) => b.count - a.count)
                .map(({ plan, count }) => (
                  <BarRow key={plan} label={plan} value={count} max={maxPlan}
                    colorHex={PLAN_COLORS[plan] || '#52525b'} />
                ))
            )}
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-5">
          <SectionTitle>Alumnos por coach</SectionTitle>
          <div className="space-y-3.5">
            {porCoach.length === 0 ? (
              <p className="text-xs text-zinc-600 italic">Sin datos</p>
            ) : (
              porCoach.map(({ nombre, count, color }, i) => {
                const paleta = color !== null && color !== undefined
                  ? COLORES_COACH[Number(color) % COLORES_COACH.length]
                  : COLORES_COACH[i % COLORES_COACH.length]
                return (
                  <BarRow key={nombre} label={nombre} value={count} max={maxCoach}
                    colorHex={paleta.border} />
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Fila 4: Cancelaciones vs Reagendamientos */}
      <div className="bg-surface border border-border rounded-2xl p-5">
        <SectionTitle>Cancelaciones y reagendamientos — semana actual</SectionTitle>

        {excepciones.total === 0 ? (
          <div className="text-center py-6">
            <div className="text-xs font-bold text-green-500 uppercase tracking-widest mb-2">Sin novedades</div>
            <div className="text-sm text-zinc-500 font-medium">Sin cancelaciones ni reagendamientos esta semana</div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Cancelaciones',   value: excepciones.cancelaciones,   color: '#f87171',
                sub: 'clases canceladas definitivamente' },
              { label: 'Reagendamientos', value: excepciones.reagendamientos,  color: '#fbbf24',
                sub: 'clases movidas a otra fecha' },
            ].map(({ label, value, color, sub }) => (
              <div key={label} className="bg-hover border border-border rounded-xl p-4 text-center"
                style={{ borderTop: `2px solid ${color}40` }}>
                <div className="text-3xl font-black" style={{ color }}>{value}</div>
                <div className="text-xs font-semibold text-zinc-500 mt-2">{label}</div>
                <div className="text-[10px] text-zinc-600 mt-0.5">{sub}</div>
              </div>
            ))}
          </div>
        )}

        {excepciones.total > 0 && (
          <div className="mt-4">
            <div className="h-3 bg-hover-md rounded-full overflow-hidden flex">
              <div className="h-full bg-red-500/70 rounded-l-full transition-all duration-700"
                style={{ width: `${Math.round(excepciones.cancelaciones / excepciones.total * 100)}%` }} />
              <div className="h-full bg-amber-400/70 rounded-r-full transition-all duration-700"
                style={{ width: `${Math.round(excepciones.reagendamientos / excepciones.total * 100)}%` }} />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-[10px] text-red-400">Cancelaciones</span>
              <span className="text-[10px] text-amber-400">Reagendamientos</span>
            </div>
          </div>
        )}
      </div>

      {/* Fila 5: Resumen general */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-surface border border-border rounded-2xl p-4 text-center">
          <div className="text-2xl font-black text-foreground">{coaches}</div>
          <div className="text-xs text-zinc-500 mt-1">Coaches activos</div>
        </div>
        <div className="bg-surface border border-border rounded-2xl p-4 text-center">
          <div className="text-2xl font-black text-foreground">{alumnos.total}</div>
          <div className="text-xs text-zinc-500 mt-1">Alumnos totales</div>
        </div>
        <div className="bg-surface border border-border rounded-2xl p-4 text-center">
          <div className="text-2xl font-black text-foreground">
            {alumnos.activos > 0 ? `${Math.round(alumnos.activos / alumnos.total * 100)}%` : '—'}
          </div>
          <div className="text-xs text-zinc-500 mt-1">Retención</div>
        </div>
      </div>

    </div>
  )
}
