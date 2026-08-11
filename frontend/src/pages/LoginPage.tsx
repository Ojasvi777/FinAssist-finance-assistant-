import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { motion } from 'framer-motion'
import { Sparkles, Mail, Lock, User, ArrowRight, Activity } from 'lucide-react'

export const LoginPage: React.FC = () => {
  const { login, register, isAuthenticated } = useApp()
  const navigate = useNavigate()
  
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  // Redirect if already logged in
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true)
    try {
      if (isRegister) {
        await register(email, password, name || 'Demo User')
      } else {
        await login(email, password)
      }
      navigate('/dashboard')
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 relative overflow-hidden font-body selection:bg-blue-600 selection:text-white p-4">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-500/5 dark:bg-blue-600/5 rounded-full filter blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-500/5 dark:bg-indigo-600/5 rounded-full filter blur-[120px] pointer-events-none -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 rounded-3xl border border-slate-200/60 dark:border-slate-850/80 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl shadow-2xl relative z-10 space-y-6"
      >
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-550/25">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-3">
            {isRegister ? 'Create your account' : 'Sign in to FinAssist'}
          </h2>
          <p className="text-xs text-slate-450 dark:text-slate-400 font-medium">
            Seeded sandbox environment linked to secure SQLite DB
          </p>
        </div>

        {/* Form fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {isRegister && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Demo User"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 outline-none focus:border-blue-500 text-slate-800 dark:text-slate-200"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="email"
                placeholder="demo@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 outline-none focus:border-blue-500 text-slate-800 dark:text-slate-200"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 outline-none focus:border-blue-500 text-slate-800 dark:text-slate-200"
                required
              />
            </div>
          </div>

          {!isRegister && (
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 pt-1">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" className="rounded border-slate-300 dark:border-slate-800" defaultChecked />
                <span>Remember me</span>
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-1 shadow-lg shadow-blue-550/20"
          >
            {loading ? 'Authenticating...' : isRegister ? 'Register Account' : 'Sign In'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Toggle link */}
        <div className="text-center pt-2 text-[11px] font-medium text-slate-500 dark:text-slate-400">
          {isRegister ? 'Already have an account? ' : "Don't have an account? "}
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="text-blue-600 dark:text-blue-450 hover:underline font-bold"
          >
            {isRegister ? 'Sign In' : 'Register Now'}
          </button>
        </div>

        {/* Quick Demo hint */}
        <div className="mt-4 p-3 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100/40 dark:border-blue-900/30 text-blue-700 dark:text-blue-400 text-[10px] font-semibold flex items-center gap-2">
          <Activity className="w-3.5 h-3.5" />
          <span>Demo creds: <strong>demo@example.com</strong> / <strong>password123</strong></span>
        </div>

      </motion.div>
    </div>
  )
}
