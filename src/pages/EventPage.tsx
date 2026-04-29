import { useParams, Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Button,
  TextInput,
  Tile,
  Stack,
  InlineNotification,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
} from '@carbon/react'
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
    .refine((n) => !Number.isNaN(n) && n > 0, { message: 'Amount must be positive' }),
  description: z.string().optional(),
})

type ExpenseFormIn = z.input<typeof expenseSchema>
type ExpenseForm = z.infer<typeof expenseSchema>

export function EventPage() {
  const { id: rawId = '' } = useParams()
  const me = useAppSelector((s) => s.auth.user)
  const { data: ev, error: evError, isLoading: evLoading } = useGetEventQuery(
    rawId,
    { skip: !rawId, ...poll }
  )
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
      await addEx({
        id: rawId,
        body: { amount: data.amount, description: data.description || '' },
      }).unwrap()
      form.reset({ amount: '', description: '' })
    } catch {
      setMsg('Could not add expense. Join the event first.')
    }
  }

  if (!rawId) {
    return <p>Invalid event</p>
  }
  if (evLoading) {
    return <p>Loading event…</p>
  }
  if (evError || !ev) {
    return (
      <InlineNotification
        kind="error"
        title="Event"
        subtitle="Could not load this event. Check the link and sign in."
        lowContrast
      />
    )
  }

  return (
    <Stack gap={6}>
      <p>
        <Link to="/">Home</Link>
      </p>
      <h1>{ev.title}</h1>
      <p className="hangplan-muted">
        Max {ev.maxParticipants} people · {ev.status === 'OPEN' ? 'Open' : 'Closed'} · Created by {ev.createdByName}
      </p>
      <p className="hangplan-muted">
        Share: <code style={{ wordBreak: 'break-all' }}>{typeof window !== 'undefined' ? window.location.href : ''}</code>
      </p>
      {msg && (
        <InlineNotification
          kind="error"
          title="Action"
          subtitle={msg}
          lowContrast
          onClose={() => setMsg(null)}
        />
      )}

      <div className="hangplan-section">
        <h2>Join</h2>
        {alreadyJoined ? (
          <p className="hangplan-muted">You are in this event.</p>
        ) : (
          <Button
            kind="primary"
            onClick={onJoin}
            disabled={isClosed || joinState.isLoading}
          >
            {isClosed ? 'Event closed' : 'Join event'}
          </Button>
        )}
      </div>

      <div className="hangplan-section">
        <h2>Participants</h2>
        <Tile>
          <ul className="hangplan-list">
            {ev.participants.map((p) => (
              <li key={p.id}>
                {p.name} ({p.status})
              </li>
            ))}
          </ul>
        </Tile>
      </div>

      <div className="hangplan-section">
        <h2>Expenses</h2>
        {alreadyJoined && !isClosed && (
          <Tile>
            <form onSubmit={form.handleSubmit(onExpense)} noValidate>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12, alignItems: 'end' }}>
                <Controller
                  name="amount"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <TextInput
                      id="am"
                      type="number"
                      step="0.01"
                      min={0.01}
                      labelText="Amount"
                      invalid={!!fieldState.error}
                      invalidText={fieldState.error?.message}
                      value={String(field.value)}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                  )}
                />
                <Controller
                  name="description"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <TextInput
                      id="dsc"
                      labelText="Description"
                      invalid={!!fieldState.error}
                      invalidText={fieldState.error?.message}
                      {...field}
                    />
                  )}
                />
              </div>
              <div style={{ height: 12 }} />
              <Button type="submit" disabled={exState.isLoading} size="sm">
                Add expense
              </Button>
            </form>
          </Tile>
        )}

        <Tile style={{ marginTop: 12 }}>
          {expenses.length === 0 ? (
            <p className="hangplan-muted">No expenses yet.</p>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Description</TableHeader>
                  <TableHeader>Amount</TableHeader>
                  <TableHeader>Paid by</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {expenses.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell>{e.description || '—'}</TableCell>
                    <TableCell>{e.amount}</TableCell>
                    <TableCell>{e.paidByName}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Tile>
      </div>

      <div className="hangplan-section">
        <h2>Equal split</h2>
        {summary && (
          <Tile>
            <p>
              Total: <strong>{summary.total}</strong> — Share each: <strong>{summary.sharePerPerson}</strong> (
              {summary.participantCount} people)
            </p>
            {summary.balances.length > 0 && (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeader>Person</TableHeader>
                    <TableHeader>Paid</TableHeader>
                    <TableHeader>Share</TableHeader>
                    <TableHeader>Balance</TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {summary.balances.map((b) => (
                    <TableRow key={b.userId}>
                      <TableCell>{b.name}</TableCell>
                      <TableCell>{b.paid}</TableCell>
                      <TableCell>{b.share}</TableCell>
                      <TableCell>{b.balance}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Tile>
        )}
      </div>
    </Stack>
  )
}
