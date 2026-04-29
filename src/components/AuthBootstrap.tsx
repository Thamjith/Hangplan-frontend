import { useEffect } from 'react'
import { useGetMeQuery } from '../store/hangplanApi'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { clearAuth, setUser } from '../store/authSlice'

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
    if (data) {
      dispatch(setUser(data))
    }
  }, [data, dispatch])

  useEffect(() => {
    if (isUnauthorized(error)) {
      dispatch(clearAuth())
    }
  }, [error, dispatch])

  return null
}
