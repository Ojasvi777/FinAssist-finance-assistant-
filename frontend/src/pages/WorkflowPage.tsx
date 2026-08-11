import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Globe,
  FileText,
  Fingerprint,
  Database,
  Cpu,
  Sparkles,
  Layers,
  ArrowRight,
  Code,
  Terminal,
  Activity
} from 'lucide-react'

interface WorkflowStep {
  id: string
  title: string
  icon: React.ReactNode
  color: string
  glowColor: string
  desc: string
  details: string[]
  codeSample?: string
  inputLabel: string
  inputValue: string
  outputLabel: string
  outputValue: string
}

const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    id: 'crawl',
    title: 'Crawling',
    icon: <Globe className="w-5 h-5" />,
    color: 'border-blue-500 text-blue-500 bg-blue-50 dark:bg-blue-950/20',
    glowColor: 'shadow-blue-500/20',
    desc: 'Crawls official AmEx product catalogs and travel benefits guides.',
    details: [
      'Scrapes benefits recursively from seed JSON urls',
      'Loads dynamic JavaScript lists using requests/Playwright',
      'Stores raw HTML code local arrays'
    ],
    codeSample: `import requests
from bs4 import BeautifulSoup

def crawl_site(url):
    res = requests.get(url)
    if res.status_code == 200:
        return res.text # Raw HTML code
    return None`,
    inputLabel: 'Seed URLs',
    inputValue: '["americanexpress.com/platinum-card", "americanexpress.com/gold-card"]',
    outputLabel: 'Raw HTML Cache',
    outputValue: '"<html><body><h1>AmEx Platinum Lounge Access...</h1></body></html>"'
  },
  {
    id: 'clean',
    title: 'Text Cleaning',
    icon: <FileText className="w-5 h-5" />,
    color: 'border-cyan-500 text-cyan-500 bg-cyan-50 dark:bg-cyan-950/20',
    glowColor: 'shadow-cyan-500/20',
    desc: 'Strips formatting scripts, navigation links, and CSS classes.',
    details: [
      'Removes HTML script/styles/header tags using BeautifulSoup',
      'Strips duplicate blank spacing and normalizes character encoding',
      'Keeps sentence contextual structures clean for semantic vector parsing'
    ],
    codeSample: `def clean_html(html_content):
    soup = BeautifulSoup(html_content, "html.parser")
    # Remove navigation and scripts
    for s in soup(["script", "style", "nav", "footer"]):
        s.extract()
    return soup.get_text(" ", strip=True)`,
    inputLabel: 'Raw HTML Content',
    inputValue: '"<html><body><h1>AmEx Platinum Lounge Access...</h1></body></html>"',
    outputLabel: 'Clean Raw Text',
    outputValue: '"AmEx Platinum Lounge Access. Cardmembers receive complimentary entry..."'
  },
  {
    id: 'chunk',
    title: 'Chunking',
    icon: <Layers className="w-5 h-5" />,
    color: 'border-purple-500 text-purple-500 bg-purple-50 dark:bg-purple-950/20',
    glowColor: 'shadow-purple-500/20',
    desc: 'Splits raw text files into overlapping 500-1000 character segments.',
    details: [
      'Divides massive texts into chunks using Sentence Splitter libraries',
      'Adds 100 character sentence overlaps to prevent cutting terms in half',
      'Saves meta-properties (e.g. source URL paths) along with text sections'
    ],
    codeSample: `def create_chunks(text, size=500, overlap=100):
    chunks = []
    start = 0
    while start < len(text):
        end = start + size
        chunks.append(text[start:end])
        start += (size - overlap)
    return chunks`,
    inputLabel: 'Clean Raw Text',
    inputValue: '"AmEx Platinum Lounge Access. Cardmembers receive complimentary entry..."',
    outputLabel: 'Segmented Chunks',
    outputValue: '["AmEx Platinum Lounge Access...", "Cardmembers receive complimentary entry..."]'
  },
  {
    id: 'embed',
    title: 'Embedding',
    icon: <Fingerprint className="w-5 h-5" />,
    color: 'border-pink-500 text-pink-500 bg-pink-50 dark:bg-pink-950/20',
    glowColor: 'shadow-pink-500/20',
    desc: 'Translates clean sentence sections into 384-dimensional dense vectors.',
    details: [
      'Runs all-MiniLM-L6-v2 transformer model locally',
      'Transforms English characters into floating-point coordinates lists',
      'Preserves conceptual similarity (e.g., "lounge" maps close to "airport")'
    ],
    codeSample: `from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")
def embed_chunks(chunks):
    return model.encode(chunks) # Returns 384-dimensional vector`,
    inputLabel: 'Text Chunk',
    inputValue: '"Cardmembers receive complimentary entry to Centurion lounges."',
    outputLabel: '384D Vector Coordinate',
    outputValue: '[0.0418, -0.0921, 0.1235, -0.0054, ...]'
  },
  {
    id: 'faiss',
    title: 'Retrieval',
    icon: <Database className="w-5 h-5" />,
    color: 'border-amber-500 text-amber-500 bg-amber-50 dark:bg-amber-950/20',
    glowColor: 'shadow-amber-500/20',
    desc: 'Compares search vectors to retrieve matching documents instantly.',
    details: [
      'Executes flat L2 inner-product similarity scans in FAISS memory',
      'Retrieves the top k (usually k=4) highest scoring sentence records',
      'Excludes unrelated card terms, filtering only relevant paragraphs'
    ],
    codeSample: `import faiss

def query_faiss(index, query_vector, k=4):
    scores, indices = index.search(query_vector, k)
    return scores, indices # Returns similarity scores and file IDs`,
    inputLabel: 'User Query Vector',
    inputValue: '[0.0381, -0.0815, 0.1114, -0.0102, ...]',
    outputLabel: 'Top k Matched Chunks',
    outputValue: '{"chunk_id": "chunk-1", "text": "Centurion Lounge access criteria...", "score": 0.942}'
  },
  {
    id: 'gemini',
    title: 'Gemini',
    icon: <Cpu className="w-5 h-5" />,
    color: 'border-indigo-500 text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20',
    glowColor: 'shadow-indigo-500/20',
    desc: 'Combines matched source vectors and question inside prompt instructions.',
    details: [
      'Injects FAISS context blocks directly into Gemini prompt structure',
      'Forces model to answer using only supplied data segments',
      'Drastically removes LLM hallucination and fabricated credit statements'
    ],
    codeSample: `import google.generativeai as genai

def generate_answer(query, context):
    prompt = f"Answer the query using ONLY the context:\\nContext: {context}\\nQuery: {query}"
    model = genai.GenerativeModel("gemini-2.5-flash")
    return model.generate_content(prompt).text`,
    inputLabel: 'Context-Augmented Prompt',
    inputValue: '"Answer the query: lounge entry rules. Context: Platinum cards get Centurion access..."',
    outputLabel: 'Structured Text response',
    outputValue: '"Based on official terms, Platinum cardmembers receive complimentary access to Centurion..."'
  },
  {
    id: 'response',
    title: 'Response',
    icon: <Sparkles className="w-5 h-5" />,
    color: 'border-emerald-500 text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20',
    glowColor: 'shadow-emerald-500/20',
    desc: 'Delivers formatted fact-checked response alongside URL links.',
    details: [
      'Renders output with Markdown tables, bold cards, and points guidelines',
      'Draws clickable URL hyperlinks linking back to original sources',
      'Saves chat turn into LocalStorage histories'
    ],
    codeSample: `return {
    "answer": response_text,
    "sources": ["americanexpress.com/lounge-access"]
}`,
    inputLabel: 'Structured Text response',
    inputValue: '"Based on official terms, Platinum cardmembers receive complimentary access to Centurion..."',
    outputLabel: 'UI Renders Stream',
    outputValue: '<html><div><p>Based on official terms...</p><a href="...">Source</a></div></html>'
  }
]

export const WorkflowPage: React.FC = () => {
  const [activeStep, setActiveStep] = useState<string>('crawl')

  const currentStep = WORKFLOW_STEPS.find((s) => s.id === activeStep) || WORKFLOW_STEPS[0]

  return (
    <div className="min-h-full p-6 md:p-8 flex flex-col gap-8 animate-fade-in text-slate-800 dark:text-slate-200">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-800 dark:text-white leading-none">
          FinAssist RAG pipeline
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5">
          Step-by-step visual workflow showing crawlers, vector sentence embedding, and FAISS database retrieval.
        </p>
      </div>

      {/* Animated Pipeline Nodes Wrapper */}
      <div className="relative p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center overflow-x-auto min-w-0">
        
        {/* Animated Particles flowing between nodes */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <div className="relative w-[85%] h-0.5 bg-slate-100 dark:bg-slate-800">
            {/* Particle flow animation */}
            {[0, 1, 2, 3, 4, 5].map((n) => (
              <motion.div
                key={n}
                initial={{ left: '0%' }}
                animate={{ left: '100%' }}
                transition={{
                  repeat: Infinity,
                  duration: 4,
                  ease: 'linear',
                  delay: n * 0.8
                }}
                className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 shadow-md shadow-blue-500/50 -top-[3px]"
              />
            ))}
          </div>
        </div>

        {/* Nodes Grid */}
        <div className="relative z-10 w-full flex items-center justify-between gap-4 min-w-[800px] px-2 py-4">
          {WORKFLOW_STEPS.map((step, idx) => {
            const isActive = step.id === activeStep
            return (
              <React.Fragment key={step.id}>
                {/* Individual Node */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveStep(step.id)}
                  className={`flex flex-col items-center text-center p-3 rounded-2xl border transition-all ${
                    isActive
                      ? `bg-slate-50 dark:bg-slate-800 shadow-lg ring-2 ring-blue-500 border-blue-500 scale-105 ${step.glowColor}`
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-750'
                  }`}
                  style={{ width: '108px' }}
                >
                  {/* Step Icon */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm mb-2 ${step.color}`}>
                    {step.icon}
                  </div>
                  
                  {/* Step label */}
                  <span className="text-[10px] font-bold tracking-tight text-slate-800 dark:text-slate-200 leading-snug">
                    {step.title}
                  </span>
                  
                  {/* Progress Indicator */}
                  <span className="text-[8px] text-slate-400 font-mono mt-1 font-semibold uppercase">Step {idx + 1}</span>
                </motion.button>

                {/* Connector Arrow */}
                {idx < WORKFLOW_STEPS.length - 1 && (
                  <div className="text-slate-350 dark:text-slate-750 shrink-0">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </React.Fragment>
            )
          })}
        </div>
      </div>

      {/* Info Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* Step details Card */}
        <div className="card h-full flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${currentStep.color}`}>
                {currentStep.icon}
              </div>
              <div>
                <h3 className="font-extrabold text-base md:text-lg text-slate-800 dark:text-white leading-none">
                  {currentStep.title}
                </h3>
                <span className="text-[9px] text-slate-400 mt-1 block uppercase font-mono tracking-wider">
                  Stage ID: {currentStep.id}
                </span>
              </div>
            </div>
            
            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
              {currentStep.desc}
            </p>

            <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" /> Pipeline Actions
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-350 mb-6">
              {currentStep.details.map((detail, idx) => (
                <li key={idx} className="flex items-start gap-2 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <span>{detail}</span>
                </li>
              ))}
            </ul>

            {/* Input/Output Data Sandbox */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-5 space-y-3.5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Input ({currentStep.inputLabel})
                  </span>
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl font-mono text-[9px] text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-850/50 break-all leading-normal">
                    {currentStep.inputValue}
                  </div>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Output ({currentStep.outputLabel})
                  </span>
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl font-mono text-[9px] text-slate-650 dark:text-slate-400 border border-slate-200/50 dark:border-slate-850/50 break-all leading-normal">
                    {currentStep.outputValue}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-850 text-[10px] text-slate-400 font-semibold leading-relaxed">
            Click on any pipeline node above to inspect its action logs, metadata configurations, and python scripts.
          </div>
        </div>

        {/* Python Script block Card */}
        <div className="card h-full flex flex-col justify-between overflow-hidden">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase font-extrabold tracking-wider text-slate-450 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-indigo-500" /> Pipeline Code Block
              </span>
              <span className="text-[9px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 border border-slate-200 dark:border-slate-700 rounded text-slate-500 font-semibold">
                PYTHON 3.12
              </span>
            </div>
            
            <div className="flex-1 min-h-0 bg-slate-900 border border-slate-850 rounded-2xl p-4 overflow-auto font-mono text-[10.5px] text-slate-200 leading-relaxed max-h-[360px]">
              <pre className="whitespace-pre">
                <code>{currentStep.codeSample || '# code block empty'}</code>
              </pre>
            </div>
          </div>

          <div className="mt-6 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 text-[11px] text-blue-700 dark:text-blue-400 font-medium flex items-center gap-2">
            <Code className="w-4 h-4 text-blue-500 shrink-0" />
            <span>This script coordinates data normalization at indexing time.</span>
          </div>
        </div>

      </div>
    </div>
  )
}
