import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Sparkles, Sun, Moon, Home, MessageSquare, Database, Info, GitBranch, TrendingUp } from 'lucide-react'
import { useApp } from '../../context/AppContext'

export const CommandPalette: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  
  const { toggleTheme, theme, addConversation } = useApp()
  const navigate = useNavigate()
  const listRef = useRef<HTMLDivElement>(null)

  // Listen for Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      } else if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const actions = [
    {
      id: 'new-chat',
      title: 'New Chat Session',
      subtitle: 'Create a new financial AI conversation',
      icon: <Sparkles className="w-4 h-4 text-emerald-500" />,
      perform: () => {
        addConversation()
        navigate('/chat')
        setIsOpen(false)
      }
    },
    {
      id: 'toggle-theme',
      title: `Toggle Theme`,
      subtitle: `Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`,
      icon: theme === 'light' ? <Moon className="w-4 h-4 text-indigo-500" /> : <Sun className="w-4 h-4 text-yellow-500" />,
      perform: () => {
        toggleTheme()
        setIsOpen(false)
      }
    },
    {
      id: 'go-landing',
      title: 'Go to Home',
      subtitle: 'Return to marketing landing page',
      icon: <Home className="w-4 h-4 text-slate-500" />,
      perform: () => {
        navigate('/')
        setIsOpen(false)
      }
    },
    {
      id: 'go-chat',
      title: 'Go to AI Chat',
      subtitle: 'Chat with Amex Financial RAG assistant',
      icon: <MessageSquare className="w-4 h-4 text-blue-500" />,
      perform: () => {
        navigate('/chat')
        setIsOpen(false)
      }
    },
    {
      id: 'go-dashboard',
      title: 'Go to Spend Optimizer',
      subtitle: 'View card multipliers & track budget',
      icon: <TrendingUp className="w-4 h-4 text-emerald-500" />,
      perform: () => {
        navigate('/dashboard')
        setIsOpen(false)
      }
    },
    {
      id: 'go-workflow',
      title: 'Go to Workflow',
      subtitle: 'View animated data crawling pipeline',
      icon: <GitBranch className="w-4 h-4 text-purple-500" />,
      perform: () => {
        navigate('/workflow')
        setIsOpen(false)
      }
    },
    {
      id: 'go-sources',
      title: 'Go to Sources',
      subtitle: 'Browse crawled and indexed vectors',
      icon: <Database className="w-4 h-4 text-orange-500" />,
      perform: () => {
        navigate('/sources')
        setIsOpen(false)
      }
    },
    {
      id: 'go-about',
      title: 'Go to About',
      subtitle: 'Read details on RAG & FAISS details',
      icon: <Info className="w-4 h-4 text-cyan-500" />,
      perform: () => {
        navigate('/about')
        setIsOpen(false)
      }
    }
  ]

  const filtered = actions.filter((act) =>
    act.title.toLowerCase().includes(search.toLowerCase()) ||
    act.subtitle.toLowerCase().includes(search.toLowerCase())
  )

  useEffect(() => {
    setSelectedIndex(0)
  }, [search])

  const handleActionKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % filtered.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % filtered.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].perform()
      }
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-md dark:bg-black/70"
          />

          {/* Dialog */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Input */}
            <div className="flex items-center gap-3 px-4 border-b border-slate-100 dark:border-slate-800">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleActionKeyDown}
                placeholder="Search commands (e.g. chat, theme)..."
                className="w-full py-4 text-sm bg-transparent outline-none text-slate-800 dark:text-slate-200"
              />
              <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-400 font-mono">ESC</span>
            </div>

            {/* List */}
            <div ref={listRef} className="max-h-[300px] overflow-y-auto p-2 flex flex-col gap-1">
              {filtered.length === 0 ? (
                <div className="py-8 text-center text-sm text-slate-400">
                  No commands found
                </div>
              ) : (
                filtered.map((act, idx) => {
                  const active = selectedIndex === idx
                  return (
                    <button
                      key={act.id}
                      onClick={act.perform}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                        active
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700">
                        {act.icon}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold">{act.title}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{act.subtitle}</div>
                      </div>
                      {active && (
                        <span className="text-[10px] text-slate-400 bg-white dark:bg-slate-900 px-1.5 py-0.5 border border-slate-200 dark:border-slate-700 rounded shadow-sm">
                          Enter
                        </span>
                      )}
                    </button>
                  )
                })
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center text-[10px] text-slate-400">
              <div className="flex gap-2">
                <span>↑↓ navigate</span>
                <span>↵ select</span>
              </div>
              <span>Ctrl+K to toggle</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
