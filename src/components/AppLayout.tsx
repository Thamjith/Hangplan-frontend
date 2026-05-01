import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { clearAuth } from '../store/authSlice'
import { hangplanApi } from '../store/hangplanApi'
import { useCallback } from 'react'

type Props = { children: React.ReactNode }

function LogoIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 30 30" aria-hidden="true" style={{ display: 'block', flexShrink: 0 }}>
      <rect x="2" y="2" width="26" height="26" rx="8" fill="var(--primary)" />
      <circle cx="8.5" cy="9.5" r="2.5" fill="white" />
      <circle cx="15" cy="8.5" r="2.5" fill="white" />
      <circle cx="21.5" cy="9.5" r="2.5" fill="white" />
      <path d="M5.5 22 Q5.5 15 8.5 14 Q10.5 13.5 11.5 15" stroke="white" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M11.5 22 Q11.5 14.5 15 13.5 Q18.5 14.5 18.5 22" stroke="white" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M18.5 15 Q19.5 13.5 21.5 14 Q24.5 15 24.5 22" stroke="white" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M6.5 16.5 Q9 14.5 13 15.5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.85" />
      <path d="M23.5 16.5 Q21 14.5 17 15.5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.85" />
    </svg>
  )
}

export function AppLayout({ children }: Props) {
  const user = useAppSelector((s) => s.auth.user)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const onLogout = useCallback(() => {
    dispatch(clearAuth())
    dispatch(hangplanApi.util.resetApiState())
    navigate('/', { replace: true })
  }, [dispatch, navigate])

  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="app-header__inner">
          <Link to="/app" className="app-header__brand">
            <LogoIcon />
            HangPlan
          </Link>
          {user && (
            <div className="app-header__user">
              <span className="app-header__user-name">Signed in as {user.name}</span>
              <button className="hp-btn hp-btn--secondary hp-btn--sm" onClick={onLogout}>
                Log out
              </button>
            </div>
          )}
        </div>
      </header>
      <main className="app-content">
        {children}
      </main>
    </div>
  )
}
