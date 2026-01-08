import { Outlet, NavLink } from 'react-router-dom'
import { useAppStore } from '../store/appStore'

export default function Layout() {
  const { mode, setMode } = useAppStore()

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 z-10">
        <div className="flex items-center justify-between px-4 h-14">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-rc-red rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <h1 className="text-lg font-semibold text-gray-800">Partner GIS System</h1>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-1">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-rc-red text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/map"
              className={({ isActive }) =>
                `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-rc-red text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              Map
            </NavLink>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-rc-red text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/network"
              className={({ isActive }) =>
                `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-rc-red text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              Network
            </NavLink>
            <NavLink
              to="/partners"
              className={({ isActive }) =>
                `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-rc-red text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              Partners
            </NavLink>
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-rc-red text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              Admin
            </NavLink>
          </nav>

          {/* Mode Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Mode:</span>
            <button
              onClick={() => setMode(mode === 'steady' ? 'disaster' : 'steady')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                mode === 'disaster'
                  ? 'bg-orange-500 text-white'
                  : 'bg-blue-500 text-white'
              }`}
            >
              {mode === 'disaster' ? 'Disaster Mode' : 'Steady State'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  )
}
