import { useState } from 'react'
import { apiService } from '../services/api'
import {
  Sparkles,
  TrendingUp,
  Pizza,
  Plane,
  Film,
  ShoppingBag,
  Wrench,
  HelpCircle,
  Check,
  Zap,
  ArrowRight
} from 'lucide-react'

interface Expense {
  id?: number
  description: string
  amount: number
  category: string
  date: string
  payment_method: string
}

interface DashboardViewProps {
  expenses: Expense[]
  onAddExpense: (expense: { description: string; amount: number; category: string; date: string; payment_method: string }) => Promise<void>
  onClearExpenses: () => void
  onTabChange: (tab: string) => void
}

const CATEGORY_ICONS: Record<string, any> = {
  Food: Pizza,
  Travel: Plane,
  Entertainment: Film,
  Shopping: ShoppingBag,
  Utilities: Wrench,
  Others: HelpCircle,
}

const CATEGORY_COLORS: Record<string, string> = {
  Food: 'var(--orange, #f97316)',
  Travel: 'var(--blue-bright)',
  Entertainment: 'var(--purple)',
  Shopping: 'var(--yellow)',
  Utilities: 'var(--red)',
  Others: 'var(--text-dim)',
}

export default function DashboardView({ expenses, onAddExpense, onClearExpenses, onTabChange }: DashboardViewProps) {
  const [quickInput, setQuickInput] = useState('')
  const [parsing, setParsing] = useState(false)
  const [parsed, setParsed] = useState<any>(null)
  const [success, setSuccess] = useState(false)

  // Calculate totals
  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0)
  const budgetLimit = 1500.00
  const percentBudget = Math.min((totalSpent / budgetLimit) * 100, 100)

  // Category counts
  const categoryTotals: Record<string, number> = {}
  expenses.forEach((exp) => {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount
  })

  // Quick parse action
  const handleQuickParse = async () => {
    if (!quickInput.trim() || parsing) return
    setParsing(true)
    setParsed(null)
    setSuccess(false)

    try {
      const data = await apiService.aiParseExpense(quickInput)
      setParsed(data)
    } catch (e) {
      console.warn('Fallback quick parse')
      setTimeout(() => {
        // Fallback
        const amountMatch = quickInput.match(/\$?(\d+(\.\d{2})?)/)
        const amt = amountMatch ? parseFloat(amountMatch[1]) : 15.00
        let desc = 'Mock Purchase'
        let cat = 'Others'
        let pay = 'Cash'

        if (quickInput.toLowerCase().includes('starbucks') || quickInput.toLowerCase().includes('food')) {
          desc = 'Starbucks'
          cat = 'Food'
          pay = 'Amex Gold'
        } else if (quickInput.toLowerCase().includes('uber') || quickInput.toLowerCase().includes('flight')) {
          desc = 'Uber'
          cat = 'Travel'
          pay = 'Amex Platinum'
        }

        setParsed({
          description: desc,
          amount: amt,
          category: cat,
          payment_method: pay,
          date: new Date().toISOString().split('T')[0],
        })
      }, 500)
    } finally {
      setParsing(false)
    }
  }

  const handleConfirmQuickAdd = async () => {
    if (!parsed) return
    await onAddExpense(parsed)
    setParsed(null)
    setQuickInput('')
    setSuccess(true)
    setTimeout(() => setSuccess(false), 2000)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fade-in">
      {/* Top Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {/* Total Spent */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-faint)' }}>Total Monthly Expenses</span>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, marginTop: 8 }}>
                ${totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
            </div>
            <div
              style={{
                background: 'var(--blue-soft)',
                padding: 10,
                borderRadius: 10,
                color: 'var(--blue-bright)',
              }}
            >
              <TrendingUp size={20} />
            </div>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 12 }}>
            Across {expenses.length} transaction logs
          </div>
        </div>

        {/* Budget limit */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-faint)' }}>Budget Used</span>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, marginTop: 8 }}>
                {percentBudget.toFixed(0)}%
              </h2>
            </div>
            <div
              style={{
                background: percentBudget > 85 ? 'var(--red-soft)' : 'var(--green-soft)',
                padding: 10,
                borderRadius: 10,
                color: percentBudget > 85 ? 'var(--red)' : 'var(--green)',
              }}
            >
              <Zap size={20} />
            </div>
          </div>
          {/* Progress bar */}
          <div style={{ width: '100%', height: 6, background: 'var(--border)', borderRadius: 9, marginTop: 14, overflow: 'hidden' }}>
            <div
              style={{
                width: `${percentBudget}%`,
                height: '100%',
                background: percentBudget > 85 ? 'var(--red)' : 'var(--blue-bright)',
                borderRadius: 9,
                transition: 'width 0.3s ease',
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-faint)', marginTop: 8 }}>
            <span>Spent: ${totalSpent.toFixed(0)}</span>
            <span>Limit: ${budgetLimit.toFixed(0)}</span>
          </div>
        </div>

        {/* Amex Rewards optimization Card */}
        <div className="card" style={{ background: 'linear-gradient(135deg, var(--blue), #1e293b)', color: '#fff', border: 'none' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: 'var(--blue-bright)' }}>
              <Sparkles size={13} color="var(--blue-bright)" /> AMEX REWARDS ADVICE
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginTop: 10, lineHeight: 1.4 }}>
              Unlock 4x multipliers on Dining & Supermarkets!
            </h3>
            <p style={{ fontSize: 11.5, opacity: 0.8, marginTop: 6, lineHeight: 1.5 }}>
              Your food category spending is high. Paying with Amex Gold will maximize your points multiplier.
            </p>
          </div>
          <button
            onClick={() => onTabChange('chat')}
            style={{
              marginTop: 14,
              fontSize: 12,
              fontWeight: 700,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            Ask AI Advisor <ArrowRight size={12} />
          </button>
        </div>
      </div>

      {/* Quick Entry Box */}
      <div className="card">
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Sparkles size={15} color="var(--blue-bright)" /> Quick AI Expense Entry
        </h3>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            value={quickInput}
            onChange={(e) => setQuickInput(e.target.value)}
            placeholder="Type spending (e.g. spent $15 at Starbucks for coffee on Amex Gold)..."
            style={{
              flex: 1,
              borderRadius: 10,
              padding: '10px 14px',
              fontSize: 13,
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleQuickParse()
            }}
          />
          <button
            onClick={handleQuickParse}
            disabled={parsing || !quickInput.trim()}
            style={{
              background: 'var(--blue-bright)',
              color: '#fff',
              fontWeight: 600,
              padding: '0 18px',
              borderRadius: 10,
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              opacity: parsing || !quickInput.trim() ? 0.7 : 1,
            }}
          >
            {parsing ? 'Parsing...' : 'AI Parse'}
          </button>
        </div>

        {parsed && (
          <div
            className="animate-fade-in"
            style={{
              marginTop: 14,
              padding: 12,
              background: 'var(--surface-muted)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ fontSize: 12.5 }}>
              Extracted: <strong style={{ color: 'var(--text)' }}>{parsed.description}</strong> for{' '}
              <strong style={{ color: 'var(--green)' }}>${parsed.amount.toFixed(2)}</strong> ({parsed.category} | {parsed.payment_method})
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setParsed(null)}
                style={{ fontSize: 12, padding: '4px 10px', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-dim)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmQuickAdd}
                style={{ fontSize: 12, padding: '4px 10px', background: 'var(--green)', color: '#fff', borderRadius: 6, fontWeight: 600 }}
              >
                Confirm Add
              </button>
            </div>
          </div>
        )}

        {success && (
          <div style={{ marginTop: 10, color: 'var(--green)', fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Check size={14} /> Transaction added successfully!
          </div>
        )}
      </div>

      {/* Main Content Split: Recent Transactions vs Category Distribution */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 20 }}>
        {/* Recent Transactions */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>Recent Transactions</h3>
            <button
              onClick={() => onTabChange('expenses')}
              style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--blue-bright)' }}
            >
              View All
            </button>
          </div>

          {expenses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-faint)', fontSize: 13.5 }}>
              No transactions logged yet. Try our AI entry box above!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {expenses.slice(0, 4).map((exp, idx) => {
                const IconComp = CATEGORY_ICONS[exp.category] || HelpCircle
                return (
                  <div
                    key={exp.id || idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 12,
                      background: 'var(--surface-muted)',
                      border: '1px solid var(--border)',
                      borderRadius: 12,
                      transition: 'transform 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateX(2px)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 8,
                          background: 'var(--surface)',
                          border: '1px solid var(--border)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: CATEGORY_COLORS[exp.category] || 'var(--blue-bright)',
                        }}
                      >
                        <IconComp size={16} />
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>{exp.description}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 2 }}>
                          {exp.date} • {exp.payment_method}
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)' }}>
                      -${exp.amount.toFixed(2)}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Category breakdown progress indicators */}
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>Category Spending</h3>
          {expenses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-faint)', fontSize: 13.5 }}>
              No categories populated yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {Object.keys(CATEGORY_ICONS).map((cat) => {
                const total = categoryTotals[cat] || 0
                const percent = totalSpent > 0 ? (total / totalSpent) * 100 : 0
                const catColor = CATEGORY_COLORS[cat] || 'var(--text-dim)'
                return (
                  <div key={cat}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, fontWeight: 600, marginBottom: 6 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: catColor }} />
                        {cat}
                      </span>
                      <span>
                        ${total.toFixed(2)} ({percent.toFixed(0)}%)
                      </span>
                    </div>
                    <div style={{ width: '100%', height: 5, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${percent}%`,
                          height: '100%',
                          background: catColor,
                          borderRadius: 99,
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Admin Actions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
        <button
          onClick={onClearExpenses}
          style={{
            fontSize: 12,
            color: 'var(--red)',
            padding: '6px 12px',
            border: '1px solid var(--red)',
            borderRadius: 8,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--red-soft)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
          }}
        >
          Clear All Expenses
        </button>
      </div>
    </div>
  )
}
