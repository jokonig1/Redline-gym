'use client'
import { resolveColor } from './utils'

export default function TarjetaSemanal({
  slot, coaches, soloEditarCoachId,
  menuSlotKey, setMenuSlotKey, menuRef,
  onAbrirModal, onVerPerfil,
}) {
  const color    = resolveColor(slot, coaches)
  const slotKey  = `${slot.id}-${slot.fechaStr}`
  const menuOpen = menuSlotKey === slotKey
  const editable = !soloEditarCoachId || slot.coach_id === soloEditarCoachId

  return (
    <div
      className="rounded p-1 mb-0.5 select-none transition-all group relative hover:brightness-110"
      style={{ background: color.bg, borderLeft: `2px solid ${color.border}` }}
    >
      {/* Nombre alumno */}
      <div className="text-[9px] font-bold text-white leading-tight truncate pr-4">
        {slot.alumno?.nombre?.split(' ')[0]}
      </div>
      {/* Tipo */}
      <div className="text-[8px] leading-tight mt-0.5 truncate" style={{ color: color.text }}>
        {slot.tipo === 'grupal' ? 'Grupal' : 'Personal'}
      </div>
      {/* Coach */}
      <div className="hidden sm:block text-[8px] leading-tight mt-0.5 truncate text-white/50">
        {slot.coach?.nombre?.split(' ')[0]
          ? `Coach: ${slot.coach.nombre.split(' ')[0]}`
          : coaches.find(c => c.id === slot.coach_id)?.nombre?.split(' ')[0]
            ? `Coach: ${coaches.find(c => c.id === slot.coach_id).nombre.split(' ')[0]}`
            : null
        }
      </div>

      {/* ⋮ menú */}
      <div ref={menuOpen ? menuRef : null} className="absolute top-0 right-0">
        <button
          onMouseDown={e => e.stopPropagation()}
          onClick={e => {
            e.stopPropagation()
            e.preventDefault()
            setMenuSlotKey(menuOpen ? null : slotKey)
          }}
          className="opacity-0 group-hover:opacity-100 w-4 h-4 flex items-center justify-center rounded text-white/60 hover:text-white hover:bg-black/20 text-xs leading-none transition-all"
        >
          ⋮
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-5 z-40 bg-[#1e1e1e] border border-white/10 rounded-xl shadow-2xl shadow-black/60 py-1.5 w-36">
            <button
              onMouseDown={e => e.stopPropagation()}
              onClick={() => { setMenuSlotKey(null); onVerPerfil(slot.alumno?.id) }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-300 hover:text-white hover:bg-white/5 transition-colors text-left"
            >
              <span>◉</span> Ver perfil
            </button>
            {editable && (
              <button
                onMouseDown={e => e.stopPropagation()}
                onClick={() => { setMenuSlotKey(null); onAbrirModal(slot) }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-300 hover:text-white hover:bg-white/5 transition-colors text-left"
              >
                <span>↗</span> Mover clase
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
