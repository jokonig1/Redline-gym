'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import LoadingSpinner from '@/app/dashboard/_components/LoadingSpinner'
import StatusBadge from '@/app/dashboard/_components/StatusBadge'

// ── Helpers de fecha ──────────────────────────────────────────────────────────

function formatFecha(fechaStr) {
  if (!fechaStr) return '—'
  const [y, m, d] = fechaStr.split('-')
  const meses = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']
  return `${parseInt(d)} ${meses[parseInt(m) - 1]} ${y}`
}

function formatFechaCorta(fechaStr) {
  if (!fechaStr) return ''
  const [, m, d] = fechaStr.split('-')
  const meses = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']
  return `${parseInt(d)} ${meses[parseInt(m) - 1]}`
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
      <p className="text-sm text-zinc-600 text-center py-6">Sin sesiones registradas todavía</p>
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
                            {/* Si hay más de 1 sesión en la semana, separar con línea */}
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

// ── Campo editable ────────────────────────────────────────────────────────────

function Field({ label, field, type = 'text', editando, form, alumno, onChange }) {
  return (
    <div>
      <label className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1">{label}</label>
      {editando ? (
        <input
          type={type}
          value={form[field] || ''}
          onChange={e => onChange(field, e.target.value)}
          className="w-full bg-raised border border-border text-foreground rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-600"
        />
      ) : (
        <div className="text-sm text-foreground">{alumno[field] || <span className="text-zinc-500">—</span>}</div>
      )}
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function DetalleAlumno() {
  const router = useRouter()
  const { id } = useParams()
  const [alumno,    setAlumno]    = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [saving,    setSaving]    = useState(false)
  const [editando,  setEditando]  = useState(false)
  const [form,      setForm]      = useState({})
  const [errorSave, setErrorSave] = useState('')
  const [sesiones,  setSesiones]  = useState([])

  useEffect(() => {
    const supabase = createClient()
    async function fetchData() {
      const [{ data: a }, sesRes] = await Promise.all([
        supabase.from('alumnos').select('*, coach:coach_id(nombre)').eq('id', id).single(),
        fetch(`/api/sesiones-rutina?alumno_id=${id}`),
      ])
      setAlumno(a)
      setForm(a)
      setSesiones(sesRes.ok ? await sesRes.json() : [])
      setLoading(false)
    }
    fetchData()
  }, [id])

  function handleFieldChange(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSave() {
    setSaving(true)
    setErrorSave('')
    const supabase = createClient()
    const { error } = await supabase.from('alumnos').update({
      nombre:                form.nombre,
      rut:                   form.rut,
      telefono:              form.telefono,
      email:                 form.email,
      direccion:             form.direccion,
      contacto_emergencia:   form.contacto_emergencia,
      telefono_emergencia:   form.telefono_emergencia,
      objetivos:             form.objetivos,
      restricciones_medicas: form.restricciones_medicas,
      plan:                  form.plan,
      coach_id:              form.coach_id,
    }).eq('id', id)
    setSaving(false)
    if (error) { setErrorSave(error.message); return }
    setEditando(false)
    setAlumno(form)
  }

  if (loading) return <LoadingSpinner />

  if (!alumno) return (
    <div className="text-zinc-500 text-center py-12">Alumno no encontrado</div>
  )

  const fieldProps = { editando, form, alumno, onChange: handleFieldChange }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="text-zinc-500 hover:text-foreground transition-colors text-sm">
          ← Volver
        </button>
      </div>

      {/* Header alumno */}
      <div className="bg-surface border border-border rounded-xl p-5 mb-4 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-red-900/30 flex items-center justify-center text-xl font-black text-red-400">
          {alumno.nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1">
          <h2 className="text-foreground font-bold text-lg">{alumno.nombre}</h2>
          <div className="flex gap-3 mt-1">
            <StatusBadge activo={alumno.activo} />
            <span className="text-xs text-zinc-500">{alumno.plan}</span>
            <span className="text-xs text-zinc-500">Coach: {alumno.coach?.nombre || '—'}</span>
          </div>
        </div>
        <div className="flex gap-2">
          {editando ? (
            <>
              <button onClick={() => { setEditando(false); setErrorSave('') }}
                className="text-sm text-zinc-500 hover:text-foreground px-4 py-2 rounded-lg border border-border-strong transition-colors">
                Cancelar
              </button>
              <button onClick={handleSave} disabled={saving}
                className="bg-red-600 hover:bg-red-700 text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </>
          ) : (
            <button onClick={() => setEditando(true)}
              className="text-sm text-zinc-500 hover:text-foreground px-4 py-2 rounded-lg border border-border-strong transition-colors">
              Editar
            </button>
          )}
        </div>
      </div>

      {errorSave && (
        <p className="text-red-500 text-sm mb-4 bg-red-900/20 border border-red-900/30 rounded-lg px-4 py-2">
          {errorSave}
        </p>
      )}

      {/* Datos personales */}
      <div className="bg-surface border border-border rounded-xl p-5 mb-4">
        <div className="text-xs text-zinc-500 uppercase tracking-widest mb-4">Datos personales</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nombre completo" field="nombre" {...fieldProps} />
          <Field label="RUT" field="rut" {...fieldProps} />
          <Field label="Teléfono" field="telefono" {...fieldProps} />
          <Field label="Correo" field="email" type="email" {...fieldProps} />
          <Field label="Dirección" field="direccion" {...fieldProps} />
          <Field label="Fecha nacimiento" field="fecha_nacimiento" type="date" {...fieldProps} />
        </div>
      </div>

      {/* Contacto emergencia */}
      <div className="bg-surface border border-border rounded-xl p-5 mb-4">
        <div className="text-xs text-zinc-500 uppercase tracking-widest mb-4">Contacto de emergencia</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nombre contacto" field="contacto_emergencia" {...fieldProps} />
          <Field label="Teléfono contacto" field="telefono_emergencia" {...fieldProps} />
        </div>
      </div>

      {/* Info gimnasio */}
      <div className="bg-surface border border-border rounded-xl p-5 mb-4">
        <div className="text-xs text-zinc-500 uppercase tracking-widest mb-4">Información del gimnasio</div>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1">Objetivos</label>
            {editando ? (
              <textarea
                value={form.objetivos || ''}
                onChange={e => handleFieldChange('objetivos', e.target.value)}
                rows={3}
                className="w-full bg-raised border border-border text-foreground rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-600 resize-none"
              />
            ) : (
              <div className="text-sm text-foreground">{alumno.objetivos || <span className="text-zinc-500">—</span>}</div>
            )}
          </div>
          <div>
            <label className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1">Restricciones médicas</label>
            {editando ? (
              <textarea
                value={form.restricciones_medicas || ''}
                onChange={e => handleFieldChange('restricciones_medicas', e.target.value)}
                rows={3}
                className="w-full bg-raised border border-border text-foreground rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-600 resize-none"
              />
            ) : (
              <div className="text-sm text-foreground">{alumno.restricciones_medicas || <span className="text-zinc-500">—</span>}</div>
            )}
          </div>
        </div>
      </div>

      {/* Historial de rutinas */}
      <div className="bg-surface border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs text-zinc-500 uppercase tracking-widest">Historial de rutinas</div>
          <span className="text-xs text-zinc-600">{sesiones.length} sesión{sesiones.length !== 1 ? 'es' : ''}</span>
        </div>
        <HistorialRutinas sesiones={sesiones} />
      </div>

    </div>
  )
}
