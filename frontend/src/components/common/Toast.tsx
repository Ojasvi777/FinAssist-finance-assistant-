import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'
import { useApp } from '../../context/AppContext'

export const Toast: React.FC = () => {
  const { toast, clearToast } = useApp()

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        clearToast()
      }, 3500)
      return () => clearTimeout(timer)
    }
  }, [toast])

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
  }

  const bgColors = {
    success: 'bg-emerald-55/90 dark:bg-emerald-950/20 border-emerald-500/30',
    error: 'bg-rose-55/90 dark:bg-rose-950/20 border-rose-500/30',
    info: 'bg-blue-55/90 dark:bg-blue-950/20 border-blue-500/30',
  }

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 35, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 15, scale: 0.95 }}
          transition={{ duration: 0.25 }}
          className={`fixed bottom-5 right-5 z-[9999] flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-xl ${bgColors[toast.type]}`}
        >
          {icons[toast.type]}
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {toast.message}
          </span>
          <button onClick={clearToast} className="text-slate-400 hover:text-slate-650 dark:hover:text-slate-300 ml-1">
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
