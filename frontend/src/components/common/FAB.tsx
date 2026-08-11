import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Command, MessageSquare, Keyboard } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'

export const FAB: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()
  const { showToast } = useApp()

  const toggleOpen = () => setIsOpen((prev) => !prev)

  const items = [
    {
      icon: <Command className="w-4 h-4" />,
      label: 'Commands (Ctrl+K)',
      onClick: () => {
        // Dispatch keypress event for Ctrl+K to open CommandPalette
        const event = new KeyboardEvent('keydown', {
          key: 'k',
          ctrlKey: true,
          bubbles: true,
        })
        window.dispatchEvent(event)
        setIsOpen(false)
      },
      color: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    },
    {
      icon: <MessageSquare className="w-4 h-4" />,
      label: 'Quick Chat',
      onClick: () => {
        navigate('/chat')
        setIsOpen(false)
      },
      color: 'bg-blue-600 hover:bg-blue-700 text-white',
    },
    {
      icon: <Keyboard className="w-4 h-4" />,
      label: 'View Shortcuts',
      onClick: () => {
        showToast('Shortcuts: Ctrl+K (Palette), Ctrl+Shift+T (Theme), Alt+N (New Chat)', 'info')
        setIsOpen(false)
      },
      color: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    },
  ]

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      {/* Floating Menu Items */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.9 }}
            className="flex flex-col items-end gap-2.5 mb-1"
          >
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-sm text-slate-600 dark:text-slate-350">
                  {item.label}
                </span>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={item.onClick}
                  className={`w-9.5 h-9.5 rounded-xl flex items-center justify-center shadow-lg ${item.color}`}
                >
                  {item.icon}
                </motion.button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Primary Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleOpen}
        className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xl shadow-blue-500/25 relative overflow-hidden"
      >
        <motion.div
          animate={{ rotate: isOpen ? 135 : 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
          <Sparkles className="w-5.5 h-5.5" />
        </motion.div>
      </motion.button>
    </div>
  )
}
