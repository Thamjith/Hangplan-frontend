import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { AuthUser } from './authSlice'

const baseUrl =
  (import.meta.env.VITE_API_BASE as string | undefined) ?? 'http://localhost:8080'

export const hangplanApi = createApi({
  reducerPath: 'hangplanApi',
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers, { getState }) => {
      const s = getState() as { auth: { token: string | null } }
      if (s.auth.token) {
        headers.set('Authorization', `Bearer ${s.auth.token}`)
      }
      return headers
    },
  }),
  tagTypes: ['Event', 'EventExpenses', 'EventSummary', 'User'],
  endpoints: (build) => ({
    signup: build.mutation<
      { token: string; user: AuthUser },
      { name: string; email: string; password: string }
    >({
      query: (body) => ({ url: '/auth/signup', method: 'POST', body }),
    }),
    login: build.mutation<
      { token: string; user: AuthUser },
      { email: string; password: string }
    >({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
    }),
    getMe: build.query<AuthUser, void>({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),
    createEvent: build.mutation<
      EventOut,
      { title: string; maxParticipants: number }
    >({
      query: (body) => ({ url: '/events', method: 'POST', body }),
    }),
    getEvent: build.query<EventOut, string>({
      query: (id) => `/events/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Event', id }],
    }),
    joinEvent: build.mutation<void, string>({
      query: (id) => ({ url: `/events/${id}/join`, method: 'POST' }),
      invalidatesTags: (_r, _e, id) => [{ type: 'Event', id }],
    }),
    addExpense: build.mutation<
      void,
      { id: string; body: { amount: number; description?: string } }
    >({
      query: ({ id, body }) => ({
        url: `/events/${id}/expenses`,
        method: 'POST',
        body: { amount: body.amount, description: body.description ?? '' },
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Event', id },
        { type: 'EventExpenses', id },
        { type: 'EventSummary', id },
      ],
    }),
    getExpenses: build.query<ExpenseView[], string>({
      query: (id) => `/events/${id}/expenses`,
      providesTags: (_r, _e, id) => [{ type: 'EventExpenses', id }],
    }),
    getSummary: build.query<SummaryOut, string>({
      query: (id) => `/events/${id}/summary`,
      providesTags: (_r, _e, id) => [{ type: 'EventSummary', id }],
    }),
  }),
})

export type EventOut = {
  id: string
  title: string
  maxParticipants: number
  status: 'OPEN' | 'CLOSED'
  createdById: string
  createdByName: string
  createdAt: string
  participants: {
    id: string
    userId: string
    name: string
    email: string
    status: 'ACCEPTED' | 'DECLINED'
  }[]
}

export type ExpenseView = {
  id: string
  amount: string
  description: string
  paidByParticipantId: string
  paidByName: string
}

export type SummaryOut = {
  total: string
  participantCount: number
  sharePerPerson: string
  balances: {
    userId: string
    name: string
    paid: string
    share: string
    balance: string
  }[]
}

export const {
  useSignupMutation,
  useLoginMutation,
  useGetMeQuery,
  useCreateEventMutation,
  useGetEventQuery,
  useJoinEventMutation,
  useAddExpenseMutation,
  useGetExpensesQuery,
  useGetSummaryQuery,
} = hangplanApi

export { baseUrl as apiBaseUrl }
