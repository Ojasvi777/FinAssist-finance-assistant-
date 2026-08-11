import React, { useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface MarkdownProps {
  content: string
}

export const Markdown: React.FC<MarkdownProps> = ({ content }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const handleCopyCode = (text: string, idx: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(idx)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  if (!content) return null

  // Simple and highly effective regex-based parser
  // First, let's look for code blocks: ```lang\ncode\n```
  const parts = content.split(/(```[\s\S]*?```)/g)

  return (
    <div className="space-y-3 font-body text-slate-800 dark:text-slate-200">
      {parts.map((part, idx) => {
        if (part.startsWith('```')) {
          // It's a code block
          const lines = part.split('\n')
          const header = lines[0].replace('```', '').trim()
          const language = header || 'code'
          const codeText = lines.slice(1, lines.length - 1).join('\n')

          return (
            <div
              key={idx}
              className="my-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-100 overflow-hidden shadow-sm font-mono text-xs"
            >
              <div className="flex items-center justify-between px-4 py-2 bg-slate-950/80 border-b border-slate-800 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                <span>{language}</span>
                <button
                  type="button"
                  onClick={() => handleCopyCode(codeText, idx)}
                  className="flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  {copiedIndex === idx ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 overflow-x-auto leading-relaxed">
                <code>{codeText}</code>
              </pre>
            </div>
          )
        }

        // It's normal text, parse line by line
        const lines = part.split('\n')
        return (
          <div key={idx} className="space-y-2">
            {lines.map((line, lidx) => {
              const trimmed = line.trim()
              if (!trimmed) return <div key={lidx} className="h-2" />

              // Check for Headings
              if (trimmed.startsWith('# ')) {
                return (
                  <h1 key={lidx} className="text-xl font-extrabold text-slate-950 dark:text-white mt-4 mb-2">
                    {parseInline(trimmed.substring(2))}
                  </h1>
                )
              }
              if (trimmed.startsWith('## ')) {
                return (
                  <h2 key={lidx} className="text-lg font-bold text-slate-900 dark:text-white mt-3 mb-2">
                    {parseInline(trimmed.substring(3))}
                  </h2>
                )
              }
              if (trimmed.startsWith('### ')) {
                return (
                  <h3 key={lidx} className="text-base font-bold text-slate-800 dark:text-slate-100 mt-2 mb-1">
                    {parseInline(trimmed.substring(4))}
                  </h3>
                )
              }

              // Check for Bullet Lists
              if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
                return (
                  <ul key={lidx} className="list-disc pl-6 space-y-1 my-1">
                    <li className="text-sm text-slate-750 dark:text-slate-300">
                      {parseInline(trimmed.substring(2))}
                    </li>
                  </ul>
                )
              }

              // Check for Numbered Lists
              const numMatch = trimmed.match(/^(\d+)\.\s(.*)/)
              if (numMatch) {
                return (
                  <ol key={lidx} className="list-decimal pl-6 space-y-1 my-1">
                    <li className="text-sm text-slate-750 dark:text-slate-300">
                      {parseInline(numMatch[2])}
                    </li>
                  </ol>
                )
              }

              // Default Paragraph
              return (
                <p key={lidx} className="text-sm text-slate-750 dark:text-slate-300 leading-relaxed">
                  {parseInline(line)}
                </p>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

// Function to parse inline bold (**text**) and code (`code`)
function parseInline(text: string): React.ReactNode[] {
  // Regex to split by bold (**), italics (* or _), or inline code (`)
  const regex = /(\*\*.*?\*\*|`.*?`)/g
  const parts = text.split(regex)

  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={idx} className="font-extrabold text-slate-950 dark:text-white">
          {part.slice(2, -2)}
        </strong>
      )
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={idx} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 font-mono text-xs text-blue-600 dark:text-blue-400">
          {part.slice(1, -1)}
        </code>
      )
    }
    return part
  })
}
