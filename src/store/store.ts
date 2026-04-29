import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { hangplanApi } from './hangplanApi'
import authReducer from './authSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [hangplanApi.reducerPath]: hangplanApi.reducer,
  },
  middleware: (getDefault) =>
    getDefault().concat(hangplanApi.middleware),
})

setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
