import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  useSearchParams,
  useNavigate,
  useLocation,
  Link,
  type Location,
} from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Button, TextInput, InlineNotification, Form, FormGroup, Stack, Tile, Toggle } from '@carbon/react'
import { useLoginMutation, useSignupMutation, apiBaseUrl } from '../store/hangplanApi'
import { setCredentials } from '../store/authSlice'
import { useAppDispatch } from '../store/hooks'

const loginSchema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(1, 'Password required'),
})
const signupSchema = z.object({
  // Avoid the literal field name "name" (id/name="name" conflicts with window.name and form APIs)
  fullName: z.string().min(1, 'Name required'),
  email: z.string().email('Valid email required'),
  password: z.string().min(6, 'At least 6 characters'),
})

type Login = z.infer<typeof loginSchema>
type Signup = z.infer<typeof signupSchema>

const rhfValueOpts = {
  shouldValidate: true,
  shouldDirty: true,
  shouldTouch: true,
} as const

export function AuthPage() {
  const [search, setSearch] = useSearchParams()
  const navigate = useNavigate()
  const loc = useLocation()
  const from = (loc.state as { from?: Location } | null)?.from?.pathname
  const dispatch = useAppDispatch()
  const [signUpMode, setSignUpMode] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const [login, loginState] = useLoginMutation()
  const [signup, signupState] = useSignupMutation()

  const loginForm = useForm<Login>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })
  const { setValue: setLoginValue } = loginForm
  const signupForm = useForm<Signup>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: '', email: '', password: '' },
  })
  const { setValue: setSignupValue } = signupForm

  useEffect(() => {
    const token = search.get('token')
    if (token) {
      dispatch(setCredentials({ token }))
      setSearch({})
      navigate(from ?? '/', { replace: true })
    }
  }, [search, setSearch, dispatch, navigate, from])

  const onLogin = async (data: Login) => {
    setFormError(null)
    try {
      const res = await login(data).unwrap()
      dispatch(
        setCredentials({ token: res.token, user: res.user })
      )
      navigate(from ?? '/', { replace: true })
    } catch (e: unknown) {
      setFormError('Invalid email or password')
    }
  }

  const onSignup = async (data: Signup) => {
    setFormError(null)
    try {
      const res = await signup({
        name: data.fullName,
        email: data.email,
        password: data.password,
      }).unwrap()
      dispatch(
        setCredentials({ token: res.token, user: res.user })
      )
      navigate(from ?? '/', { replace: true })
    } catch (e: unknown) {
      setFormError('Could not create account. Email may already be in use.')
    }
  }

  const pending = signUpMode ? signupState.isLoading : loginState.isLoading
  const googleHref = `${apiBaseUrl}/oauth2/authorization/google`

  return (
    <Stack gap={6} style={{ maxWidth: '28rem', margin: '0 auto' }}>
      <h1>Welcome to HangPlan</h1>
      <p className="hangplan-muted">Sign in to plan hangouts, split costs fairly.</p>

      {formError && (
        <InlineNotification
          kind="error"
          title="Error"
          subtitle={formError}
          lowContrast
        />
      )}

      <Tile>
        {/* RHF’s internal onChange bails if get(_fields, name) is missing; setValue still updates _formValues (RHF 7.74+). Carbon TextInput can leave fullName/email unregistered. */}
        <Form
          noValidate
          onSubmit={
            signUpMode
              ? signupForm.handleSubmit(onSignup)
              : loginForm.handleSubmit(onLogin)
          }
        >
          <FormGroup legendText="Mode">
            <Toggle
              id="auth-mode"
              labelText="I want to create an account"
              toggled={signUpMode}
              onToggle={() => {
                setSignUpMode((v) => !v)
                setFormError(null)
              }}
            />
          </FormGroup>

          {signUpMode ? (
            <>
              <Controller
                name="fullName"
                control={signupForm.control}
                render={({ field, fieldState }) => (
                  <TextInput
                    id="auth-signup-fullname"
                    labelText="Name"
                    autoComplete="name"
                    invalid={!!fieldState.error}
                    invalidText={fieldState.error?.message}
                    value={String(field.value ?? '')}
                    onChange={(e) => {
                      setSignupValue('fullName', (e.target as HTMLInputElement).value, rhfValueOpts)
                    }}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                )}
              />
              <div style={{ height: 12 }} />
              <Controller
                name="email"
                control={signupForm.control}
                render={({ field, fieldState }) => (
                  <TextInput
                    id="auth-signup-email"
                    type="email"
                    labelText="Email"
                    autoComplete="email"
                    invalid={!!fieldState.error}
                    invalidText={fieldState.error?.message}
                    value={String(field.value ?? '')}
                    onChange={(e) => {
                      setSignupValue('email', (e.target as HTMLInputElement).value, rhfValueOpts)
                    }}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                )}
              />
              <div style={{ height: 12 }} />
              <Controller
                name="password"
                control={signupForm.control}
                render={({ field, fieldState }) => (
                  <TextInput
                    id="auth-signup-password"
                    type="password"
                    labelText="Password"
                    autoComplete="new-password"
                    invalid={!!fieldState.error}
                    invalidText={fieldState.error?.message}
                    value={String(field.value ?? '')}
                    onChange={(e) => {
                      setSignupValue('password', (e.target as HTMLInputElement).value, rhfValueOpts)
                    }}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                )}
              />
            </>
          ) : (
            <>
              <Controller
                name="email"
                control={loginForm.control}
                render={({ field, fieldState }) => (
                  <TextInput
                    id="login-email"
                    type="email"
                    labelText="Email"
                    autoComplete="email"
                    invalid={!!fieldState.error}
                    invalidText={fieldState.error?.message}
                    value={String(field.value ?? '')}
                    onChange={(e) => {
                      setLoginValue('email', (e.target as HTMLInputElement).value, rhfValueOpts)
                    }}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                )}
              />
              <div style={{ height: 12 }} />
              <Controller
                name="password"
                control={loginForm.control}
                render={({ field, fieldState }) => (
                  <TextInput
                    id="login-password"
                    type="password"
                    labelText="Password"
                    autoComplete="current-password"
                    invalid={!!fieldState.error}
                    invalidText={fieldState.error?.message}
                    value={String(field.value ?? '')}
                    onChange={(e) => {
                      setLoginValue('password', (e.target as HTMLInputElement).value, rhfValueOpts)
                    }}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                )}
              />
            </>
          )}
          <div style={{ height: 16 }} />
          <Button type="submit" kind="primary" disabled={pending}>
            {signUpMode ? 'Sign up' : 'Log in'}
          </Button>
        </Form>

        <div style={{ height: 20 }} />
        <Button
          type="button"
          kind="tertiary"
          onClick={() => {
            window.location.href = googleHref
          }}
        >
          Continue with Google
        </Button>
        <p className="hangplan-muted" style={{ marginTop: 8 }}>
          Configure Google OAuth in the backend to use this button.
        </p>
        <p style={{ marginTop: 16 }}>
          <Link to="/">Back to home</Link>
        </p>
      </Tile>
    </Stack>
  )
}
