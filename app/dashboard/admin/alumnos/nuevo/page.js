'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { DIAS, DIAS_LABEL_LARGO } from '@/lib/constants'

function Field({ label, name, type = 'text', required = false, value, onChange }) {
  return (
    <div>
      <label className="text-xs text-zinc-500 uppercase tracking-wider block mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type} name={name} value={value} onChange={onChange} required={required}
        className="w-full bg-[#1c1c1c] border border-white/5 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-red-600 transition-colors"
      />
    </div>
  )
}

export default function NuevoAlumno() {
  const router  = useRouter()
  const [loading, setLoading] = useState(false)
  const [coaches, setCoaches] = useState([])
  const [error,   setError]   = useState('')
  const [form,    setForm]    = useState({
    nombre: '', rut: '', fecha_nacimiento: '', telefono: '',
    email: '', direccion: '', contacto_emergencia: '',
    telefono_emergencia: '', objetivos: '',
    restricciones_medicas: '', plan: '3x/sem', coach_id: '',
  })
  const [horarios, setHorarios] = useState([])

  useEffect(() => {
    fetch('/api/coaches')
      .then(r => r.ok ? r.json() : [])
      .then(data => setCoaches(data))
  }, [])

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  function handleHorarioChange(index, field, value) {
    setHorarios(prev => prev.map((h, i) => i === index ? { ...h, [field]: value } : h))
  }

  function agregarHorario() {
    setHorarios(prev => [...prev, { dia: 'lunes', hora: '08:00', tipo: 'grupal' }])
  }

  function eliminarHorario(index) {
    setHorarios(prev => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()

    const { data: alumno, error: alumnoError } = await supabase
      .from('alumnos')
      .insert([{ ...form, coach_id: form.coach_id || null }])
      .select()
      .single()

    if (alumnoError) {
      setError('Error al guardar: ' + alumnoError.message)
      setLoading(false)
      return
    }

    const horariosValidos = horarios.filter(h => h.dia && h.hora)
    if (horariosValidos.length > 0) {
      await supabase.from('alumno_horarios').insert(
        horariosValidos.map(h => ({
          alumno_id: alumno.id,
          coach_id:  form.coach_id || null,
          dia:       h.dia,
          hora:      h.hora,
          tipo:      h.tipo,
          activo:    true,
        }))
      )
    }

    router.push('/dashboard/admin/alumnos')
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="text-zinc-500 hover:text-white transition-colors text-sm">
          ← Volver
        </button>
        <h2 className="text-white font-bold">Nuevo Alumno</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Datos personales */}
        <div className="bg-[#141414] border border-white/5 rounded-xl p-5">
          <div className="text-xs text-zinc-500 uppercase tracking-widest mb-4">Datos personales</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nombre completo"  name="nombre"           required value={form.nombre}           onChange={handleChange} />
            <Field label="RUT"              name="rut"                       value={form.rut}               onChange={handleChange} />
            <Field label="Fecha nacimiento" name="fecha_nacimiento" type="date" value={form.fecha_nacimiento} onChange={handleChange} />
            <Field label="Teléfono"         name="telefono"                  value={form.telefono}          onChange={handleChange} />
            <Field label="Correo"           name="email"            type="email" value={form.email}         onChange={handleChange} />
            <Field label="Dirección"        name="direccion"                 value={form.direccion}         onChange={handleChange} />
          </div>
        </div>

        {/* Contacto emergencia */}
        <div className="bg-[#141414] border border-white/5 rounded-xl p-5">
          <div className="text-xs text-zinc-500 uppercase tracking-widest mb-4">Contacto de emergencia</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nombre contacto"   name="contacto_emergencia"  value={form.contacto_emergencia}  onChange={handleChange} />
            <Field label="Teléfono contacto" name="telefono_emergencia"  value={form.telefono_emergencia}  onChange={handleChange} />
          </div>
        </div>

        {/* Info gimnasio */}
        <div className="bg-[#141414] border border-white/5 rounded-xl p-5">
          <div className="text-xs text-zinc-500 uppercase tracking-widest mb-4">Información del gimnasio</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-wider block mb-1.5">Plan</label>
              <select name="plan" value={form.plan} onChange={handleChange}
                className="w-full bg-[#1c1c1c] border border-white/5 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-red-600">
                <option value="2x/sem">2x por semana</option>
                <option value="3x/sem">3x por semana</option>
                <option value="Full">Full (5x/sem)</option>
                <option value="Personalizado">Personalizado</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-wider block mb-1.5">Coach asignado</label>
              <select name="coach_id" value={form.coach_id} onChange={handleChange}
                className="w-full bg-[#1c1c1c] border border-white/5 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-red-600">
                <option value="">Sin asignar</option>
                {coaches.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-zinc-500 uppercase tracking-wider block mb-1.5">Objetivos</label>
              <textarea name="objetivos" value={form.objetivos} onChange={handleChange} rows={3}
                className="w-full bg-[#1c1c1c] border border-white/5 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-red-600 resize-none" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-zinc-500 uppercase tracking-wider block mb-1.5">Restricciones médicas</label>
              <textarea name="restricciones_medicas" value={form.restricciones_medicas} onChange={handleChange} rows={3}
                className="w-full bg-[#1c1c1c] border border-white/5 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-red-600 resize-none" />
            </div>
          </div>
        </div>

        {/* Horarios (opcional) */}
        <div className="bg-[#141414] border border-white/5 rounded-xl p-5">
          <div className="flex items-center justify-between mb-1">
            <div className="text-xs text-zinc-500 uppercase tracking-widest">Horario semanal fijo</div>
            <button type="button" onClick={agregarHorario}
              className="text-xs text-red-500 hover:text-red-400 transition-colors font-medium">
              + Agregar día
            </button>
          </div>
          <p className="text-[11px] text-zinc-700 mb-4">
            Opcional — el coach puede asignarlo después desde &quot;Mis Alumnos&quot;
          </p>

          {horarios.length === 0 ? (
            <button
              type="button"
              onClick={agregarHorario}
              className="w-full border border-dashed border-white/10 text-zinc-600 hover:text-zinc-400 hover:border-white/20 text-xs py-4 rounded-lg transition-colors"
            >
              + Agregar horario
            </button>
          ) : (
            <div className="space-y-3">
              {horarios.map((h, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-3 items-end">
                  <div>
                    <label className="text-xs text-zinc-500 uppercase tracking-wider block mb-1.5">Día</label>
                    <select
                      value={h.dia}
                      onChange={e => handleHorarioChange(i, 'dia', e.target.value)}
                      className="w-full bg-[#1c1c1c] border border-white/5 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-red-600"
                    >
                      {DIAS.map(d => <option key={d} value={d}>{DIAS_LABEL_LARGO[d]}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 uppercase tracking-wider block mb-1.5">Hora</label>
                    <input
                      type="time"
                      value={h.hora}
                      onChange={e => handleHorarioChange(i, 'hora', e.target.value)}
                      className="w-full bg-[#1c1c1c] border border-white/5 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-red-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 uppercase tracking-wider block mb-1.5">Tipo</label>
                    <select
                      value={h.tipo}
                      onChange={e => handleHorarioChange(i, 'tipo', e.target.value)}
                      className="w-full bg-[#1c1c1c] border border-white/5 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-red-600"
                    >
                      <option value="grupal">Grupal</option>
                      <option value="personalizado">Personalizado</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => eliminarHorario(i)}
                    className="text-zinc-600 hover:text-red-400 transition-colors pb-2"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex gap-3">
          <button type="button" onClick={() => router.back()}
            className="px-6 py-2.5 rounded-lg border border-white/10 text-zinc-400 hover:text-white text-sm transition-colors">
            Cancelar
          </button>
          <button type="submit" disabled={loading}
            className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold px-8 py-2.5 rounded-lg transition-colors text-sm">
            {loading ? 'Guardando...' : 'Guardar alumno'}
          </button>
        </div>
      </form>
    </div>
  )
}
