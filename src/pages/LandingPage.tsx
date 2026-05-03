import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useSearchParams, useLocation, type Location } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useLoginMutation, useSignupMutation, oauthBaseUrl } from '../store/hangplanApi'
import { setCredentials } from '../store/authSlice'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import '../styles/landing.scss'

// ── Icons ─────────────────────────────────────────────────────────────────────

type IconProps = { size?: number; color?: string }

function LogoIcon({ size = 30, color = 'var(--primary)' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 30 30" aria-hidden="true" style={{ display: 'block', flexShrink: 0 }}>
      <rect x="2" y="2" width="26" height="26" rx="8" fill={color} />
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

function CalendarIcon({ size = 24, color = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="3" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

function UsersIcon({ size = 24, color = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="7" r="3.5" /><path d="M2 21v-1.5a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5V21" /><circle cx="18" cy="7.5" r="2.5" /><path d="M22 21v-1a4 4 0 0 0-3-3.87" />
    </svg>
  )
}

function CheckIcon({ size = 24, color = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function SplitIcon({ size = 24, color = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

function ChevronDownIcon({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

function EyeIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOffIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}

// ── Navbar ────────────────────────────────────────────────────────────────────

function Navbar({ scrolled, onAuthClick }: { scrolled: boolean; onAuthClick: (m: 'login' | 'signup') => void }) {
  return (
    <nav className={`lp-nav${scrolled ? ' is-scrolled' : ''}`} aria-label="Primary">
      <div className="lp-nav__inner">
        <Link to="/" className="lp-nav__brand">
          <LogoIcon />
          <span>HangPlan</span>
        </Link>
        <div className="lp-nav__actions">
          <button type="button" className="lp-btn-ghost" onClick={() => onAuthClick('login')}>
            Sign in
          </button>
          <button type="button" className="lp-btn-primary lp-btn-primary--nav" onClick={() => onAuthClick('signup')}>
            Get Started
          </button>
        </div>
      </div>
    </nav>
  )
}

// ── Hero visual card ──────────────────────────────────────────────────────────

const PREVIEW_PEOPLE = [
  { name: 'Alex', bg: 'var(--primary)', initials: 'A', confirmed: true },
  { name: 'Jamie', bg: 'var(--secondary)', initials: 'J', confirmed: true },
  { name: 'Sam', bg: 'var(--accent)', initials: 'S', confirmed: false },
  { name: 'Riley', bg: 'oklch(60% 0.14 165)', initials: 'R', confirmed: true },
]

function HeroVisual() {
  return (
    <figure className="lp-event-card" aria-labelledby="hero-preview-caption">
      <div className="lp-event-card__header">
        <div>
          <div className="lp-event-card__title">🏖️ Beach Weekend</div>
          <div className="lp-event-card__meta">Sat, Jun 14 · Malibu, CA</div>
        </div>
        <span className="lp-event-card__going">3 going</span>
      </div>
      <div className="lp-event-card__people">
        {PREVIEW_PEOPLE.map((p) => (
          <div className="lp-event-card__person" key={p.name}>
            <div
              className={`lp-event-card__avatar${p.confirmed ? '' : ' lp-event-card__avatar--pending'}`}
              style={{ background: p.bg }}
              aria-hidden="true"
            >
              {p.initials}
              {p.confirmed && (
                <span className="lp-event-card__avatar__check">
                  <svg width="7" height="7" viewBox="0 0 8 8" fill="none" aria-hidden="true">
                    <polyline points="1 4 3 6 7 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </span>
              )}
            </div>
            <span className="lp-event-card__person-name">
              {p.name}
              <span className="hp-visually-hidden">{p.confirmed ? ', confirmed going' : ', pending RSVP'}</span>
            </span>
          </div>
        ))}
      </div>
      <div className="lp-event-card__split">
        <span className="lp-event-card__split__label">Expenses split</span>
        <div className="lp-event-card__split__amounts">
          <div className="lp-event-card__split__amount">
            <strong>$340</strong><span>total</span>
          </div>
          <div className="lp-event-card__split__amount lp-event-card__split__amount--primary">
            <strong>$85</strong><span>each</span>
          </div>
        </div>
      </div>
      <figcaption id="hero-preview-caption" className="hp-visually-hidden">
        Sample event card: Beach Weekend on Saturday June 14 in Malibu, California; three people confirmed going out of four invitees;
        shared expenses total three hundred forty dollars, eighty-five dollars per person.
      </figcaption>
    </figure>
  )
}

// ── Hero ──────────────────────────────────────────────────────────────────────

function Hero({ onAuthClick }: { onAuthClick: (m: 'login' | 'signup') => void }) {
  return (
    <section className="lp-hero" aria-labelledby="hero-heading">
      <div
        className="lp-hero__blob"
        aria-hidden="true"
        style={{ top: -80, right: '8%', width: 520, height: 520, background: 'var(--primary)', opacity: 0.12, filter: 'blur(115px)' }}
      />
      <div
        className="lp-hero__blob"
        aria-hidden="true"
        style={{ bottom: -60, left: '2%', width: 400, height: 400, background: 'var(--accent)', opacity: 0.14, filter: 'blur(88px)' }}
      />
      <div
        className="lp-hero__blob"
        aria-hidden="true"
        style={{ top: '40%', right: '35%', width: 280, height: 280, background: 'var(--secondary)', opacity: 0.10, filter: 'blur(62px)' }}
      />
      <div className="lp-hero__content">
        <div className="lp-hero__badge">
          <span className="lp-hero__badge__dot" aria-hidden="true" />
          Social event planning, simplified
        </div>
        <h1 id="hero-heading" className="lp-hero__title">
          Plan moments.<br />
          <span className="highlight">Stay connected.</span>
        </h1>
        <p className="lp-hero__desc">
          HangPlan makes it effortless to organize events, keep your crew in the loop, and settle up — all in one place.
        </p>
        <div className="lp-hero__ctas">
          <button type="button" className="lp-btn-primary lp-btn-primary--hero" onClick={() => onAuthClick('signup')}>
            Get Started — it&apos;s free
          </button>
          <a href="#how" className="lp-btn-outline">
            See how it works{' '}
            <span aria-hidden="true">
              <ChevronDownIcon />
            </span>
          </a>
        </div>
        <HeroVisual />
      </div>
    </section>
  )
}

// ── Features ──────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: <CalendarIcon size={24} />,
    title: 'Create events',
    desc: 'Set up any occasion in seconds — birthdays, trips, dinners, spontaneous hangs.',
    iconBg: 'var(--primary-lt)',
    iconColor: 'var(--primary)',
  },
  {
    icon: <UsersIcon size={24} />,
    title: 'Invite friends',
    desc: 'Share a link or invite by name. Everyone stays in one place, no group chats needed.',
    iconBg: 'var(--accent-lt)',
    iconColor: 'var(--accent)',
  },
  {
    icon: <CheckIcon size={24} />,
    title: 'Track participation',
    desc: "See who's in, who's maybe, and who needs a nudge — at a glance.",
    iconBg: 'var(--secondary-lt)',
    iconColor: 'var(--secondary)',
  },
  {
    icon: <SplitIcon size={24} />,
    title: 'Split expenses',
    desc: 'Add costs as you go. HangPlan handles the math and tells everyone what they owe.',
    iconBg: 'var(--primary-lt)',
    iconColor: 'var(--primary)',
  },
]

function Features() {
  return (
    <section className="lp-features" aria-labelledby="features-heading">
      <div className="lp-features__container">
        <div className="lp-features__header">
          <h2 id="features-heading" className="lp-section-title">Everything your group needs</h2>
          <p className="lp-section-desc">Four pillars that turn chaotic group planning into effortless coordination.</p>
        </div>
        <div className="lp-features__grid">
          {FEATURES.map((f) => (
            <div className="lp-feature-card" key={f.title}>
              <div className="lp-feature-card__icon" style={{ background: f.iconBg, color: f.iconColor }} aria-hidden="true">
                {f.icon}
              </div>
              <h3 className="lp-feature-card__title">{f.title}</h3>
              <p className="lp-feature-card__desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── How It Works ──────────────────────────────────────────────────────────────

const STEPS = [
  {
    n: '01',
    title: 'Create an event',
    desc: "Name it, add a date and location, and you're ready to share in under a minute.",
  },
  {
    n: '02',
    title: 'Invite your group',
    desc: 'Send a link or search by name. Friends accept and can immediately see all the details.',
  },
  {
    n: '03',
    title: 'Track & settle up',
    desc: 'Add expenses as they happen. HangPlan calculates who owes what — no spreadsheets.',
  },
]

function HowItWorks() {
  return (
    <section id="how" className="lp-how" aria-labelledby="how-heading">
      <div className="lp-how__container">
        <div className="lp-how__header">
          <h2 id="how-heading" className="lp-section-title">Up and running in minutes</h2>
          <p className="lp-section-desc" style={{ maxWidth: 420 }}>
            No learning curve. Just open HangPlan and start planning.
          </p>
        </div>
        <div className="lp-how__grid">
          {STEPS.map((s) => (
            <div className="lp-step-card" key={s.n}>
              <div className="lp-step-card__num">{s.n}</div>
              <div>
                <h3 className="lp-step-card__title">{s.title}</h3>
                <p className="lp-step-card__desc">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Auth Section ──────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password required'),
})
const signupSchema = z.object({
  fullName: z.string().min(1, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'At least 6 characters'),
})

type LoginFormData = z.infer<typeof loginSchema>
type SignupFormData = z.infer<typeof signupSchema>

function AuthSection({ initialMode }: { initialMode: 'login' | 'signup' }) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode)
  const [showPw, setShowPw] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const loc = useLocation()
  const from = (loc.state as { from?: Location } | null)?.from?.pathname

  const [login, loginState] = useLoginMutation()
  const [signup, signupState] = useSignupMutation()
  const pending = mode === 'login' ? loginState.isLoading : signupState.isLoading

  const loginForm = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) })
  const signupForm = useForm<SignupFormData>({ resolver: zodResolver(signupSchema) })
  const loginErrors = loginForm.formState.errors
  const signupErrors = signupForm.formState.errors

  useEffect(() => {
    setMode(initialMode)
    setApiError(null)
  }, [initialMode])

  const switchMode = () => {
    setMode((m) => (m === 'login' ? 'signup' : 'login'))
    setApiError(null)
  }

  const onLogin = async (data: LoginFormData) => {
    setApiError(null)
    try {
      const res = await login(data).unwrap()
      dispatch(setCredentials({ token: res.token, user: res.user }))
      navigate(from ?? '/app', { replace: true })
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status
      if (status === 401 || status === 400) {
        setApiError('Invalid email or password')
      } else {
        setApiError('Something went wrong. Please try again.')
      }
    }
  }

  const onSignup = async (data: SignupFormData) => {
    setApiError(null)
    try {
      const res = await signup({ name: data.fullName, email: data.email, password: data.password }).unwrap()
      dispatch(setCredentials({ token: res.token, user: res.user }))
      navigate(from ?? '/app', { replace: true })
    } catch {
      setApiError('Could not create account. Email may already be in use.')
    }
  }

  const googleHref = `${oauthBaseUrl}/oauth2/authorization/google`

  return (
    <section id="auth" className="lp-auth" aria-labelledby="auth-heading">
      <div className="lp-auth__card">
        <div className="lp-auth__head">
          <div className="lp-auth__head__brand">
            <LogoIcon size={24} />
            <span>HangPlan</span>
          </div>
          <h2 id="auth-heading" className="lp-auth__head__title">
            {mode === 'signup' ? 'Create your account' : 'Sign in'}
          </h2>
          <p className="lp-auth__head__sub">
            {mode === 'signup' ? 'Free forever. No credit card needed.' : 'Good to see you again.'}
          </p>
        </div>

        <a className="lp-auth__google" href={googleHref}>
          <GoogleIcon />
          Continue with Google
        </a>

        <div className="lp-auth__divider">
          <div className="lp-auth__divider__line" />
          <span>or</span>
          <div className="lp-auth__divider__line" />
        </div>

        {apiError && (
          <div className="lp-auth__error-banner" role="alert">
            {apiError}
          </div>
        )}

        {mode === 'signup' ? (
          <form className="lp-auth__form" onSubmit={signupForm.handleSubmit(onSignup)} noValidate>
            <div className="lp-auth__field">
              <label htmlFor="auth-fullname">Full name</label>
              <input
                id="auth-fullname"
                className={`lp-auth__input${signupErrors.fullName ? ' is-error' : ''}`}
                placeholder="Your name"
                autoComplete="name"
                {...signupForm.register('fullName')}
              />
              {signupErrors.fullName && <p className="lp-auth__field-error">{signupErrors.fullName.message}</p>}
            </div>
            <div className="lp-auth__field">
              <label htmlFor="auth-signup-email">Email</label>
              <input
                id="auth-signup-email"
                type="email"
                className={`lp-auth__input${signupErrors.email ? ' is-error' : ''}`}
                placeholder="you@example.com"
                autoComplete="email"
                {...signupForm.register('email')}
              />
              {signupErrors.email && <p className="lp-auth__field-error">{signupErrors.email.message}</p>}
            </div>
            <div className="lp-auth__field">
              <label htmlFor="auth-signup-pw">Password</label>
              <div className="lp-auth__pw-wrap">
                <input
                  id="auth-signup-pw"
                  type={showPw ? 'text' : 'password'}
                  className={`lp-auth__input lp-auth__input--pw${signupErrors.password ? ' is-error' : ''}`}
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                  {...signupForm.register('password')}
                />
                <button type="button" onClick={() => setShowPw((v) => !v)} aria-label={showPw ? 'Hide password' : 'Show password'}>
                  {showPw ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {signupErrors.password && <p className="lp-auth__field-error">{signupErrors.password.message}</p>}
            </div>
            <button type="submit" className="lp-auth__submit" disabled={pending} aria-busy={pending}>
              {pending ? <span className="spinner" aria-hidden /> : 'Create account'}
            </button>
          </form>
        ) : (
          <form className="lp-auth__form" onSubmit={loginForm.handleSubmit(onLogin)} noValidate>
            <div className="lp-auth__field">
              <label htmlFor="auth-login-email">Email</label>
              <input
                id="auth-login-email"
                type="email"
                className={`lp-auth__input${loginErrors.email ? ' is-error' : ''}`}
                placeholder="you@example.com"
                autoComplete="email"
                {...loginForm.register('email')}
              />
              {loginErrors.email && <p className="lp-auth__field-error">{loginErrors.email.message}</p>}
            </div>
            <div className="lp-auth__field">
              <label htmlFor="auth-login-pw">Password</label>
              <div className="lp-auth__pw-wrap">
                <input
                  id="auth-login-pw"
                  type={showPw ? 'text' : 'password'}
                  className={`lp-auth__input lp-auth__input--pw${loginErrors.password ? ' is-error' : ''}`}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...loginForm.register('password')}
                />
                <button type="button" onClick={() => setShowPw((v) => !v)} aria-label={showPw ? 'Hide password' : 'Show password'}>
                  {showPw ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {loginErrors.password && <p className="lp-auth__field-error">{loginErrors.password.message}</p>}
            </div>
            <div className="lp-auth__forgot">
              <a href="#">Forgot password?</a>
            </div>
            <button type="submit" className="lp-auth__submit" disabled={pending} aria-busy={pending}>
              {pending ? <span className="spinner" aria-hidden /> : 'Sign in'}
            </button>
          </form>
        )}

        <p className="lp-auth__switch">
          {mode === 'signup' ? 'Already have an account? ' : "Don't have an account? "}
          <button type="button" onClick={switchMode}>
            {mode === 'signup' ? 'Sign in' : 'Create one'}
          </button>
        </p>
      </div>
    </section>
  )
}

// ── Footer ────────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="lp-footer">
      <div className="lp-footer__brand">
        <span aria-hidden="true">
          <LogoIcon size={22} />
        </span>
        HangPlan
      </div>
      <p className="lp-footer__copy">© 2026 HangPlan. Built for people who love making plans.</p>
      <nav className="lp-footer__links" aria-label="Footer">
        {['Privacy', 'Terms', 'Contact'].map((l) => (
          <a key={l} href="#">{l}</a>
        ))}
      </nav>
    </footer>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function LandingPage() {
  const token = useAppSelector((s) => s.auth.token)
  const navigate = useNavigate()
  const [search, setSearch] = useSearchParams()
  const dispatch = useAppDispatch()
  const loc = useLocation()
  const from = (loc.state as { from?: Location } | null)?.from?.pathname

  const [scrolled, setScrolled] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup')
  const authRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (token) navigate(from ?? '/app', { replace: true })
  }, [token, navigate, from])

  useEffect(() => {
    const oauthToken = search.get('token')
    if (oauthToken) {
      dispatch(setCredentials({ token: oauthToken }))
      setSearch({})
    }
  }, [search, setSearch, dispatch])

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const onAuthClick = (mode: 'login' | 'signup') => {
    setAuthMode(mode)
    setTimeout(() => {
      if (authRef.current) {
        const top = authRef.current.getBoundingClientRect().top + window.scrollY - 80
        window.scrollTo({ top, behavior: 'smooth' })
      }
    }, 50)
  }

  return (
    <>
      <a href="#main-content" className="hp-skip-link">
        Skip to main content
      </a>
      <Navbar scrolled={scrolled} onAuthClick={onAuthClick} />
      <main id="main-content">
        <Hero onAuthClick={onAuthClick} />
        <Features />
        <HowItWorks />
        <div ref={authRef}>
          <AuthSection initialMode={authMode} />
        </div>
      </main>
      <Footer />
    </>
  )
}
