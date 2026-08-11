import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  Paperclip,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  ArrowUp,
  RotateCcw,
  Copy,
  Check,
  StopCircle,
  ExternalLink,
  ChevronRight,
  BookOpen,
  X,
  Bookmark,
  ThumbsUp,
  ThumbsDown,
  Download
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { Markdown } from '../components/common/Markdown'

const SUGGESTED_QUESTIONS = [
  'What are the benefits of the Platinum Card?',
  'How do I earn 4X Membership Rewards points?',
  'List airport lounges included in travel benefits.',
  'How do airline fee credits work?'
]

const QUICK_TEMPLATES = [
  { title: ' lounge access', desc: 'Query airport lounge rules & guest privileges' },
  { title: '4x points advice', desc: 'Identify food and dining point multipliers' },
  { title: 'credits checklist', desc: 'Verify statement credit reconciliation rules' }
]

export const ChatPage: React.FC = () => {
  const {
    conversations,
    currentConversationId,
    sendMessage,
    loading,
    regenerateResponse,
    stopGenerating,
    showToast,
    sources
  } = useApp()

  const [input, setInput] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [showSourcesPanel, setShowSourcesPanel] = useState(true)

  // Speech Recognition (Web Speech API)
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<any>(null)

  // Speech Synthesis (Text to Speech)
  const [speakingId, setSpeakingId] = useState<string | null>(null)
  const [likedMessages, setLikedMessages] = useState<Record<string, 'like' | 'dislike'>>({})

  const handleExportChat = () => {
    if (!activeConv?.messages) return
    const textData = JSON.stringify(activeConv.messages, null, 2)
    const blob = new Blob([textData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${activeConv.title.replace(/\s+/g, '-').toLowerCase()}-history.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast('Exported chat history successfully!', 'success')
  }

  const handleLikeMessage = (id: string, type: 'like' | 'dislike') => {
    setLikedMessages((prev) => ({ ...prev, [id]: type }))
    showToast(type === 'like' ? 'Thank you for your feedback!' : 'Feedback submitted.', 'success')
  }

  const activeConv = conversations.find((c) => c.id === currentConversationId)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeConv?.messages, loading])

  // Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (SpeechRecognition) {
      const rec = new SpeechRecognition()
      rec.continuous = false
      rec.interimResults = false
      rec.lang = 'en-US'

      rec.onresult = (e: any) => {
        const transcript = e.results[0][0].transcript
        setInput((prev) => prev + (prev ? ' ' : '') + transcript)
        setIsListening(false)
        showToast('Voice search text captured!', 'success')
      }

      rec.onerror = () => {
        setIsListening(false)
        showToast('Speech recognition error. Try speaking closer to mic.', 'error')
      }

      rec.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current = rec
    }
  }, [])

  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
      showToast('Speech recognition not supported in this browser.', 'info')
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      setIsListening(true)
      recognitionRef.current.start()
    }
  }

  // Speak response aloud
  const handleSpeak = (text: string, msgId: string) => {
    if (speakingId === msgId) {
      window.speechSynthesis.cancel()
      setSpeakingId(null)
      return
    }

    window.speechSynthesis.cancel()
    const cleanText = text.replace(/[*#`_\-]/g, '') // strip markdown
    const utterance = new SpeechSynthesisUtterance(cleanText)

    utterance.onend = () => {
      setSpeakingId(null)
    }

    utterance.onerror = () => {
      setSpeakingId(null)
    }

    setSpeakingId(msgId)
    window.speechSynthesis.speak(utterance)
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return
    const text = input.trim()
    setInput('')
    await sendMessage(text)
  }

  const handleCopyMessage = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    showToast('Copied text to clipboard', 'success')
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] md:h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 relative overflow-hidden">
      
      {/* Main Chat Workspace */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative border-r border-slate-200/50 dark:border-slate-800/50">
        
        {/* Top Header Bar */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md z-10 shrink-0">
          <div>
            <h2 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm md:text-base leading-none flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {activeConv?.title || 'Chat Workspace'}
            </h2>
            <p className="text-[10px] text-slate-400 mt-1.5 leading-none font-medium">Grounded RAG Pipeline Session</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportChat}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold transition-all text-slate-500 flex items-center gap-1.5"
              title="Export chat as JSON"
            >
              <Download className="w-3.5 h-3.5 text-blue-550" />
              <span className="hidden sm:inline">Export Chat</span>
            </button>
            <button
              onClick={() => setShowSourcesPanel((prev) => !prev)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                showSourcesPanel
                  ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/50 shadow-sm'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500'
              }`}
              title="Toggle sources panel"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sources Pane</span>
            </button>
          </div>
        </div>

        {/* Chat Stream Window */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth">
          {!activeConv || activeConv.messages.length <= 1 ? (
            /* Empty State Container */
            <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto text-center px-4 py-8">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20"
              >
                <Sparkles className="w-5.5 h-5.5 animate-pulse" />
              </motion.div>
              
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                AmEx FinAssist AI
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-3 leading-relaxed max-w-md">
                Grounded in official American Express card terms. Ask about dining multipliers, lounge access criteria, or statement credits.
              </p>

              {/* Templates */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full mt-10">
                {QUICK_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.title}
                    onClick={() => setInput(`Give me details on ${tmpl.title}`)}
                    className="p-3.5 text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 hover:border-blue-500 dark:hover:border-blue-600 rounded-2xl transition-all shadow-sm flex flex-col justify-between group"
                  >
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 capitalize flex items-center gap-1.5">
                      <Bookmark className="w-3.5 h-3.5 text-blue-500" />
                      {tmpl.title}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-2 font-medium leading-relaxed">{tmpl.desc}</span>
                  </button>
                ))}
              </div>

              {/* Suggested Prompts list */}
              <div className="w-full mt-8 border-t border-slate-200/50 dark:border-slate-800/50 pt-8">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-4">Suggested questions</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => setInput(q)}
                      className="px-4 py-2.5 text-left bg-slate-50 hover:bg-blue-50/30 dark:bg-slate-900/50 dark:hover:bg-blue-950/20 border border-slate-200/40 dark:border-slate-800/40 hover:border-blue-500/50 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 transition-all flex items-center justify-between"
                    >
                      <span className="truncate pr-3">{q}</span>
                      <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Active Message List */
            <div className="max-w-3xl mx-auto space-y-6">
              {activeConv.messages.map((msg) => {
                const isUser = msg.sender === 'user'
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex items-start gap-4 ${isUser ? 'flex-row-reverse' : ''}`}
                  >
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center font-bold text-xs shadow-sm ${
                      isUser
                        ? 'bg-blue-600 text-white'
                        : 'bg-gradient-to-br from-indigo-500 to-blue-600 text-white'
                    }`}>
                      {isUser ? 'U' : <Sparkles className="w-4 h-4" />}
                    </div>

                    {/* Bubble Content */}
                    <div className="flex-1 flex flex-col gap-1 min-w-0">
                      <div className={`p-4 md:p-5 rounded-2xl border text-sm max-w-[88%] shadow-sm leading-relaxed transition-all duration-300 ${
                        isUser
                          ? 'bg-blue-600 text-white border-blue-500 self-end rounded-tr-none'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-850 text-slate-800 dark:text-slate-200 self-start rounded-tl-none'
                      }`}>
                        {isUser ? (
                          <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                        ) : (
                          <Markdown content={msg.text} />
                        )}

                        {/* Inline sources display */}
                        {!isUser && msg.sources && msg.sources.length > 0 && (
                          <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/80">
                            <div className="text-[10px] uppercase font-extrabold tracking-wider text-slate-450 mb-2">Verified references</div>
                            <div className="flex flex-wrap gap-2">
                              {msg.sources.map((s, sidx) => (
                                <a
                                  key={sidx}
                                  href={s.url.startsWith('http') ? s.url : `https://${s.url}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 text-[10px] font-bold text-blue-650 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/30 px-2 py-1 rounded-lg hover:bg-blue-100/50"
                                  title={`${s.title} (Page ${s.page}) - Similarity: ${s.score} - Confidence: ${s.confidence}%`}
                                >
                                  <span className="text-[8px] font-mono px-1 bg-blue-600 dark:bg-blue-500 text-white rounded font-extrabold">{s.citation}</span>
                                  <span className="max-w-[120px] truncate">{s.title}</span>
                                  <span className="text-slate-400 text-[9px] font-medium">p. {s.page}</span>
                                  <ExternalLink className="w-2.5 h-2.5 text-blue-500" />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Small Actions list under bubbles */}
                      <div className={`flex items-center gap-2.5 mt-1 px-1 ${isUser ? 'justify-end mr-1' : 'justify-start ml-1'}`}>
                        <span className="text-[9px] text-slate-400 font-medium">{msg.timestamp}</span>
                        {!isUser && (
                          <>
                            <span className="text-slate-300 dark:text-slate-800">•</span>
                            <button
                              onClick={() => handleCopyMessage(msg.text, msg.id)}
                              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-700 transition-colors"
                              title="Copy text"
                            >
                              {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => handleSpeak(msg.text, msg.id)}
                              className={`p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors ${
                                speakingId === msg.id ? 'text-blue-500 animate-pulse' : 'hover:text-slate-700'
                              }`}
                              title="Speak aloud"
                            >
                              {speakingId === msg.id ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => handleLikeMessage(msg.id, 'like')}
                              className={`p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors ${
                                likedMessages[msg.id] === 'like' ? 'text-blue-550' : 'text-slate-400 hover:text-slate-700'
                              }`}
                              title="Like response"
                            >
                              <ThumbsUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleLikeMessage(msg.id, 'dislike')}
                              className={`p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors ${
                                likedMessages[msg.id] === 'dislike' ? 'text-rose-500' : 'text-slate-400 hover:text-slate-700'
                              }`}
                              title="Dislike response"
                            >
                              <ThumbsDown className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}

              {/* Stream Typing Skeleton Loader */}
              {loading && (
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="p-4 rounded-2xl rounded-tl-none border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 shadow-sm max-w-[80%] space-y-2.5 py-4 w-64 animate-pulse">
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-5/6" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Chat Input Container */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
          <div className="max-w-3xl mx-auto flex flex-col gap-2">
            
            {/* Toolbar Action bar */}
            {activeConv && activeConv.messages.length > 1 && (
              <div className="flex items-center justify-between px-1 text-[11px] font-semibold text-slate-400 shrink-0">
                <button
                  onClick={regenerateResponse}
                  disabled={loading}
                  className="hover:text-blue-500 disabled:opacity-50 flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Regenerate Response
                </button>

                {loading && (
                  <button
                    onClick={stopGenerating}
                    className="hover:text-rose-500 flex items-center gap-1 text-slate-500 transition-colors"
                  >
                    <StopCircle className="w-3.5 h-3.5" /> Stop Generating
                  </button>
                )}
              </div>
            )}

            {/* Input Bar Form */}
            <form
              onSubmit={handleSend}
              className="flex items-center gap-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-2xl focus-within:border-blue-500 dark:focus-within:border-blue-600 transition-colors shadow-sm"
            >
              <Paperclip className="w-5 h-5 text-slate-400 cursor-pointer hover:text-slate-600 pl-0.5" />
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about travel rewards or dining points..."
                className="flex-1 text-sm bg-transparent outline-none text-slate-850 dark:text-slate-200 px-2"
                disabled={loading}
              />

              {/* Dictation Trigger */}
              <button
                type="button"
                onClick={handleVoiceInput}
                className={`p-2 rounded-xl transition-all ${
                  isListening
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-350'
                }`}
                title="Voice Input"
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <button
                type="submit"
                disabled={!input.trim() || loading}
                className={`p-2 rounded-xl text-white shadow-sm flex items-center justify-center transition-all shrink-0 ${
                  input.trim() && !loading
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-slate-300 dark:bg-slate-800 cursor-not-allowed text-slate-400 dark:text-slate-500'
                }`}
              >
                <ArrowUp className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* RAG Sources Collapsible Right Sidebar */}
      <AnimatePresence>
        {showSourcesPanel && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="hidden lg:flex flex-col h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shrink-0 z-10"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">FAISS Context Cache</h3>
                <p className="text-[10px] text-slate-400 mt-1">Grounded vectors loaded this turn</p>
              </div>
              <button
                onClick={() => setShowSourcesPanel(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scroller list */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {sources.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4 select-none">
                  <BookOpen className="w-8 h-8 text-slate-200 dark:text-slate-800 mb-3" />
                  <div className="text-xs font-bold text-slate-500 dark:text-slate-400">No sources cached</div>
                  <p className="text-[10px] text-slate-400 mt-1 max-w-[180px] leading-relaxed">
                    Ask the AI advisor a question to trigger RAG vector lookup.
                  </p>
                </div>
              ) : (
                sources.map((s, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-slate-150 dark:border-slate-800 bg-slate-50/65 dark:bg-slate-900/50 hover:shadow-sm transition-all flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                      <span className="flex items-center gap-1">
                        <span className="px-1.5 py-0.5 bg-blue-600 text-white rounded text-[8px] font-mono font-extrabold">{s.citation}</span>
                        <span className="max-w-[150px] truncate text-slate-700 dark:text-slate-200">{s.title}</span>
                      </span>
                      <span className="text-blue-605 dark:text-blue-400">Match</span>
                    </div>

                    <div className="p-2 rounded-lg bg-white dark:bg-slate-950 text-[10.5px] text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-850 leading-relaxed max-h-24 overflow-y-auto">
                      "{s.text}"
                    </div>

                    <div className="flex justify-between items-center text-[9px] text-slate-400 font-medium">
                      <span>Retrieval Score: <strong className="text-slate-700 dark:text-slate-300 font-bold">{s.score}</strong></span>
                      <span>Confidence: <strong className="text-emerald-500 font-bold">{s.confidence}%</strong></span>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-850/80 pt-2 text-[10px]">
                      <span className="text-[9px] text-slate-400 font-medium">Page {s.page} of Document</span>
                      <a
                        href={s.url.startsWith('http') ? s.url : `https://${s.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Visit site <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
