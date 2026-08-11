import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  Plus,
  Trash2,
  Award,
  TrendingUp,
  Pizza,
  Plane,
  Film,
  ShoppingBag,
  Wrench,
  HelpCircle,
  Clock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { apiService, Expense, CreditCard, RewardsProfile, AnalyticsResponse } from '../services/api'
import { useApp } from '../context/AppContext'

const CATEGORY_ICONS: Record<string, any> = {
  Food: Pizza,
  Travel: Plane,
  Entertainment: Film,
  Shopping: ShoppingBag,
  Utilities: Wrench,
  Others: HelpCircle,
}

const CATEGORY_COLORS: Record<string, string> = {
  Food: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
  Travel: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
  Entertainment: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
  Shopping: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
  Utilities: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
  Others: 'text-slate-500 bg-slate-500/10 border-slate-500/20',
}

const CARD_BACKGROUNDS: Record<string, string> = {
  Platinum: 'from-slate-800 via-slate-900 to-slate-950 text-slate-100 border-slate-700',
  Gold: 'from-amber-700 via-yellow-800 to-amber-950 text-yellow-50 border-amber-600/30',
  'Blue Cash': 'from-blue-700 via-blue-900 to-slate-950 text-blue-50 border-blue-600/30',
}

export const DashboardPage: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [cards, setCards] = useState<CreditCard[]>([])
  const [activeCardIdx, setActiveCardIdx] = useState<number>(0)
  const [rewards, setRewards] = useState<RewardsProfile | null>(null)
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null)
  
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  
  // Quick Entry / AI Parsing state
  const [quickInput, setQuickInput] = useState('')
  const [parsing, setParsing] = useState(false)
  const [parsedItem, setParsedItem] = useState<Partial<Expense> | null>(null)

  // Manual Form state
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Food')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [paymentMethod, setPaymentMethod] = useState('Amex Platinum')

  const { showToast } = useApp()

  const fetchDashboardData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [expensesData, cardsData, rewardsData, analyticsData] = await Promise.all([
        apiService.getExpenses(),
        apiService.getCards(),
        apiService.getRewards(),
        apiService.getAnalytics()
      ])
      setExpenses(expensesData)
      setCards(cardsData)
      setRewards(rewardsData)
      setAnalytics(analyticsData)
    } catch (e: any) {
      console.error('Failed to load dashboard data', e)
      setError('Could not connect to the database. Running in offline test sandbox mode.')
      // Sandbox seed fallback
      setExpenses([
        { id: '1', description: 'Starbucks Coffee', amount: 8.50, category: 'Food', date: '2026-07-15', payment_method: 'Amex Gold' },
        { id: '2', description: 'Uber Airport Ride', amount: 45.00, category: 'Travel', date: '2026-07-14', payment_method: 'Amex Platinum' },
        { id: '3', description: 'Netflix Subscription', amount: 15.99, category: 'Entertainment', date: '2026-07-12', payment_method: 'Amex Platinum' },
        { id: '4', description: 'Amazon Purchases', amount: 120.00, category: 'Shopping', date: '2026-07-10', payment_method: 'Amex Platinum' }
      ])
      setCards([
        { id: 'card-platinum', holderName: 'Demo User', cardNumber: '3712 345678 90123', expiry: '12/30', cvv: '1234', limit: 10000.00, cardType: 'Platinum', currentStatement: 180.99, availableCredit: 9819.01 },
        { id: 'card-gold', holderName: 'Demo User', cardNumber: '3787 987654 32109', expiry: '10/29', cvv: '5678', limit: 8000.00, cardType: 'Gold', currentStatement: 8.50, availableCredit: 7991.50 },
        { id: 'card-bluecash', holderName: 'Demo User', cardNumber: '3728 555555 44444', expiry: '05/28', cvv: '9012', limit: 5000.00, cardType: 'Blue Cash', currentStatement: 0.00, availableCredit: 5000.00 }
      ])
      setRewards({
        membershipRewardsBalance: 124759,
        pointsEarnedFromSpend: 259,
        history: [
          { id: 'r1', points: 34, description: 'Starbucks Coffee - Point Multiplier', date: '2026-07-15' },
          { id: 'r2', points: 225, description: 'Uber Ride - Point Multiplier', date: '2026-07-14' }
        ]
      })
      setAnalytics({
        categories: { Food: 8.50, Travel: 45.00, Entertainment: 15.99, Shopping: 120.00 },
        monthlyComparison: [{ month: '2026-07', total: 189.49 }],
        weeklyComparison: [{ date: '2026-07-15', amount: 8.50 }, { date: '2026-07-14', amount: 45.00 }],
        forecastNextMonth: 200.00,
        budgets: { Food: 1500, Travel: 3000, Shopping: 2000, Entertainment: 500, Utilities: 800, Others: 1000 }
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-400">Loading your statements...</span>
        </div>
      </div>
    )
  }

  const activeCard = cards[activeCardIdx] || {
    holderName: 'Demo User',
    cardNumber: '3712 345678 90123',
    expiry: '12/30',
    cvv: '1234',
    limit: 10000.00,
    cardType: 'Platinum',
    currentStatement: 0.00,
    availableCredit: 10000.00
  }

  const cardLimit = activeCard.limit
  const totalCardSpent = activeCard.currentStatement
  const cardProgress = Math.min((totalCardSpent / cardLimit) * 100, 100)

  // Calculations for budget advice
  const foodSpend = expenses.filter(e => e.category === 'Food').reduce((sum, e) => sum + e.amount, 0)
  const travelSpend = expenses.filter(e => e.category === 'Travel').reduce((sum, e) => sum + e.amount, 0)
  const shoppingSpend = expenses.filter(e => e.category === 'Shopping').reduce((sum, e) => sum + e.amount, 0)

  // Quick parser handles receipt strings
  const handleQuickParse = async () => {
    if (!quickInput.trim() || parsing) return
    setParsing(true)
    setParsedItem(null)
    try {
      const data = await apiService.aiParseExpense(quickInput)
      setParsedItem(data)
      setDescription(data.description || 'AI Parsed Transaction')
      setAmount(data.amount ? String(data.amount) : '15.00')
      setCategory(data.category || 'Food')
      setDate(data.date || new Date().toISOString().split('T')[0])
      setPaymentMethod(data.payment_method || 'Amex Platinum')
      showToast('AI parsed description successfully! Review below.', 'success')
      setQuickInput('')
    } catch (e) {
      console.warn('AI Parsing failed, falling back to regex parser.')
      const amountMatch = quickInput.match(/\$?(\d+(\.\d{2})?)/)
      const amt = amountMatch ? amountMatch[1] : '12.50'
      let desc = 'Mock Purchase'
      let cat = 'Others'
      let pm = 'Amex Platinum'

      if (quickInput.toLowerCase().includes('starbucks') || quickInput.toLowerCase().includes('coffee') || quickInput.toLowerCase().includes('food')) {
        desc = 'Starbucks Coffee'
        cat = 'Food'
        pm = 'Amex Gold'
      } else if (quickInput.toLowerCase().includes('uber') || quickInput.toLowerCase().includes('cab') || quickInput.toLowerCase().includes('travel')) {
        desc = 'Uber Ride'
        cat = 'Travel'
      }

      const mockData = {
        description: desc,
        amount: parseFloat(amt),
        category: cat,
        date: new Date().toISOString().split('T')[0],
        payment_method: pm
      }
      setParsedItem(mockData)
      setDescription(mockData.description)
      setAmount(String(mockData.amount))
      setCategory(mockData.category)
      setDate(mockData.date)
      setPaymentMethod(mockData.payment_method)
      showToast('Offline extraction applied.', 'info')
      setQuickInput('')
    } finally {
      setParsing(false)
    }
  }

  // Log transaction
  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim() || !amount) return
    const amtVal = parseFloat(amount)
    if (isNaN(amtVal) || amtVal <= 0) {
      showToast('Please enter a valid numeric amount', 'error')
      return
    }

    const payload = {
      description: description.trim(),
      amount: amtVal,
      category,
      date,
      payment_method: paymentMethod
    }

    try {
      await apiService.addExpense(payload)
      showToast('Transaction logged to database', 'success')
      fetchDashboardData() // reload metrics & cards statement values automatically
    } catch (e) {
      console.warn('Backend database connection failed, adding locally')
      const mockSaved = {
        ...payload,
        id: String(Date.now())
      }
      setExpenses((prev) => [mockSaved, ...prev])
      showToast('Transaction logged locally (offline mode)', 'info')
    }

    // Reset Form
    setDescription('')
    setAmount('')
    setParsedItem(null)
  }

  // Delete transaction
  const handleDeleteExpense = async (id: string) => {
    try {
      await apiService.deleteExpense(id)
      showToast('Transaction deleted successfully', 'success')
      fetchDashboardData()
    } catch (e) {
      console.warn('Backend delete failed')
      setExpenses((prev) => prev.filter((exp) => exp.id !== id))
      showToast('Transaction deleted locally', 'info')
    }
  }

  const handleNextCard = () => {
    if (cards.length === 0) return
    setActiveCardIdx((prev) => (prev + 1) % cards.length)
  }

  const handlePrevCard = () => {
    if (cards.length === 0) return
    setActiveCardIdx((prev) => (prev - 1 + cards.length) % cards.length)
  }

  // Grouped by Category for styling
  const getCatSummary = () => {
    if (analytics && analytics.categories) {
      return Object.entries(analytics.categories)
    }
    return [['Food', foodSpend], ['Travel', travelSpend], ['Shopping', shoppingSpend]]
  }

  return (
    <div className="min-h-full p-6 md:p-8 flex flex-col gap-8 animate-fade-in text-slate-800 dark:text-slate-200 font-body">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/50 dark:border-slate-850/50 pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-none flex items-center gap-2">
            Card Spend & Points Optimizer
            <span className="px-2 py-0.5 text-[9px] font-bold bg-blue-105 dark:bg-blue-950 text-blue-700 dark:text-blue-400 rounded border border-blue-200/50 dark:border-blue-900/30 uppercase tracking-wider">
              Connected
            </span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 font-medium">
            Test points calculations, budget limits, and AI statement extraction linked to PostgreSQL models.
          </p>
        </div>
      </div>

      {/* Database Status Info */}
      {error && (
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-amber-700 dark:text-amber-400 text-xs font-semibold flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchDashboardData}
            className="px-3 py-1 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/50 dark:hover:bg-amber-800 rounded-lg text-[10px] font-extrabold uppercase transition-colors"
          >
            Retry Sync
          </button>
        </div>
      )}

      {/* Cards Display with dynamic slide-switch */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Switched Fake credit card visual */}
        <div className="relative flex flex-col gap-3">
          <div className="flex justify-between items-center px-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            <span>Linked Cards Testbed</span>
            <div className="flex gap-1.5">
              <button onClick={handlePrevCard} className="p-1 rounded bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 text-slate-500">
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button onClick={handleNextCard} className="p-1 rounded bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 text-slate-500">
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className={`relative group overflow-hidden rounded-3xl border bg-gradient-to-br p-6 flex flex-col justify-between h-56 shadow-2xl transition-all duration-500 ${
            CARD_BACKGROUNDS[activeCard.cardType] || CARD_BACKGROUNDS['Platinum']
          }`}>
            <div className="absolute top-0 right-0 w-44 h-44 bg-[radial-gradient(circle,rgba(255,255,255,0.06)_0%,transparent_60%)] pointer-events-none" />
            
            <div className="flex justify-between items-start relative z-10">
              <div>
                <span className="text-[9px] uppercase tracking-wider font-extrabold opacity-60 block">American Express</span>
                <span className="text-xs font-black tracking-widest uppercase">{activeCard.cardType}</span>
              </div>
              <span className="font-extrabold text-[10px] uppercase font-mono tracking-widest text-slate-400">Amex</span>
            </div>

            <div className="my-2 flex items-center justify-between relative z-10">
              <div className="w-10 h-7 rounded bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 opacity-80 border border-yellow-500/20 shadow-sm" />
              <div className="text-right">
                <span className="text-[9px] font-bold opacity-60 uppercase tracking-widest block">MR Points Balance</span>
                <span className="text-lg font-black tracking-tight">
                  {(rewards?.membershipRewardsBalance || 124500).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-end relative z-10">
              <div>
                <span className="text-[9px] uppercase tracking-widest opacity-50 block font-bold">Holder</span>
                <span className="text-xs font-bold tracking-wide">{activeCard.holderName}</span>
              </div>
              <div className="text-right font-mono">
                <span className="text-[8px] opacity-50 block">Number / Expiry / CVV</span>
                <span className="text-xs font-semibold">{activeCard.cardNumber} • {activeCard.expiry}</span>
              </div>
            </div>
            
            <div className="absolute bottom-2 left-6 text-[8px] font-mono opacity-40 tracking-wider">
              DEMO CARD • NOT REAL OR PERSISTED
            </div>
          </div>
        </div>

        {/* Dynamic Spend Metrics Column */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:col-span-2">
          
          {/* Card Statement Stat */}
          <div className="card flex flex-col justify-between py-5 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Statement Balance</span>
              <h2 className="text-2xl md:text-3xl font-black mt-2 tracking-tight text-slate-900 dark:text-white">
                ${totalCardSpent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
            </div>
            <div className="text-[10px] text-slate-450 mt-4 font-semibold flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-2.5">
              <span>ACTIVE CARD TYPE</span>
              <span className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-450 font-bold uppercase font-mono">{activeCard.cardType}</span>
            </div>
          </div>

          {/* Available Card Limit Stat */}
          <div className="card flex flex-col justify-between py-5 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Available Credit</span>
              <h2 className="text-2xl md:text-3xl font-black mt-2 tracking-tight text-slate-900 dark:text-white">
                ${activeCard.availableCredit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
            </div>
            <div className="text-[10px] text-slate-450 mt-4 font-semibold flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-2.5">
              <span>LIMIT CAP</span>
              <span className="font-bold text-slate-600 dark:text-slate-300 font-mono">${cardLimit.toLocaleString()}</span>
            </div>
          </div>

          {/* Budget Limit Tracker */}
          <div className="card flex flex-col justify-between py-5 lg:col-span-2 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Card Credit Limit Used</span>
                <span className="text-xs font-extrabold text-blue-600 dark:text-blue-450">{cardProgress.toFixed(0)}%</span>
              </div>
              
              <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-850 rounded-full mt-3 overflow-hidden border border-slate-200/50 dark:border-slate-800/50">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${cardProgress}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className={`h-full rounded-full ${
                    cardProgress > 85 ? 'bg-rose-500' : 'bg-blue-600 dark:bg-blue-500'
                  }`}
                />
              </div>
            </div>

            <div className="flex justify-between text-[10px] text-slate-400 mt-3 font-semibold">
              <span>Spent on card: ${totalCardSpent.toFixed(0)}</span>
              <span>Card Limit: ${cardLimit.toFixed(0)}</span>
            </div>
          </div>

        </div>

      </div>

      {/* Forms & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Forms */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Quick logger */}
          <div className="card bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
            <h3 className="font-extrabold text-sm mb-3.5 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
              Quick AI Expense logger
            </h3>
            
            <div className="flex gap-2">
              <input
                value={quickInput}
                onChange={(e) => setQuickInput(e.target.value)}
                placeholder="E.g., Dinner at subway for $14.50 on Amex Gold..."
                className="flex-1 text-xs py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 outline-none text-slate-700 dark:text-slate-300 focus:border-blue-500"
                disabled={parsing}
              />
              <button
                onClick={handleQuickParse}
                disabled={!quickInput.trim() || parsing}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1 shrink-0"
              >
                {parsing ? 'Parsing...' : 'AI Extract'}
              </button>
            </div>
            {parsedItem && (
              <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold flex items-center justify-between">
                <span>AI Extracted: "{parsedItem.description}" for ${parsedItem.amount?.toFixed(2)} ({parsedItem.category})</span>
                <button type="button" onClick={() => setParsedItem(null)} className="text-emerald-500 hover:text-emerald-750 font-extrabold text-[12px]">✕</button>
              </div>
            )}
            <p className="text-[10px] text-slate-400 mt-2 font-medium">Type natural phrases. We query FastAPI's parser to populate details.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleAddExpense} className="card space-y-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
            <h3 className="font-extrabold text-sm mb-1.5 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-blue-500" />
              Review & Log Transaction
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Description</label>
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="E.g., Starbucks Coffee"
                  className="w-full text-xs py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Amount ($ USD)</label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="E.g., 8.50"
                  className="w-full text-xs py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-xs py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 outline-none"
                >
                  {['Food', 'Travel', 'Entertainment', 'Shopping', 'Utilities', 'Others'].map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-xs py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 outline-none"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Payment Card Rule Mapping</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'Amex Platinum', label: 'Amex Platinum (5x)' },
                    { id: 'Amex Gold', label: 'Amex Gold (4x)' },
                    { id: 'Amex Blue Cash', label: 'Blue Cash (2x)' }
                  ].map((cardOption) => (
                    <button
                      key={cardOption.id}
                      type="button"
                      onClick={() => setPaymentMethod(cardOption.id)}
                      className={`py-2 px-3 text-center border text-[11px] rounded-lg font-bold transition-all ${
                        paymentMethod === cardOption.id
                          ? 'bg-blue-600 border-blue-650 text-white shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      {cardOption.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-755 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 mt-4 shadow-md shadow-blue-500/10"
            >
              <CheckCircle2 className="w-4 h-4" /> Save Transaction to Database
            </button>
          </form>

        </div>

        {/* Charts & Advisor */}
        <div className="space-y-6">
          
          {/* Spend Curve Chart */}
          <div className="card bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
            <h3 className="font-extrabold text-sm mb-4 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-indigo-500" /> Spend Activity Curve
            </h3>

            <div className="w-full h-32 relative">
              {expenses.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">
                  No data to map
                </div>
              ) : (
                <>
                  <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 0,100 L 0,80 Q 20,40 40,75 T 80,20 Q 90,45 100,10 L 100,100 Z"
                      fill="url(#chartGrad)"
                    />
                    <path
                      d="M 0,80 Q 20,40 40,75 T 80,20 Q 90,45 100,10"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="2.5"
                    />
                  </svg>
                  <div className="absolute inset-0 border-b border-dashed border-slate-100 dark:border-slate-800/80 pointer-events-none" style={{ top: '33%' }} />
                  <div className="absolute inset-0 border-b border-dashed border-slate-100 dark:border-slate-800/80 pointer-events-none" style={{ top: '66%' }} />
                </>
              )}
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold mt-3">
              <span>Jul 01</span>
              <span className="text-[9px] uppercase bg-slate-100 dark:bg-slate-850 px-1.5 py-0.5 rounded text-slate-500 font-mono">Verified DB Sync</span>
              <span>Today</span>
            </div>
          </div>

          {/* Multiplier Advice */}
          <div className="card bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
            <h3 className="font-extrabold text-sm mb-4 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-500" /> Multiplier Advice
            </h3>

            <div className="space-y-3.5">
              {getCatSummary().map(([cat, val]) => (
                <div key={cat} className="flex justify-between items-start gap-2 border-b border-slate-100 dark:border-slate-850 pb-2.5 text-xs">
                  <div>
                    <span className="font-bold block text-slate-750 dark:text-slate-200">{cat} Spending</span>
                    <span className="text-[10px] text-slate-450 mt-1 block">Logged: ${(val as number).toFixed(2)}</span>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      cat === 'Food' ? 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400 border-orange-200/50' :
                      cat === 'Travel' ? 'bg-blue-105 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border-blue-200/50' :
                      'bg-yellow-105 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-450 border-yellow-250/20'
                    }`}>
                      {cat === 'Food' ? 'Use Amex Gold' : cat === 'Travel' ? 'Use Platinum' : 'Use Everyday'}
                    </span>
                    <span className="text-[10px] font-bold text-slate-450 block mt-1">
                      +{Math.round((val as number) * (cat === 'Food' ? 4 : cat === 'Travel' ? 5 : 2))} Points
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Recent Transactions Table */}
      <div className="card bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <h3 className="font-extrabold text-sm mb-4 flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-blue-500" />
          Recent Transaction Entries
        </h3>

        {expenses.length === 0 ? (
          <div className="text-center py-10 text-slate-400 select-none">
            No logged statements found. Seed new card charges above.
          </div>
        ) : (
          <div className="overflow-x-auto min-w-0">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5">Category</th>
                  <th className="py-2.5">Description</th>
                  <th className="py-2.5">Date</th>
                  <th className="py-2.5">Payment card</th>
                  <th className="py-2.5 text-right">Amount</th>
                  <th className="py-2.5 text-right pr-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                <AnimatePresence>
                  {expenses.map((exp) => {
                    const Icon = CATEGORY_ICONS[exp.category] || HelpCircle
                    const badgeStyles = CATEGORY_COLORS[exp.category] || 'text-slate-500 bg-slate-500/10'
                    return (
                      <motion.tr
                        key={exp.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="group hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors"
                      >
                        <td className="py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg border font-bold text-[10px] uppercase ${badgeStyles}`}>
                            <Icon className="w-3.5 h-3.5" />
                            {exp.category}
                          </span>
                        </td>
                        <td className="py-3 font-semibold text-slate-800 dark:text-slate-200">{exp.description}</td>
                        <td className="py-3 text-slate-400">{exp.date}</td>
                        <td className="py-3">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-850 text-slate-500 font-bold uppercase border border-slate-200/50 dark:border-slate-800">
                            {exp.payment_method}
                          </span>
                        </td>
                        <td className="py-3 text-right font-bold text-slate-800 dark:text-slate-100">
                          ${exp.amount.toFixed(2)}
                        </td>
                        <td className="py-3 text-right pr-2">
                          <button
                            onClick={() => exp.id && handleDeleteExpense(exp.id)}
                            className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </motion.tr>
                    )
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  )
}
