import { useEffect, useState } from "react"
import {
  CitationItem,
  FolderItem,
  RecentNoteItem,
  TemplateItem,
  TranscriptSegment,
} from "@/services/granolaService"
import { useGranolaService } from "@/services/ServiceContext"
import { LiveTranscriptDrawer } from "@/components/live-transcript-drawer"
import { AskGranolaDrawer } from "@/components/ask-granola-drawer"
import { ShareExportDialog } from "@/components/share-export-dialog"
import { TemplateBuilderDialog } from "@/components/template-builder-dialog"
import { AudioPlayerBar } from "@/components/audio-player-bar"
import { useLiveSpeechRecognition } from "@/hooks/useLiveSpeechRecognition"
import { soundEngine } from "@/utils/audioCues"
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
  Volume2,
  ArrowRight,
  Share2,
  SlidersHorizontal,
  Play,
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
  const [transcriptOpen, setTranscriptOpen] = useState<boolean>(false)
  const [highlightTimestamp, setHighlightTimestamp] = useState<string | null>(null)
  const [askGranolaOpen, setAskGranolaOpen] = useState<boolean>(false)
  const [askGranolaInitialQuery, setAskGranolaInitialQuery] = useState<string>("")
  const [shareDialogOpen, setShareDialogOpen] = useState<boolean>(false)
  const [templates, setTemplates] = useState<TemplateItem[]>([])
  const [templateBuilderOpen, setTemplateBuilderOpen] = useState<boolean>(false)
  const [audioSeekRequest, setAudioSeekRequest] = useState<{ timestamp: string; nonce: number } | null>(null)
  const [currentAudioTimestamp, setCurrentAudioTimestamp] = useState<string | null>(null)

  // Load meeting templates
  useEffect(() => {
    service.getTemplates().then(setTemplates)
  }, [service])

  const handleSaveTemplate = async (newTpl: TemplateItem) => {
    await service.saveTemplate(newTpl)
    const updated = await service.getTemplates()
    setTemplates(updated)
    setSelectedTemplate(newTpl.name)
  }

  const handleDeleteTemplate = async (templateId: string) => {
    await service.deleteTemplate(templateId)
    const updated = await service.getTemplates()
    setTemplates(updated)
    if (updated[0]) {
      setSelectedTemplate(updated[0].name)
    }
  }

  // Live Speech-to-Text Recognition from Microphone
  const { interimText, isListening } = useLiveSpeechRecognition({
    active: isRecording,
    onFinalTranscript: (text) => {
      const currentList = note.transcript || []
      const mins = Math.floor(currentList.length * 0.4)
      const secs = (currentList.length * 15) % 60
      const timestamp = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`

      const newSegment: TranscriptSegment = {
        id: `trans-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp,
        speaker: "You",
        isSelf: true,
        text,
      }

      onUpdateNote({
        ...note,
        transcript: [...currentList, newSegment],
      })
    },
  })

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

  // Smart keyboard handling for rough scratchpad (Markdown & Bullets)
  const handleRoughNotesKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget
    const { selectionStart, selectionEnd, value } = textarea

    // Cmd+B / Ctrl+B for Bold
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
      e.preventDefault()
      const selected = value.slice(selectionStart, selectionEnd)
      const replacement = `**${selected || "bold text"}**`
      const nextVal = value.slice(0, selectionStart) + replacement + value.slice(selectionEnd)
      handleRoughNotesChange(nextVal)
      setTimeout(() => {
        textarea.selectionStart = selectionStart + 2
        textarea.selectionEnd = selectionStart + 2 + (selected ? selected.length : 9)
      }, 0)
      return
    }

    // Cmd+I / Ctrl+I for Italic
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "i") {
      e.preventDefault()
      const selected = value.slice(selectionStart, selectionEnd)
      const replacement = `*${selected || "italic text"}*`
      const nextVal = value.slice(0, selectionStart) + replacement + value.slice(selectionEnd)
      handleRoughNotesChange(nextVal)
      setTimeout(() => {
        textarea.selectionStart = selectionStart + 1
        textarea.selectionEnd = selectionStart + 1 + (selected ? selected.length : 11)
      }, 0)
      return
    }

    // Tab for 2-space indentation
    if (e.key === "Tab") {
      e.preventDefault()
      const indent = "  "
      const nextVal = value.slice(0, selectionStart) + indent + value.slice(selectionEnd)
      handleRoughNotesChange(nextVal)
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = selectionStart + indent.length
      }, 0)
      return
    }

    // Enter for bullet and checklist auto-continuation
    if (e.key === "Enter") {
      const lineStart = value.lastIndexOf("\n", selectionStart - 1) + 1
      const currentLine = value.slice(lineStart, selectionStart)

      // Match bullets, numbered lists, and checkboxes
      const match = currentLine.match(/^(\s*)(•\s|- \[ \]\s|\[ \]\s|-\s|\*\s|\d+\.\s)/)
      if (match) {
        e.preventDefault()
        const [, indent, marker] = match

        // Empty bullet clears the line (cancels list on double Enter)
        if (currentLine.trim() === marker.trim()) {
          const nextVal = value.slice(0, lineStart) + value.slice(selectionStart)
          handleRoughNotesChange(nextVal)
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = lineStart
          }, 0)
          return
        }

        let nextMarker = marker
        const numMatch = marker.match(/^(\d+)\.\s$/)
        if (numMatch) {
          nextMarker = `${parseInt(numMatch[1], 10) + 1}. `
        }

        const insertion = `\n${indent}${nextMarker}`
        const nextVal = value.slice(0, selectionStart) + insertion + value.slice(selectionEnd)
        handleRoughNotesChange(nextVal)
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = selectionStart + insertion.length
        }, 0)
      }
    }
  }

  // Quick 1-click format chips
  const insertFormatting = (prefix: string, suffix = "") => {
    const textarea = document.getElementById("rough-notes-textarea") as HTMLTextAreaElement | null
    if (!textarea) {
      handleRoughNotesChange(roughNotes ? `${roughNotes}\n${prefix}` : prefix)
      return
    }
    const { selectionStart, selectionEnd, value } = textarea
    const selected = value.slice(selectionStart, selectionEnd)
    const replacement = `${prefix}${selected}${suffix}`
    const nextVal = value.slice(0, selectionStart) + replacement + value.slice(selectionEnd)
    handleRoughNotesChange(nextVal)
    setTimeout(() => {
      textarea.focus()
      textarea.selectionStart = selectionStart + prefix.length
      textarea.selectionEnd = selectionStart + prefix.length + selected.length
    }, 0)
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
      soundEngine.playEnhanceDone()
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
    <div className="w-full max-w-5xl mx-auto space-y-6 select-none animate-in fade-in duration-200 pb-28">
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
                  if (t === "__custom_builder__") {
                    setTemplateBuilderOpen(true)
                    return
                  }
                  setSelectedTemplate(t)
                  handleTriggerEnhance(t)
                }}
                className="appearance-none pl-2.5 pr-7 py-1 rounded-lg border border-border/70 bg-background text-xs font-medium text-foreground hover:bg-muted/50 transition cursor-pointer outline-none max-w-[170px] sm:max-w-none truncate"
              >
                {templates.length > 0
                  ? templates.map((t) => (
                      <option key={t.id || t.name} value={t.name}>
                        {t.icon ? `${t.icon} ` : ""}{t.name}
                      </option>
                    ))
                  : TEMPLATES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                <option disabled>──────────</option>
                <option value="__custom_builder__">⚙️ Manage Templates...</option>
              </select>
              <ChevronDown className="size-3 text-muted-foreground absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <button
              type="button"
              onClick={() => setTemplateBuilderOpen(true)}
              className="p-1.5 rounded-lg border border-border/70 bg-background hover:bg-muted/50 text-muted-foreground hover:text-foreground transition cursor-pointer shrink-0"
              title="Customize Templates & AI Prompts"
              aria-label="Customize Templates"
            >
              <SlidersHorizontal className="size-3.5" />
            </button>

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

            {/* Live Transcript Drawer Trigger Button */}
            <button
              type="button"
              onClick={() => {
                setHighlightTimestamp(null)
                setTranscriptOpen(true)
              }}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg border border-border/70 bg-background hover:bg-muted/50 text-xs font-medium text-foreground transition cursor-pointer shrink-0"
              title={isListening ? "Listening to mic... click to view transcript" : "View verbatim meeting transcript"}
            >
              <Volume2 className={`size-3.5 ${isListening ? "text-emerald-500 animate-pulse" : "text-muted-foreground"}`} />
              <span className="hidden sm:inline">Transcript</span>
              {isListening && (
                <span className="size-1.5 rounded-full bg-emerald-500 animate-ping" />
              )}
              {note.transcript && note.transcript.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-muted font-mono font-semibold">
                  {note.transcript.length}
                </span>
              )}
            </button>

            {/* Ask AI Copilot Button */}
            <button
              type="button"
              onClick={() => {
                setAskGranolaInitialQuery("")
                setAskGranolaOpen(true)
              }}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg border border-border/70 bg-background hover:bg-muted/50 text-xs font-medium text-foreground transition cursor-pointer shrink-0"
              title="Ask Granola AI questions about this note"
            >
              <Sparkles className="size-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">Ask AI</span>
            </button>

            {/* Share & Export Button */}
            <button
              type="button"
              onClick={() => setShareDialogOpen(true)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg border border-border/70 bg-background hover:bg-muted/50 text-xs font-medium text-foreground transition cursor-pointer shrink-0"
              title="Share or export note (Slack, Email, Markdown, Notion, Linear)"
            >
              <Share2 className="size-3.5 text-muted-foreground" />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </div>
      </header>

      {/* Audio Playback & Transcript Scrubber Bar (Component #20) */}
      {!isRecording && note.transcript && note.transcript.length > 0 && (
        <AudioPlayerBar
          transcript={note.transcript}
          meetingTitle={note.title}
          durationFormatted={note.duration}
          seekRequest={audioSeekRequest}
          onTimeUpdate={(_sec, formatted) => setCurrentAudioTimestamp(formatted)}
          onToggleTranscript={() => setTranscriptOpen((prev) => !prev)}
          isTranscriptOpen={transcriptOpen}
        />
      )}

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
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground pb-0.5">
              <div className="flex items-center gap-1.5 font-semibold text-foreground/85">
                <FileEdit className="size-3.5 text-muted-foreground" />
                <span>Your Rough Notes</span>
              </div>

              {/* Word & Char counter + Auto-save indicator */}
              <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground">
                <span>
                  {roughNotes.trim() ? roughNotes.trim().split(/\s+/).length : 0} words
                </span>
                <span>•</span>
                <span>{roughNotes.length} chars</span>
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-sans">
                  <Check className="size-2.5" />
                  <span>Saved</span>
                </span>
              </div>
            </div>

            {/* Quick Markdown Format Chips */}
            <div className="flex items-center gap-1 overflow-x-auto invisible-scrollbar pb-1 text-xs">
              <button
                type="button"
                onClick={() => insertFormatting("• ")}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md border border-border/60 bg-background hover:bg-muted text-[11px] font-medium text-muted-foreground hover:text-foreground transition cursor-pointer shrink-0"
                title="Add bullet point (Enter to continue)"
              >
                <span>•</span>
                <span>Bullet</span>
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("- [ ] ")}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md border border-border/60 bg-background hover:bg-muted text-[11px] font-medium text-muted-foreground hover:text-foreground transition cursor-pointer shrink-0"
                title="Add checklist task"
              >
                <CheckSquare className="size-2.5" />
                <span>Task</span>
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("## ")}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md border border-border/60 bg-background hover:bg-muted text-[11px] font-medium text-muted-foreground hover:text-foreground transition cursor-pointer shrink-0"
                title="Add section heading"
              >
                <span className="font-mono text-[10px]">H2</span>
                <span>Section</span>
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("> ")}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md border border-border/60 bg-background hover:bg-muted text-[11px] font-medium text-muted-foreground hover:text-foreground transition cursor-pointer shrink-0"
                title="Add blockquote"
              >
                <Quote className="size-2.5" />
                <span>Quote</span>
              </button>
              <div className="h-3 w-px bg-border/60 mx-1 shrink-0" />
              <button
                type="button"
                onClick={() => insertFormatting("**", "**")}
                className="px-1.5 py-0.5 rounded border border-border/50 bg-background hover:bg-muted text-[10px] font-bold text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
                title="Bold (Cmd+B)"
              >
                B
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("*", "*")}
                className="px-1.5 py-0.5 rounded border border-border/50 bg-background hover:bg-muted text-[10px] italic font-serif text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
                title="Italic (Cmd+I)"
              >
                I
              </button>
            </div>

            <textarea
              id="rough-notes-textarea"
              aria-label="Your rough meeting notes"
              value={roughNotes}
              onChange={(e) => handleRoughNotesChange(e.target.value)}
              onKeyDown={handleRoughNotesKeyDown}
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
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const ts = activeCitation.timestamp
                    setAudioSeekRequest({ timestamp: ts, nonce: Date.now() })
                    setActiveCitation(null)
                  }}
                  className="px-2.5 py-1.5 rounded-lg font-medium text-emerald-600 hover:bg-emerald-500/10 transition cursor-pointer flex items-center gap-1"
                  title="Play recorded audio from this timestamp"
                >
                  <Play className="size-3 fill-current" />
                  <span>Play from {activeCitation.timestamp}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const ts = activeCitation.timestamp
                    setActiveCitation(null)
                    setHighlightTimestamp(ts)
                    setTranscriptOpen(true)
                  }}
                  className="px-2.5 py-1.5 rounded-lg font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition cursor-pointer flex items-center gap-1"
                >
                  <span>Transcript</span>
                  <ArrowRight className="size-3" />
                </button>
              </div>

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

      {/* 4. Bottom Floating AI Chat & Transcript Bar (Granola Signature - Post-meeting) */}
      {!isRecording && (
        <div className="sticky bottom-4 z-30 pt-4 flex items-center justify-center pointer-events-none animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/80 bg-background/90 dark:bg-zinc-900/90 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all max-w-lg w-full">
            <button
              type="button"
              onClick={() => {
                setAskGranolaInitialQuery("")
                setAskGranolaOpen(true)
              }}
              className="p-1 rounded-full text-emerald-600 hover:bg-emerald-500/10 transition cursor-pointer"
              title="Open AI Copilot"
            >
              <Sparkles className="size-3.5 shrink-0" />
            </button>
            <input
              type="text"
              placeholder="Ask Granola anything about this meeting..."
              className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground/50 border-none outline-none focus:ring-0 p-0"
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.currentTarget.value.trim()) {
                  setAskGranolaInitialQuery(e.currentTarget.value.trim())
                  setAskGranolaOpen(true)
                  e.currentTarget.value = ""
                }
              }}
            />
            <div className="h-4 w-px bg-border/80 shrink-0" />
            <button
              type="button"
              onClick={() => {
                setHighlightTimestamp(null)
                setTranscriptOpen(true)
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer shrink-0"
              title="Toggle Live Transcript"
            >
              <Volume2 className="size-3.5" />
              <span className="hidden sm:inline">Transcript</span>
            </button>
          </div>
        </div>
      )}

      {/* 5. Live Transcript Side Drawer (Component #10) */}
      <LiveTranscriptDrawer
        open={transcriptOpen}
        onOpenChange={setTranscriptOpen}
        transcript={note.transcript}
        meetingTitle={note.title}
        isRecording={isRecording}
        interimText={interimText}
        highlightTimestamp={highlightTimestamp}
        activeTimestamp={currentAudioTimestamp}
        onSeekAudio={(ts) => setAudioSeekRequest({ timestamp: ts, nonce: Date.now() })}
        onInsertQuoteToNotes={(quote) => {
          handleRoughNotesChange(roughNotes ? `${roughNotes}${quote}` : quote.trim())
        }}
      />

      {/* 6. Post-Meeting AI Copilot Drawer (Component #15) */}
      <AskGranolaDrawer
        open={askGranolaOpen}
        onOpenChange={setAskGranolaOpen}
        note={note}
        initialQuery={askGranolaInitialQuery}
        onInsertToNotes={(text) => {
          handleRoughNotesChange(roughNotes ? `${roughNotes}\n\n${text}` : text)
        }}
        onJumpToTranscriptTimestamp={(ts) => {
          setHighlightTimestamp(ts)
          setTranscriptOpen(true)
        }}
      />

      {/* 7. Share & Export Dialog (Components #16 & #17) */}
      <ShareExportDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        note={note}
      />

      {/* 8. Template Builder & Prompt Editor Dialog (Component #19) */}
      <TemplateBuilderDialog
        open={templateBuilderOpen}
        onOpenChange={setTemplateBuilderOpen}
        templates={templates}
        onSaveTemplate={handleSaveTemplate}
        onDeleteTemplate={handleDeleteTemplate}
        activeTemplateName={selectedTemplate}
        onSelectTemplate={(name) => {
          setSelectedTemplate(name)
          handleTriggerEnhance(name)
        }}
      />
    </div>
  )
}
