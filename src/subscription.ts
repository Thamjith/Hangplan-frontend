import type { AuthUser } from './store/authSlice'

export function isPaidUser(user: AuthUser | null | undefined): boolean {
  if (!user) return false
  const plan = user.subscriptionPlan ?? 'FREE'
  return (
    plan !== 'FREE' &&
    !!user.subscriptionEnd &&
    new Date(user.subscriptionEnd) > new Date()
  )
}
