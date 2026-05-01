import { Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { LandingPage } from './pages/LandingPage'
import { CreateEventPage } from './pages/CreateEventPage'
import { EventPage } from './pages/EventPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppLayout>
              <CreateEventPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/event/:id"
        element={
          <ProtectedRoute>
            <AppLayout>
              <EventPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
