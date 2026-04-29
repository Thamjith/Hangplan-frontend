import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@carbon/react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { clearAuth } from '../store/authSlice'
import { hangplanApi } from '../store/hangplanApi'
import { useCallback } from 'react'

type Props = { children: React.ReactNode }

export function AppLayout({ children }: Props) {
  const user = useAppSelector((s) => s.auth.user)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const onLogout = useCallback(() => {
    dispatch(clearAuth())
    dispatch(hangplanApi.util.resetApiState())
    navigate('/auth', { replace: true })
  }, [dispatch, navigate])

  return (
    <>
      <div className="hangplan-layout">
        <div className="hangplan-header">
          <Link to="/" className="hangplan-brand-link">
            HangPlan
          </Link>
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span className="hangplan-muted">Signed in as {user.name}</span>
              <Button kind="secondary" size="sm" onClick={onLogout}>
                Log out
              </Button>
            </div>
          )}
        </div>
        {children}
      </div>
    </>
  )
}
