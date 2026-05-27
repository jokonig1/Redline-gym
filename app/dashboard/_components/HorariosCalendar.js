'use client'
import { useState, Fragment, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DIAS, DIAS_LABEL, HORAS } from '@/lib/constants'
import { toDateStr, resolveColor } from './calendar/utils'
import TarjetaSemanal from './calendar/TarjetaSemanal'
import TarjetaDiaria  from './calendar/TarjetaDiaria'
import ModalMover     from './calendar/ModalMover'


// Abreviaciones de 2 letras para cabecera semanal en móvil
const DIAS_LABEL_2 = {
  lunes: 'Lu', martes: 'Ma', miercoles: 'Mi',
  jueves: 'Ju', viernes: 'Vi', sabado: 'Sá',
}

export default function HorariosCalendar({
  horarios, excepciones, coaches, semana,
  semanaOffset, setSemanaOffset,
  onGuardar, onDeshacer,
  soloEditarCoachId = null,
  rutasAdmin = false,
}) {
  const router = useRouter()

  // Vista inicial: mensual en móvil (como Google Calendar), semanal en desktop
  const [vista, setVista] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth < 768 ? 'mensual' : 'semanal'
  )
  const [diaSeleccionado, setDiaSeleccionado] = useState(() => {
    const d = new Date().getDay()
    return d === 0 ? 5 : d - 1
  })

  const [menuSlotKey, setMenuSlotKey] = useState(null)
  const menuRef = useRef(null)

  const [modalSlot,    setModalSlot]    = useState(null)
  const [moverForm,    setMoverForm]    = useState({ fecha_nueva: '', hora_nueva: '', motivo: '' })
  const [guardando,    setGuardando]    = useState(false)
  const [errorGuardar, setErrorGuardar] = useState('')

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuSlotKey(null)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // ── Label del período actual ───────────────────────────────────────────────

  const hoy = new Date()
  const mesActual = new Date(
    hoy.getFullYear(),
    hoy.getMonth() + Math.floor(semanaOffset / 4.33),
    1
  )
  const mesLabel = mesActual.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })

  function fmtFecha(fecha) {
    return `${fecha.getDate()} ${fecha.toLocaleDateString('es-CL', { month: 'short' })}.`
  }
  const semanaLabel = semana.length >= 6
    ? `${fmtFecha(semana[0].fecha)} – ${fmtFecha(semana[5].fecha)}`
    : ''

  const periodLabel = vista === 'mensual' ? mesLabel : semanaLabel

  // ── Lógica de excepciones ─────────────────────────────────────────────────

  function getExcepcion(horarioId, fechaStr) {
    return excepciones.find(
      e => e.alumno_horario_id === horarioId && e.fecha_original === fechaStr
    ) || null
  }

  function getHorariosSlot(dia, hora, fecha) {
    const fechaStr = fecha ? toDateStr(fecha) : undefined
    if (!fechaStr) return []

    const regulares = horarios
      .filter(h => h.dia === dia && h.hora?.slice(0, 5) === hora)
      .filter(h => {
        const exc = getExcepcion(h.id, fechaStr)
        if (!exc) return true
        if (exc.cancelado) return false
        if (exc.fecha_nueva || exc.hora_nueva) return false
        return true
      })
      .map(h => ({ ...h, excepcion: null, fechaStr, _movida: false }))

    const movidasAqui = excepciones
      .filter(exc => {
        if (!exc.fecha_nueva || exc.cancelado) return false
        return exc.fecha_nueva === fechaStr && exc.hora_nueva?.slice(0, 5) === hora
      })
      .map(exc => {
        const h = horarios.find(x => x.id === exc.alumno_horario_id)
        if (!h) return null
        return { ...h, excepcion: exc, fechaStr: exc.fecha_original, _movida: true }
      })
      .filter(Boolean)

    return [...regulares, ...movidasAqui]
  }

  // ── Modal mover ───────────────────────────────────────────────────────────

  function abrirModal(slot) {
    const exc = slot.excepcion
    setModalSlot(slot)
    setMenuSlotKey(null)
    setErrorGuardar('')
    setMoverForm({
      fecha_nueva: exc?.fecha_nueva || '',
      hora_nueva:  exc?.hora_nueva?.slice(0, 5) || slot.hora?.slice(0, 5) || '',
      motivo:      exc?.motivo || '',
    })
  }

  async function guardarMover() {
    if (!moverForm.fecha_nueva || !moverForm.hora_nueva) {
      setErrorGuardar('Elegí la nueva fecha y hora.')
      return
    }
    setGuardando(true)
    setErrorGuardar('')
    try {
      await onGuardar(modalSlot, moverForm)
      setModalSlot(null)
    } catch (err) {
      setErrorGuardar(err.message || 'Error al guardar el cambio.')
    } finally {
      setGuardando(false)
    }
  }

  async function restaurar() {
    if (!modalSlot?.excepcion?.id) return
    setErrorGuardar('')
    try {
      await onDeshacer(modalSlot.excepcion.id)
      setModalSlot(null)
    } catch (err) {
      setErrorGuardar(err.message || 'Error al restaurar el horario.')
    }
  }

  // ── Clic en día del mes → vista diaria ───────────────────────────────────

  function handleMesDiaClick(fecha) {
    const dayOfWeek = fecha.getDay()
    const dayIdx    = dayOfWeek === 0 ? 5 : dayOfWeek - 1  // 0=Lun … 5=Sáb

    const inicioHoy = new Date(hoy)
    const todayDiff = hoy.getDay() === 0 ? 6 : hoy.getDay() - 1
    inicioHoy.setDate(hoy.getDate() - todayDiff)
    inicioHoy.setHours(0, 0, 0, 0)

    const inicioTarget = new Date(fecha)
    inicioTarget.setDate(fecha.getDate() - dayIdx)
    inicioTarget.setHours(0, 0, 0, 0)

    const diffWeeks = Math.round((inicioTarget - inicioHoy) / (7 * 24 * 60 * 60 * 1000))
    setSemanaOffset(diffWeeks)
    setDiaSeleccionado(dayIdx)
    setVista('diaria')
  }

  const tarjetaProps = {
    coaches,
    soloEditarCoachId,
    onAbrirModal: abrirModal,
    onVerPerfil:  (alumnoId) => router.push(`/dashboard/admin/alumnos/${alumnoId}`),
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col">

      {/* ── Barra de controles ── */}
      <div className="mb-3 space-y-2">

        {/* Tabs + navegación */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-0.5 bg-[#141414] border border-white/5 rounded-lg p-1">
            {['semanal', 'diaria', 'mensual'].map(v => (
              <button
                key={v}
                onClick={() => setVista(v)}
                className={`px-2.5 sm:px-4 py-1.5 rounded-md text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all ${
                  vista === v ? 'bg-red-600 text-white' : 'text-zinc-500 hover:text-white'
                }`}
              >
                <span className="sm:hidden">
                  {v === 'semanal' ? 'Sem' : v === 'diaria' ? 'Día' : 'Mes'}
                </span>
                <span className="hidden sm:inline">{v}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setSemanaOffset(s => s - 1)}
              className="text-zinc-500 hover:text-white w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors"
            >←</button>
            <button
              onClick={() => setSemanaOffset(0)}
              className="text-xs text-zinc-400 hover:text-white px-2.5 py-1.5 rounded-lg border border-white/10 hover:border-white/20 transition-colors"
            >Hoy</button>
            <button
              onClick={() => setSemanaOffset(s => s + 1)}
              className="text-zinc-500 hover:text-white w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors"
            >→</button>
          </div>
        </div>

        {/* Label período */}
        <div className="text-sm font-semibold text-white capitalize">{periodLabel}</div>

      </div>

      {/* ── VISTA SEMANAL — todos los días, sin scroll horizontal ── */}
      {vista === 'semanal' && (
        <div className="bg-[#141414] border border-white/5 rounded-xl overflow-hidden">

          {/* Cabecera de días */}
          <div className="grid gap-px bg-white/5"
            style={{ gridTemplateColumns: '40px repeat(6, minmax(0, 1fr))' }}>
            <div className="bg-[#141414]" />
            {semana.map(({ dia, fecha }) => {
              const esHoy = fecha.toDateString() === new Date().toDateString()
              return (
                <div key={dia} className={`bg-[#141414] py-1.5 text-center ${esHoy ? 'bg-red-600/5' : ''}`}>
                  {/* Móvil: 2 letras | Desktop: 3 letras */}
                  <div className="text-[8px] sm:text-[10px] font-bold text-zinc-500 tracking-wider uppercase">
                    <span className="sm:hidden">{DIAS_LABEL_2[dia]}</span>
                    <span className="hidden sm:inline">{DIAS_LABEL[dia]}</span>
                  </div>
                  <div className={`text-[11px] sm:text-sm font-black ${esHoy ? 'text-red-500' : 'text-white'}`}>
                    {fecha.getDate()}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Filas de horas */}
          <div className="grid gap-px bg-white/5"
            style={{ gridTemplateColumns: '40px repeat(6, minmax(0, 1fr))' }}>
            {HORAS.map(hora => (
              <Fragment key={hora}>
                <div className="bg-[#141414] flex items-start justify-end pr-1.5 pt-1">
                  <span className="text-[9px] text-zinc-400 font-mono font-semibold">{hora}</span>
                </div>
                {semana.map(({ dia, fecha }) => {
                  const slots = getHorariosSlot(dia, hora, fecha)
                  return (
                    <div key={`${dia}-${hora}`} className="bg-[#141414] p-0.5 min-h-12 min-w-0 overflow-hidden">
                      {slots.map(slot => (
                        <TarjetaSemanal
                          key={`${slot.id}-${slot.fechaStr}`}
                          slot={slot}
                          menuSlotKey={menuSlotKey}
                          setMenuSlotKey={setMenuSlotKey}
                          menuRef={menuRef}
                          {...tarjetaProps}
                        />
                      ))}
                    </div>
                  )
                })}
              </Fragment>
            ))}
          </div>
        </div>
      )}

      {/* ── VISTA DIARIA ── */}
      {vista === 'diaria' && (
        <div>
          {/* Selector de día */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-none">
            {semana.map(({ dia, fecha }, i) => {
              const esHoy = fecha.toDateString() === new Date().toDateString()
              return (
                <button
                  key={dia}
                  onClick={() => setDiaSeleccionado(i)}
                  className={`shrink-0 flex flex-col items-center px-3 sm:px-4 py-2 rounded-xl transition-all ${
                    diaSeleccionado === i
                      ? 'bg-red-600 text-white'
                      : 'bg-[#141414] border border-white/5 text-zinc-400 hover:text-white'
                  }`}
                >
                  <span className="text-[10px] uppercase tracking-widest">{DIAS_LABEL[dia]}</span>
                  <span className={`text-lg sm:text-xl font-black ${esHoy && diaSeleccionado !== i ? 'text-red-500' : ''}`}>
                    {fecha.getDate()}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="bg-[#141414] border border-white/5 rounded-xl overflow-hidden">
            {HORAS.map(hora => {
              const diaActual = semana[diaSeleccionado]
              const slots     = getHorariosSlot(diaActual?.dia, hora, diaActual?.fecha)
              return (
                <div key={hora} className="flex gap-3 px-3 sm:px-4 py-2.5 sm:py-3 border-b border-white/5 last:border-b-0">
                  <div className="w-10 sm:w-14 text-xs sm:text-sm text-zinc-300 font-mono font-semibold shrink-0 pt-1.5">
                    {hora}
                  </div>
                  <div className="flex-1 flex flex-col sm:flex-row sm:flex-wrap gap-2">
                    {slots.length === 0
                      ? <div className="text-zinc-800 text-xs self-center py-1">—</div>
                      : slots.map(slot => (
                          <TarjetaDiaria
                            key={`${slot.id}-${slot.fechaStr}`}
                            slot={slot}
                            onDeshacer={onDeshacer}
                            {...tarjetaProps}
                          />
                        ))
                    }
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── VISTA MENSUAL — ocupa el alto disponible del viewport ── */}
      {vista === 'mensual' && (
        <div
          className="bg-[#141414] border border-white/5 rounded-xl overflow-hidden flex flex-col"
          style={{ height: 'calc(100dvh - 220px)' }}
        >
          {/* Cabecera días */}
          <div className="grid grid-cols-7 gap-px bg-white/5 shrink-0">
            {['L','M','X','J','V','S','D'].map(d => (
              <div key={d} className="bg-[#141414] py-1.5 text-center text-[9px] sm:text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                {d}
              </div>
            ))}
          </div>

          {/* Celdas del mes — crecen para ocupar el espacio */}
          <div
            className="grid grid-cols-7 gap-px bg-white/5 flex-1"
            style={{ gridAutoRows: '1fr' }}
          >
            {(() => {
              const primerDia = new Date(mesActual)
              const ultimoDia = new Date(primerDia.getFullYear(), primerDia.getMonth() + 1, 0)
              const offsetDia = (primerDia.getDay() + 6) % 7
              const celdas    = []

              for (let i = 0; i < offsetDia; i++) {
                celdas.push(<div key={`e${i}`} className="bg-[#141414]" />)
              }

              for (let d = 1; d <= ultimoDia.getDate(); d++) {
                const fecha     = new Date(primerDia.getFullYear(), primerDia.getMonth(), d)
                const fechaStr  = toDateStr(fecha)
                const diaNombre = DIAS[(fecha.getDay() + 6) % 7]
                const esHoy     = fecha.toDateString() === new Date().toDateString()
                const esDomingo = fecha.getDay() === 0

                const slots = esDomingo ? [] : [
                  ...horarios.filter(h => {
                    if (h.dia !== diaNombre) return false
                    const exc = getExcepcion(h.id, fechaStr)
                    return !exc || (!exc.cancelado && !exc.fecha_nueva)
                  }),
                  ...excepciones
                    .filter(exc => !exc.cancelado && exc.fecha_nueva === fechaStr)
                    .map(exc => horarios.find(h => h.id === exc.alumno_horario_id))
                    .filter(Boolean),
                ]

                celdas.push(
                  <div
                    key={d}
                    onClick={() => !esDomingo && handleMesDiaClick(fecha)}
                    className={`bg-[#141414] p-0.5 sm:p-1.5 overflow-hidden transition-colors flex flex-col
                      ${!esDomingo ? 'cursor-pointer hover:bg-white/3 active:bg-white/5' : ''}
                      ${esHoy ? 'ring-1 ring-inset ring-red-600/40' : ''}`}
                  >
                    {/* Número del día */}
                    <div className={`text-[9px] sm:text-[11px] font-bold w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded-full mx-auto mb-0.5 shrink-0 ${
                      esHoy ? 'bg-red-600 text-white' : esDomingo ? 'text-zinc-700' : 'text-zinc-400'
                    }`}>{d}</div>

                    {/* Chips de eventos — texto en todos los tamaños */}
                    <div className="space-y-px flex-1 min-h-0 overflow-hidden">
                      {slots.slice(0, 3).map(slot => {
                        const color    = resolveColor(slot, coaches)
                        const editable = !soloEditarCoachId || slot.coach_id === soloEditarCoachId
                        return (
                          <div
                            key={slot.id}
                            onClick={e => {
                              e.stopPropagation()
                              if (editable) abrirModal({ ...slot, fechaStr, excepcion: getExcepcion(slot.id, fechaStr) })
                            }}
                            className={`text-[7px] sm:text-[9px] px-0.5 sm:px-1 py-px rounded truncate leading-tight ${
                              editable ? 'cursor-pointer hover:brightness-125' : 'cursor-default'
                            }`}
                            style={{ background: color.bg, color: color.text }}
                          >
                            {slot.alumno?.nombre?.split(' ')[0]}
                          </div>
                        )
                      })}
                      {slots.length > 3 && (
                        <div className="text-[7px] sm:text-[8px] text-zinc-600 px-0.5">
                          +{slots.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                )
              }
              return celdas
            })()}
          </div>
        </div>
      )}

      {/* Modal mover clase */}
      {modalSlot && (
        <ModalMover
          slot={modalSlot}
          form={moverForm}
          setForm={setMoverForm}
          guardando={guardando}
          error={errorGuardar}
          onGuardar={guardarMover}
          onDeshacer={restaurar}
          onClose={() => setModalSlot(null)}
        />
      )}

    </div>
  )
}
