import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

const TOKEN_KEY = 'hangplan_token'

export type AuthUser = {
  id: string
  name: string
  email: string
  provider: 'LOCAL' | 'GOOGLE'
}

type AuthState = {
  token: string | null
  user: AuthUser | null
}

function loadToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

const initialState: AuthState = {
  token: loadToken(),
  user: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(
      state,
      action: PayloadAction<{ token: string; user?: AuthUser | null }>
    ) {
      state.token = action.payload.token
      if (action.payload.user !== undefined) {
        state.user = action.payload.user
      }
      try {
        localStorage.setItem(TOKEN_KEY, action.payload.token)
      } catch {
        // ignore
      }
    },
    setUser(state, action: PayloadAction<AuthUser | null>) {
      state.user = action.payload
    },
    clearAuth(state) {
      state.token = null
      state.user = null
      try {
        localStorage.removeItem(TOKEN_KEY)
      } catch {
        // ignore
      }
    },
  },
})

export const { setCredentials, setUser, clearAuth } = authSlice.actions
export default authSlice.reducer

export function getStoredToken(): string | null {
  return loadToken()
}
