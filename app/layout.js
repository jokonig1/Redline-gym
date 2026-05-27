import './globals.css'

export const metadata = {
  title: 'RedLine Gimnasio',
  description: 'Plataforma de gestión integral',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}