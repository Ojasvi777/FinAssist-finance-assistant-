import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Database,
  Tag,
  Clock,
  Sparkles,
  Link as LinkIcon
} from 'lucide-react'

interface DocumentChunk {
  id: string
  title: string
  url: string
  category: 'Lounge' | 'Multipliers' | 'Credits' | 'Insurance'
  score: number
  text: string
  tokens: number
  crawledAt: string
}

const INDEXED_CHUNKS: DocumentChunk[] = [
  {
    id: 'chunk-1',
    title: 'AmEx Centurion Lounge access criteria',
    url: 'https://www.americanexpress.com/travel-benefits/lounge-access',
    category: 'Lounge',
    score: 0.942,
    text: 'AmEx Platinum Cardmembers receive complimentary access to over 1,400 airport lounges globally through the Global Lounge Collection. This includes all Centurion Lounges, Delta Sky Clubs (when flying Delta), and Priority Pass Select lounges. Guest policies allow up to two guests at no additional charge for Centurion Lounges, subject to change.',
    tokens: 72,
    crawledAt: '2026-07-16'
  },
  {
    id: 'chunk-2',
    title: 'Membership Rewards Dine multiplier policy',
    url: 'https://www.americanexpress.com/gold-card/points-terms',
    category: 'Multipliers',
    score: 0.895,
    text: 'AmEx Gold Cardmembers earn 4X Membership Rewards points at Restaurants worldwide (including takeout and delivery in the US), and 4X points at US Supermarkets on up to $25,000 per calendar year in purchases, then 1X. Travel purchases booked directly with airlines earn 3X.',
    tokens: 65,
    crawledAt: '2026-07-15'
  },
  {
    id: 'chunk-3',
    title: '$200 Annual Airline Fee Credits guidelines',
    url: 'https://www.americanexpress.com/platinum-card/fee-credits',
    category: 'Credits',
    score: 0.867,
    text: 'Platinum cardholders must select a qualifying airline through their Amex portal to receive the annual $200 airline fee statement credit. The credit covers incidental fees such as baggage, inflight meals, and lounge day passes. It does not cover ticket purchases, upgrades, or gift cards.',
    tokens: 60,
    crawledAt: '2026-07-14'
  },
  {
    id: 'chunk-4',
    title: 'Trip Cancellation and Interruption insurance caps',
    url: 'https://www.americanexpress.com/platinum-card/protection-terms',
    category: 'Insurance',
    score: 0.824,
    text: 'AmEx Platinum Trip Cancellation and Interruption insurance covers up to $10,000 per trip and $20,000 per 12-month period for non-refundable expenses when the trip is cancelled or cut short due to a covered reason (e.g. sickness or extreme weather). Purchases must be charged entirely on the card.',
    tokens: 75,
    crawledAt: '2026-07-13'
  },
  {
    id: 'chunk-5',
    title: 'AmEx Digital Entertainment Credit subscription terms',
    url: 'https://www.americanexpress.com/platinum-card/digital-credits',
    category: 'Credits',
    score: 0.789,
    text: 'The $240 Digital Entertainment Credit on the Platinum Card provides up to $20 back monthly on purchases for Peacock, Disney+, Hulu, ESPN+, and The New York Times when charged directly to the card. Cardmembers must enroll through their online account to activate credits.',
    tokens: 58,
    crawledAt: '2026-07-12'
  }
]

export const SourcesPage: React.FC = () => {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>('All')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  const filtered = INDEXED_CHUNKS.filter((chunk) => {
    const matchesSearch = chunk.title.toLowerCase().includes(search.toLowerCase()) ||
      chunk.text.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = activeCategory === 'All' || chunk.category === activeCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-full p-6 md:p-8 flex flex-col gap-6 animate-fade-in text-slate-800 dark:text-slate-200">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-800 dark:text-white leading-none">
          Knowledge Base (FAISS Cache)
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5">
          Verify, search, and audit index entries compiled from official American Express credit card disclosure pages.
        </p>
      </div>

      {/* Stats row widget */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
        <div className="card flex items-center gap-4 py-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/20">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-bold">{INDEXED_CHUNKS.length}</div>
            <div className="text-[10px] text-slate-450 dark:text-slate-400 uppercase font-bold tracking-wider">Indexed Paragraphs</div>
          </div>
        </div>

        <div className="card flex items-center gap-4 py-4">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center border border-purple-500/20">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-bold">4</div>
            <div className="text-[10px] text-slate-455 dark:text-slate-400 uppercase font-bold tracking-wider">Index Categories</div>
          </div>
        </div>

        <div className="card flex items-center gap-4 py-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-bold">330</div>
            <div className="text-[10px] text-slate-455 dark:text-slate-400 uppercase font-bold tracking-wider">Total Tokens Cached</div>
          </div>
        </div>
      </div>

      {/* Filter Options Row */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        
        {/* Search Input bar */}
        <div className="relative w-full sm:max-w-xs flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search index database..."
            className="w-full text-xs py-2.5 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none text-slate-700 dark:text-slate-300 focus:border-blue-500 dark:focus:border-blue-600 transition-colors shadow-sm"
          />
        </div>

        {/* Categories Tab pills */}
        <div className="flex flex-wrap gap-2 justify-end w-full sm:w-auto">
          {['All', 'Lounge', 'Multipliers', 'Credits', 'Insurance'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                activeCategory === cat
                  ? 'bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-500/10'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-350 dark:hover:border-slate-750'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Indexed Document List */}
      <div className="flex-1 flex flex-col gap-4 min-h-0 overflow-y-auto pr-1">
        <AnimatePresence>
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="card text-center py-16 text-slate-500 dark:text-slate-400 flex flex-col items-center justify-center border-dashed"
            >
              <Database className="w-12 h-12 text-slate-200 dark:text-slate-800 mb-4 animate-pulse" />
              <p className="font-bold text-sm">No vector chunks matched your filters</p>
              <p className="text-xs text-slate-400 mt-1.5">Try querying different card features like "lounge" or "dining" terms.</p>
            </motion.div>
          ) : (
            filtered.map((chunk) => {
              const isExpanded = expandedId === chunk.id
              return (
                <motion.div
                  key={chunk.id}
                  layout
                  className="card border border-slate-200 dark:border-slate-800 p-5 flex flex-col gap-3.5 relative overflow-hidden"
                >
                  {/* Similarity/Match score badge */}
                  <div className="absolute top-5 right-5 flex items-center gap-1.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Score:</span>
                    <span className="text-xs font-extrabold px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30">
                      {chunk.score.toFixed(3)}
                    </span>
                  </div>

                  {/* Header */}
                  <div>
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold text-[9px] uppercase tracking-wider border border-slate-200/40 dark:border-slate-700/40">
                      {chunk.category}
                    </span>
                    <h3 className="font-extrabold text-slate-800 dark:text-white mt-2.5 pr-28 text-base">
                      {chunk.title}
                    </h3>
                  </div>

                  {/* Chunk text details */}
                  <div className="text-xs md:text-sm text-slate-655 dark:text-slate-350 leading-relaxed">
                    {isExpanded ? chunk.text : `${chunk.text.substring(0, 160)}...`}
                  </div>

                  {/* Metadata Row */}
                  <div className="flex flex-wrap items-center justify-between gap-4 mt-2 pt-3 border-t border-slate-100 dark:border-slate-850 text-[10px] text-slate-400 font-medium">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" /> Crawled: {chunk.crawledAt}
                      </span>
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-blue-500" /> {chunk.tokens} tokens
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <a
                        href={chunk.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        <LinkIcon className="w-3 h-3" /> External Link <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                      
                      <button
                        onClick={() => toggleExpand(chunk.id)}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-0.5 font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-350 transition-colors"
                      >
                        {isExpanded ? (
                          <>
                            Collapse <ChevronUp className="w-3.5 h-3.5" />
                          </>
                        ) : (
                          <>
                            Expand <ChevronDown className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )
            })
          )}
        </AnimatePresence>
      </div>

    </div>
  )
}
