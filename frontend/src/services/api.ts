import axios from 'axios'

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000'

const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Automatically attach JWT token to every request header if present in localStorage
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, (error) => {
  return Promise.reject(error)
})

export interface HistoryTurn {
  question: string
  answer: string
}

export interface SourceMetadata {
  text: string
  title: string
  url: string
  score: number
  confidence: number
  page: number
  citation: string
}

export interface ChatResponse {
  answer: string
  sources: SourceMetadata[]
}

export interface Message {
  id: string
  sender: 'user' | 'assistant'
  text: string
  timestamp: string
  sources?: SourceMetadata[]
}

export interface Conversation {
  id: string
  title: string
  isPinned: boolean
  createdAt: string
  messages: Message[]
}

export interface Expense {
  id?: string
  description: string
  amount: number
  category: string
  date: string
  payment_method: string
}

export interface CreditCard {
  id: string
  holderName: string
  cardNumber: string
  expiry: string
  cvv: string
  limit: number
  cardType: string
  currentStatement: number
  availableCredit: number
}

export interface RewardHistoryEntry {
  id: string
  points: number
  description: string
  date: string
}

export interface RewardsProfile {
  membershipRewardsBalance: number
  pointsEarnedFromSpend: number
  history: RewardHistoryEntry[]
}

export interface UserSettings {
  theme: string
  defaultCardId: string
  notificationsEnabled: boolean
}

export interface AnalyticsResponse {
  categories: Record<string, number>
  monthlyComparison: { month: string; total: number }[]
  weeklyComparison: { date: string; amount: number }[]
  forecastNextMonth: number
  budgets: Record<string, number>
}

export const apiService = {
  // Check backend health
  checkHealth: async () => {
    const response = await client.get<{ status: string }>('/health')
    return response.data
  },

  // Auth Operations
  register: async (email: string, password: string, name: string) => {
    const response = await client.post<{ token: string; user: { id: string; email: string; name: string } }>('/auth/register', { email, password, name })
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token)
    }
    return response.data
  },

  login: async (email: string, password: string) => {
    const response = await client.post<{ token: string; user: { id: string; email: string; name: string; avatar?: string } }>('/auth/login', { email, password })
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token)
    }
    return response.data
  },

  getMe: async () => {
    const response = await client.get<{ id: string; email: string; name: string; avatar?: string }>('/auth/me')
    return response.data
  },

  logout: async () => {
    localStorage.removeItem('authToken')
  },

  // Conversations CRUD
  getConversations: async () => {
    const response = await client.get<Conversation[]>('/conversations')
    return response.data
  },

  createConversation: async () => {
    const response = await client.post<Conversation>('/conversations')
    return response.data
  },

  updateConversation: async (id: string, payload: { title?: string; is_pinned?: boolean }) => {
    const response = await client.patch<{ status: string }>(`/conversations/${id}`, payload)
    return response.data
  },

  deleteConversation: async (id: string) => {
    const response = await client.delete<{ status: string; deleted_id: string }>(`/conversations/${id}`)
    return response.data
  },

  getMessages: async (convId: string) => {
    const response = await client.get<Message[]>(`/conversations/${convId}/messages`)
    return response.data
  },

  sendMessage: async (convId: string, text: string, signal?: AbortSignal) => {
    const response = await client.post<{ user_message: Message; assistant_message: Message }>(
      `/conversations/${convId}/messages`, 
      { text }, 
      { signal }
    )
    return response.data
  },

  // Tracked Expenses CRUD
  getExpenses: async () => {
    const response = await client.get<Expense[]>('/api/expenses')
    return response.data
  },

  addExpense: async (expense: Omit<Expense, 'id'>) => {
    const response = await client.post<Expense & { points_earned?: number }>('/api/expenses', expense)
    return response.data
  },

  deleteExpense: async (id: string) => {
    const response = await client.delete<{ status: string; deleted_id: string }>(`/api/expenses/${id}`)
    return response.data
  },

  aiParseExpense: async (text: string) => {
    const response = await client.post<Partial<Expense>>('/api/expenses/ai-parse', { text })
    return response.data
  },

  // Cards & Rewards
  getCards: async () => {
    const response = await client.get<CreditCard[]>('/cards')
    return response.data
  },

  getRewards: async () => {
    const response = await client.get<RewardsProfile>('/cards/rewards')
    return response.data
  },

  // User Settings
  getSettings: async () => {
    const response = await client.get<UserSettings>('/profile/settings')
    return response.data
  },

  updateSettings: async (settings: Partial<UserSettings>) => {
    const response = await client.patch<{ status: string }>('/profile/settings', {
      theme: settings.theme,
      default_card_id: settings.defaultCardId,
      notifications_enabled: settings.notificationsEnabled
    })
    return response.data
  },

  // Analytics
  getAnalytics: async () => {
    const response = await client.get<AnalyticsResponse>('/history/analytics')
    return response.data
  },

  // RAG Sources status
  getSourcesStatus: async () => {
    const response = await client.get<{ loadedDocumentsCount: number; provider: string }>('/sources/optimizer')
    return response.data
  }
}
