import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, HelpCircle, ArrowLeft } from 'lucide-react'

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center select-none transition-colors">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex flex-col items-center justify-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-6 border border-blue-500/20 shadow-sm">
          <HelpCircle className="w-8 h-8 animate-bounce" />
        </div>

        <h1 className="text-6xl md:text-8xl font-black text-slate-800 dark:text-white tracking-tight">404</h1>
        <h2 className="text-xl md:text-2xl font-extrabold text-slate-700 dark:text-slate-200 mt-4 leading-none">
          Page Not Found
        </h2>
        <p className="text-slate-400 dark:text-slate-500 text-sm max-w-sm mt-3 leading-relaxed">
          The workspace path you are trying to visit does not exist. Press the button below to return back safely.
        </p>

        <button
          onClick={() => navigate('/')}
          className="mt-8 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/20 flex items-center gap-2 hover:-translate-y-0.5 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Safety
        </button>
      </motion.div>

      <div className="absolute bottom-6 text-[10px] text-slate-400 font-medium tracking-wider uppercase flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-blue-500" /> FinAssist AI Compliance
      </div>
    </div>
  )
}
