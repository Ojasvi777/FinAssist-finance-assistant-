import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { apiService, SourceMetadata, Message, Conversation } from '../services/api'

export interface ToastInfo {
  message: string
  type: 'success' | 'error' | 'info'
}

interface AppContextType {
  theme: 'light' | 'dark'
  toggleTheme: () => void
  user: { id: string; email: string; name: string; avatar?: string } | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
  conversations: Conversation[]
  currentConversationId: string | null
  setCurrentConversationId: (id: string | null) => void
  loading: boolean
  sources: SourceMetadata[]
  addConversation: () => Promise<string>
  deleteConversation: (id: string) => Promise<void>
  renameConversation: (id: string, title: string) => Promise<void>
  pinConversation: (id: string, pin: boolean) => Promise<void>
  sendMessage: (text: string) => Promise<void>
  regenerateResponse: () => Promise<void>
  stopGenerating: () => void
  toast: ToastInfo | null
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void
  clearToast: () => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  loadActiveChatMessages: (id: string) => Promise<void>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme')
    return (saved as 'light' | 'dark') || 'dark'
  })

  // Auth State
  const [user, setUser] = useState<{ id: string; email: string; name: string; avatar?: string } | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [authLoading, setAuthLoading] = useState<boolean>(true)

  // Chat States
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [sources, setSources] = useState<SourceMetadata[]>([])
  const [toast, setToast] = useState<ToastInfo | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const abortControllerRef = useRef<AbortController | null>(null)

  // 1. Initial Authentication Check
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken')
      if (token) {
        try {
          const profile = await apiService.getMe()
          setUser(profile)
          setIsAuthenticated(true)
          showToast(`Welcome back, ${profile.name}`, 'success')
        } catch (e) {
          console.warn('Invalid auth token, logging out')
          localStorage.removeItem('authToken')
          setIsAuthenticated(false)
        }
      }
      setAuthLoading(false)
    }
    checkAuth()
  }, [])

  // 2. Fetch conversations when authenticated
  useEffect(() => {
    const loadConversations = async () => {
      if (isAuthenticated) {
        try {
          const list = await apiService.getConversations()
          setConversations(list)
          if (list.length > 0) {
            const lastActive = localStorage.getItem('currentConversationId')
            const exists = list.some((c) => c.id === lastActive)
            const defaultId = exists ? lastActive : list[0].id
            setCurrentConversationId(defaultId)
            if (defaultId) {
              await loadActiveChatMessages(defaultId)
            }
          } else {
            // Create a default one if none exist
            await addConversation()
          }
        } catch (e) {
          console.error('Failed to load conversations', e)
        }
      } else {
        setConversations([])
        setCurrentConversationId(null)
      }
    }
    loadConversations()
  }, [isAuthenticated])

  // Sync active message changes on click
  const loadActiveChatMessages = async (convId: string) => {
    setLoading(true)
    try {
      const msgs = await apiService.getMessages(convId)
      setConversations((prev) =>
        prev.map((c) => (c.id === convId ? { ...c, messages: msgs } : c))
      )
      // Pick last message sources if any
      const lastAssistantMsg = [...msgs].reverse().find((m) => m.sender === 'assistant')
      if (lastAssistantMsg && lastAssistantMsg.sources) {
        setSources(lastAssistantMsg.sources)
      } else {
        setSources([])
      }
    } catch (e) {
      console.error('Failed to fetch messages', e)
    } finally {
      setLoading(false)
    }
  }

  // 3. Persist Theme Class
  useEffect(() => {
    localStorage.setItem('theme', theme)
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  // Persist currentConversationId
  useEffect(() => {
    if (currentConversationId) {
      localStorage.setItem('currentConversationId', currentConversationId)
    } else {
      localStorage.removeItem('currentConversationId')
    }
  }, [currentConversationId])

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 't') {
        e.preventDefault()
        toggleTheme()
      }
      if (e.altKey && e.key.toLowerCase() === 'n') {
        e.preventDefault()
        addConversation()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [theme])

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(nextTheme)
    showToast(`Theme toggled to ${nextTheme}`, 'info')
    // Sync with backend if logged in
    if (isAuthenticated) {
      apiService.updateSettings({ theme: nextTheme }).catch(console.error)
    }
  }

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type })
  }

  const clearToast = () => setToast(null)

  // Auth Operations
  const login = async (email: string, password: string) => {
    try {
      const data = await apiService.login(email, password)
      setUser(data.user)
      setIsAuthenticated(true)
      showToast('Logged in successfully', 'success')
    } catch (e: any) {
      const msg = e.response?.data?.detail || 'Authentication failed'
      showToast(msg, 'error')
      throw new Error(msg)
    }
  }

  const register = async (email: string, password: string, name: string) => {
    try {
      const data = await apiService.register(email, password, name)
      setUser(data.user)
      setIsAuthenticated(true)
      showToast('Account registered successfully', 'success')
    } catch (e: any) {
      const msg = e.response?.data?.detail || 'Registration failed'
      showToast(msg, 'error')
      throw new Error(msg)
    }
  }

  const logout = () => {
    apiService.logout()
    setUser(null)
    setIsAuthenticated(false)
    setConversations([])
    setCurrentConversationId(null)
    showToast('Logged out successfully', 'info')
  }

  // Conversation logs synchronizer
  const addConversation = async () => {
    if (!isAuthenticated) return ''
    try {
      const newConv = await apiService.createConversation()
      setConversations((prev) => [newConv, ...prev])
      setCurrentConversationId(newConv.id)
      showToast('New chat session created', 'success')
      return newConv.id
    } catch (e) {
      console.error('Failed to create conversation', e)
      showToast('Error creating conversation', 'error')
      return ''
    }
  }

  const deleteConversation = async (id: string) => {
    if (!isAuthenticated) return
    try {
      await apiService.deleteConversation(id)
      setConversations((prev) => {
        const filtered = prev.filter((c) => c.id !== id)
        if (currentConversationId === id) {
          setCurrentConversationId(filtered.length > 0 ? filtered[0].id : null)
        }
        return filtered
      })
      showToast('Chat deleted', 'info')
    } catch (e) {
      console.error('Failed to delete chat', e)
    }
  }

  const renameConversation = async (id: string, title: string) => {
    if (!isAuthenticated || !title.trim()) return
    try {
      await apiService.updateConversation(id, { title: title.trim() })
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, title: title.trim() } : c))
      )
      showToast('Chat renamed', 'success')
    } catch (e) {
      console.error('Failed to rename chat', e)
    }
  }

  const pinConversation = async (id: string, pin: boolean) => {
    if (!isAuthenticated) return
    try {
      await apiService.updateConversation(id, { is_pinned: pin })
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, isPinned: pin } : c))
      )
      showToast(pin ? 'Chat pinned' : 'Chat unpinned', 'info')
    } catch (e) {
      console.error('Failed to pin chat', e)
    }
  }

  const sendMessage = async (text: string) => {
    if (!text.trim() || !currentConversationId || !isAuthenticated) return

    // 1. Instantly append user message in local client list
    const userMsg: Message = {
      id: `user-temp-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setConversations((prev) =>
      prev.map((c) =>
        c.id === currentConversationId
          ? {
              ...c,
              messages: [...(c.messages || []), userMsg],
              title: c.title === 'New Chat Session' ? (text.length > 25 ? text.substring(0, 25) + '...' : text) : c.title,
            }
          : c
      )
    )

    setLoading(true)
    setSources([])
    abortControllerRef.current = new AbortController()

    try {
      const data = await apiService.sendMessage(currentConversationId, text.trim(), abortControllerRef.current.signal)
      
      // Update with final verified messages from backend database
      setConversations((prev) =>
        prev.map((c) =>
          c.id === currentConversationId
            ? {
                ...c,
                messages: [
                  ...(c.messages || []).filter(m => !m.id.startsWith('user-temp')),
                  data.user_message,
                  data.assistant_message
                ]
              }
            : c
        )
      )
      setSources(data.assistant_message.sources || [])
    } catch (e: any) {
      if (axios.isCancel(e) || e.name === 'AbortError') {
        showToast('Generation cancelled', 'info')
        return
      }
      console.error('Send message failed', e)
      showToast('Error connecting to advisor endpoint', 'error')
    } finally {
      setLoading(false)
      abortControllerRef.current = null
    }
  }

  const regenerateResponse = async () => {
    const activeConv = conversations.find((c) => c.id === currentConversationId)
    if (!activeConv || !activeConv.messages || activeConv.messages.length < 2) return

    // Slice last assistant message
    const msgList = [...activeConv.messages]
    let lastUserIdx = -1
    for (let i = msgList.length - 1; i >= 0; i--) {
      if (msgList[i].sender === 'user') {
        lastUserIdx = i
        break
      }
    }

    if (lastUserIdx === -1) return
    const queryText = msgList[lastUserIdx].text
    
    // Trim local messages to that user message
    const trimmed = msgList.slice(0, lastUserIdx)
    setConversations((prev) =>
      prev.map((c) => (c.id === currentConversationId ? { ...c, messages: trimmed } : c))
    )

    await sendMessage(queryText)
  }

  const stopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }

  if (authLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-400">
        <div className="w-9 h-9 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
        <span className="text-xs font-bold font-mono tracking-widest uppercase animate-pulse">Initializing Session...</span>
      </div>
    )
  }

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        user,
        isAuthenticated,
        login,
        register,
        logout,
        conversations,
        currentConversationId,
        setCurrentConversationId,
        loading,
        sources,
        addConversation,
        deleteConversation,
        renameConversation,
        pinConversation,
        sendMessage,
        regenerateResponse,
        stopGenerating,
        toast,
        showToast,
        clearToast,
        searchQuery,
        setSearchQuery,
        loadActiveChatMessages,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used inside AppProvider')
  return context
}
