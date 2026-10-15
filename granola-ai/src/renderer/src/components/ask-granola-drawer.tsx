import { useEffect, useRef, useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { RecentNoteItem } from "@/services/granolaService"
import {
  Sparkles,
  Send,
  Copy,
  Check,
  PlusCircle,
  Clock,
  Bot,
} from "lucide-react"

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  citations?: { timestamp: string; quote: string }[]
  timeLabel: string
}

interface AskGranolaDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  note: RecentNoteItem
  initialQuery?: string
  onInsertToNotes?: (text: string) => void
  onJumpToTranscriptTimestamp?: (timestamp: string) => void
}

const QUICK_PROMPTS = [
  { label: "Draft follow-up email", icon: "✉️", prompt: "Draft a concise follow-up email to all attendees summarizing key decisions and next steps." },
  { label: "Action items by owner", icon: "📋", prompt: "List all action items grouped by owner with specific deadlines." },
  { label: "Key blockers & risks", icon: "⚠️", prompt: "What were the main technical or timeline blockers discussed in this meeting?" },
  { label: "Summary in 3 bullets", icon: "🎯", prompt: "Give me an executive TL;DR of this meeting in exactly 3 bullet points." },
]

export function AskGranolaDrawer({
  open,
  onOpenChange,
  note,
  initialQuery,
  onInsertToNotes,
  onJumpToTranscriptTimestamp,
}: AskGranolaDrawerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState<string>("")
  const [isThinking, setIsThinking] = useState<boolean>(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initialize or handle incoming initialQuery
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: `I'm ready to answer any questions about **"${note.title}"** using both your rough notes and the verbatim meeting audio transcript.`,
          timeLabel: "Now",
        },
      ])
    }
  }, [open, note.title, messages.length])

  useEffect(() => {
    if (initialQuery && open) {
      handleSend(initialQuery)
    }
  }, [initialQuery, open])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isThinking])

  const handleSend = (textToSend?: string) => {
    const q = (textToSend || input).trim()
    if (!q || isThinking) return

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: q,
      timeLabel: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setIsThinking(true)

    // Simulate smart AI response grounded in note and transcript
    setTimeout(() => {
      let responseContent = ""
      let citations: { timestamp: string; quote: string }[] = []

      const lowerQ = q.toLowerCase()

      if (lowerQ.includes("email") || lowerQ.includes("follow-up")) {
        responseContent = `Here is a drafted follow-up email:\n\n**Subject:** Recap: ${note.title}\n\nHi team,\n\nThanks everyone for the productive sync. Here is a quick summary of what we decided and our next steps:\n\n**Decisions:**\n${note.enhancedNotes?.keyDecisions.map((k) => `• ${k.text}`).join("\n") || "• Reviewed key architecture milestones."}\n\n**Action Items:**\n${note.enhancedNotes?.actionItems.map((a) => `• **${a.owner}**: ${a.text}`).join("\n") || "• Complete pending milestones before next sprint."}\n\nPlease let me know if anything was missed.\n\nBest,\n${note.attendees?.[0] || "Team"}`
        citations = [{ timestamp: "04:12", quote: "We agreed to finalize auth flow before Wednesday's release." }]
      } else if (lowerQ.includes("action") || lowerQ.includes("tasks") || lowerQ.includes("owner")) {
        responseContent = `Here are the action items extracted from the transcript:\n\n${
          note.enhancedNotes?.actionItems
            .map((a, i) => `${i + 1}. **${a.owner}** — ${a.text} (Status: ${a.completed ? "Done" : "Pending"})`)
            .join("\n\n") || "No open action items recorded."
        }`
        citations = [{ timestamp: "05:15", quote: "Sarah will send the updated OpenAPI schema by Friday morning." }]
      } else if (lowerQ.includes("blocker") || lowerQ.includes("risk")) {
        responseContent = `The primary concerns raised during the call were:\n\n1. **SSO Token Invalidation Edge Case**: Session tokens might expire during long enterprise sessions.\n2. **Database Migration Downtime**: Marcus mentioned a potential 15-minute maintenance window is required for table indexing.\n3. **Timeline Tightness**: Wednesday release deadline leaves only 2 days for QA testing.`
        citations = [
          { timestamp: "02:18", quote: "If the token expires mid-request, we might see 401s on background sync." },
          { timestamp: "03:45", quote: "We should run the database migration during off-peak European hours." },
        ]
      } else {
        responseContent = `Based on the meeting transcript and synthesis for **${note.title}**:\n\n${
          note.enhancedNotes?.summary || "The team aligned on core deliverables and unblocked the upcoming release schedule."
        }\n\nKey discussion highlighted that technical debt in authentication is resolved, and cross-team alignment was confirmed.`
        citations = [{ timestamp: "01:24", quote: "We're on track for this sprint as long as the API contract stays intact." }]
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: responseContent,
        citations,
        timeLabel: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }

      setMessages((prev) => [...prev, aiMsg])
      setIsThinking(false)
    }, 1200)
  }

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 flex flex-col bg-background/98 dark:bg-zinc-950/98 backdrop-blur-2xl border-l border-border/70 shadow-2xl z-50 select-none"
        overlayClassName="bg-black/20 backdrop-blur-[0.5px]"
      >
        {/* Header */}
        <SheetHeader className="px-5 py-3.5 border-b border-border/50 flex flex-row items-center justify-between space-y-0 shrink-0">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Sparkles className="size-4" />
            </div>
            <div>
              <SheetTitle className="text-sm font-semibold text-foreground">
                Ask Granola
              </SheetTitle>
              <p className="text-[11px] text-muted-foreground truncate max-w-[220px]">
                {note.title}
              </p>
            </div>
          </div>
        </SheetHeader>

        {/* Quick Prompt Pills */}
        <div className="px-4 py-2 border-b border-border/40 bg-muted/20 flex items-center gap-1.5 overflow-x-auto invisible-scrollbar shrink-0">
          {QUICK_PROMPTS.map((qp) => (
            <button
              key={qp.label}
              type="button"
              onClick={() => handleSend(qp.prompt)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-background border border-border/60 hover:border-emerald-500/40 hover:bg-emerald-500/5 text-foreground/80 hover:text-emerald-600 transition-all cursor-pointer shrink-0 shadow-2xs"
            >
              <span>{qp.icon}</span>
              <span>{qp.label}</span>
            </button>
          ))}
        </div>

        {/* Conversation Message List */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 text-xs select-text">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col gap-1.5 ${
                msg.role === "user" ? "items-end" : "items-start"
              }`}
            >
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                {msg.role === "user" ? (
                  <>
                    <span>You</span>
                    <span>•</span>
                    <span>{msg.timeLabel}</span>
                  </>
                ) : (
                  <>
                    <Bot className="size-3 text-emerald-500" />
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">Granola AI</span>
                    <span>•</span>
                    <span>{msg.timeLabel}</span>
                  </>
                )}
              </div>

              <div
                className={`rounded-2xl p-3.5 max-w-[92%] leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-emerald-600 text-white rounded-br-xs"
                    : "bg-card border border-border/70 text-foreground rounded-bl-xs shadow-2xs"
                }`}
              >
                {msg.content}

                {/* Citation Pills on Assistant Responses */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-border/50 space-y-1.5">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                      Grounding Citations
                    </span>
                    {msg.citations.map((c, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-1.5 p-2 rounded-lg bg-muted/40 border border-border/40 text-[11px]"
                      >
                        <button
                          type="button"
                          onClick={() => onJumpToTranscriptTimestamp?.(c.timestamp)}
                          className="flex items-center gap-1 font-mono text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer shrink-0 pt-0.5"
                          title="Jump to quote in transcript"
                        >
                          <Clock className="size-2.5" />
                          <span>[{c.timestamp}]</span>
                        </button>
                        <span className="text-muted-foreground italic flex-1">
                          "{c.quote}"
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Assistant Action Buttons */}
                {msg.role === "assistant" && msg.id !== "welcome" && (
                  <div className="mt-3 pt-2 border-t border-border/40 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/70 transition cursor-pointer"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="size-3 text-emerald-500" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="size-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    {onInsertToNotes && (
                      <button
                        type="button"
                        onClick={() => onInsertToNotes(msg.content)}
                        className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition cursor-pointer"
                        title="Append this response into your rough notes"
                      >
                        <PlusCircle className="size-3" />
                        <span>Insert into Notes</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isThinking && (
            <div className="flex items-center gap-2 text-muted-foreground text-xs py-2">
              <Bot className="size-3.5 text-emerald-500 animate-spin" />
              <span>Analyzing notes & transcript...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Footer */}
        <div className="p-3 border-t border-border/60 bg-background/95 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/80 bg-muted/40 focus-within:border-emerald-500/50 focus-within:bg-background transition-all"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about this meeting..."
              className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground/60 border-none outline-none focus:ring-0 p-0"
            />
            <button
              type="submit"
              disabled={!input.trim() || isThinking}
              className="p-1 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-30 disabled:hover:bg-emerald-600 transition cursor-pointer shrink-0"
              title="Send message"
            >
              <Send className="size-3" />
            </button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  )
}
