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

  const firstName = slot.alumno?.nombre?.split(' ')[0] || '—'

  return (
    <div
      className="rounded p-0.5 mb-0.5 select-none transition-all group relative hover:brightness-110"
      style={{ background: color.bg, borderLeft: `2px solid ${color.border}` }}
    >
      {/* Nombre — primera palabra, truncado */}
      <div
        className="text-[8px] sm:text-[9px] font-bold leading-tight truncate pr-3"
        style={{ color: color.border }}
      >
        {firstName}
      </div>

      {/* Tipo — solo sm+ */}
      <div
        className="hidden sm:block text-[7px] leading-tight mt-0.5 truncate"
        style={{ color: color.border + 'cc' }}
      >
        {slot.tipo === 'grupal' ? 'Grupal' : 'Personal'}
      </div>

      {/* Coach — solo sm+ */}
      <div className="hidden sm:block text-[7px] leading-tight mt-0.5 truncate" style={{ color: color.border + '80' }}>
        {(() => {
          const n = slot.coach?.nombre?.split(' ')[0]
            || coaches.find(c => c.id === slot.coach_id)?.nombre?.split(' ')[0]
          return n ? n : null
        })()}
      </div>

      {/* Botón de menú ⋮ */}
      <div ref={menuOpen ? menuRef : null} className="absolute top-0 right-0">
        <button
          onMouseDown={e => e.stopPropagation()}
          onClick={e => {
            e.stopPropagation()
            e.preventDefault()
            setMenuSlotKey(menuOpen ? null : slotKey)
          }}
          className="opacity-0 group-hover:opacity-100 w-4 h-4 flex items-center justify-center rounded text-[10px] leading-none transition-all hover:bg-black/20"
          style={{ color: color.border }}
        >
          ⋮
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-5 z-40 bg-raised border border-border-strong rounded-xl shadow-2xl shadow-black/30 py-1.5 w-36">
            <button
              onMouseDown={e => e.stopPropagation()}
              onClick={() => { setMenuSlotKey(null); onVerPerfil(slot.alumno?.id) }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-foreground-2 hover:text-foreground hover:bg-hover-md transition-colors text-left"
            >
              <span>◉</span> Ver perfil
            </button>
            {editable && (
              <button
                onMouseDown={e => e.stopPropagation()}
                onClick={() => { setMenuSlotKey(null); onAbrirModal(slot) }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-foreground-2 hover:text-foreground hover:bg-hover-md transition-colors text-left"
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
