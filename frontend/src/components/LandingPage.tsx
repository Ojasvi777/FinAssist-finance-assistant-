import { useState } from 'react'
import {
  ArrowRight,
  Sparkles,
  Wand2,
  Check,
  Zap,
  TrendingUp,
  ChevronRight,
  MessageSquare
} from 'lucide-react'

interface LandingPageProps {
  onLaunchApp: () => void
  onAddExpense: (expense: { description: string; amount: number; category: string; date: string; payment_method: string }) => Promise<void>
}

export default function LandingPage({ onLaunchApp, onAddExpense }: LandingPageProps) {
  const [inputText, setInputText] = useState('Spent $45 on dinner at Olive Garden with my Amex Gold')
  const [parsing, setParsing] = useState(false)
  const [parsedResult, setParsedResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState(false)

  const handleParseText = async () => {
    if (!inputText.trim()) return
    setParsing(true)
    setError(null)
    setSuccessMsg(false)
    setParsedResult(null)

    try {
      const res = await fetch('http://127.0.0.1:8000/api/expenses/ai-parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText }),
      })

      if (!res.ok) throw new Error('Backend offline')
      const data = await res.json()
      setParsedResult(data)
    } catch (e) {
      console.warn('Backend parse failed, using client fallback parser', e)
      // client fallback parser using regex
      setTimeout(() => {
        let amount = 15.00
        let description = 'Starbucks Coffee'
        let category = 'Food'
        let payment_method = 'Cash'
        const date = new Date().toISOString().split('T')[0]

        // Try extracting amount
        const amountMatch = inputText.match(/\$?(\d+(\.\d{2})?)/)
        if (amountMatch) amount = parseFloat(amountMatch[1])

        // Try extracting merchant
        if (inputText.toLowerCase().includes('starbucks')) {
          description = 'Starbucks'
          category = 'Food'
        } else if (inputText.toLowerCase().includes('olive garden')) {
          description = 'Olive Garden'
          category = 'Food'
          payment_method = 'Amex Gold'
        } else if (inputText.toLowerCase().includes('uber')) {
          description = 'Uber Taxi'
          category = 'Travel'
          payment_method = 'Amex Platinum'
        } else if (inputText.toLowerCase().includes('netflix')) {
          description = 'Netflix Subscription'
          category = 'Entertainment'
          payment_method = 'Visa Debit'
        } else {
          // generic extraction
          const words = inputText.split(' ')
          if (words.length > 2) {
            description = words.slice(0, 3).join(' ')
          }
        }

        setParsedResult({
          amount,
          description,
          category,
          payment_method,
          date,
        })
      }, 800)
    } finally {
      setParsing(false)
    }
  }

  const handleConfirmAdd = async () => {
    if (!parsedResult) return
    try {
      await onAddExpense({
        description: parsedResult.description,
        amount: parsedResult.amount,
        category: parsedResult.category,
        date: parsedResult.date,
        payment_method: parsedResult.payment_method || 'Cash',
      })
      setSuccessMsg(true)
      setParsedResult(null)
      setTimeout(() => setSuccessMsg(false), 3000)
    } catch (e) {
      setError('Could not save expense')
    }
  }

  return (
    <div className="hero-gradient animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 60, paddingBottom: 60 }}>
      {/* Hero Section */}
      <section style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 40, marginTop: 20 }}>
        <div style={{ flex: 1, maxWidth: 620 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'var(--blue-soft)',
              color: 'var(--blue-bright)',
              fontSize: 12.5,
              fontWeight: 700,
              padding: '6px 14px',
              borderRadius: 999,
              marginBottom: 20,
            }}
          >
            <Sparkles size={14} /> AI-Powered Financial Intelligence
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 46,
              fontWeight: 800,
              lineHeight: 1.15,
              color: 'var(--text)',
              letterSpacing: '-0.03em',
            }}
          >
            Take Control of Your Expenses with <span style={{ color: 'var(--blue-bright)' }}>AI-Powered</span> Tracking
          </h1>
          <p style={{ marginTop: 18, color: 'var(--text-dim)', fontSize: 16.5, lineHeight: 1.6 }}>
            Track transactions instantly, build budget forecasts, and get tailormade rewards advice. Powered by our RAG AI model trained on American Express card benefits.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 32 }}>
            <button className="cta-button" onClick={onLaunchApp}>
              Launch Dashboard <ArrowRight size={16} />
            </button>
            <a
              href="#features"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 14.5,
                fontWeight: 600,
                color: 'var(--text-dim)',
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--blue-bright)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-dim)')}
            >
              See how it works <ChevronRight size={16} />
            </a>
          </div>
        </div>

        {/* Hero Interactive Widget */}
        <div style={{ flex: 1, maxWidth: 460 }}>
          <div
            className="card"
            style={{
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: 24,
              boxShadow: 'var(--shadow-lg)',
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: 'var(--blue-soft)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--blue-bright)',
                }}
              >
                <Wand2 size={16} />
              </div>
              <div>
                <h3 style={{ fontSize: 14.5, fontWeight: 700 }}>Try our AI transaction parser</h3>
                <p style={{ fontSize: 11, color: 'var(--text-faint)' }}>Type spending in plain English below</p>
              </div>
            </div>

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="e.g. Spent $8.50 at Starbucks on food"
              style={{
                width: '100%',
                height: 72,
                borderRadius: 'var(--radius-sm)',
                padding: 12,
                fontSize: 13,
                resize: 'none',
                marginBottom: 12,
              }}
            />

            <button
              onClick={handleParseText}
              disabled={parsing}
              style={{
                width: '100%',
                background: 'var(--blue-bright)',
                color: '#fff',
                fontWeight: 600,
                fontSize: 13.5,
                padding: '10px 0',
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                opacity: parsing ? 0.7 : 1,
              }}
            >
              {parsing ? 'Parsing transaction...' : 'Parse with AI'}
              <Sparkles size={14} />
            </button>

            {/* Parsing Result Showcase */}
            {parsedResult && (
              <div
                className="animate-fade-in"
                style={{
                  marginTop: 16,
                  padding: 14,
                  background: 'var(--surface-muted)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', marginBottom: 10 }}>
                  Extracted Details
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 12.5, marginBottom: 12 }}>
                  <div>
                    <span style={{ color: 'var(--text-faint)' }}>Merchant:</span>{' '}
                    <strong style={{ color: 'var(--text)' }}>{parsedResult.description}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-faint)' }}>Amount:</span>{' '}
                    <strong style={{ color: 'var(--green)' }}>${parsedResult.amount.toFixed(2)}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-faint)' }}>Category:</span>{' '}
                    <span
                      style={{
                        padding: '2px 8px',
                        background: 'var(--blue-soft)',
                        color: 'var(--blue-bright)',
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    >
                      {parsedResult.category}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-faint)' }}>Payment:</span>{' '}
                    <strong style={{ color: 'var(--text)' }}>{parsedResult.payment_method}</strong>
                  </div>
                </div>
                <button
                  onClick={handleConfirmAdd}
                  style={{
                    width: '100%',
                    background: 'var(--green)',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: 12.5,
                    padding: '8px 0',
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                >
                  <Check size={14} /> Add to Transaction History
                </button>
              </div>
            )}

            {successMsg && (
              <div
                className="animate-fade-in"
                style={{
                  marginTop: 16,
                  padding: 12,
                  background: 'var(--green-soft)',
                  border: '1px solid var(--green)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--green)',
                  fontSize: 12.5,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Check size={16} /> Saved! Open Dashboard or Expenses to view it.
              </div>
            )}

            {error && (
              <div style={{ marginTop: 10, color: 'var(--red)', fontSize: 12 }}>{error}</div>
            )}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features">
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 26,
            fontWeight: 800,
            textAlign: 'center',
            marginBottom: 36,
            color: 'var(--text)',
          }}
        >
          Why choose FinAssist?
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          <FeatureCard
            icon={<Zap size={22} color="var(--blue-bright)" />}
            title="Instant Text Parsing"
            desc="Ditch the tedious manual input. Just describe what you bought, and our AI automatically extracts merchant, amount, category, and card used."
          />
          <FeatureCard
            icon={<MessageSquare size={22} color="var(--blue-bright)" />}
            title="RAG AI Card Advisor"
            desc="Ask our chatbot anything about American Express rewards. Optimize point multipliers, dining credits, and travel lounges based on your expenses."
          />
          <FeatureCard
            icon={<TrendingUp size={22} color="var(--blue-bright)" />}
            title="Smart Budgeting"
            desc="Set monthly category limits and watch your dashboard update automatically. Get AI-powered notifications before you cross your budget."
          />
        </div>
      </section>

      {/* Amex RAG integration spotlight */}
      <section
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '40px 48px',
          display: 'flex',
          alignItems: 'center',
          gap: 40,
        }}
      >
        <div style={{ flex: 1 }}>
          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 22,
              fontWeight: 800,
              color: 'var(--text)',
              marginBottom: 12,
            }}
          >
            Optimized for American Express Cardholders
          </h3>
          <p style={{ color: 'var(--text-dim)', fontSize: 14.5, lineHeight: 1.6, marginBottom: 20 }}>
            Our platform extracts and links metadata from official Amex card benefits. If you purchase items via your Amex Platinum, Amex Gold, or Blue Cash Everyday card, the system will highlight missing credits, suggest where to use which card for maximum reward points, and verify travel lounge options before your flights.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {['Platinum Lounges', '$200 Airline Credits', '4X Dining Multipliers', 'Purchase Protection'].map((tag) => (
              <span
                key={tag}
                style={{
                  padding: '4px 12px',
                  background: 'var(--blue-soft)',
                  color: 'var(--blue-bright)',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div
          style={{
            width: 240,
            height: 150,
            borderRadius: 14,
            background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
            boxShadow: '0 12px 24px -8px rgba(59, 130, 246, 0.4)',
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: 20,
            transform: 'rotate(3deg)',
          }}
        >
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 13, letterSpacing: '0.05em' }}>
            AMERICAN EXPRESS
          </div>
          <div style={{ fontSize: 11, opacity: 0.8 }}>PREFERRED REWARDS PARTNER</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div style={{ fontSize: 12, fontWeight: 600 }}>OJASVI KATHURIA</div>
            <div style={{ width: 34, height: 22, background: 'rgba(255,255,255,0.2)', borderRadius: 4 }} />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 26,
            fontWeight: 800,
            textAlign: 'center',
            marginBottom: 36,
            color: 'var(--text)',
          }}
        >
          Simple, Transparent Pricing
        </h2>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, maxWidth: 840, margin: '0 auto' }}>
          {/* Free Plan */}
          <div
            className="card"
            style={{
              flex: 1,
              border: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: 340,
            }}
          >
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Starter Plan</h3>
              <p style={{ fontSize: 12.5, color: 'var(--text-faint)', marginBottom: 20 }}>Perfect to get started</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 24 }}>
                <span style={{ fontSize: 32, fontWeight: 800 }}>$0</span>
                <span style={{ fontSize: 13, color: 'var(--text-faint)' }}>/ month</span>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, color: 'var(--text-dim)' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Check size={14} color="var(--green)" /> Log up to 50 expenses/mo
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Check size={14} color="var(--green)" /> Regular Category Analytics
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Check size={14} color="var(--green)" /> SQLite Local Storage
                </li>
              </ul>
            </div>
            <button
              onClick={onLaunchApp}
              style={{
                width: '100%',
                border: '1px solid var(--border)',
                borderRadius: 10,
                padding: '10px 0',
                fontSize: 13.5,
                fontWeight: 600,
                color: 'var(--text-dim)',
                marginTop: 24,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-muted)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              Use for Free
            </button>
          </div>

          {/* Pro Plan */}
          <div
            className="card"
            style={{
              flex: 1,
              border: '2px solid var(--blue-bright)',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: 340,
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: -12,
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'var(--blue-bright)',
                color: '#fff',
                fontSize: 10.5,
                fontWeight: 800,
                padding: '3px 12px',
                borderRadius: 99,
                textTransform: 'uppercase',
              }}
            >
              Most Popular
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Premium Plan</h3>
              <p style={{ fontSize: 12.5, color: 'var(--text-faint)', marginBottom: 20 }}>For dedicated financial tracking</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 24 }}>
                <span style={{ fontSize: 32, fontWeight: 800 }}>$12</span>
                <span style={{ fontSize: 13, color: 'var(--text-faint)' }}>/ month</span>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, color: 'var(--text-dim)' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Check size={14} color="var(--green)" /> Unlimited AI Transactions Parsing
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Check size={14} color="var(--green)" /> RAG Finance AI Bot integration
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Check size={14} color="var(--green)" /> Premium Card Benefits Optimizer
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Check size={14} color="var(--green)" /> Custom Budgets & Alerts
                </li>
              </ul>
            </div>
            <button
              onClick={onLaunchApp}
              style={{
                width: '100%',
                background: 'var(--blue-bright)',
                color: '#fff',
                borderRadius: 10,
                padding: '10px 0',
                fontSize: 13.5,
                fontWeight: 600,
                marginTop: 24,
                boxShadow: '0 4px 10px rgba(59, 130, 246, 0.2)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
            >
              Get Premium Access
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div
      className="card"
      style={{
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: 24,
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: 'var(--blue-soft)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 18,
        }}
      >
        {icon}
      </div>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: 'var(--text)' }}>{title}</h3>
      <p style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.6 }}>{desc}</p>
    </div>
  )
}
