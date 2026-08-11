import { useState } from 'react'
import { apiService } from '../services/api'
import {
  Trash2,
  Search,
  Filter,
  Plus,
  Pizza,
  Plane,
  Film,
  ShoppingBag,
  Wrench,
  HelpCircle,
  Sparkles,
  CreditCard,
  Calendar,
  Check
} from 'lucide-react'

interface Expense {
  id?: number
  description: string
  amount: number
  category: string
  date: string
  payment_method: string
}

interface ExpensesViewProps {
  expenses: Expense[]
  onAddExpense: (expense: { description: string; amount: number; category: string; date: string; payment_method: string }) => Promise<void>
  onDeleteExpense: (id: number) => Promise<void>
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

export default function ExpensesView({ expenses, onAddExpense, onDeleteExpense }: ExpensesViewProps) {
  // Form State
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Food')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [paymentMethod, setPaymentMethod] = useState('Amex Gold')

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')

  // AI assistant helper inside form
  const [aiText, setAiText] = useState('')
  const [parsing, setParsing] = useState(false)
  const [aiMessage, setAiMessage] = useState('')

  const handleAiFill = async () => {
    if (!aiText.trim()) return
    setParsing(true)
    setAiMessage('')

    try {
      const data = await apiService.aiParseExpense(aiText)

      setDescription(data.description || '')
      setAmount(String(data.amount || ''))
      setCategory(data.category || 'Food')
      setDate(data.date || new Date().toISOString().split('T')[0])
      setPaymentMethod(data.payment_method || 'Cash')
      setAiMessage('Form populated by AI!')
      setAiText('')
      setTimeout(() => setAiMessage(''), 2500)
    } catch (e) {
      console.warn('Fallback parser inside expense form')
      setTimeout(() => {
        // basic regex fallback
        const amountMatch = aiText.match(/\$?(\d+(\.\d{2})?)/)
        const amt = amountMatch ? amountMatch[1] : '20.00'
        setDescription('AI Parsed Item')
        setAmount(amt)
        setCategory('Food')
        setAiMessage('Form populated by fallback!')
        setAiText('')
        setTimeout(() => setAiMessage(''), 2500)
      }, 400)
    } finally {
      setParsing(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim() || !amount) return

    const parsedAmount = parseFloat(amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) return

    await onAddExpense({
      description,
      amount: parsedAmount,
      category,
      date,
      payment_method: paymentMethod,
    })

    // Reset fields (except date and payment method, for convenience)
    setDescription('')
    setAmount('')
  }

  // Filtered Expenses list
  const filteredExpenses = expenses.filter((exp) => {
    const matchesSearch = exp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.payment_method.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'All' || exp.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.2fr', gap: 24 }} className="animate-fade-in">
      {/* Left Column: Form Card */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* AI filler */}
        <div className="card">
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Sparkles size={14} color="var(--blue-bright)" /> Form AI Assistant
          </h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={aiText}
              onChange={(e) => setAiText(e.target.value)}
              placeholder="e.g. Spent $30 at Uber..."
              style={{
                flex: 1,
                fontSize: 12.5,
                borderRadius: 8,
                padding: '6px 10px',
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAiFill()
              }}
            />
            <button
              onClick={handleAiFill}
              disabled={parsing || !aiText.trim()}
              style={{
                background: 'var(--blue-bright)',
                color: '#fff',
                fontWeight: 600,
                fontSize: 12,
                padding: '0 12px',
                borderRadius: 8,
                opacity: parsing || !aiText.trim() ? 0.7 : 1,
              }}
            >
              Fill
            </button>
          </div>
          {aiMessage && (
            <div style={{ fontSize: 11.5, color: 'var(--green)', marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Check size={12} /> {aiMessage}
            </div>
          )}
        </div>

        {/* Regular manual logger */}
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 18 }}>Log Transaction</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Description */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-dim)' }}>Merchant/Description</label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Costco Wholesale"
                required
                style={{ fontSize: 13, padding: '8px 12px', borderRadius: 8 }}
              />
            </div>

            {/* Amount */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-dim)' }}>Amount ($)</label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
                style={{ fontSize: 13, padding: '8px 12px', borderRadius: 8 }}
              />
            </div>

            {/* Category Select */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-dim)' }}>Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ fontSize: 13, padding: '8px 12px', borderRadius: 8 }}
              >
                {Object.keys(CATEGORY_ICONS).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-dim)' }}>Transaction Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                style={{ fontSize: 13, padding: '8px 12px', borderRadius: 8 }}
              />
            </div>

            {/* Payment method */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-dim)' }}>Payment Method</label>
              <input
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                placeholder="e.g. Amex Platinum / Cash"
                style={{ fontSize: 13, padding: '8px 12px', borderRadius: 8 }}
              />
            </div>

            <button
              type="submit"
              style={{
                background: 'linear-gradient(135deg, var(--blue-bright), var(--blue))',
                color: '#fff',
                fontWeight: 700,
                fontSize: 13.5,
                padding: '10px 0',
                borderRadius: 8,
                marginTop: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                boxShadow: '0 2px 6px rgba(59, 130, 246, 0.2)',
              }}
            >
              <Plus size={15} /> Save Expense
            </button>
          </form>
        </div>
      </div>

      {/* Right Column: List Table Card */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Header with Search and filters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700 }}>Expense History</h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Search */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={14} color="var(--text-faint)" style={{ position: 'absolute', left: 10 }} />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search description..."
                style={{
                  fontSize: 12,
                  padding: '6px 10px 6px 30px',
                  borderRadius: 8,
                  width: 170,
                }}
              />
            </div>

            {/* Category Filter */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Filter size={13} color="var(--text-faint)" style={{ position: 'absolute', left: 8 }} />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                style={{
                  fontSize: 12,
                  padding: '6px 8px 6px 26px',
                  borderRadius: 8,
                  background: 'var(--surface)',
                }}
              >
                <option value="All">All Categories</option>
                {Object.keys(CATEGORY_ICONS).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Expenses Table */}
        <div style={{ overflowX: 'auto', flex: 1 }}>
          {filteredExpenses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-faint)', fontSize: 13.5 }}>
              No transactions match your search filters.
            </div>
          ) : (
            <table className="expense-table">
              <thead>
                <tr>
                  <th style={{ width: 110 }}>Date</th>
                  <th>Description</th>
                  <th style={{ width: 120 }}>Category</th>
                  <th style={{ width: 130 }}>Method</th>
                  <th style={{ textAlign: 'right', width: 90 }}>Amount</th>
                  <th style={{ width: 44 }}></th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((exp) => {
                  const IconComp = CATEGORY_ICONS[exp.category] || HelpCircle
                  const color = CATEGORY_COLORS[exp.category] || 'var(--text-dim)'
                  return (
                    <tr key={exp.id}>
                      <td style={{ display: 'flex', alignItems: 'center', gap: 6, borderBottom: 'none', padding: '14px 16px 14px 0' }}>
                        <Calendar size={13} color="var(--text-faint)" />
                        {exp.date}
                      </td>
                      <td style={{ fontWeight: 600 }}>{exp.description}</td>
                      <td>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '2px 8px',
                            background: 'var(--blue-soft)',
                            color: color,
                            borderRadius: 6,
                            fontSize: 11,
                            fontWeight: 700,
                          }}
                        >
                          <IconComp size={10} />
                          {exp.category}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <CreditCard size={12} color="var(--text-faint)" />
                          {exp.payment_method}
                        </div>
                      </td>
                      <td style={{ fontWeight: 700, textAlign: 'right', color: 'var(--text)' }}>
                        ${exp.amount.toFixed(2)}
                      </td>
                      <td>
                        {exp.id && (
                          <button
                            onClick={() => onDeleteExpense(exp.id!)}
                            style={{
                              color: 'var(--text-faint)',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--red)')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-faint)')}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
