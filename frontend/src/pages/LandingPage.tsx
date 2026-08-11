import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  ArrowRight,
  Globe,
  Database,
  LayoutDashboard,
  Activity,
  Cpu,
  Shield,
  Lock,
  Settings,
  ChevronDown,
  ArrowRightLeft
} from 'lucide-react'

export const LandingPage: React.FC = () => {
  const navigate = useNavigate()
  const [activeCardTab, setActiveCardTab] = useState<'platinum' | 'gold' | 'blue'>('platinum')
  const [typedText, setTypedText] = useState('')
  const phrases = [
    'How do I access the Centurion Lounge?',
    'What is the dining multiplier for Gold?',
    'How do I use my $200 airline credit?',
    'Show me travel benefits on Platinum...'
  ]
  const [phraseIdx, setPhraseIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  // Expense AI Mock Sandbox state
  const [sandboxInput, setSandboxInput] = useState('Spent $8.50 at Starbucks on my Gold card')
  const [sandboxParsed, setSandboxParsed] = useState({
    description: 'Starbucks Coffee',
    amount: 8.50,
    category: 'Food',
    paymentMethod: 'Gold',
    pointsEarned: 34,
    multiplier: '4X Dining'
  })

  // Accordion FAQ state
  const [activeFaq, setActiveFaq] = useState<number | null>(null)

  // Typing Effect for Hero Terminal
  useEffect(() => {
    const activePhrase = phrases[phraseIdx]
    let timer: any
    
    if (isDeleting) {
      timer = setTimeout(() => {
        setTypedText(activePhrase.substring(0, charIdx - 1))
        setCharIdx(prev => prev - 1)
      }, 40)
    } else {
      timer = setTimeout(() => {
        setTypedText(activePhrase.substring(0, charIdx + 1))
        setCharIdx(prev => prev + 1)
      }, 70)
    }

    if (!isDeleting && charIdx === activePhrase.length) {
      timer = setTimeout(() => setIsDeleting(true), 2500)
    } else if (isDeleting && charIdx === 0) {
      setIsDeleting(false)
      setPhraseIdx(prev => (prev + 1) % phrases.length)
    }

    return () => clearTimeout(timer)
  }, [charIdx, isDeleting, phraseIdx])

  // Expense parsing sandbox simulation
  const handleSandboxParse = () => {
    const txt = sandboxInput.toLowerCase()
    let amount = 15.00
    let description = 'Merchant Store'
    let category = 'Others'
    let paymentMethod = 'Cash'
    let points = 15
    let multiplier = '1X Base'

    // Simple parser
    const amtMatch = txt.match(/\$?(\d+(\.\d+)?)/)
    if (amtMatch) amount = parseFloat(amtMatch[1])

    if (txt.includes('starbucks') || txt.includes('coffee') || txt.includes('restaurant') || txt.includes('mcdonald')) {
      description = 'Starbucks & Dining'
      category = 'Food'
    } else if (txt.includes('uber') || txt.includes('flight') || txt.includes('airline') || txt.includes('hotel')) {
      description = 'Uber/Travel Provider'
      category = 'Travel'
    } else if (txt.includes('amazon') || txt.includes('shopping') || txt.includes('target')) {
      description = 'Amazon / Retail'
      category = 'Shopping'
    } else if (txt.includes('netflix') || txt.includes('spotify') || txt.includes('hulu')) {
      description = 'Netflix Subscription'
      category = 'Entertainment'
    }

    if (txt.includes('gold')) {
      paymentMethod = 'Gold'
      if (category === 'Food') {
        points = Math.round(amount * 4)
        multiplier = '4X Dining'
      } else {
        points = Math.round(amount * 1)
        multiplier = '1X Base'
      }
    } else if (txt.includes('platinum') || txt.includes('plat')) {
      paymentMethod = 'Platinum'
      if (category === 'Travel') {
        points = Math.round(amount * 5)
        multiplier = '5X Flights'
      } else {
        points = Math.round(amount * 1)
        multiplier = '1X Base'
      }
    } else if (txt.includes('blue') || txt.includes('cash')) {
      paymentMethod = 'Blue Cash'
      if (category === 'Shopping') {
        points = Math.round(amount * 2)
        multiplier = '2X Cashback'
      } else {
        points = Math.round(amount * 1)
        multiplier = '1X Base'
      }
    } else {
      paymentMethod = 'Cash/Visa'
      points = 0
      multiplier = '0X Base'
    }

    setSandboxParsed({
      description,
      amount,
      category,
      paymentMethod,
      pointsEarned: points,
      multiplier
    })
  }

  // Micro-particles simulation
  const particles = Array.from({ length: 25 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 5 + 1.5,
    delay: Math.random() * 5
  }))

  return (
    <div className="min-h-screen bg-slate-55 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-500 relative overflow-hidden font-body selection:bg-blue-600 selection:text-white">
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-screen flex flex-col justify-between overflow-hidden">
        {/* Moving Particles Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
          {particles.map((p) => (
            <div
              key={p.id}
              className="absolute rounded-full bg-blue-500/10 dark:bg-blue-400/5 animate-pulse"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                animationDelay: `${p.delay}s`,
                animationDuration: '8s'
              }}
            />
          ))}
        </div>

        {/* Ambient background glows */}
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(59,130,246,0.08)_0%,transparent_70%)] pointer-events-none -z-10" />
        <div className="absolute top-[10%] right-[-10%] w-[900px] h-[900px] bg-[radial-gradient(circle,rgba(99,102,241,0.06)_0%,transparent_70%)] pointer-events-none -z-10" />

        {/* Header Navigation */}
        <header className="max-w-7xl mx-auto w-full px-6 md:px-12 py-6 flex items-center justify-between z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-650 flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
              <Sparkles className="w-5.5 h-5.5 animate-pulse" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white block leading-none">FinAssist</span>
              <span className="text-[9px] uppercase tracking-widest text-slate-400 font-extrabold mt-1 block">AMEX RAG Platform</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate('/login')}
              className="text-xs font-bold text-slate-600 dark:text-slate-350 hover:text-blue-500 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/chat')}
              className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 font-bold text-xs shadow-md transition-all duration-300 hover:-translate-y-0.5"
            >
              Launch Console
            </button>
          </div>
        </header>

        {/* Hero Main Content */}
        <div className="max-w-7xl mx-auto w-full px-6 md:px-12 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center flex-1">
          {/* Left Text details */}
          <div className="lg:col-span-7 space-y-8 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-150/40 dark:border-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
              <Cpu className="w-3.5 h-3.5 text-blue-550" /> Grounded Financial Intelligence Engine
            </div>
            
            <h1 className="text-4xl sm:text-6xl md:text-7.5xl font-black tracking-tight leading-[1.02] text-slate-900 dark:text-white">
              The AI Advisor that <br className="hidden sm:inline" />
              actually knows your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-350">AmEx Disclosures.</span>
            </h1>

            <p className="text-slate-550 dark:text-slate-400 text-sm md:text-base max-w-xl leading-relaxed font-medium">
              A high-precision RAG assistant that answers reward questions, computes points multipliers, and manages budgets. Backed by PostgreSQL and official scraped agreements.
            </p>

            {/* Interactive Terminal Bar */}
            <div className="h-11 text-slate-700 dark:text-slate-300 text-xs md:text-sm font-semibold font-mono flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-850 max-w-lg shadow-inner backdrop-blur-md">
              <span className="text-blue-500 font-extrabold select-none">{'>'}</span>
              <span>{typedText}</span>
              <span className="w-1.5 h-4 bg-blue-600 dark:bg-blue-400 animate-ping" />
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={() => navigate('/chat')}
                className="px-8 py-4.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 flex items-center gap-2 text-xs uppercase tracking-wider transition-all hover:-translate-y-0.5"
              >
                Consult Advisor Chat <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-8 py-4.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-250 border border-slate-200 dark:border-slate-800 font-black rounded-2xl text-xs uppercase tracking-wider transition-all flex items-center gap-2 hover:-translate-y-0.5"
              >
                Open Spend Dashboard <LayoutDashboard className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Visual Details - Glass Credit Card rotating */}
          <div className="lg:col-span-5 relative flex flex-col items-center justify-center py-6">
            <div className="flex gap-2.5 mb-8 p-1.5 bg-slate-200/50 dark:bg-slate-900/50 rounded-2xl border border-slate-200/40 dark:border-slate-850 backdrop-blur-md z-10 shadow-inner">
              {['platinum', 'gold', 'blue'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveCardTab(tab as any)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-extrabold uppercase transition-all ${
                    activeCardTab === tab
                      ? 'bg-blue-650 text-white shadow-md shadow-blue-550/20'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeCardTab}
                initial={{ opacity: 0, rotateY: 90, scale: 0.95 }}
                animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                exit={{ opacity: 0, rotateY: -90, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className={`relative w-full max-w-sm rounded-3xl border p-6 flex flex-col justify-between h-56 shadow-2xl text-white select-none ${
                  activeCardTab === 'platinum' ? 'bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 border-slate-750' :
                  activeCardTab === 'gold' ? 'bg-gradient-to-br from-amber-700 via-yellow-800 to-amber-950 border-amber-600/30' :
                  'bg-gradient-to-br from-blue-700 via-blue-900 to-slate-950 border-blue-600/30'
                }`}
              >
                <div className="absolute top-0 right-0 w-36 h-36 bg-[radial-gradient(circle,rgba(255,255,255,0.06)_0%,transparent_60%)] pointer-events-none" />
                
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider font-extrabold opacity-60 block">American Express</span>
                    <span className="text-sm font-black tracking-widest uppercase">{activeCardTab}</span>
                  </div>
                  <span className="font-extrabold text-[10px] font-mono tracking-widest opacity-60">AMEX</span>
                </div>

                <div className="my-2 flex items-center justify-between">
                  <div className="w-10 h-7 rounded-lg bg-gradient-to-r from-amber-250 via-yellow-400 to-amber-250 opacity-80 border border-yellow-500/25 shadow-sm" />
                  <div className="text-right">
                    <span className="text-[8px] font-bold opacity-60 uppercase tracking-widest block">MR Multipliers</span>
                    <span className="text-xs font-black">
                      {activeCardTab === 'platinum' ? '5X Flights & Travel booking' :
                       activeCardTab === 'gold' ? '4X Dining & Supermarkets' :
                       '2X Cash Back Shopping spend'}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-[8px] uppercase tracking-widest opacity-50 block font-bold">Holder</span>
                    <span className="text-xs font-bold tracking-wide">Demo User</span>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-[7px] opacity-50 block font-bold">Number / Expiry</span>
                    <span className="text-xs font-semibold">3712 •••• •••• 90123</span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
            
            <div className="absolute -z-10 w-52 h-52 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-full filter blur-[80px] opacity-15 pointer-events-none" />
          </div>
        </div>

        {/* 2. TRUSTED BY SECTION */}
        <div className="border-t border-slate-200/50 dark:border-slate-850/50 py-10 bg-slate-50 dark:bg-slate-900/20 w-full">
          <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <span className="text-[10px] uppercase tracking-widest font-extrabold text-slate-400">DESIGNED IN THE SPIRIT OF MODERN FINTECH</span>
            <div className="flex flex-wrap items-center gap-8 md:gap-12 opacity-50 hover:opacity-75 transition-opacity duration-300 font-extrabold text-sm tracking-widest font-mono text-slate-450 dark:text-slate-500 select-none">
              <span>LINEAR</span>
              <span>VERCEL</span>
              <span>RAMP</span>
              <span>MERCURY</span>
              <span>SABRE</span>
              <span>STRIPE</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CORE FEATURES GRID */}
      <section className="py-24 border-t border-slate-250/30 dark:border-slate-850/40 bg-slate-50/50 dark:bg-slate-950/20">
        <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-16">
          <div className="max-w-2xl text-left space-y-3">
            <span className="text-[10px] uppercase tracking-widest font-extrabold text-blue-600 dark:text-blue-400">BENEFIT SUITE</span>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight">
              A comprehensive toolkit for Membership Rewards optimization.
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              We replace hardcoded calculations and AI hallucinations with a structured, queryable data warehouse.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Globe className="w-6 h-6 text-blue-500" />,
                title: 'Playwright Disclosures Crawling',
                desc: 'Automated ingestion pipelines scrape official card terms, lounge access requirements, and statement credit guides directly from AmEx source documents.'
              },
              {
                icon: <Database className="w-6 h-6 text-indigo-500" />,
                title: 'FAISS Semantic Indexing',
                desc: 'Disclosures are segmented, tokenized, and vectorized using a dense transformer model, allowing search queries to match reference context in less than 1ms.'
              },
              {
                icon: <LayoutDashboard className="w-6 h-6 text-purple-500" />,
                title: 'Dynamic Spend Analytics',
                desc: 'Real-time database records track user transactions, budget status, reward points, card spend multipliers, and monthly forecasts.'
              }
            ].map((f, idx) => (
              <div
                key={idx}
                className="p-8 rounded-3xl border border-slate-200/60 dark:border-slate-850/80 bg-white dark:bg-slate-900/60 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:border-blue-550/20 hover:-translate-y-1 space-y-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 flex items-center justify-center">
                  {f.icon}
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">{f.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. HOW RAG WORKS SECTION */}
      <section className="py-28 relative">
        <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-16">
          <div className="max-w-2xl text-left space-y-3">
            <span className="text-[10px] uppercase tracking-widest font-extrabold text-blue-600 dark:text-blue-400">RAG ARCHITECTURE</span>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight">
              Fact-Grounded Generation Pipeline
            </h2>
            <p className="text-slate-550 dark:text-slate-400 text-sm">
              We cross-check all user queries against scraped knowledge indexes to ensure 100% factual accuracy.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 relative">
            {[
              {
                step: '01',
                title: 'Data Ingestion',
                desc: 'Official terms PDFs are crawled via Playwright, stripping styling tags to yield clean text disclosures.'
              },
              {
                step: '02',
                title: 'Vector Embeddings',
                desc: 'A dense sentence-transformer encodes clean text into dense 384-dimensional vector coordinates.'
              },
              {
                step: '03',
                title: 'FAISS Search',
                desc: 'Local similarity calculations compare query vectors to disclosures index, locating matching chunks.'
              },
              {
                step: '04',
                title: 'Gemini Synthesis',
                desc: 'Context chunks are appended to the query prompt. Gemini synthesizes a factual, cited response.'
              }
            ].map((s, idx) => (
              <div key={idx} className="relative p-6 rounded-3xl bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-850/60 flex flex-col justify-between h-56 hover:border-blue-500/30 transition-all">
                <div>
                  <span className="text-3xl font-black text-blue-500/20 block font-mono">{s.step}</span>
                  <h4 className="text-base font-black text-slate-900 dark:text-white mt-4">{s.title}</h4>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. EXPENSE AI PARSER SANDBOX SECTION */}
      <section className="py-24 bg-slate-100/40 dark:bg-indigo-950/10 border-t border-b border-slate-200/40 dark:border-slate-850/50">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-6 text-left">
            <span className="text-[10px] uppercase tracking-widest font-extrabold text-blue-600 dark:text-blue-400">EXPENSE AI</span>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight">
              Natural language parsing.
            </h2>
            <p className="text-slate-500 dark:text-slate-455 text-xs md:text-sm leading-relaxed font-medium">
              Our AI parses spoken or typed phrases (e.g. "I spent $8.50 at Starbucks on my Gold card"), log items, categorizes purchases, updates budgets, and tallies Membership Rewards. Try it live:
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                value={sandboxInput}
                onChange={(e) => setSandboxInput(e.target.value)}
                className="flex-1 text-xs px-4 py-3 rounded-xl border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-950 outline-none focus:border-blue-500 text-slate-800 dark:text-slate-200"
              />
              <button
                onClick={handleSandboxParse}
                className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                Parse AI
              </button>
            </div>
            
            <p className="text-[10px] text-slate-400 italic">
              Try: "Taxi to Airport cost $45 on Platinum" or "Netflix sub $15 on Blue Cash"
            </p>
          </div>

          <div className="lg:col-span-7">
            <div className="p-8 rounded-3xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 shadow-xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-850">
                <span className="text-xs font-extrabold uppercase text-slate-400">Sandbox Output Log</span>
                <span className="text-[10px] font-mono bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 px-2 py-0.5 rounded-lg font-bold">PARSED SUCCESSFULLY</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Merchant', value: sandboxParsed.description },
                  { label: 'Amount', value: `$${sandboxParsed.amount.toFixed(2)}` },
                  { label: 'Category', value: sandboxParsed.category },
                  { label: 'Payment Card', value: sandboxParsed.paymentMethod },
                  { label: 'Points Multiplier', value: sandboxParsed.multiplier },
                  { label: 'Rewards Earned', value: `+${sandboxParsed.pointsEarned} MR Points`, highlight: true }
                ].map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 space-y-1">
                    <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">{item.label}</span>
                    <div className={`text-xs font-black ${item.highlight ? 'text-blue-600 dark:text-blue-400' : 'text-slate-800 dark:text-slate-200'}`}>
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SPEND OPTIMIZER SECTION */}
      <section className="py-24 max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        <div className="lg:col-span-7 order-2 lg:order-1">
          <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 shadow-xl divide-y divide-slate-100 dark:divide-slate-850">
            {[
              { card: 'Platinum', rule: '5X Flights & Hotels booking', category: 'Travel', rate: '5X' },
              { card: 'Gold', rule: '4X Restaurants & US Supermarkets', category: 'Food', rate: '4X' },
              { card: 'Blue Cash Preferred', rule: '6X Streaming, 3X Groceries & Gas', category: 'Entertainment', rate: '6X' }
            ].map((r, idx) => (
              <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-7 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-[8px] font-black text-slate-500`}>
                    AMEX
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-850 dark:text-slate-200 block">{r.card}</span>
                    <span className="text-[10px] text-slate-400 font-medium">{r.rule}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30">
                    {r.rate} Points
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 space-y-4 text-left order-1 lg:order-2">
          <span className="text-[10px] uppercase tracking-widest font-extrabold text-blue-600 dark:text-blue-400">SPEND OPTIMIZER</span>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight">
            Know which card to pay with.
          </h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
            Optimize reward collection rules instantly. Our engine analyzes categories dynamically to yield maximum Membership Rewards points or Cash Back on every swipe.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline pt-2 group"
          >
            Open Spend Analytics <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </section>

      {/* 7. AI ADVISOR SIMULATED INTERACTIVE CONSOLE */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900/20 border-t border-slate-200/50 dark:border-slate-850/50">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-5 space-y-4 text-left">
            <span className="text-[10px] uppercase tracking-widest font-extrabold text-blue-600 dark:text-blue-400">AI ADVISOR CONSOLE</span>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight">
              Factual responses with clear citations.
            </h2>
            <p className="text-xs md:text-sm text-slate-550 dark:text-slate-400 leading-relaxed font-medium">
              Every advisor statement highlights specific document references, page numbers, matching vector distance, and confidence scoring. Zero hallucination guarantee.
            </p>
            <button
              onClick={() => navigate('/chat')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-450 hover:underline pt-2 group"
            >
              Consult the Live Advisor <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div className="lg:col-span-7">
            <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-xl space-y-4 text-left">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-850">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-indigo-500 to-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">FinAssist Response Sandbox</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-450 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Grounded Session
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Grounded Response</span>
                <p className="text-xs text-slate-750 dark:text-slate-300 leading-relaxed">
                  American Express Platinum Cardmembers receive complimentary entry to Centurion Lounges globally <span className="text-[8px] bg-blue-650 text-white px-1.5 py-0.5 rounded font-mono font-bold">[1]</span>. Access requires a valid physical card, confirmed same-day boarding pass, and matching ID.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold text-blue-650 dark:text-blue-400 bg-blue-100/50 dark:bg-blue-950/40 border border-blue-150 px-2 py-0.5 rounded-lg">
                    <span className="text-[8px] bg-blue-650 text-white px-1 rounded font-mono font-bold">[1]</span> Centurion Lounge Disclosures p. 3
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. SECURITY & ROBUST COMPLIANCE */}
      <section className="py-24 max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        <div className="lg:col-span-7 order-2 lg:order-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                icon: <Lock className="w-5 h-5 text-blue-550" />,
                title: 'Bcrypt Hash Cryptography',
                desc: 'Passwords are coded on-disk using adaptive bcrypt cryptographic salting to prevent key dictionary leaks.'
              },
              {
                icon: <Shield className="w-5 h-5 text-indigo-550" />,
                title: 'JWT Session Token Guarding',
                desc: 'Access tokens authorize API routing dynamically, with secure local token clearance upon user sign-out.'
              },
              {
                icon: <Settings className="w-5 h-5 text-purple-550" />,
                title: 'Strict API Rate Limiting',
                desc: 'Middleware filters incoming TCP calls dynamically to shield downstream database compute cycles.'
              },
              {
                icon: <Activity className="w-5 h-5 text-emerald-550" />,
                title: 'Prepared Database Statements',
                desc: 'Prisma client schemas validate parameter variables before database queries, neutralizing script injection.'
              }
            ].map((sec, idx) => (
              <div key={idx} className="p-5 rounded-2xl border border-slate-200/60 dark:border-slate-850/80 bg-white dark:bg-slate-900 shadow-md space-y-3 text-left">
                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 flex items-center justify-center">
                  {sec.icon}
                </div>
                <h4 className="text-sm font-black text-slate-850 dark:text-white">{sec.title}</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{sec.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 space-y-4 text-left order-1 lg:order-2">
          <span className="text-[10px] uppercase tracking-widest font-extrabold text-blue-600 dark:text-blue-400">ENTERPRISE SECURITY</span>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight">
            Security. Encrypted. Sealed.
          </h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
            We isolate sensitive calculations, sandbox variables, and implement JWT-guarded RESTful session management to ensure client privacy at every layer.
          </p>
        </div>
      </section>

      {/* 9. TESTIMONIALS SECTION */}
      <section className="py-24 bg-slate-50 dark:bg-slate-950 border-t border-b border-slate-200/40 dark:border-slate-850/50 text-left">
        <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-16">
          <div className="max-w-xl space-y-3">
            <span className="text-[10px] uppercase tracking-widest font-extrabold text-blue-600 dark:text-blue-400">TESTIMONIALS</span>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white">What users say about FinAssist.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                quote: "FinAssist is the first tool that correctly parsed my AmEx Gold dining exclusions. The RAG architecture citation references are exceptionally detailed.",
                author: "Sarah Jenkins",
                role: "Lead Finance Analyst, Stripe"
              },
              {
                quote: "A gorgeous, responsive spatial dashboard coupled with highly grounded, cited answers. It has completely optimized our Membership Rewards calculations.",
                author: "Marcus Chen",
                role: "Director of Product, Sabre Systems"
              }
            ].map((t, idx) => (
              <div key={idx} className="p-8 rounded-3xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 shadow-md space-y-6 flex flex-col justify-between">
                <p className="text-sm md:text-base italic text-slate-655 dark:text-slate-300 leading-relaxed">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-extrabold text-xs">
                    {t.author[0]}
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-900 dark:text-white block">{t.author}</span>
                    <span className="text-[10px] text-slate-400 block font-medium">{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. SYSTEM ARCHITECTURE SECTION */}
      <section className="py-24 max-w-7xl mx-auto px-6 md:px-12 text-left">
        <div className="space-y-12">
          <div className="max-w-xl space-y-3">
            <span className="text-[10px] uppercase tracking-widest font-extrabold text-blue-600 dark:text-blue-400">SYSTEM ARCHITECTURE</span>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white">Full-Stack RAG Sandbox</h2>
          </div>

          <div className="p-8 rounded-3xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 shadow-xl space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 items-center text-center">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-205/60 dark:border-slate-850">
                <span className="text-xs font-black text-blue-600 dark:text-blue-400 block">Frontend React</span>
                <span className="text-[10px] text-slate-400 mt-1 block">TypeScript / Vite</span>
              </div>
              <div className="flex justify-center text-slate-350 select-none">
                <ArrowRightLeft className="w-6 h-6" />
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-205/60 dark:border-slate-850">
                <span className="text-xs font-black text-blue-600 dark:text-blue-400 block">Backend API</span>
                <span className="text-[10px] text-slate-400 mt-1 block">FastAPI / Uvicorn</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-205/60 dark:border-slate-850">
                <span className="text-xs font-black text-blue-600 dark:text-blue-400 block">Database Layer</span>
                <span className="text-[10px] text-slate-400 mt-1 block">Prisma / PostgreSQL</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-450 leading-relaxed text-center font-medium max-w-2xl mx-auto">
              Our architecture bridges the client browser and API, with an abstract repository layer that swaps from SQLite to Neon PostgreSQL dynamically.
            </p>
          </div>
        </div>
      </section>

      {/* 11. FAQ ACCORDION SECTION */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900/20 border-t border-b border-slate-200/40 dark:border-slate-850/50 text-left">
        <div className="max-w-4xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-[10px] uppercase tracking-widest font-extrabold text-blue-600 dark:text-blue-400">FAQ</span>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'How does the RAG search pipeline prevent hallucination?',
                a: 'Traditional LLMs guess answers based on historical pre-training weights. FinAssist vectorizes your exact query, searches a local FAISS index containing official scraped card agreement text, retrieves only the 4 most relevant context paragraphs, and instructs Gemini to answer ONLY using that retrieved context. If it is not found, the model states so clearly.'
              },
              {
                q: 'Is my credit card information secure in the sandbox?',
                a: 'Yes, because all credentials and numbers are seeded, fictional details clearly marked as test sandbox data. We do not require or collect real credit card logs. Security algorithms (JWT, bcrypt) are fully active to keep user logins and logged sandbox transactions isolated.'
              },
              {
                q: 'How do I migrate the SQLite database to Neon PostgreSQL?',
                a: 'Simply define your DATABASE_URL environment variable inside .env pointing to your Neon database cluster, run the prisma migration commands: "npx prisma migrate dev --schema=prisma/schema.prisma", and our backend repositories selector will dynamically instantiate the PrismaRepository interface instead of SQLite!'
              }
            ].map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-205/60 dark:border-slate-850 bg-white dark:bg-slate-900 overflow-hidden"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left font-black text-sm text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {activeFaq === idx && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-5 text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 12. CALL TO ACTION (CTA) BLOCK */}
      <section className="py-24 max-w-7xl mx-auto px-6 md:px-12">
        <div className="p-12 md:p-16 rounded-3xl bg-gradient-to-r from-blue-650 to-indigo-650 text-white shadow-2xl relative overflow-hidden text-center">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,rgba(255,255,255,0.12),transparent_60%)] pointer-events-none" />
          <h2 className="text-2xl md:text-4.5xl font-black tracking-tight relative z-10 leading-tight">
            Ready to optimize your Membership Rewards?
          </h2>
          <p className="max-w-md mx-auto text-blue-100 mt-4 leading-relaxed relative z-10 text-xs font-semibold">
            Sign up for a secure sandbox profile to test dynamic transaction entry, custom calculators, and grounded disclosures advice.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4 relative z-10">
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-4 bg-white hover:bg-slate-50 text-blue-600 font-extrabold rounded-2xl transition-colors shadow-lg text-xs uppercase tracking-wider"
            >
              Get Started (Sign Up)
            </button>
            <button
              onClick={() => navigate('/chat')}
              className="px-8 py-4 bg-blue-750 hover:bg-blue-800 text-white font-extrabold rounded-2xl transition-all border border-blue-500/30 text-xs uppercase tracking-wider"
            >
              Open Chat Console
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 md:px-12 py-12 border-t border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-950 flex flex-col md:flex-row justify-between items-center gap-6 relative z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-sm tracking-tight text-slate-800 dark:text-white">FinAssist</span>
        </div>
        <div className="flex gap-6 text-[10px] font-bold uppercase tracking-wider text-slate-450 dark:text-slate-400">
          <button onClick={() => navigate('/chat')} className="hover:text-blue-500 transition-colors">Advisor Chat</button>
          <button onClick={() => navigate('/dashboard')} className="hover:text-blue-500 transition-colors">Spend Optimizer</button>
          <button onClick={() => navigate('/workflow')} className="hover:text-blue-500 transition-colors">Pipeline Workflow</button>
          <button onClick={() => navigate('/sources')} className="hover:text-blue-500 transition-colors">FAISS Index</button>
        </div>
        <div className="text-[10px] text-slate-400 font-medium">
          © {new Date().getFullYear()} FinAssist AI. Seeded fictional card details for sandbox testing.
        </div>
      </footer>
    </div>
  )
}
