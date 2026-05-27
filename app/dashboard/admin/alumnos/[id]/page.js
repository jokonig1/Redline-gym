'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import LoadingSpinner from '@/app/dashboard/_components/LoadingSpinner'
import StatusBadge from '@/app/dashboard/_components/StatusBadge'

function Field({ label, field, type = 'text', editando, form, alumno, onChange }) {
  return (
    <div>
      <label className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1">{label}</label>
      {editando ? (
        <input
          type={type}
          value={form[field] || ''}
          onChange={e => onChange(field, e.target.value)}
          className="w-full bg-[#1c1c1c] border border-white/5 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-600"
        />
      ) : (
        <div className="text-sm text-white">{alumno[field] || <span className="text-zinc-600">—</span>}</div>
      )}
    </div>
  )
}

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
  const [expandida, setExpandida] = useState(null)

  function formatFecha(fechaStr) {
    if (!fechaStr) return '—'
    const [y, m, d] = fechaStr.split('-')
    const meses = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']
    return `${parseInt(d)} ${meses[parseInt(m) - 1]} ${y}`
  }

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
        <button onClick={() => router.back()} className="text-zinc-500 hover:text-white transition-colors text-sm">
          ← Volver
        </button>
      </div>

      {/* Header alumno */}
      <div className="bg-[#141414] border border-white/5 rounded-xl p-5 mb-4 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-red-900/30 flex items-center justify-center text-xl font-black text-red-400">
          {alumno.nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1">
          <h2 className="text-white font-bold text-lg">{alumno.nombre}</h2>
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
                className="text-sm text-zinc-400 hover:text-white px-4 py-2 rounded-lg border border-white/10 transition-colors">
                Cancelar
              </button>
              <button onClick={handleSave} disabled={saving}
                className="bg-red-600 hover:bg-red-700 text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </>
          ) : (
            <button onClick={() => setEditando(true)}
              className="text-sm text-zinc-400 hover:text-white px-4 py-2 rounded-lg border border-white/10 transition-colors">
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
      <div className="bg-[#141414] border border-white/5 rounded-xl p-5 mb-4">
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
      <div className="bg-[#141414] border border-white/5 rounded-xl p-5 mb-4">
        <div className="text-xs text-zinc-500 uppercase tracking-widest mb-4">Contacto de emergencia</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nombre contacto" field="contacto_emergencia" {...fieldProps} />
          <Field label="Teléfono contacto" field="telefono_emergencia" {...fieldProps} />
        </div>
      </div>

      {/* Info gimnasio */}
      <div className="bg-[#141414] border border-white/5 rounded-xl p-5">
        <div className="text-xs text-zinc-500 uppercase tracking-widest mb-4">Información del gimnasio</div>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1">Objetivos</label>
            {editando ? (
              <textarea
                value={form.objetivos || ''}
                onChange={e => handleFieldChange('objetivos', e.target.value)}
                rows={3}
                className="w-full bg-[#1c1c1c] border border-white/5 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-600 resize-none"
              />
            ) : (
              <div className="text-sm text-white">{alumno.objetivos || <span className="text-zinc-600">—</span>}</div>
            )}
          </div>
          <div>
            <label className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1">Restricciones médicas</label>
            {editando ? (
              <textarea
                value={form.restricciones_medicas || ''}
                onChange={e => handleFieldChange('restricciones_medicas', e.target.value)}
                rows={3}
                className="w-full bg-[#1c1c1c] border border-white/5 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-600 resize-none"
              />
            ) : (
              <div className="text-sm text-white">{alumno.restricciones_medicas || <span className="text-zinc-600">—</span>}</div>
            )}
          </div>
        </div>
      </div>

      {/* Historial de sesiones */}
      <div className="bg-[#141414] border border-white/5 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs text-zinc-500 uppercase tracking-widest">Historial de rutinas</div>
          <span className="text-xs text-zinc-600">{sesiones.length} sesión{sesiones.length !== 1 ? 'es' : ''}</span>
        </div>

        {sesiones.length === 0 ? (
          <p className="text-sm text-zinc-700 text-center py-6">Sin sesiones registradas todavía</p>
        ) : (
          <div className="space-y-2">
            {sesiones.map(s => (
              <div key={s.id} className="border border-white/5 rounded-xl overflow-hidden">

                <button
                  onClick={() => setExpandida(prev => prev === s.id ? null : s.id)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/3 transition-colors text-left"
                >
                  <div>
                    <span className="text-sm font-semibold text-white">{s.rutina_nombre}</span>
                    <span className="text-xs text-zinc-500 ml-3">{formatFecha(s.fecha)}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-zinc-600">{s.ejercicios?.length || 0} ejerc.</span>
                    <span className="text-zinc-600 text-xs">{expandida === s.id ? '▲' : '▼'}</span>
                  </div>
                </button>

                {expandida === s.id && (
                  <div className="border-t border-white/5 px-4 py-3 space-y-3 bg-black/10">
                    {(s.ejercicios || []).map((ej, i) => (
                      <div key={i}>
                        <div className="text-xs font-semibold text-zinc-300 mb-1.5">{ej.nombre}</div>
                        <div className="flex flex-wrap gap-2">
                          {(ej.series || []).map((serie, j) => (
                            <div key={j} className="bg-white/5 border border-white/8 rounded-lg px-3 py-1.5 text-center">
                              <div className="text-[9px] text-zinc-600 mb-0.5">Serie {j + 1}</div>
                              <div className="text-xs font-bold text-white">
                                {serie.peso ? `${serie.peso} kg` : '—'}
                                <span className="text-zinc-500 font-normal"> × </span>
                                {serie.reps ? `${serie.reps}` : '—'}
                              </div>
                            </div>
                          ))}
                          {(!ej.series || ej.series.length === 0) && (
                            <span className="text-xs text-zinc-700">Sin series</span>
                          )}
                        </div>
                      </div>
                    ))}
                    {s.notas && (
                      <div className="pt-2 border-t border-white/5">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Notas: </span>
                        <span className="text-xs text-zinc-400">{s.notas}</span>
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
