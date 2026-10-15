import { useEffect, useState } from "react"
import {
  CitationItem,
  FolderItem,
  RecentNoteItem,
} from "@/services/granolaService"
import { useGranolaService } from "@/services/ServiceContext"
import {
  Calendar,
  Clock,
  Folder,
  Sparkles,
  Columns,
  FileEdit,
  CheckSquare,
  Copy,
  Check,
  ChevronDown,
  Quote,
  X,
  User,
} from "lucide-react"

interface NoteEditorProps {
  note: RecentNoteItem
  folders: FolderItem[]
  onUpdateNote: (updated: RecentNoteItem) => void
  isRecording?: boolean
}

type ViewMode = "split" | "rough" | "enhanced"

const TEMPLATES = [
  "Sales Discovery",
  "Product Sync",
  "1:1 Meeting",
  "Executive Brief",
]

export function NoteEditor({
  note,
  folders,
  onUpdateNote,
  isRecording = false,
}: NoteEditorProps) {
  const { service } = useGranolaService()

  // Local state for interactive editing
  const [title, setTitle] = useState<string>(note.title)
  const [roughNotes, setRoughNotes] = useState<string>(note.roughNotes || "")
  const [viewMode, setViewMode] = useState<ViewMode>("split")
  const [selectedTemplate, setSelectedTemplate] = useState<string>(
    note.template || "Sales Discovery"
  )
  const [isEnhancing, setIsEnhancing] = useState<boolean>(false)
  const [activeCitation, setActiveCitation] = useState<CitationItem | null>(null)
  const [copied, setCopied] = useState<boolean>(false)

  // Keep local state in sync when switching notes
  useEffect(() => {
    setTitle(note.title)
    setRoughNotes(note.roughNotes || "")
    setSelectedTemplate(note.template || "Sales Discovery")
    setActiveCitation(null)
  }, [note.id])

  // Save changes to service
  const handleTitleBlur = async () => {
    if (title.trim() && title !== note.title) {
      const updated = await service.updateNote(note.id, { title })
      onUpdateNote(updated)
    }
  }

  const handleRoughNotesChange = async (newText: string) => {
    setRoughNotes(newText)
    const updated = await service.updateNote(note.id, { roughNotes: newText })
    onUpdateNote(updated)
  }

  const handleToggleActionItem = async (itemId: string) => {
    if (!note.enhancedNotes) return
    const updatedItems = note.enhancedNotes.actionItems.map((item) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    )
    const updatedEnhanced = {
      ...note.enhancedNotes,
      actionItems: updatedItems,
    }
    const updated = await service.updateNote(note.id, {
      enhancedNotes: updatedEnhanced,
    })
    onUpdateNote(updated)
  }

  // Trigger inline AI enhancement
  const handleTriggerEnhance = async (templateName?: string) => {
    setIsEnhancing(true)
    const targetTemplate = templateName || selectedTemplate

    // Synthesize realistic structured content
    setTimeout(async () => {
      const newEnhanced = {
        summary: `Synthesized brief for ${title} under the ${targetTemplate} template. Key priorities and commitments extracted from ${note.duration || "14m"} of audio discussion.`,
        keyDecisions: [
          {
            text: "Confirmed scope alignment and production deployment milestones",
            citation: {
              id: "c-live-1",
              timestamp: "03:45",
              speaker: note.attendees?.[0] || "Speaker 1",
              quote:
                "We reviewed the deliverables and agreed that the architecture plan meets our security criteria.",
            },
          },
          {
            text: "Finalized next sprint deliverables and assigned technical owners",
            citation: {
              id: "c-live-2",
              timestamp: "09:20",
              speaker: note.attendees?.[1] || "Speaker 2",
              quote:
                "Let's make sure the integration tests pass before deploying to staging on Monday.",
            },
          },
        ],
        actionItems: [
          {
            id: `act-${Date.now()}-1`,
            text: "Distribute finalized meeting recap and architecture diagram",
            owner: "You",
            completed: false,
          },
          {
            id: `act-${Date.now()}-2`,
            text: "Review SSO configuration and verify token expiration policy",
            owner: note.attendees?.[0] || "Team",
            completed: false,
          },
        ],
      }

      const updated = await service.updateNote(note.id, {
        template: targetTemplate,
        enhancedNotes: newEnhanced,
      })
      onUpdateNote(updated)
      setIsEnhancing(false)
    }, 2200)
  }

  const handleCopyEnhanced = () => {
    if (!note.enhancedNotes) return
    const text = `# ${note.title}\n\n## Summary\n${note.enhancedNotes.summary}\n\n## Key Decisions\n${note.enhancedNotes.keyDecisions.map((k) => `• ${k.text}`).join("\n")}\n\n## Action Items\n${note.enhancedNotes.actionItems.map((a) => `- [${a.completed ? "x" : " "}] ${a.owner}: ${a.text}`).join("\n")}`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const currentFolder = folders.find((f) => f.id === note.folderId)

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 select-none animate-in fade-in duration-200">
      {/* 1. Meeting Note Header (Directly Blended) */}
      <header className="space-y-4 border-b border-border/50 pb-5">
        {/* Top Metadata Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-muted/60 font-medium text-foreground/80">
              <Calendar className="size-3" />
              <span>{note.dateLabel}</span>
            </span>

            {note.duration && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted/40">
                <Clock className="size-3" />
                <span>{note.duration}</span>
              </span>
            )}

            {currentFolder && (
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-muted/40 font-medium">
                <Folder className="size-3 text-amber-500" />
                <span>{currentFolder.name}</span>
              </span>
            )}

            {isRecording && (
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium border border-emerald-500/20">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live Audio Transcribing</span>
              </span>
            )}
          </div>

          {/* Attendees Stack */}
          {note.attendees && note.attendees.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-muted-foreground">Attendees:</span>
              <div className="flex items-center -space-x-1">
                {note.attendees.map((attendee) => (
                  <div
                    key={attendee}
                    title={attendee}
                    className="size-6 rounded-full border border-background bg-secondary flex items-center justify-center text-[10px] font-semibold text-foreground/85 shadow-xs"
                  >
                    {attendee
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Editable Document Title with Auto-wrapping */}
        <div className="group relative">
          <textarea
            rows={1}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              e.target.style.height = "auto"
              e.target.style.height = `${e.target.scrollHeight}px`
            }}
            onBlur={handleTitleBlur}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                e.currentTarget.blur()
              }
            }}
            placeholder="Untitled Meeting Note"
            className="w-full text-2xl sm:text-3xl font-bold tracking-tight text-foreground bg-transparent border-none outline-none focus:ring-0 placeholder:text-muted-foreground/40 p-0 resize-none overflow-hidden block"
          />
        </div>

        {/* Document Action Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
          {/* View Mode Segmented Switcher */}
          <div className="flex items-center rounded-lg border border-border/60 bg-muted/40 p-0.5 text-xs self-start sm:self-auto shrink-0">
            <button
              type="button"
              onClick={() => setViewMode("split")}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-md font-medium transition cursor-pointer ${
                viewMode === "split"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Split View"
            >
              <Columns className="size-3.5" />
              <span className="hidden sm:inline">Split View</span>
              <span className="sm:hidden">Split</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("rough")}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-md font-medium transition cursor-pointer ${
                viewMode === "rough"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Rough Notes"
            >
              <FileEdit className="size-3.5" />
              <span className="hidden sm:inline">Rough Notes</span>
              <span className="sm:hidden">Rough</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("enhanced")}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-md font-medium transition cursor-pointer ${
                viewMode === "enhanced"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Enhanced Notes"
            >
              <Sparkles className="size-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">Enhanced</span>
              <span className="sm:hidden">AI</span>
            </button>
          </div>

          {/* Template Selector & AI Re-enhance */}
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap">
            <div className="relative inline-block">
              <select
                aria-label="Meeting template"
                value={selectedTemplate}
                onChange={(e) => {
                  const t = e.target.value
                  setSelectedTemplate(t)
                  handleTriggerEnhance(t)
                }}
                className="appearance-none pl-2.5 pr-7 py-1 rounded-lg border border-border/70 bg-background text-xs font-medium text-foreground hover:bg-muted/50 transition cursor-pointer outline-none max-w-[170px] sm:max-w-none truncate"
              >
                {TEMPLATES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <ChevronDown className="size-3 text-muted-foreground absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <button
              type="button"
              onClick={() => handleTriggerEnhance()}
              disabled={isEnhancing}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white shadow-xs transition cursor-pointer disabled:opacity-50 shrink-0"
            >
              <Sparkles className={`size-3.5 ${isEnhancing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">{isEnhancing ? "Enhancing..." : "Enhance with AI"}</span>
              <span className="sm:hidden">{isEnhancing ? "Enhancing" : "Enhance"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Dual Canvas (Rough Notes vs. Enhanced Notes) */}
      <div
        className={`grid gap-4 lg:gap-6 ${
          viewMode === "split"
            ? "grid-cols-1 md:grid-cols-2"
            : "grid-cols-1"
        }`}
      >
        {/* Left Pane: Your Rough Notes Scratchpad */}
        {(viewMode === "split" || viewMode === "rough") && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5 font-semibold text-foreground/85">
                <FileEdit className="size-3.5 text-muted-foreground" />
                <span>Your Rough Notes</span>
              </div>
              <span className="text-[11px] font-mono">
                {roughNotes.length} chars
              </span>
            </div>

            <textarea
              aria-label="Your rough meeting notes"
              value={roughNotes}
              onChange={(e) => handleRoughNotesChange(e.target.value)}
              placeholder="Take quick bullet points, action items, or shorthand notes during your meeting. Granola will merge them with the verbatim audio transcript..."
              className="w-full min-h-[320px] md:min-h-[480px] p-3.5 sm:p-4 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/30 focus:bg-background text-sm font-sans leading-relaxed text-foreground placeholder:text-muted-foreground/40 outline-none transition resize-none focus:border-border"
            />
          </div>
        )}

        {/* Right Pane: AI Enhanced Notes */}
        {(viewMode === "split" || viewMode === "enhanced") && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5 font-semibold text-foreground/85">
                <Sparkles className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>AI Enhanced Notes</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium">
                  {selectedTemplate}
                </span>
              </div>

              {note.enhancedNotes && (
                <button
                  type="button"
                  onClick={handleCopyEnhanced}
                  className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="size-3 text-emerald-500" />
                      <span className="text-emerald-600">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-3" />
                      <span>Copy Markdown</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* AI Enhancing Shimmer Banner */}
            {isEnhancing && (
              <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center gap-2 text-xs">
                  <div className="size-2 rounded-full bg-emerald-500 animate-ping" />
                  <span className="animate-shimmer-text font-medium text-xs">
                    Synthesizing transcript & rough notes into {selectedTemplate}...
                  </span>
                </div>
                <div className="h-1 w-full bg-emerald-500/10 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 animate-pulse w-3/4 rounded-full" />
                </div>
              </div>
            )}

            {/* Enhanced Content Body */}
            {note.enhancedNotes ? (
              <div className="min-h-[320px] md:min-h-[480px] p-4 sm:p-5 rounded-xl border border-border/60 bg-card/40 space-y-6 text-sm leading-relaxed">
                {/* Executive Summary */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Executive Summary
                  </h3>
                  <p className="text-foreground/90 leading-relaxed">
                    {note.enhancedNotes.summary}
                  </p>
                </div>

                {/* Key Decisions with Clickable Citations */}
                <div className="space-y-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Key Decisions & Takeaways
                  </h3>
                  <ul className="space-y-2">
                    {note.enhancedNotes.keyDecisions.map((decision, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="mt-1.5 size-1.5 rounded-full bg-emerald-500 shrink-0" />
                        <span className="flex-1 text-foreground/90">
                          {decision.text}
                          {decision.citation && (
                            <button
                              type="button"
                              onClick={() => setActiveCitation(decision.citation!)}
                              className="ml-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-mono font-medium bg-secondary hover:bg-emerald-500/15 text-muted-foreground hover:text-emerald-700 dark:hover:text-emerald-300 border border-border/60 transition cursor-pointer select-none"
                              title="View speaker quote in transcript"
                            >
                              <Quote className="size-2.5 text-emerald-600" />
                              <span>{decision.citation.timestamp}</span>
                            </button>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Items with Interactive Checkboxes */}
                <div className="space-y-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Action Items
                  </h3>
                  <div className="space-y-2">
                    {note.enhancedNotes.actionItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start gap-2.5 group"
                      >
                        <button
                          type="button"
                          onClick={() => handleToggleActionItem(item.id)}
                          className="mt-0.5 text-muted-foreground hover:text-emerald-600 transition cursor-pointer shrink-0"
                        >
                          {item.completed ? (
                            <CheckSquare className="size-4 text-emerald-600" />
                          ) : (
                            <div className="size-4 rounded border border-border hover:border-emerald-600" />
                          )}
                        </button>
                        <span
                          className={`flex-1 text-xs sm:text-sm ${
                            item.completed
                              ? "line-through text-muted-foreground/70"
                              : "text-foreground/90"
                          }`}
                        >
                          <span className="font-semibold text-foreground mr-1.5">
                            {item.owner}:
                          </span>
                          {item.text}
                          {item.citation && (
                            <button
                              type="button"
                              onClick={() => setActiveCitation(item.citation!)}
                              className="ml-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-secondary hover:bg-emerald-500/15 text-muted-foreground hover:text-emerald-700 dark:hover:text-emerald-300 border border-border/60 transition cursor-pointer select-none"
                            >
                              <Quote className="size-2.5 text-emerald-600" />
                              <span>{item.citation.timestamp}</span>
                            </button>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Next Steps footer if present */}
                {note.enhancedNotes.nextSteps && (
                  <div className="pt-3 border-t border-border/40 text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground/80">Next Steps: </span>
                    <span>{note.enhancedNotes.nextSteps}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="min-h-[320px] md:min-h-[480px] p-6 sm:p-8 rounded-xl border border-dashed border-border/80 bg-muted/10 flex flex-col items-center justify-center text-center space-y-3">
                <div className="size-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                  <Sparkles className="size-5" />
                </div>
                <div className="space-y-1 max-w-sm">
                  <h4 className="text-sm font-semibold text-foreground">
                    No enhanced notes generated yet
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Click <strong>"Enhance with AI"</strong> above to synthesize your meeting audio and rough scratchpad into a structured brief.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleTriggerEnhance()}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition cursor-pointer"
                >
                  Enhance Now
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Interactive Citation Spotlight Modal / Popover (Component #14) */}
      {activeCitation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-background/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg mx-3 sm:mx-0 max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <div className="flex items-center gap-2 text-xs">
                <span className="flex items-center justify-center size-6 rounded-full bg-emerald-500/15 text-emerald-600 font-semibold">
                  <User className="size-3.5" />
                </span>
                <div>
                  <div className="font-semibold text-foreground">
                    {activeCitation.speaker}
                  </div>
                  <div className="text-[11px] text-muted-foreground font-mono">
                    Recorded at {activeCitation.timestamp}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveCitation(null)}
                className="p-1 text-muted-foreground hover:text-foreground rounded-md transition"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Verbatim Quote */}
            <div className="p-4 rounded-xl bg-muted/40 border border-border/50 text-sm leading-relaxed text-foreground italic space-y-2">
              <div className="text-xs font-semibold not-italic text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Quote className="size-3" /> Verbatim Audio Transcript
              </div>
              <p>"{activeCitation.quote}"</p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-muted-foreground text-[11px]">
                Clicking citations lets you verify AI claims against raw audio.
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(activeCitation.quote)
                  setActiveCitation(null)
                }}
                className="px-3 py-1.5 rounded-lg font-medium bg-secondary hover:bg-secondary/80 text-foreground transition cursor-pointer"
              >
                Copy Quote
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
