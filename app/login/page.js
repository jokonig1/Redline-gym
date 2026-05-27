'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Correo o contraseña incorrectos')
      setLoading(false)
      return
    }

    // Obtener el rol del usuario
    const { data: profile } = await supabase
      .from('profiles')
      .select('rol')
      .eq('id', data.user.id)
      .single()

    if (profile?.rol === 'admin') router.push('/dashboard/admin')
    else if (profile?.rol === 'coach') router.push('/dashboard/coach')
    else router.push('/dashboard/alumno')
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-black tracking-widest text-red-600">RED<span className="text-white">LINE</span></h1>
          <p className="text-zinc-500 text-sm mt-1 tracking-widest uppercase">Gimnasio Integral</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs text-zinc-500 uppercase tracking-wider">Correo</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full mt-1 bg-[#141414] border border-zinc-800 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-red-600 transition-colors"
              placeholder="tu@correo.com"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-500 uppercase tracking-wider">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full mt-1 bg-[#141414] border border-zinc-800 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-red-600 transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-colors tracking-wider uppercase text-sm"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}

