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
      className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 select-none transition-all w-full hover:brightness-110"
      style={{ background: color.bg, border: `1px solid ${color.border}30` }}
    >
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0"
        style={{ background: color.border + '25', color: color.text }}
      >
        {slot.alumno?.nombre?.split(' ').map(n => n[0]).join('').slice(0, 2)}
      </div>

      {/* Nombre + tipo */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold truncate leading-tight" style={{ color: color.border }}>
          {slot.alumno?.nombre}
        </div>
        <div className="text-[11px] truncate leading-tight mt-0.5" style={{ color: color.border + 'bb' }}>
          {slot.tipo === 'grupal' ? 'Grupal' : 'Personal'}
          {slot.coach?.nombre && <span> · {slot.coach.nombre.split(' ')[0]}</span>}
        </div>
      </div>

      {/* Acciones — iconos compactos, siempre caben */}
      <div className="flex items-center gap-0.5 shrink-0" onClick={e => e.stopPropagation()}>
        <button
          onClick={() => onVerPerfil(slot.alumno?.id)}
          title="Ver perfil"
          className="w-7 h-7 flex items-center justify-center rounded-lg text-sm transition-all hover:bg-black/10"
          style={{ color: color.border + 'aa' }}
        >
          ◉
        </button>

        {editable && slot.excepcion && (
          <button
            onClick={() => onDeshacer(slot.excepcion.id)}
            title="Restaurar horario original"
            className="w-7 h-7 flex items-center justify-center rounded-lg text-sm transition-all hover:bg-black/10"
            style={{ color: color.border + 'aa' }}
          >
            ↩
          </button>
        )}

        {editable && (
          <button
            onClick={() => onAbrirModal(slot)}
            title={slot.excepcion ? 'Editar excepción' : 'Mover clase'}
            className="h-7 rounded-lg border text-xs font-medium transition-all hover:bg-black/10 flex items-center px-1.5 sm:px-2.5"
            style={{ color: color.border, borderColor: color.border + '50' }}
          >
            {/* Icono en móvil, texto en sm+ */}
            <span className="sm:hidden">↗</span>
            <span className="hidden sm:inline">{slot.excepcion ? 'Editar' : 'Mover'}</span>
          </button>
        )}
      </div>
    </div>
  )
}
