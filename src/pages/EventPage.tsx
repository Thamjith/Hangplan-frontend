import { useParams, Link } from 'react-router-dom'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client/dist/sockjs.min.js'
import {
  apiBaseUrl,
  useGetEventQuery,
  useGetExpensesQuery,
  useGetSummaryQuery,
  useJoinEventMutation,
  useAddExpenseMutation,
  useDeclineEventMutation,
} from '../store/hangplanApi'
import { useAppSelector } from '../store/hooks'
import { isPaidUser } from '../subscription'

const expenseSchema = z.object({
  amount: z
    .string()
    .min(1, 'Required')
    .transform((s) => parseFloat(s))
    .refine((n) => !Number.isNaN(n) && n > 0, { message: 'Must be positive' }),
  description: z.string().optional(),
})

type ExpenseFormIn = z.input<typeof expenseSchema>
type ExpenseForm = z.infer<typeof expenseSchema>

/** Paid-tier WebSocket/STOMP reached “subscribed and listening”, vs failed or still connecting */
type RealtimeWsStatus = 'connecting' | 'live' | 'unavailable'

const REALTIME_CONNECT_MS = 15000

export function EventPage() {
  const { id: rawId = '' } = useParams()
  const me = useAppSelector((s) => s.auth.user)
  const authToken = useAppSelector((s) => s.auth.token)
  const realtimeEnabled = isPaidUser(me)

  const {
    data: ev,
    error: evError,
    isLoading: evLoading,
    refetch: refetchEvent,
  } = useGetEventQuery(rawId, { skip: !rawId })
  const { data: expenses = [], refetch: refetchExpenses } = useGetExpensesQuery(rawId, { skip: !rawId })
  const { data: summary, refetch: refetchSummary } = useGetSummaryQuery(rawId, { skip: !rawId })
  const [join, joinState] = useJoinEventMutation()
  const [decline, declineState] = useDeclineEventMutation()
  const [addEx, exState] = useAddExpenseMutation()
  const [msg, setMsg] = useState<string | null>(null)
  const [copyLinkFeedback, setCopyLinkFeedback] = useState<'idle' | 'copied' | 'error'>('idle')
  const [realtimeWsStatus, setRealtimeWsStatus] = useState<RealtimeWsStatus>('connecting')

  const form = useForm<ExpenseFormIn, unknown, ExpenseForm>({
    resolver: zodResolver(expenseSchema),
    defaultValues: { amount: '', description: '' },
  })

  const hasAcceptedMembership = useMemo(() => {
    if (!me || !ev) return false
    return ev.participants.some((p) => p.userId === me.id && p.status === 'ACCEPTED')
  }, [me, ev])

  const myParticipant = useMemo(() => {
    if (!me || !ev) return undefined
    return ev.participants.find((p) => p.userId === me.id)
  }, [me, ev])

  const isCreator = !!(me && ev && ev.createdById === me.id)

  const isClosed = ev?.status === 'CLOSED'

  useEffect(() => {
    setCopyLinkFeedback('idle')
  }, [rawId])

  const copyShareLink = useCallback(async () => {
    if (typeof window === 'undefined') return
    const url = window.location.href
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url)
      } else {
        const ta = document.createElement('textarea')
        ta.value = url
        ta.style.position = 'fixed'
        ta.style.left = '-9999px'
        document.body.appendChild(ta)
        ta.focus()
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
      }
      setCopyLinkFeedback('copied')
      window.setTimeout(() => setCopyLinkFeedback('idle'), 2000)
    } catch {
      setCopyLinkFeedback('error')
      window.setTimeout(() => setCopyLinkFeedback('idle'), 2500)
    }
  }, [])
  
  const onRefresh = useCallback(async () => {
    setMsg(null)
    try {
      await Promise.all([refetchEvent(), refetchExpenses(), refetchSummary()])
    } catch {
      setMsg('Could not refresh right now. Please try again.')
    }
  }, [refetchEvent, refetchExpenses, refetchSummary])

  useEffect(() => {
    if (!rawId || !realtimeEnabled || !authToken) {
      return
    }

    let cancelled = false
    setRealtimeWsStatus('connecting')

    const failTimer = window.setTimeout(() => {
      if (!cancelled) {
        setRealtimeWsStatus((prev) => (prev === 'live' ? 'live' : 'unavailable'))
      }
    }, REALTIME_CONNECT_MS)

    const clearFailTimer = () => {
      window.clearTimeout(failTimer)
    }

    const wsBase = apiBaseUrl.replace(/\/$/, '')
    const client = new Client({
      webSocketFactory: () => new SockJS(`${wsBase}/ws`),
      connectHeaders: {
        Authorization: `Bearer ${authToken}`,
      },
      reconnectDelay: 5000,
    })

    const markUnavailable = () => {
      if (!cancelled) {
        clearFailTimer()
        setRealtimeWsStatus('unavailable')
      }
    }

    client.onConnect = () => {
      if (cancelled) return
      clearFailTimer()
      client.subscribe(`/topic/events/${rawId}`, () => {
        void onRefresh()
      })
      setRealtimeWsStatus('live')
    }

    client.onStompError = () => {
      markUnavailable()
    }

    client.onWebSocketError = () => {
      markUnavailable()
    }

    client.activate()

    return () => {
      cancelled = true
      clearFailTimer()
      void client.deactivate()
    }
  }, [rawId, realtimeEnabled, authToken, onRefresh])

  const onJoin = async () => {
    setMsg(null)
    try {
      await join(rawId).unwrap()
    } catch {
      setMsg('Could not join. The event may be full or closed.')
    }
  }

  const onDecline = async () => {
    setMsg(null)
    try {
      await decline(rawId).unwrap()
    } catch {
      setMsg('Could not save your choice. Try again.')
    }
  }

  const onExpense = async (data: ExpenseForm) => {
    setMsg(null)
    try {
      await addEx({ id: rawId, body: { amount: data.amount, description: data.description || '' } }).unwrap()
      form.reset({ amount: '', description: '' })
    } catch {
      setMsg('Could not add expense. Join the event first.')
    }
  }

  if (!rawId) return <p className="hp-muted">Invalid event</p>

  if (evLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-muted)', paddingTop: 40 }}>
        <span className="hp-spinner hp-spinner--dark" />
        Loading event…
      </div>
    )
  }

  if (evError || !ev) {
    return (
      <div className="hp-inline-error">
        Could not load this event. Check the link and make sure you are signed in.
      </div>
    )
  }

  return (
    <div>
      <p style={{ marginBottom: 20 }}>
        <Link to="/app" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>
          ← Back to events
        </Link>
      </p>

      <h1 className="hp-page-title" style={{ marginBottom: 8 }}>{ev.title}</h1>
      <p className="hp-muted" style={{ marginBottom: 4 }}>
        Max {ev.maxParticipants} people ·{' '}
        <span className={`hp-badge ${isClosed ? 'hp-badge--muted' : 'hp-badge--success'}`} style={{ verticalAlign: 'middle' }}>
          {isClosed ? 'Closed' : 'Open'}
        </span>{' '}
        · Created by {ev.createdByName}
      </p>
      <div
        className="hp-muted"
        style={{
          marginBottom: 28,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '10px 12px',
        }}
      >
        <span style={{ flexShrink: 0 }}>Share link:</span>
        <code
          style={{
            flex: '1 1 180px',
            minWidth: 0,
            fontSize: 13,
            wordBreak: 'break-all',
            background: 'var(--bg)',
            padding: '6px 10px',
            borderRadius: 4,
            border: '1px solid var(--border)',
          }}
        >
          {typeof window !== 'undefined' ? window.location.href : ''}
        </code>
        <button
          type="button"
          className="hp-btn hp-btn--secondary hp-btn--sm"
          style={{ flexShrink: 0 }}
          onClick={() => void copyShareLink()}
        >
          {copyLinkFeedback === 'copied'
            ? 'Copied!'
            : copyLinkFeedback === 'error'
              ? 'Could not copy'
              : 'Copy link'}
        </button>
      </div>

      {msg && (
        <div className="hp-inline-error" style={{ marginBottom: 20 }}>
          {msg}
        </div>
      )}

      <div className="hp-section" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <p className="hp-muted" style={{ margin: 0 }}>
            {!realtimeEnabled
              ? 'Real-time updates are available for premium users.'
              : realtimeWsStatus === 'live'
                ? 'Real-time updates are enabled for your account.'
                : realtimeWsStatus === 'connecting'
                  ? 'Connecting to real-time updates…'
                  : 'Real-time updates could not connect. Refresh the page to try again.'}
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              className={`hp-btn hp-btn--sm ${realtimeEnabled ? 'hp-btn--secondary' : 'hp-btn--primary'}`}
              onClick={() => void onRefresh()}
            >
              Refresh
            </button>
            {realtimeEnabled && realtimeWsStatus === 'unavailable' && (
              <button type="button" className="hp-btn hp-btn--primary hp-btn--sm" onClick={() => window.location.reload()}>
                Reload page
              </button>
            )}
            {!realtimeEnabled && (
              <button type="button" className="hp-btn hp-btn--secondary hp-btn--sm" disabled>
                Upgrade
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Join */}
      <div className="hp-section">
        <h2 className="hp-section-title">Join</h2>
        {isCreator ? (
          <p className="hp-muted">You created this event — you are already included as a participant.</p>
        ) : hasAcceptedMembership ? (
          <>
            <p className="hp-muted">You are in this event.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginTop: 14 }}>
              <button
                type="button"
                className="hp-btn hp-btn--secondary"
                onClick={onDecline}
                disabled={declineState.isLoading}
              >
                {declineState.isLoading ? <span className="hp-spinner hp-spinner--dark" /> : 'Pass on this event'}
              </button>
            </div>
            <p className="hp-muted" style={{ marginTop: 12, fontSize: 14 }}>
              Changed your mind? You can pass and join again later if there is room.
            </p>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
              <button
                className="hp-btn hp-btn--primary"
                onClick={onJoin}
                disabled={isClosed || joinState.isLoading}
              >
                {joinState.isLoading ? <span className="hp-spinner" /> : isClosed ? 'Event closed' : 'Join event'}
              </button>
              {!isClosed && myParticipant?.status !== 'DECLINED' && (
                <button
                  type="button"
                  className="hp-btn hp-btn--secondary"
                  onClick={onDecline}
                  disabled={declineState.isLoading}
                >
                  {declineState.isLoading ? <span className="hp-spinner hp-spinner--dark" /> : 'Pass on this event'}
                </button>
              )}
            </div>
            {myParticipant?.status === 'DECLINED' && (
              <p className="hp-muted" style={{ marginTop: 14 }}>
                You passed on this event. You can still join if there is room.
              </p>
            )}
          </>
        )}
      </div>

      {/* Participants */}
      <div className="hp-section">
        <h2 className="hp-section-title">Participants ({ev.participants.length})</h2>
        {ev.participants.length === 0 ? (
          <p className="hp-muted">No participants yet.</p>
        ) : (
          <div className="hp-card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="hp-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {ev.participants.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>
                      <span className={`hp-badge ${p.status === 'ACCEPTED' ? 'hp-badge--success' : 'hp-badge--muted'}`}>
                        {p.status === 'ACCEPTED' ? 'Accepted' : 'Declined'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add expense form */}
      {hasAcceptedMembership && !isClosed && (
        <div className="hp-section">
          <h2 className="hp-section-title">Add expense</h2>
          <div className="hp-card" style={{ maxWidth: 480 }}>
            <form onSubmit={form.handleSubmit(onExpense)} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
                <div className="hp-input-group">
                  <label htmlFor="exp-amount">Amount</label>
                  <input
                    id="exp-amount"
                    type="number"
                    step="0.01"
                    min={0.01}
                    className={`hp-input${form.formState.errors.amount ? ' is-error' : ''}`}
                    placeholder="0.00"
                    {...form.register('amount')}
                  />
                  {form.formState.errors.amount && (
                    <span className="hp-field-error">{form.formState.errors.amount.message}</span>
                  )}
                </div>
                <div className="hp-input-group">
                  <label htmlFor="exp-desc">Description</label>
                  <input
                    id="exp-desc"
                    className="hp-input"
                    placeholder="What was it for?"
                    {...form.register('description')}
                  />
                </div>
              </div>
              <div>
                <button type="submit" className="hp-btn hp-btn--primary hp-btn--sm" disabled={exState.isLoading}>
                  {exState.isLoading ? <span className="hp-spinner" /> : 'Add expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expenses list */}
      <div className="hp-section">
        <h2 className="hp-section-title">Expenses</h2>
        {expenses.length === 0 ? (
          <p className="hp-muted">No expenses yet.</p>
        ) : (
          <div className="hp-card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="hp-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Paid by</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((e) => (
                  <tr key={e.id}>
                    <td>{e.description || '—'}</td>
                    <td style={{ fontWeight: 600 }}>{e.amount}</td>
                    <td>{e.paidByName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Split summary */}
      {summary && (
        <div className="hp-section">
          <h2 className="hp-section-title">Equal split</h2>
          <div className="hp-card">
            <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', marginBottom: summary.balances.length > 0 ? 20 : 0 }}>
              <div>
                <p className="hp-muted" style={{ marginBottom: 4 }}>Total</p>
                <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-base)' }}>{summary.total}</p>
              </div>
              <div>
                <p className="hp-muted" style={{ marginBottom: 4 }}>Share each ({summary.participantCount} people)</p>
                <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--primary)' }}>{summary.sharePerPerson}</p>
              </div>
            </div>
            {summary.balances.length > 0 && (
              <div style={{ overflow: 'hidden', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginTop: 4 }}>
                <table className="hp-table">
                  <thead>
                    <tr>
                      <th>Person</th>
                      <th>Paid</th>
                      <th>Share</th>
                      <th>Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.balances.map((b) => (
                      <tr key={b.userId}>
                        <td>{b.name}</td>
                        <td>{b.paid}</td>
                        <td>{b.share}</td>
                        <td style={{ fontWeight: 600, color: parseFloat(b.balance) >= 0 ? 'oklch(42% 0.18 150)' : 'oklch(55% 0.20 25)' }}>
                          {b.balance}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
