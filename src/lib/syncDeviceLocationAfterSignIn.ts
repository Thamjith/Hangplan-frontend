import type { AuthUser } from '../store/authSlice'
import { setUser } from '../store/authSlice'
import { hangplanApi } from '../store/hangplanApi'
import type { UpdateProfileRequest } from '../store/hangplanApi'
import { store } from '../store/store'

/** Set before OAuth redirect return; consumed when `/auth/me` loads in `AuthBootstrap`. */
export const PENDING_LOCATION_SYNC_KEY = 'hangplan_pending_location_sync'

const GEO_OPTIONS: PositionOptions = {
  enableHighAccuracy: false,
  timeout: 12_000,
  maximumAge: 120_000,
}

/**
 * After sign-in, asks the browser for the device position once and PATCHes `/auth/me`.
 * Failures (denied permission, timeout, network) are ignored so sign-in is never blocked.
 */
export function syncDeviceLocationAfterSignIn(user: AuthUser): void {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const body: UpdateProfileRequest = {
        name: user.name,
        locationUpdate: 'SET',
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      }
      if (user.phoneE164) {
        body.phoneE164 = user.phoneE164
      }

      void store
        .dispatch(hangplanApi.endpoints.updateMe.initiate(body))
        .unwrap()
        .then((next) => {
          store.dispatch(setUser(next))
        })
        .catch(() => {})
    },
    () => {},
    GEO_OPTIONS
  )
}
