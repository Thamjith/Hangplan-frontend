import { Navigate, useLocation } from 'react-router-dom'
import { useAppSelector } from '../store/hooks'

type Props = { children: React.ReactNode }

export function ProtectedRoute({ children }: Props) {
  const token = useAppSelector((s) => s.auth.token)
  const loc = useLocation()
  if (!token) {
    return <Navigate to="/" replace state={{ from: loc }} />
  }
  return <>{children}</>
}
