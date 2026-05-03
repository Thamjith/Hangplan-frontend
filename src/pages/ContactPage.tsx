import { StaticDocLayout } from '../components/StaticDocLayout'

export function ContactPage() {
  return (
    <StaticDocLayout title="Contact">
      <div className="lp-static__banner" role="status">
        <strong>In development.</strong> The contacts and messaging experience for HangPlan is not available
        yet. This page will list support options and contact channels when they are ready.
      </div>
      <p>
        For now, please refer to project or repository documentation if you are collaborating on HangPlan as a
        contributor.
      </p>
    </StaticDocLayout>
  )
}
