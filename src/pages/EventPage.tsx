import { useParams, Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  useGetEventQuery,
  useGetExpensesQuery,
  useGetSummaryQuery,
  useJoinEventMutation,
  useAddExpenseMutation,
} from '../store/hangplanApi'
import { useAppSelector } from '../store/hooks'

const poll = { pollingInterval: 5000 } as const

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

export function EventPage() {
  const { id: rawId = '' } = useParams()
  const me = useAppSelector((s) => s.auth.user)

  const { data: ev, error: evError, isLoading: evLoading } = useGetEventQuery(rawId, { skip: !rawId, ...poll })
  const { data: expenses = [] } = useGetExpensesQuery(rawId, { skip: !rawId, ...poll })
  const { data: summary } = useGetSummaryQuery(rawId, { skip: !rawId, ...poll })
  const [join, joinState] = useJoinEventMutation()
  const [addEx, exState] = useAddExpenseMutation()
  const [msg, setMsg] = useState<string | null>(null)

  const form = useForm<ExpenseFormIn, unknown, ExpenseForm>({
    resolver: zodResolver(expenseSchema),
    defaultValues: { amount: '', description: '' },
  })

  const alreadyJoined = useMemo(() => {
    if (!me || !ev) return false
    return ev.participants.some((p) => p.userId === me.id)
  }, [me, ev])

  const isClosed = ev?.status === 'CLOSED'

  const onJoin = async () => {
    setMsg(null)
    try {
      await join(rawId).unwrap()
    } catch {
      setMsg('Could not join. The event may be full or closed.')
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
      <p className="hp-muted" style={{ marginBottom: 28, wordBreak: 'break-all' }}>
        Share link:{' '}
        <code style={{ fontSize: 13, background: 'var(--bg)', padding: '2px 6px', borderRadius: 4, border: '1px solid var(--border)' }}>
          {typeof window !== 'undefined' ? window.location.href : ''}
        </code>
      </p>

      {msg && (
        <div className="hp-inline-error" style={{ marginBottom: 20 }}>
          {msg}
        </div>
      )}

      {/* Join */}
      <div className="hp-section">
        <h2 className="hp-section-title">Join</h2>
        {alreadyJoined ? (
          <p className="hp-muted">You are already in this event.</p>
        ) : (
          <button
            className="hp-btn hp-btn--primary"
            onClick={onJoin}
            disabled={isClosed || joinState.isLoading}
          >
            {joinState.isLoading ? <span className="hp-spinner" /> : isClosed ? 'Event closed' : 'Join event'}
          </button>
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
      {alreadyJoined && !isClosed && (
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
