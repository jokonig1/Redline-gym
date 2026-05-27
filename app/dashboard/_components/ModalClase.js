'use client'
import { useState, useEffect } from 'react'

/**
 * Modal que aparece al presionar una clase del día.
 * Permite marcar asistencia y registrar la rutina con pesos/reps.
 *
 * Props:
 *   slot     – { id, alumno: {id, nombre, plan}, tipo, hora }
 *   coachId  – ID del coach autenticado
 *   fecha    – 'YYYY-MM-DD' de la clase
 *   onClose  – función para cerrar
 */
export default function ModalClase({ slot, coachId, fecha, onClose }) {
  const alumno = slot.alumno

  // ── Asistencia ──────────────────────────────────────────────────────────────
  const [asistio,          setAsistio]          = useState(null)   // true | false | null
  const [asistenciaId,     setAsistenciaId]     = useState(null)
  const [guardandoAsist,   setGuardandoAsist]   = useState(false)

  // ── Rutina ──────────────────────────────────────────────────────────────────
  const [rutinas,          setRutinas]          = useState([])
  const [rutinaActiva,     setRutinaActiva]     = useState(null)
  const [ultimaSesion,     setUltimaSesion]     = useState(null)
  const [ejerciciosHoy,    setEjerciciosHoy]    = useState([])
  const [loadingRutina,    setLoadingRutina]    = useState(false)
  const [guardandoRutina,  setGuardandoRutina]  = useState(false)
  const [notas,            setNotas]            = useState('')
  const [savedRutina,      setSavedRutina]      = useState(false)
  const [errorRutina,      setErrorRutina]      = useState('')

  // ── Cargar asistencia existente + rutinas del coach ─────────────────────────
  useEffect(() => {
    async function load() {
      const [asistRes, rutinasRes] = await Promise.all([
        fetch(`/api/asistencias?coach_id=${coachId}&alumno_horario_id=${slot.id}&fecha=${fecha}`),
        fetch(`/api/rutinas-predefinidas?coach_id=${coachId}`),
      ])
      if (asistRes.ok) {
        const asist = await asistRes.json()
        if (asist) { setAsistio(asist.asistio); setAsistenciaId(asist.id) }
      }
      if (rutinasRes.ok) setRutinas(await rutinasRes.json())
    }
    load()
  }, [coachId, slot.id, fecha])

  // ── Marcar asistencia ────────────────────────────────────────────────────────
  async function marcarAsistencia(valor) {
    setGuardandoAsist(true)
    setAsistio(valor)
    const res = await fetch('/api/asistencias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        alumno_id:         alumno.id,
        coach_id:          coachId,
        alumno_horario_id: slot.id,
        fecha,
        hora:              slot.hora?.slice(0, 5),
        asistio:           valor,
      }),
    })
    if (res.ok) { const d = await res.json(); setAsistenciaId(d.id) }
    setGuardandoAsist(false)
  }

  // ── Seleccionar rutina → cargar última sesión del alumno ─────────────────────
  async function seleccionarRutina(rutina) {
    setRutinaActiva(rutina)
    setLoadingRutina(true)
    setSavedRutina(false)
    setErrorRutina('')

    const res = await fetch(
      `/api/sesiones-rutina?alumno_id=${alumno.id}&rutina_nombre=${encodeURIComponent(rutina.nombre)}`
    )
    const ultima = res.ok ? await res.json() : null
    setUltimaSesion(ultima)

    // Construir ejercicios de hoy a partir de la plantilla
    // Si hay sesión anterior, pre-cargar sus valores como punto de partida
    const ejerciciosBase = (rutina.ejercicios || []).map(ej => {
      const prevEj = ultima?.ejercicios?.find(e => e.nombre === ej.nombre)
      return {
        nombre: ej.nombre,
        series: prevEj?.series?.length
          ? prevEj.series.map(s => ({ peso: s.peso ?? '', reps: s.reps ?? '' }))
          : [{ peso: '', reps: '' }],
      }
    })
    setEjerciciosHoy(ejerciciosBase)
    setLoadingRutina(false)
  }

  // ── Editar series ────────────────────────────────────────────────────────────
  function setSerie(ejIdx, serieIdx, field, value) {
    setEjerciciosHoy(prev => prev.map((ej, i) => {
      if (i !== ejIdx) return ej
      return {
        ...ej,
        series: ej.series.map((s, j) => j === serieIdx ? { ...s, [field]: value } : s),
      }
    }))
  }

  function agregarSerie(ejIdx) {
    setEjerciciosHoy(prev => prev.map((ej, i) => {
      if (i !== ejIdx) return ej
      const ultima = ej.series[ej.series.length - 1]
      return { ...ej, series: [...ej.series, { peso: ultima?.peso ?? '', reps: ultima?.reps ?? '' }] }
    }))
  }

  function quitarSerie(ejIdx, serieIdx) {
    setEjerciciosHoy(prev => prev.map((ej, i) => {
      if (i !== ejIdx) return ej
      const nuevas = ej.series.filter((_, j) => j !== serieIdx)
      return { ...ej, series: nuevas.length ? nuevas : [{ peso: '', reps: '' }] }
    }))
  }

  function renombrarEjercicio(ejIdx, nombre) {
    setEjerciciosHoy(prev => prev.map((ej, i) => i === ejIdx ? { ...ej, nombre } : ej))
  }

  function eliminarEjercicio(ejIdx) {
    setEjerciciosHoy(prev => prev.filter((_, i) => i !== ejIdx))
  }

  function agregarEjercicio() {
    setEjerciciosHoy(prev => [...prev, { nombre: '', series: [{ peso: '', reps: '' }] }])
  }

  // ── Guardar sesión ──────────────────────────────────────────────────────────
  async function guardarSesion() {
    setGuardandoRutina(true)
    setErrorRutina('')
    const res = await fetch('/api/sesiones-rutina', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        alumno_id:             alumno.id,
        coach_id:              coachId,
        alumno_horario_id:     slot.id,
        fecha,
        rutina_nombre:         rutinaActiva.nombre,
        rutina_predefinida_id: rutinaActiva.id,
        ejercicios:            ejerciciosHoy,
        notas,
      }),
    })
    if (res.ok) {
      setSavedRutina(true)
    } else {
      const err = await res.json()
      setErrorRutina(err.error || 'Error al guardar la sesión.')
    }
    setGuardandoRutina(false)
  }

  // ── Helper: datos de sesión anterior para mostrar ────────────────────────────
  function prevSerie(ejNombre) {
    const prevEj = ultimaSesion?.ejercicios?.find(e => e.nombre === ejNombre)
    if (!prevEj?.series?.length) return null
    return prevEj.series
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-[#141414] border border-white/10 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg shadow-2xl flex flex-col max-h-[92dvh] sm:max-h-[88dvh]">

        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-white/5 shrink-0">
          <div>
            <div className="text-base font-black text-white">{alumno?.nombre}</div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-zinc-500">
                {slot.hora?.slice(0, 5)}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 text-zinc-400 font-medium">
                {slot.tipo === 'grupal' ? 'Grupal' : 'Personalizado'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-600 hover:text-white w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 transition-all"
          >✕</button>
        </div>

        {/* Cuerpo con scroll */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">

          {/* ── Asistencia ── */}
          <div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-3">Asistencia</div>
            <div className="flex gap-2">
              {[
                { label: '✓  Asistió',     value: true,  cls: 'bg-green-600/20 border-green-600/40 text-green-400' },
                { label: '✕  No asistió', value: false, cls: 'bg-red-600/20 border-red-600/40 text-red-400' },
              ].map(({ label, value, cls }) => (
                <button
                  key={String(value)}
                  disabled={guardandoAsist}
                  onClick={() => marcarAsistencia(value)}
                  className={`flex-1 py-2.5 rounded-xl border text-sm font-bold transition-all disabled:opacity-50 ${
                    asistio === value
                      ? cls
                      : 'border-white/10 text-zinc-500 hover:text-white hover:border-white/20'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {asistio !== null && (
              <div className={`mt-2 text-xs text-center font-medium ${asistio ? 'text-green-500' : 'text-red-400'}`}>
                {asistio ? 'Asistencia registrada' : 'Inasistencia registrada'}
              </div>
            )}
          </div>

          {/* ── Rutina ── */}
          <div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-3">Rutina de hoy</div>

            {rutinas.length === 0 ? (
              <p className="text-xs text-zinc-600 italic">
                No tenés rutinas predefinidas. Creá una en la sección Rutinas.
              </p>
            ) : (
              <>
                {/* Selector de rutina */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {rutinas.map(r => (
                    <button
                      key={r.id}
                      onClick={() => seleccionarRutina(r)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        rutinaActiva?.id === r.id
                          ? 'bg-red-600/20 border-red-600/50 text-red-400'
                          : 'border-white/10 text-zinc-400 hover:text-white hover:border-white/20'
                      }`}
                    >
                      {r.nombre}
                    </button>
                  ))}
                </div>

                {/* Ejercicios */}
                {loadingRutina && (
                  <div className="text-xs text-zinc-500 text-center py-4">Cargando sesión anterior…</div>
                )}

                {rutinaActiva && !loadingRutina && (
                  <div className="space-y-4">

                    {/* Info sesión anterior */}
                    {ultimaSesion && (
                      <div className="text-[10px] text-zinc-600 text-center">
                        Última sesión:{' '}
                        <span className="text-zinc-400">
                          {new Date(ultimaSesion.fecha + 'T12:00:00').toLocaleDateString('es-CL', {
                            day: 'numeric', month: 'short'
                          })}
                        </span>
                      </div>
                    )}

                    {/* Ejercicios */}
                    {ejerciciosHoy.map((ej, ejIdx) => {
                      const prev = prevSerie(ej.nombre)
                      return (
                        <div key={ejIdx} className="bg-[#1c1c1c] rounded-xl p-3">
                          {/* Nombre editable + botón eliminar */}
                          <div className="flex items-center gap-2 mb-2">
                            <input
                              type="text"
                              value={ej.nombre}
                              onChange={e => renombrarEjercicio(ejIdx, e.target.value)}
                              placeholder="Nombre del ejercicio"
                              className="flex-1 bg-transparent text-sm font-bold text-white placeholder:text-zinc-600 focus:outline-none border-b border-transparent focus:border-white/20 pb-0.5 transition-colors"
                            />
                            <button
                              onClick={() => eliminarEjercicio(ejIdx)}
                              className="text-zinc-700 hover:text-red-400 transition-colors w-6 h-6 flex items-center justify-center rounded shrink-0 hover:bg-red-900/20 text-xs"
                              title="Eliminar ejercicio"
                            >✕</button>
                          </div>

                          {/* Sesión anterior (referencia) */}
                          {prev && (
                            <div className="mb-2 pb-2 border-b border-white/5">
                              <div className="text-[9px] text-zinc-600 uppercase tracking-wider mb-1">Anterior</div>
                              <div className="flex flex-wrap gap-1.5">
                                {prev.map((s, i) => (
                                  <span key={i} className="text-[10px] text-zinc-500 bg-white/5 px-2 py-0.5 rounded">
                                    {s.peso ? `${s.peso} kg` : '—'} × {s.reps || '—'}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Series de hoy */}
                          <div className="text-[9px] text-zinc-600 uppercase tracking-wider mb-2">Hoy</div>
                          <div className="space-y-1.5">
                            {ej.series.map((serie, serieIdx) => (
                              <div key={serieIdx} className="flex items-center gap-2">
                                <span className="text-[10px] text-zinc-700 w-4 text-center">{serieIdx + 1}</span>
                                <div className="flex-1 grid grid-cols-2 gap-1.5">
                                  <div className="relative">
                                    <input
                                      type="number"
                                      inputMode="decimal"
                                      placeholder="kg"
                                      value={serie.peso}
                                      onChange={e => setSerie(ejIdx, serieIdx, 'peso', e.target.value)}
                                      className="w-full bg-[#242424] border border-white/5 text-white rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:border-red-600 transition-colors text-center"
                                    />
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-zinc-600">kg</span>
                                  </div>
                                  <div className="relative">
                                    <input
                                      type="number"
                                      inputMode="numeric"
                                      placeholder="reps"
                                      value={serie.reps}
                                      onChange={e => setSerie(ejIdx, serieIdx, 'reps', e.target.value)}
                                      className="w-full bg-[#242424] border border-white/5 text-white rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:border-red-600 transition-colors text-center"
                                    />
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-zinc-600">reps</span>
                                  </div>
                                </div>
                                <button
                                  onClick={() => quitarSerie(ejIdx, serieIdx)}
                                  className="text-zinc-700 hover:text-red-400 transition-colors w-5 h-5 flex items-center justify-center text-xs shrink-0"
                                >✕</button>
                              </div>
                            ))}
                          </div>

                          <button
                            onClick={() => agregarSerie(ejIdx)}
                            className="mt-2 text-[10px] text-zinc-600 hover:text-red-400 transition-colors"
                          >
                            + Agregar serie
                          </button>
                        </div>
                      )
                    })}

                    {/* Agregar ejercicio */}
                    <button
                      onClick={agregarEjercicio}
                      className="w-full border border-dashed border-white/10 text-zinc-600 hover:text-red-400 hover:border-red-900/40 text-xs py-2.5 rounded-xl transition-colors"
                    >
                      + Agregar ejercicio
                    </button>

                    {/* Notas */}
                    <div>
                      <label className="text-[10px] text-zinc-600 uppercase tracking-wider block mb-1.5">
                        Notas (opcional)
                      </label>
                      <textarea
                        value={notas}
                        onChange={e => setNotas(e.target.value)}
                        rows={2}
                        placeholder="Observaciones de la sesión..."
                        className="w-full bg-[#1c1c1c] border border-white/5 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-red-600 resize-none transition-colors placeholder:text-zinc-700"
                      />
                    </div>

                    {/* Error */}
                    {errorRutina && (
                      <p className="text-xs text-red-400 bg-red-900/20 border border-red-900/30 rounded-lg px-3 py-2">
                        {errorRutina}
                      </p>
                    )}

                    {/* Guardado confirmación */}
                    {savedRutina && (
                      <p className="text-xs text-green-400 text-center font-medium">
                        ✓ Sesión guardada correctamente
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Footer fijo */}
        <div className="px-5 pb-5 pt-3 border-t border-white/5 shrink-0 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 border border-white/10 text-zinc-400 hover:text-white text-sm py-2.5 rounded-xl transition-all"
          >
            Cerrar
          </button>
          {rutinaActiva && !savedRutina && (
            <button
              onClick={guardarSesion}
              disabled={guardandoRutina}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-bold py-2.5 rounded-xl transition-colors"
            >
              {guardandoRutina ? 'Guardando…' : 'Guardar sesión'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
