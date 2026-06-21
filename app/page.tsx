'use client'
import { useState } from 'react'
import Link from 'next/link'

// ── Datos del gimnasio — editá esto con la info real ─────────────────────────
const GYM = {
  nombre:     'RedLine',
  tagline:    'Entrenamiento de alto rendimiento para todos los niveles',
  descripcion:'Somos un gimnasio integral enfocado en el entrenamiento personalizado y grupal. Contamos con coaches certificados que acompañan cada etapa de tu progreso, desde principiantes hasta atletas avanzados.',
  direccion:  'Santiago, Chile',
  telefono:   '+56 9 xxxx xxxx',
  instagram:  '@redlinegym',
  email:      'contacto@redlinegym.cl',
}

const PLANES = [
  {
    nombre:    '2x Semana',
    precio:    '$xx.000',
    descripcion: 'Ideal para comenzar. Dos sesiones semanales con tu coach asignado.',
    items: ['2 clases por semana', 'Coach personal asignado', 'Seguimiento de rutinas', 'Acceso a clases grupales'],
    destacado: false,
  },
  {
    nombre:    '3x Semana',
    precio:    '$xx.000',
    descripcion: 'El plan más popular. Tres sesiones para progresar de forma sostenida.',
    items: ['3 clases por semana', 'Coach personal asignado', 'Seguimiento de rutinas', 'Acceso a clases grupales', 'Programa de nutrición básico'],
    destacado: true,
  },
  {
    nombre:    'Full',
    precio:    '$xx.000',
    descripcion: 'Para quienes quieren el máximo resultado. Hasta 5 sesiones por semana.',
    items: ['Hasta 5 clases por semana', 'Coach personal asignado', 'Seguimiento de rutinas', 'Acceso a clases grupales', 'Programa de nutrición completo', 'Evaluación mensual de progreso'],
    destacado: false,
  },
]

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

          {/* Logo */}
          <a href="#inicio" className="text-xl font-black tracking-widest text-red-600">
            RED<span className="text-foreground">LINE</span>
          </a>

          {/* Nav links — desktop */}
          <div className="hidden md:flex items-center gap-8">
            {[
              { label: 'Nosotros',  href: '#nosotros' },
              { label: 'Planes',    href: '#planes'   },
              { label: 'Contacto',  href: '#contacto' },
            ].map(({ label, href }) => (
              <a key={href} href={href}
                className="text-sm text-zinc-500 hover:text-foreground transition-colors font-medium">
                {label}
              </a>
            ))}
          </div>

          {/* Botón ingresar + hamburger */}
          <div className="flex items-center gap-3">
            <Link href="/login"
              className="bg-red-600 hover:bg-red-700 text-white text-sm font-bold px-5 py-2 rounded-lg transition-colors">
              Ingresar
            </Link>
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-hover-md transition-colors text-foreground"
              aria-label="Menú"
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Menú móvil */}
        {menuOpen && (
          <div className="md:hidden border-t border-border bg-surface px-4 py-3 space-y-1">
            {[
              { label: 'Nosotros', href: '#nosotros' },
              { label: 'Planes',   href: '#planes'   },
              { label: 'Contacto', href: '#contacto' },
            ].map(({ label, href }) => (
              <a key={href} href={href} onClick={() => setMenuOpen(false)}
                className="block py-2.5 text-sm font-medium text-zinc-500 hover:text-foreground transition-colors">
                {label}
              </a>
            ))}
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section id="inicio" className="min-h-screen flex flex-col items-center justify-center text-center px-4 pt-16">
        <div className="max-w-3xl mx-auto">
          <div className="inline-block text-[10px] font-bold uppercase tracking-[4px] text-red-600 mb-6 px-3 py-1.5 rounded-full border border-red-600/30 bg-red-600/10">
            Gimnasio Integral · Santiago
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight leading-none mb-6">
            <span className="text-red-600">RED</span>
            <span className="text-foreground">LINE</span>
          </h1>

          <p className="text-lg sm:text-xl text-zinc-500 max-w-xl mx-auto mb-10 leading-relaxed">
            {GYM.tagline}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="#planes"
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3.5 rounded-xl transition-colors text-sm tracking-wide">
              Ver planes
            </a>
            <a href="#contacto"
              className="border border-border-strong text-foreground hover:bg-hover-md font-medium px-8 py-3.5 rounded-xl transition-colors text-sm">
              Contactarnos
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-zinc-600 text-xl">
          ↓
        </div>
      </section>

      {/* ── Nosotros ── */}
      <section id="nosotros" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

            {/* Texto */}
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[3px] text-red-600 mb-4">
                Sobre nosotros
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-6 leading-tight">
                Entrenamiento que<br/>marca la diferencia
              </h2>
              <p className="text-zinc-500 leading-relaxed mb-6">
                {GYM.descripcion}
              </p>
              <a href="#contacto"
                className="inline-flex items-center gap-2 text-red-600 font-bold text-sm hover:text-red-500 transition-colors">
                Conocé al equipo →
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { valor: '100%',    label: 'Personalizado'    },
                { valor: 'Coaches', label: 'Certificados'     },
                { valor: 'Todos',   label: 'los niveles'      },
                { valor: '6 días',  label: 'a la semana'      },
              ].map(({ valor, label }) => (
                <div key={label}
                  className="bg-surface border border-border rounded-2xl p-6 text-center">
                  <div className="text-2xl sm:text-3xl font-black text-red-600 mb-1">{valor}</div>
                  <div className="text-xs text-zinc-500 uppercase tracking-wider">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Planes ── */}
      <section id="planes" className="py-24 px-4 bg-surface">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-[10px] font-bold uppercase tracking-[3px] text-red-600 mb-4">
              Nuestros planes
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-foreground">
              Elegí el que se adapta a vos
            </h2>
            <p className="text-zinc-500 mt-3 max-w-md mx-auto text-sm">
              Todos los planes incluyen coach personal asignado y seguimiento de tu progreso.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANES.map(plan => (
              <div key={plan.nombre}
                className={`relative rounded-2xl p-6 border flex flex-col ${
                  plan.destacado
                    ? 'bg-red-600 border-red-600 text-white'
                    : 'bg-background border-border'
                }`}>

                {plan.destacado && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-red-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                    Más popular
                  </div>
                )}

                <div className={`text-xs font-bold uppercase tracking-widest mb-2 ${plan.destacado ? 'text-red-200' : 'text-zinc-500'}`}>
                  {plan.nombre}
                </div>
                <div className={`text-3xl font-black mb-1 ${plan.destacado ? 'text-white' : 'text-foreground'}`}>
                  {plan.precio}
                  <span className={`text-sm font-normal ml-1 ${plan.destacado ? 'text-red-200' : 'text-zinc-500'}`}>/mes</span>
                </div>
                <p className={`text-sm mb-6 mt-2 leading-relaxed ${plan.destacado ? 'text-red-100' : 'text-zinc-500'}`}>
                  {plan.descripcion}
                </p>

                <ul className="space-y-2.5 flex-1 mb-8">
                  {plan.items.map(item => (
                    <li key={item} className="flex items-start gap-2.5">
                      <span className={`text-sm mt-0.5 shrink-0 ${plan.destacado ? 'text-red-200' : 'text-red-600'}`}>✓</span>
                      <span className={`text-sm ${plan.destacado ? 'text-red-50' : 'text-zinc-500'}`}>{item}</span>
                    </li>
                  ))}
                </ul>

                <a href="#contacto"
                  className={`block text-center py-3 rounded-xl font-bold text-sm transition-colors ${
                    plan.destacado
                      ? 'bg-white text-red-600 hover:bg-red-50'
                      : 'border border-border-strong text-foreground hover:bg-hover-md'
                  }`}>
                  Consultar
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contacto ── */}
      <section id="contacto" className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-[10px] font-bold uppercase tracking-[3px] text-red-600 mb-4">
              Contacto
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-foreground">
              ¿Listo para empezar?
            </h2>
            <p className="text-zinc-500 mt-3 text-sm">
              Contactanos por cualquiera de estos medios y te respondemos a la brevedad.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: '📍',
                titulo: 'Dirección',
                valor: GYM.direccion,
                href: null,
              },
              {
                icon: '📱',
                titulo: 'WhatsApp',
                valor: GYM.telefono,
                href: `https://wa.me/${GYM.telefono.replace(/\D/g,'')}`,
              },
              {
                icon: '📷',
                titulo: 'Instagram',
                valor: GYM.instagram,
                href: `https://instagram.com/${GYM.instagram.replace('@','')}`,
              },
            ].map(({ icon, titulo, valor, href }) => (
              <div key={titulo}
                className="bg-surface border border-border rounded-2xl p-6 text-center hover:border-red-600/40 transition-colors">
                <div className="text-3xl mb-3">{icon}</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">{titulo}</div>
                {href ? (
                  <a href={href} target="_blank" rel="noopener noreferrer"
                    className="text-sm font-medium text-foreground hover:text-red-600 transition-colors">
                    {valor}
                  </a>
                ) : (
                  <span className="text-sm font-medium text-foreground">{valor}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-black tracking-widest text-red-600">
            RED<span className="text-foreground">LINE</span>
          </span>
          <span className="text-xs text-zinc-600">
            © {new Date().getFullYear()} RedLine Gimnasio. Todos los derechos reservados.
          </span>
          <Link href="/login"
            className="text-xs text-zinc-500 hover:text-foreground transition-colors font-medium">
            Ingresar al sistema →
          </Link>
        </div>
      </footer>

    </div>
  )
}
