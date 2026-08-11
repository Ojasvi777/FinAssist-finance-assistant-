import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Menu,
  X,
  Sparkles,
  MessageSquare,
  Trash2,
  Edit2,
  Check,
  Sun,
  Moon,
  Home,
  Info,
  GitBranch,
  Database,
  Search,
  ChevronDown,
  User,
  Plus,
  TrendingUp,
  Settings as SettingsIcon
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { Conversation } from '../../services/api'

interface AppLayoutProps {
  children: React.ReactNode
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const {
    theme,
    toggleTheme,
    conversations,
    currentConversationId,
    setCurrentConversationId,
    addConversation,
    deleteConversation,
    renameConversation,
    user,
    logout
  } = useApp()

  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchFilter, setSearchFilter] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)

  const menuItems = [
    { path: '/', label: 'Home', icon: <Home className="w-4 h-4" /> },
    { path: '/chat', label: 'AI Advisor', icon: <MessageSquare className="w-4 h-4" /> },
    { path: '/dashboard', label: 'Optimizer', icon: <TrendingUp className="w-4 h-4" /> },
    { path: '/workflow', label: 'Workflow', icon: <GitBranch className="w-4 h-4" /> },
    { path: '/sources', label: 'Sources', icon: <Database className="w-4 h-4" /> },
    { path: '/about', label: 'About', icon: <Info className="w-4 h-4" /> },
    { path: '/settings', label: 'Settings', icon: <SettingsIcon className="w-4 h-4" /> },
  ]

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchFilter.toLowerCase())
  )

  const handleStartRename = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingId(conv.id)
    setEditTitle(conv.title)
  }

  const handleSaveRename = (id: string, e: React.FormEvent) => {
    e.preventDefault()
    renameConversation(id, editTitle)
    setEditingId(null)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-300">
      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 backdrop-blur-md z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-lg tracking-tight">FinAssist</span>
        </div>
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
        >
          <Menu className="w-6 h-6" />
        </button>
      </header>

      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 z-30">
        {/* Brand */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-200 dark:border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="font-extrabold text-sm tracking-tight leading-none">FinAssist</div>
            <div className="text-[10px] text-slate-400 font-medium mt-1">Smart RAG Advisor</div>
          </div>
        </div>

        {/* Global Navigation */}
        <nav className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col gap-1">
          {menuItems.map((item) => {
            const active = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                  active
                    ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 shadow-sm border border-blue-100 dark:border-blue-900/50'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Chat History Section */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="px-5 pt-4 pb-2 flex items-center justify-between text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            <span>Conversations</span>
            <button
              onClick={() => {
                addConversation()
                navigate('/chat')
              }}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-500 hover:text-blue-600"
              title="New Conversation"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Search sessions */}
          <div className="px-4 mb-2">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5" />
              <input
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search history..."
                className="w-full text-xs py-1.5 pl-8 pr-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 outline-none text-slate-700 dark:text-slate-300 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Scroll List */}
          <div className="flex-1 overflow-y-auto px-2 flex flex-col gap-0.5">
            {filteredConversations.map((conv) => {
              const active = currentConversationId === conv.id && location.pathname === '/chat'
              const editing = editingId === conv.id
              return (
                <div
                  key={conv.id}
                  onClick={() => {
                    setCurrentConversationId(conv.id)
                    if (location.pathname !== '/chat') navigate('/chat')
                  }}
                  className={`group relative flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                    active
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/30'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <MessageSquare className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    {editing ? (
                      <form
                        onSubmit={(e) => handleSaveRename(conv.id, e)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full flex items-center"
                      >
                        <input
                          autoFocus
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 border border-blue-500 rounded px-1 text-slate-800 dark:text-slate-200 outline-none"
                        />
                        <button type="submit" className="p-0.5 text-emerald-500 hover:text-emerald-600 ml-1">
                          <Check className="w-3 h-3" />
                        </button>
                      </form>
                    ) : (
                      <span className="truncate pr-4">{conv.title}</span>
                    )}
                  </div>

                  {!editing && (
                    <div className="absolute right-2 opacity-0 group-hover:opacity-100 flex items-center gap-1 bg-gradient-to-l from-slate-50 to-transparent group-hover:from-slate-100 dark:group-hover:from-slate-800 pl-4 py-0.5">
                      <button
                        onClick={(e) => handleStartRename(conv, e)}
                        className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                        title="Rename"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteConversation(conv.id)
                        }}
                        className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-rose-500"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer info: Dark toggle & Profile */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/30">
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 hover:text-blue-500 transition-colors"
            title="Toggle theme (Ctrl+K)"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          <div className="relative">
            <button
              onClick={() => setProfileMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-left"
            >
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-6 h-6 rounded-full object-cover" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-black text-white uppercase font-mono">
                  {user?.name?.substring(0, 2) || 'US'}
                </div>
              )}
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Profile Dropdown */}
            <AnimatePresence>
              {profileMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileMenuOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-12 right-0 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 p-1"
                  >
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-850">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{user?.name || 'Demo User'}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 truncate">{user?.email || 'demo@example.com'}</div>
                    </div>
                    <button
                      onClick={() => {
                        navigate('/settings')
                        setProfileMenuOpen(false)
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-left mt-1"
                    >
                      <User className="w-3.5 h-3.5 text-blue-500" /> Profile Settings
                    </button>
                    <button
                      onClick={() => {
                        logout()
                        setProfileMenuOpen(false)
                        navigate('/login')
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg text-left mt-0.5 border-t border-slate-100 dark:border-slate-850"
                    >
                      Sign Out
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <div className="md:hidden fixed inset-0 z-50">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="absolute inset-0 bg-slate-900/50 dark:bg-black/70 backdrop-blur-sm"
            />

            {/* Content Drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="absolute top-0 bottom-0 left-0 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col"
            >
              {/* Header */}
              <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <span className="font-extrabold text-sm tracking-tight">FinAssist</span>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation */}
              <nav className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col gap-1">
                {menuItems.map((item) => {
                  const active = location.pathname === item.path
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                        active
                          ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 shadow-sm border border-blue-100 dark:border-blue-900/50'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  )
                })}
              </nav>

              {/* Chat History scroll list */}
              <div className="flex-1 overflow-y-auto p-4 min-h-0 flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                  <span>Chat Sessions</span>
                  <button
                    onClick={() => {
                      addConversation()
                      setSidebarOpen(false)
                      navigate('/chat')
                    }}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {filteredConversations.map((conv) => {
                  const active = currentConversationId === conv.id && location.pathname === '/chat'
                  return (
                    <div
                      key={conv.id}
                      onClick={() => {
                        setCurrentConversationId(conv.id)
                        setSidebarOpen(false)
                        if (location.pathname !== '/chat') navigate('/chat')
                      }}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium cursor-pointer ${
                        active
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      <span className="truncate">{conv.title}</span>
                    </div>
                  )
                })}
              </div>

              {/* Mobile Footer */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/30">
                <button
                  onClick={toggleTheme}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500"
                >
                  {theme === 'light' ? <Moon className="w-4.5 h-4.5" /> : <Sun className="w-4.5 h-4.5" />}
                </button>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{user?.name || 'Demo User'}</div>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 md:pt-0 pt-16">
        <div className="flex-1 overflow-y-auto relative">
          {children}
        </div>
      </div>
    </div>
  )
}
