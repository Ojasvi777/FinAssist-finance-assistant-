import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Cpu,
  Database,
  Layers,
  Calendar,
  Sparkles,
  Server,
  ArrowRight,
  Workflow
} from 'lucide-react'

export const AboutPage: React.FC = () => {
  const [activeNode, setActiveNode] = useState<string | null>(null)

  const architectureNodes = [
    {
      id: 'crawler',
      title: 'Scraper / Crawler',
      desc: 'Retrieves web agreements using BeautifulSoup/Playwright, storing clean markdown text.',
      icon: <Server className="w-5 h-5" />,
      color: 'bg-blue-500/10 text-blue-500 border-blue-500/30'
    },
    {
      id: 'faiss',
      title: 'FAISS Index',
      desc: 'Saves 384-dimensional dense vectors to query nearest-neighbors in sub-milliseconds.',
      icon: <Database className="w-5 h-5" />,
      color: 'bg-purple-500/10 text-purple-500 border-purple-500/30'
    },
    {
      id: 'gemini',
      title: 'Gemini LLM',
      desc: 'Formulates fact-grounded final advice based on vector results via zero-shot prompts.',
      icon: <Cpu className="w-5 h-5" />,
      color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/30'
    }
  ]

  const timelineEvents = [
    {
      date: 'Step 1: Ingest & Parse',
      title: 'Crawling & Scrubbing',
      desc: 'Crawls official AmEx site structures. Strips scripts and tags using BeautifulSoup4 and stores text chunks.'
    },
    {
      date: 'Step 2: Vectors Creation',
      title: 'MiniLM-L6 Embeddings',
      desc: 'Encodes 500-character segments into 384-dimensional floating point lists to preserve conceptual similarity.'
    },
    {
      date: 'Step 3: Storage',
      title: 'FAISS Directory Index',
      desc: 'Loads vector arrays into flat inner-product cells ready for real-time similarity cosine matching.'
    },
    {
      date: 'Step 4: Prompt Injection',
      title: 'Grounded LLM Prompt',
      desc: 'Appends matching source text blocks straight into the prompt variables, avoiding model guesses.'
    },
    {
      date: 'Step 5: Completion',
      title: 'Fact-Checked Response',
      desc: 'Renders citation links, bullet calculations, and card advice. Auto-logs the history turn.'
    }
  ]

  return (
    <div className="min-h-full p-6 md:p-8 flex flex-col gap-8 animate-fade-in text-slate-800 dark:text-slate-200">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-800 dark:text-white">
          FinAssist Architecture & RAG Details
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5">
          Deep dive into the retrieval-augmented generation structure, similarity search engine, and generative AI advisor.
        </p>
      </div>

      {/* RAG, FAISS, Gemini explanations cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-bl-full pointer-events-none" />
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4 border border-blue-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-lg mb-2">What is RAG?</h3>
          <p className="text-xs md:text-sm text-slate-550 dark:text-slate-400 leading-relaxed">
            Retrieval-Augmented Generation (RAG) bridges the gap between static LLM knowledge and specific business documents. By retrieving official American Express terms dynamically, it forces the AI to construct statements backed by indexed files.
          </p>
        </div>

        <div className="card hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-purple-500/10 to-transparent rounded-bl-full pointer-events-none" />
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-4 border border-purple-500/20">
            <Database className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-lg mb-2">What is FAISS?</h3>
          <p className="text-xs md:text-sm text-slate-550 dark:text-slate-400 leading-relaxed">
            Facebook AI Similarity Search (FAISS) is a high-speed library for dense vector clustering and similarity matching. Rather than slow string searches, it treats query sentences as coordinates, retrieving nearby source terms instantly.
          </p>
        </div>

        <div className="card hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-500/10 to-transparent rounded-bl-full pointer-events-none" />
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-4 border border-indigo-500/20">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-lg mb-2">How Gemini Works</h3>
          <p className="text-xs md:text-sm text-slate-550 dark:text-slate-400 leading-relaxed">
            We integrate Google Gemini. The system compiles matching source blocks along with the user's card query inside a rigid prompt template, directing Gemini to formulate structured answers using only facts in the payload.
          </p>
        </div>
      </div>

      {/* Interactive Architecture Diagram Section */}
      <div className="card">
        <h3 className="font-extrabold text-lg mb-2 flex items-center gap-2">
          <Workflow className="w-5 h-5 text-blue-500" /> Interactive Architecture Flow
        </h3>
        <p className="text-xs text-slate-400 mb-8 leading-none">Hover or click on the core blocks to inspect their functionality inside the RAG loop.</p>

        {/* Diagram grid */}
        <div className="relative p-6 rounded-2xl bg-slate-55/40 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-around gap-6 py-10">
          {architectureNodes.map((node, nidx) => (
            <React.Fragment key={node.id}>
              <motion.div
                whileHover={{ y: -4 }}
                onClick={() => setActiveNode(node.id === activeNode ? null : node.id)}
                className={`p-5 rounded-2xl border bg-white dark:bg-slate-900 cursor-pointer shadow-sm w-full md:w-56 text-center transition-all ${
                  activeNode === node.id ? 'ring-2 ring-blue-500 border-blue-500 shadow-md' : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl mx-auto flex items-center justify-center mb-3 border ${node.color}`}>
                  {node.icon}
                </div>
                <h4 className="font-extrabold text-sm">{node.title}</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">{node.desc}</p>
              </motion.div>

              {nidx < architectureNodes.length - 1 && (
                <div className="text-slate-350 dark:text-slate-700 transform rotate-90 md:rotate-0">
                  <ArrowRight className="w-5 h-5 animate-pulse" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Detailed details panel for diagram nodes */}
        <AnimatePresence mode="wait">
          {activeNode && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-6 p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40"
            >
              <div className="flex items-center gap-2 mb-2 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                Node Details: {architectureNodes.find((n) => n.id === activeNode)?.title}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed">
                {activeNode === 'crawler' && 'The Scraper uses seed URLs to ingest American Express benefits PDFs and sites, stripping headers/footers to split clean paragraphs into our text chunk database.'}
                {activeNode === 'faiss' && 'The Similarity Index represents the offline memory. It compares query vectors against the whole catalog, extracting the top 4 matched blocks based on cosine vector closeness.'}
                {activeNode === 'gemini' && 'Gemini serves as the reasoning engine. By enclosing FAISS records inside <CONTEXT> HTML blocks in the prompt, we enforce grounded compliance, removing generative hallucinations.'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* RAG Timeline Tracker */}
      <div className="card">
        <h3 className="font-extrabold text-lg mb-8 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-500" /> RAG System Timeline
        </h3>

        <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 pl-6 space-y-8">
          {timelineEvents.map((ev, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="relative"
            >
              {/* Timeline Bullet */}
              <div className="absolute -left-[31px] top-0.5 w-4.5 h-4.5 rounded-full bg-white dark:bg-slate-900 border-2 border-blue-500 shadow-sm flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              </div>
              
              <div>
                <span className="text-[10px] font-bold text-blue-650 dark:text-blue-400 uppercase tracking-wider block leading-none mb-1">
                  {ev.date}
                </span>
                <h4 className="font-extrabold text-slate-850 dark:text-white text-sm leading-tight">{ev.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 max-w-2xl leading-relaxed">
                  {ev.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

    </div>
  )
}
