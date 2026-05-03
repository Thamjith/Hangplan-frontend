/** Net balance line from event summary (balance = paid − share). */
export type BalanceLine = {
  userId: string
  name: string
  balance: string
}

export type SettlementFlow = {
  fromUserId: string
  fromName: string
  toUserId: string
  toName: string
  /** Amount `from` pays `to`, in cents (integer). */
  amountCents: number
}

const EPS_CENTS = 1

function parseBalanceToCents(balance: string): number {
  const n = Number(balance)
  if (Number.isNaN(n)) return 0
  return Math.round(n * 100)
}

function formatCents(cents: number): string {
  return (cents / 100).toFixed(2)
}

/**
 * Turns each person's net balance into a small set of pairwise payments
 * (debtors pay creditors) so the group can settle with minimal transfers.
 */
export function computePairwiseSettlementFlows(balances: BalanceLine[]): SettlementFlow[] {
  type Bucket = { userId: string; name: string; remaining: number }

  const debtors: Bucket[] = []
  const creditors: Bucket[] = []

  for (const b of balances) {
    const cents = parseBalanceToCents(b.balance)
    if (cents < -EPS_CENTS) {
      debtors.push({ userId: b.userId, name: b.name, remaining: -cents })
    } else if (cents > EPS_CENTS) {
      creditors.push({ userId: b.userId, name: b.name, remaining: cents })
    }
  }

  debtors.sort((a, b) => b.remaining - a.remaining)
  creditors.sort((a, b) => b.remaining - a.remaining)

  const flows: SettlementFlow[] = []
  let di = 0
  let ci = 0

  while (di < debtors.length && ci < creditors.length) {
    const d = debtors[di]
    const c = creditors[ci]
    if (d.remaining < EPS_CENTS) {
      di++
      continue
    }
    if (c.remaining < EPS_CENTS) {
      ci++
      continue
    }
    const pay = Math.min(d.remaining, c.remaining)
    flows.push({
      fromUserId: d.userId,
      fromName: d.name,
      toUserId: c.userId,
      toName: c.name,
      amountCents: pay,
    })
    d.remaining -= pay
    c.remaining -= pay
    if (d.remaining < EPS_CENTS) di++
    if (c.remaining < EPS_CENTS) ci++
  }

  return flows
}

export function formatSettlementAmount(cents: number): string {
  return formatCents(cents)
}

export function mergeAmountsByName(rows: { name: string; cents: number }[]): { name: string; cents: number }[] {
  const m = new Map<string, number>()
  for (const r of rows) {
    m.set(r.name, (m.get(r.name) ?? 0) + r.cents)
  }
  return Array.from(m.entries(), ([name, cents]) => ({ name, cents })).sort((a, b) => b.cents - a.cents)
}
