import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Layout from './components/layout/Layout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import InterviewPageComplete from './pages/InterviewPageComplete'
import EvaluationPage from './pages/EvaluationPage'

function AppRoutes() {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" />} />
      
      {/* Rutas protegidas */}
      <Route path="/" element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="interview" element={<InterviewPageComplete />} />
        <Route path="evaluation" element={<EvaluationPage />} />
      </Route>
      
      {/* Ruta por defecto - Login es la pantalla principal */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App