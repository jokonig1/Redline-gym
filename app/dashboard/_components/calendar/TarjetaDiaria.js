'use client'
import { resolveColor } from './utils'

export default function TarjetaDiaria({
  slot, coaches, soloEditarCoachId,
  onAbrirModal, onDeshacer, onVerPerfil,
}) {
  const color    = resolveColor(slot, coaches)
  const editable = !soloEditarCoachId || slot.coach_id === soloEditarCoachId

  return (
    <div
      className="flex items-center gap-3 rounded-xl px-4 py-3 select-none transition-all w-full sm:flex-1 sm:min-w-48 hover:brightness-110"
      style={{ background: color.bg, border: `1px solid ${color.border}30` }}
    >
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0"
        style={{ background: color.border + '25', color: color.text }}
      >
        {slot.alumno?.nombre?.split(' ').map(n => n[0]).join('').slice(0, 2)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold text-white truncate">{slot.alumno?.nombre}</div>
        <div className="text-xs flex items-center gap-1.5" style={{ color: color.text }}>
          {slot.tipo === 'grupal' ? 'Grupal' : 'Personalizado'}
          {slot.coach?.nombre && <> · {slot.coach.nombre.split(' ')[0]}</>}
        </div>
      </div>

      <div className="flex items-center gap-1 ml-auto shrink-0" onClick={e => e.stopPropagation()}>
        <button
          onClick={() => onVerPerfil(slot.alumno?.id)}
          title="Ver perfil"
          className="text-xs text-zinc-500 hover:text-zinc-200 px-2 py-1 rounded-lg hover:bg-white/5 transition-all"
        >
          ◉
        </button>
        {editable && slot.excepcion && (
          <button
            onClick={() => onDeshacer(slot.excepcion.id)}
            title="Restaurar horario original"
            className="text-xs text-zinc-500 hover:text-zinc-200 px-2 py-1 rounded-lg hover:bg-white/5 transition-all"
          >
            ↩
          </button>
        )}
        {editable && (
          <button
            onClick={() => onAbrirModal(slot)}
            className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-zinc-400 hover:text-white hover:border-white/20 transition-all"
          >
            {slot.excepcion ? 'Editar' : 'Mover'}
          </button>
        )}
      </div>
    </div>
  )
}
