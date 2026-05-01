import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useGetMyEventsQuery, type MyEventSummary } from '../store/hangplanApi'

function formatWhen(iso: string) {
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return ''
    return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return ''
  }
}

function EventRow({ item }: { item: MyEventSummary }) {
  const closed = item.status === 'CLOSED'
  const when = formatWhen(item.createdAt)
  const parts: ReactNode[] = []
  if (!item.createdByMe) {
    parts.push(`Host ${item.createdByName}`)
  }
  if (when) {
    parts.push(`Created ${when}`)
  }
  parts.push(
    <span key="st" className={`hp-badge ${closed ? 'hp-badge--muted' : 'hp-badge--success'}`}>
      {closed ? 'Closed' : 'Open'}
    </span>,
  )

  return (
    <li className="hp-events-row">
      <div className="hp-events-row__main">
        <Link className="hp-events-row__title" to={`/event/${item.id}`}>
          {item.title}
        </Link>
        <p className="hp-muted hp-events-row__meta">
          {parts.map((p, i) => (
            <span key={i}>
              {i > 0 ? ' · ' : ''}
              {p}
            </span>
          ))}
        </p>
      </div>
      {item.createdByMe ? <span className="hp-badge hp-badge--primary">Created</span> : null}
    </li>
  )
}

export function MyEventsPanel() {
  const { data, isLoading, isError } = useGetMyEventsQuery()

  if (isLoading) {
    return (
      <div className="hp-card hp-events-panel" style={{ marginBottom: 32 }}>
        <p className="hp-muted" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="hp-spinner hp-spinner--dark" />
          Loading your events…
        </p>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="hp-card hp-events-panel hp-events-panel--error" style={{ marginBottom: 32 }}>
        <p className="hp-inline-error" style={{ margin: 0 }}>
          Could not load your events. Refresh and try again.
        </p>
      </div>
    )
  }

  const events = data.events
  const total = events.length

  return (
    <div className="hp-card hp-events-panel" style={{ marginBottom: 32 }}>
      <h2 className="hp-section-title" style={{ marginBottom: 8 }}>
        Your events
      </h2>
      <p className="hp-muted" style={{ marginBottom: 24 }}>
        {total === 0
          ? 'Create an event or join one with a shared link — events you host or participate in appear here.'
          : `${total} ${total === 1 ? 'event' : 'events'} — accepted or declined status is on each event page.`}
      </p>
      {total === 0 ? (
        <p className="hp-muted hp-events-section__empty">Nothing here yet.</p>
      ) : (
        <ul className="hp-events-list">
          {events.map((item) => (
            <EventRow key={item.id} item={item} />
          ))}
        </ul>
      )}
    </div>
  )
}
