import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import MapPage from './pages/MapPage'
import DashboardPage from './pages/DashboardPage'
import NetworkPage from './pages/NetworkPage'
import PartnersPage from './pages/PartnersPage'
import AdminPage from './pages/AdminPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="map" element={<MapPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="network" element={<NetworkPage />} />
        <Route path="partners" element={<PartnersPage />} />
        <Route path="admin" element={<AdminPage />} />
      </Route>
    </Routes>
  )
}

export default App
