import { useEffect } from 'react'
import { useGetMeQuery } from '../store/hangplanApi'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { clearAuth, setUser } from '../store/authSlice'
import { PENDING_LOCATION_SYNC_KEY, syncDeviceLocationAfterSignIn } from '../lib/syncDeviceLocationAfterSignIn'

function isUnauthorized(err: unknown): boolean {
  return (
    err !== null &&
    typeof err === 'object' &&
    'status' in err &&
    (err as { status: number }).status === 401
  )
}

/** Loads profile when a JWT is present. */
export function AuthBootstrap() {
  const token = useAppSelector((s) => s.auth.token)
  const dispatch = useAppDispatch()
  const { data, error } = useGetMeQuery(undefined, { skip: !token })

  useEffect(() => {
    if (!data) return
    dispatch(setUser(data))
    if (sessionStorage.getItem(PENDING_LOCATION_SYNC_KEY) === '1') {
      sessionStorage.removeItem(PENDING_LOCATION_SYNC_KEY)
      syncDeviceLocationAfterSignIn(data)
    }
  }, [data, dispatch])

  useEffect(() => {
    if (isUnauthorized(error)) {
      sessionStorage.removeItem(PENDING_LOCATION_SYNC_KEY)
      dispatch(clearAuth())
    }
  }, [error, dispatch])

  return null
}
