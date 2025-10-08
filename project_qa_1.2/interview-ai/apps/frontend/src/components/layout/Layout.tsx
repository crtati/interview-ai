import { Outlet } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

function Layout() {
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="min-h-screen relative">
      {/* Header futurista fijo */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-cyan-400/30">
        <div className="max-w-7xl mx-auto px-4 py-2 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            {/* Logo/Brand futurista */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-black neon-text font-mono">INTERVIEW.AI</h1>
                <div className="text-xs text-gray-400 font-mono">Neural Training</div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center">
            {/* User menu - Solo botón de logout */}
            <button 
              onClick={handleLogout}
              className="p-1.5 border border-red-400/30 hover:border-red-400/50 rounded-lg transition-colors group"
              title="Cerrar Sesión"
            >
              <svg className="w-4 h-4 text-red-400 group-hover:text-red-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main content con padding top para el header fijo */}
      <main className="pt-28">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout