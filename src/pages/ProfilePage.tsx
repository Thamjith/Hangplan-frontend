import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PhoneInput, { type Value as PhoneValue } from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { setUser } from '../store/authSlice'
import { useUpdateMeMutation } from '../store/hangplanApi'
import type { UpdateProfileRequest } from '../store/hangplanApi'

export function ProfilePage() {
  const user = useAppSelector((s) => s.auth.user)
  const dispatch = useAppDispatch()
  const [updateMe, { isLoading }] = useUpdateMeMutation()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState<PhoneValue | undefined>()
  const [clearLocationOnSave, setClearLocationOnSave] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [savedOk, setSavedOk] = useState(false)

  useEffect(() => {
    if (!user) return
    setName(user.name)
    setPhone((user.phoneE164 as PhoneValue | undefined) ?? undefined)
    setClearLocationOnSave(false)
    setSaveError(null)
    setSavedOk(false)
  }, [user?.id, user?.name, user?.phoneE164, user?.latitude, user?.longitude])

  const hasStoredLocation = useMemo(
    () => user?.latitude != null && user?.longitude != null,
    [user?.latitude, user?.longitude]
  )

  const onRemoveLocation = useCallback(() => {
    setClearLocationOnSave(true)
  }, [])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveError(null)
    setSavedOk(false)
    const trimmed = name.trim()
    if (!trimmed) {
      setSaveError('Please enter your name.')
      return
    }

    const body: UpdateProfileRequest = {
      name: trimmed,
      phoneE164: phone ?? '',
    }
    if (clearLocationOnSave) {
      body.locationUpdate = 'CLEAR'
    }

    try {
      const next = await updateMe(body).unwrap()
      dispatch(setUser(next))
      setClearLocationOnSave(false)
      setSavedOk(true)
    } catch {
      setSaveError('Could not save your profile. Try again.')
    }
  }

  if (!user) {
    return (
      <div className="hp-card">
        <p className="hp-muted">Loading profile…</p>
      </div>
    )
  }

  return (
    <div className="hp-card hp-profile">
      <h1 className="hp-page-title" style={{ marginBottom: 8 }}>
        Profile
      </h1>
      <p className="hp-muted" style={{ marginBottom: 24 }}>
        Update how you appear in HangPlan. Phone is optional. Approximate location is requested when you
        sign in (if the browser allows) and used as described in the{' '}
        <Link to="/privacy" className="hp-profile__link">
          Privacy Policy
        </Link>
        .
      </p>

      <form onSubmit={onSubmit} className="hp-profile__form">
        <div className="hp-input-group">
          <label htmlFor="profile-name">Display name</label>
          <input
            id="profile-name"
            className="hp-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            maxLength={120}
          />
        </div>

        <div className="hp-input-group">
          <label htmlFor="profile-email">Email</label>
          <input
            id="profile-email"
            className="hp-input"
            value={user.email}
            disabled
            readOnly
            title="Email is tied to your sign-in method"
          />
          <span className="hp-muted" style={{ fontSize: 12 }}>
            Email cannot be changed here.
          </span>
        </div>

        <div className="hp-input-group">
          <span id="profile-phone-label">Phone (optional)</span>
          <div className="hp-profile__phone">
            <PhoneInput
              international
              defaultCountry="US"
              value={phone}
              onChange={setPhone}
              aria-labelledby="profile-phone-label"
              className="hp-profile__phone-input"
            />
          </div>
          <span className="hp-muted" style={{ fontSize: 12 }}>
            Include country code. Used for account recovery and notifications when we add them.
          </span>
        </div>

        <div className="hp-profile__location">
          <h2 className="hp-section-title" style={{ marginBottom: 8 }}>
            Approximate location
          </h2>
          <p className="hp-muted" style={{ marginBottom: 16 }}>
            When you sign in, HangPlan may ask your browser for a one-time position to support future
            location-based suggestions. Nothing is stored if you deny permission.
          </p>
          {hasStoredLocation && user.latitude != null && user.longitude != null && (
            <p className="hp-profile__coords">
              Saved: {user.latitude.toFixed(5)}, {user.longitude.toFixed(5)}
              {clearLocationOnSave && (
                <span className="hp-muted"> — will be removed when you save.</span>
              )}
            </p>
          )}
          {hasStoredLocation && (
            <div className="hp-profile__location-actions">
              <button type="button" className="hp-btn hp-btn--secondary hp-btn--sm" onClick={onRemoveLocation}>
                Remove saved location
              </button>
            </div>
          )}
        </div>

        {saveError && <p className="hp-field-error">{saveError}</p>}
        {savedOk && (
          <p className="hp-profile__saved" role="status">
            Profile saved.
          </p>
        )}

        <div style={{ marginTop: 8 }}>
          <button type="submit" className="hp-btn hp-btn--primary" disabled={isLoading} aria-busy={isLoading}>
            {isLoading ? <span className="hp-spinner hp-spinner--dark" aria-hidden /> : 'Save profile'}
          </button>
        </div>
      </form>
    </div>
  )
}
