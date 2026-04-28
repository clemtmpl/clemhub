'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader2 } from 'lucide-react'
import { askCoach } from '../actions'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const QUICK_QUESTIONS = [
  'Comment améliorer mon temps en natation ?',
  'Que manger avant une longue sortie vélo ?',
  'Comment gérer la récupération après une semaine chargée ?',
  'Quels signes indiquent un surmenage ?',
  'Comment optimiser ma transition Vélo→Course ?',
]

export function CoachChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Bonjour ! Je suis ton coach triathlon IA. Je suis là pour t\'aider avec ta préparation Half Ironman. Qu\'est-ce que tu voudrais savoir ?',
    },
  ])
  const [input, setInput] = useState('')
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = (text: string) => {
    if (!text.trim() || pending) return
    setError(null)
    const userMsg: Message = { role: 'user', content: text.trim() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')

    startTransition(async () => {
      const result = await askCoach(newMessages)
      if ('error' in result && result.error) {
        setError(result.error)
      } else if ('message' in result && result.message) {
        setMessages((prev) => [...prev, { role: 'assistant', content: result.message! }])
      }
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Quick questions */}
      {messages.length === 1 && (
        <div className="flex flex-wrap gap-2">
          {QUICK_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => sendMessage(q)}
              className="text-xs px-3 py-1.5 rounded-full border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors text-muted-foreground hover:text-foreground"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Messages */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="max-h-[500px] overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'assistant'
                    ? 'bg-primary/20 text-primary'
                    : 'bg-accent text-muted-foreground'
                }`}
              >
                {msg.role === 'assistant' ? (
                  <Bot className="h-4 w-4" />
                ) : (
                  <User className="h-4 w-4" />
                )}
              </div>
              <div
                className={`rounded-xl px-4 py-3 max-w-[85%] text-sm leading-relaxed ${
                  msg.role === 'assistant'
                    ? 'bg-accent text-foreground rounded-tl-none'
                    : 'bg-primary text-primary-foreground rounded-tr-none'
                }`}
              >
                {msg.content.split('\n').map((line, j) => (
                  <span key={j}>
                    {line}
                    {j < msg.content.split('\n').length - 1 && <br />}
                  </span>
                ))}
              </div>
            </div>
          ))}
          {pending && (
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-accent rounded-xl rounded-tl-none px-4 py-3 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Le coach réfléchit...</span>
              </div>
            </div>
          )}
          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="border-t border-border p-3">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Pose ta question au coach... (Entrée pour envoyer)"
              rows={1}
              className="resize-none flex-1 min-h-[40px] max-h-[120px]"
              disabled={pending}
            />
            <Button type="submit" size="icon" disabled={pending || !input.trim()} className="flex-shrink-0">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
