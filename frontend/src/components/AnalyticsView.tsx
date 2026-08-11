import {
  Sparkles,
  Award,
  DollarSign,
  Info
} from 'lucide-react'

interface Expense {
  id?: number
  description: string
  amount: number
  category: string
  date: string
  payment_method: string
}

interface AnalyticsViewProps {
  expenses: Expense[]
  onTabChange: (tab: string) => void
}

export default function AnalyticsView({ expenses, onTabChange }: AnalyticsViewProps) {
  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0)

  // Category totals
  const categoryTotals: Record<string, number> = {
    Food: 0,
    Travel: 0,
    Entertainment: 0,
    Shopping: 0,
    Utilities: 0,
    Others: 0,
  }
  expenses.forEach((exp) => {
    if (categoryTotals[exp.category] !== undefined) {
      categoryTotals[exp.category] += exp.amount
    } else {
      categoryTotals.Others += exp.amount
    }
  })

  // Multiplier advice points calculation
  // Amex Gold: 4X on Food
  // Amex Platinum: 5X on Travel
  // Amex Everyday: 2X on Shopping
  const foodPoints = Math.round(categoryTotals.Food * 4)
  const travelPoints = Math.round(categoryTotals.Travel * 5)
  const shoppingPoints = Math.round(categoryTotals.Shopping * 2)
  const totalPotentialPoints = foodPoints + travelPoints + shoppingPoints

  // Cashback alternatives
  const foodCashback = categoryTotals.Food * 0.04 // 4% equivalent
  const travelCashback = categoryTotals.Travel * 0.05 // 5% equivalent
  const totalPotentialCashback = foodCashback + travelCashback + (categoryTotals.Shopping * 0.03)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fade-in">
      {/* Cards Row: Points Potential vs Cashback Potential */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        {/* Points Card */}
        <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
          <div
            style={{
              position: 'absolute',
              top: -10,
              right: -10,
              width: 100,
              height: 100,
              background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)',
              borderRadius: '50%',
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, color: 'var(--blue-bright)' }}>
            <Award size={16} /> POTENTIAL AMEX MEMBERSHIP POINTS
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 800, marginTop: 12, color: 'var(--text)' }}>
            {totalPotentialPoints.toLocaleString()}{' '}
            <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-faint)' }}>points / mo</span>
          </h2>
          <p style={{ fontSize: 12.5, color: 'var(--text-dim)', marginTop: 8, lineHeight: 1.5 }}>
            By using the right cards for your category purchases: 4x on Dining/Groceries, 5x on Flights/Hotels, and 2x on Retail.
          </p>
        </div>

        {/* Cashback Card */}
        <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
          <div
            style={{
              position: 'absolute',
              top: -10,
              right: -10,
              width: 100,
              height: 100,
              background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)',
              borderRadius: '50%',
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, color: 'var(--green)' }}>
            <DollarSign size={16} /> ESTIMATED CARD SAVINGS
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 800, marginTop: 12, color: 'var(--text)' }}>
            ${totalPotentialCashback.toFixed(2)}{' '}
            <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-faint)' }}>saved / mo</span>
          </h2>
          <p style={{ fontSize: 12.5, color: 'var(--text-dim)', marginTop: 8, lineHeight: 1.5 }}>
            Value equivalent in statement credits or rewards value when matching your spending patterns to optimized card benefits.
          </p>
        </div>
      </div>

      {/* Main Grid: Detailed points breakdown vs RAG insights */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20 }}>
        {/* Multipliers Breakdown */}
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 18 }}>Card Rewards Multiplier Breakdown</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Food */}
            <BreakdownRow
              category="Food & Dining"
              amount={categoryTotals.Food}
              multiplier="4X Points"
              card="Amex Gold Card"
              points={foodPoints}
              percent={totalSpent > 0 ? (categoryTotals.Food / totalSpent) * 100 : 0}
            />

            {/* Travel */}
            <BreakdownRow
              category="Travel & Flights"
              amount={categoryTotals.Travel}
              multiplier="5X Points"
              card="Amex Platinum Card"
              points={travelPoints}
              percent={totalSpent > 0 ? (categoryTotals.Travel / totalSpent) * 100 : 0}
            />

            {/* Shopping */}
            <BreakdownRow
              category="Shopping & Retail"
              amount={categoryTotals.Shopping}
              multiplier="2X Points"
              card="Amex Blue Cash"
              points={shoppingPoints}
              percent={totalSpent > 0 ? (categoryTotals.Shopping / totalSpent) * 100 : 0}
            />
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Sparkles size={16} color="var(--blue-bright)" />
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>AI Advisor Recommendations</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13, lineHeight: 1.5 }}>
            {categoryTotals.Food > 100 && (
              <div style={{ padding: 12, background: 'var(--blue-soft)', borderRadius: 10, display: 'flex', gap: 10 }}>
                <Info size={16} color="var(--blue-bright)" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <strong>Supermarket & Dining optimization:</strong> You spent <strong>${categoryTotals.Food.toFixed(0)}</strong> on food. Use the <strong>Amex Gold card</strong> to rack up 4X Membership Rewards points instead of paying with standard debit cards.
                </div>
              </div>
            )}

            {categoryTotals.Travel > 50 && (
              <div style={{ padding: 12, background: 'var(--purple-soft)', borderRadius: 10, display: 'flex', gap: 10 }}>
                <Info size={16} color="var(--purple)" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <strong>Airport & Airline Fee Credits:</strong> You logged travel expenses. The <strong>Amex Platinum Card</strong> refunds up to $200 of airline baggage fees annually. Make sure you select your airline choice on the Amex app!
                </div>
              </div>
            )}

            {categoryTotals.Entertainment > 30 && (
              <div style={{ padding: 12, background: 'var(--yellow-soft)', borderRadius: 10, display: 'flex', gap: 10 }}>
                <Info size={16} color="var(--yellow)" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <strong>Digital Streaming Credits:</strong> Streaming services like Netflix or Disney+ qualify for the $240 digital entertainment credit on the Amex Platinum card. Log in to your Amex portal to activate this feature.
                </div>
              </div>
            )}

            <div style={{ textAlign: 'center', marginTop: 10 }}>
              <button
                onClick={() => onTabChange('chat')}
                style={{
                  background: 'var(--surface-muted)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  padding: '8px 16px',
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: 'var(--blue-bright)',
                }}
              >
                Chat with AI for Custom Plan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function BreakdownRow({
  category,
  amount,
  multiplier,
  card,
  points,
  percent
}: {
  category: string
  amount: number
  multiplier: string
  card: string
  points: number
  percent: number
}) {
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 14, background: 'var(--surface-muted)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <div>
          <strong style={{ fontSize: 13.5 }}>{category}</strong>
          <span style={{ fontSize: 11, color: 'var(--text-faint)', marginLeft: 8 }}>{percent.toFixed(0)}% of total</span>
        </div>
        <strong style={{ fontSize: 13.5 }}>${amount.toFixed(2)}</strong>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: 'var(--text-dim)', paddingTop: 6, borderTop: '1px dotted var(--border)' }}>
        <span>
          Multiplier: <span style={{ color: 'var(--blue-bright)', fontWeight: 700 }}>{multiplier}</span> via <strong>{card}</strong>
        </span>
        <span style={{ color: 'var(--green)', fontWeight: 700 }}>+{points.toLocaleString()} Points</span>
      </div>
    </div>
  )
}
