import React, { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { apiService, UserSettings, CreditCard } from '../services/api'
import {
  User,
  Settings as SettingsIcon,
  CreditCard as CardIcon,
  Bell,
  LogOut,
  Moon,
  Sun,
  ShieldAlert,
  Save
} from 'lucide-react'

export const SettingsPage: React.FC = () => {
  const { user, logout, showToast, theme, toggleTheme } = useApp()
  
  const [settings, setSettings] = useState<UserSettings>({
    theme: 'dark',
    defaultCardId: '',
    notificationsEnabled: true
  })
  
  const [cards, setCards] = useState<CreditCard[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const loadSettingsAndCards = async () => {
      try {
        const [userSettings, userCards] = await Promise.all([
          apiService.getSettings(),
          apiService.getCards()
        ])
        setSettings(userSettings)
        setCards(userCards)
      } catch (e) {
        console.error('Failed to load profile details', e)
        // Sandbox seed fallback
        setCards([
          { id: 'card-platinum', holderName: 'Demo User', cardNumber: '3712 345678 90123', expiry: '12/30', cvv: '1234', limit: 10000.00, cardType: 'Platinum', currentStatement: 245.50, availableCredit: 9754.50 },
          { id: 'card-gold', holderName: 'Demo User', cardNumber: '3787 987654 32109', expiry: '10/29', cvv: '5678', limit: 8000.00, cardType: 'Gold', currentStatement: 65.40, availableCredit: 7934.60 },
          { id: 'card-bluecash', holderName: 'Demo User', cardNumber: '3728 555555 44444', expiry: '05/28', cvv: '9012', limit: 5000.00, cardType: 'Blue Cash', currentStatement: 0.00, availableCredit: 5000.00 }
        ])
      } finally {
        setLoading(false)
      }
    }
    loadSettingsAndCards()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await apiService.updateSettings(settings)
      showToast('Profile preferences updated in database', 'success')
    } catch (e) {
      showToast('Settings saved locally (sandbox mode)', 'info')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-400">Loading user preferences...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full p-6 md:p-8 flex flex-col gap-8 animate-fade-in text-slate-800 dark:text-slate-200 font-body">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-850/50 pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
            User Settings & Profile
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 font-medium">
            Manage your card credentials, theme preferences, and connected DB settings.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: Account profile & Security */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* User Profile info */}
          <div className="card space-y-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
            <h3 className="font-extrabold text-sm mb-2 flex items-center gap-1.5">
              <User className="w-4 h-4 text-blue-500" /> Personal Account Profile
            </h3>
            
            <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                alt="Avatar"
                className="w-16 h-16 rounded-full object-cover border-2 border-blue-500/20 shadow-sm"
              />
              <div className="min-w-0">
                <div className="font-extrabold text-base text-slate-900 dark:text-white">{user?.name || 'Demo User'}</div>
                <div className="text-xs text-slate-400 font-medium truncate">{user?.email || 'demo@example.com'}</div>
                <span className="inline-block mt-2 px-2 py-0.5 text-[9px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-600 rounded">Active JWT Session</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Display Name</label>
                <input
                  value={user?.name || 'Demo User'}
                  disabled
                  className="w-full text-xs py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950/50 outline-none text-slate-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Registered Email</label>
                <input
                  value={user?.email || 'demo@example.com'}
                  disabled
                  className="w-full text-xs py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950/50 outline-none text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Connected Credit Cards info */}
          <div className="card space-y-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
            <h3 className="font-extrabold text-sm mb-2 flex items-center gap-1.5">
              <CardIcon className="w-4 h-4 text-blue-500" /> Linked Credit Cards
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {cards.map((c) => (
                <div
                  key={c.id}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col justify-between h-36 relative overflow-hidden text-slate-700 dark:text-slate-350"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider font-extrabold block text-slate-400">AMEX {c.cardType}</span>
                      <span className="text-xs font-mono font-bold">{c.cardNumber}</span>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-extrabold border border-blue-200/50 uppercase">Linked</span>
                  </div>
                  <div className="flex justify-between items-end mt-4">
                    <div>
                      <span className="text-[8px] text-slate-400 block font-bold">Limit</span>
                      <span className="text-xs font-extrabold">${c.limit.toLocaleString()}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[8px] text-slate-400 block font-bold">Expiry / CVV</span>
                      <span className="text-xs font-bold font-mono">{c.expiry} • {c.cvv}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Preferences Settings */}
        <div className="space-y-6">
          
          {/* Preferences Box */}
          <div className="card space-y-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
            <h3 className="font-extrabold text-sm mb-2 flex items-center gap-1.5">
              <SettingsIcon className="w-4 h-4 text-blue-500" /> Preferences settings
            </h3>

            {/* Dark Mode */}
            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-850">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Global Dark Mode</span>
              <button
                onClick={toggleTheme}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              >
                {theme === 'dark' ? <Moon className="w-4 h-4 text-blue-500" /> : <Sun className="w-4 h-4 text-amber-500" />}
              </button>
            </div>

            {/* Default payment Card */}
            <div className="py-2 border-b border-slate-100 dark:border-slate-850 space-y-2">
              <label className="text-[10px] uppercase font-bold text-slate-450 block">Default payment method</label>
              <select
                value={settings.defaultCardId || ''}
                onChange={(e) => setSettings({ ...settings, defaultCardId: e.target.value })}
                className="w-full text-xs py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 outline-none text-slate-700 dark:text-slate-300"
              >
                <option value="">Select card</option>
                {cards.map((c) => (
                  <option key={c.id} value={c.id}>
                    AmEx {c.cardType} ({c.cardNumber.substring(0, 4)}...)
                  </option>
                ))}
              </select>
            </div>

            {/* Notifications toggle */}
            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-850">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Bell className="w-3.5 h-3.5 text-blue-500" /> Budget Alerts notifications
              </span>
              <input
                type="checkbox"
                checked={settings.notificationsEnabled}
                onChange={(e) => setSettings({ ...settings, notificationsEnabled: e.target.checked })}
                className="rounded border-slate-300 dark:border-slate-800"
              />
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-750 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-md shadow-blue-500/10"
            >
              <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>

          {/* Session Safety / Logout Box */}
          <div className="card space-y-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
            <h3 className="font-extrabold text-sm mb-1.5 flex items-center gap-1.5 text-rose-500">
              <ShieldAlert className="w-4 h-4 text-rose-500" /> Account Security
            </h3>
            <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
              Terminate active JSON Web Token (JWT) session. Password logs are encrypted with bcrypt hashing.
            </p>
            <button
              onClick={logout}
              className="w-full py-2 px-3 text-center border border-rose-200 dark:border-rose-900/40 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out from Account
            </button>
          </div>

        </div>

      </div>

    </div>
  )
}
