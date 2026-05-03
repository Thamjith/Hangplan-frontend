import { Link } from 'react-router-dom'
import '../styles/landing.scss'

type Props = {
  title: string
  children: React.ReactNode
}

export function StaticDocLayout({ title, children }: Props) {
  return (
    <div className="lp-static">
      <header className="lp-static__header">
        <Link to="/" className="lp-static__brand">
          ← Back to HangPlan
        </Link>
      </header>
      <main className="lp-static__main">
        <article className="lp-static__article">
          <h1 className="lp-static__title">{title}</h1>
          {children}
        </article>
      </main>
    </div>
  )
}
