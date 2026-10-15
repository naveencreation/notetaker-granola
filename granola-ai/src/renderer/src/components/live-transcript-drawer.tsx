import { useEffect, useMemo, useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { TranscriptSegment } from "@/services/granolaService"
import {
  Search,
  Copy,
  Check,
  Plus,
  Mic,
  Volume2,
  X,
  Radio,
  Play,
} from "lucide-react"

interface LiveTranscriptDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transcript?: TranscriptSegment[]
  meetingTitle?: string
  isRecording?: boolean
  onInsertQuoteToNotes?: (quote: string) => void
  highlightTimestamp?: string | null
}

export function LiveTranscriptDrawer({
  open,
  onOpenChange,
  transcript = [],
  meetingTitle = "Meeting Note",
  isRecording = false,
  onInsertQuoteToNotes,
  highlightTimestamp,
}: LiveTranscriptDrawerProps) {
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [speakerFilter, setSpeakerFilter] = useState<"all" | "self" | "others">("all")
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [copiedAll, setCopiedAll] = useState<boolean>(false)
  const [insertedId, setInsertedId] = useState<string | null>(null)
  const [playingSegId, setPlayingSegId] = useState<string | null>(null)

  // Auto-scroll to highlighted citation timestamp
  useEffect(() => {
    if (!open || !highlightTimestamp) {
      return undefined
    }
    const timer = setTimeout(() => {
      const el = document.getElementById(`seg-${highlightTimestamp}`)
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" })
      }
    }, 250)
    return () => clearTimeout(timer)
  }, [open, highlightTimestamp])

  // Reset playing simulation after 3.5 seconds
  useEffect(() => {
    if (!playingSegId) {
      return undefined
    }
    const timer = setTimeout(() => {
      setPlayingSegId(null)
    }, 3500)
    return () => clearTimeout(timer)
  }, [playingSegId])

  // Filter segments by keyword & speaker
  const filteredSegments = useMemo(() => {
    return transcript.filter((seg) => {
      if (speakerFilter === "self" && !seg.isSelf) return false
      if (speakerFilter === "others" && seg.isSelf) return false

      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase()
      return (
        seg.text.toLowerCase().includes(q) ||
        seg.speaker.toLowerCase().includes(q) ||
        seg.timestamp.includes(q)
      )
    })
  }, [transcript, searchQuery, speakerFilter])

  const handleCopySegment = (seg: TranscriptSegment) => {
    navigator.clipboard.writeText(`[${seg.timestamp}] ${seg.speaker}: "${seg.text}"`)
    setCopiedId(seg.id)
    setTimeout(() => setCopiedId(null), 1800)
  }

  const handleInsertSegment = (seg: TranscriptSegment) => {
    if (onInsertQuoteToNotes) {
      onInsertQuoteToNotes(`\n• "${seg.text}" — ${seg.speaker} [${seg.timestamp}]`)
      setInsertedId(seg.id)
      setTimeout(() => setInsertedId(null), 1800)
    }
  }

  const handleCopyAll = () => {
    const fullText = transcript
      .map((s) => `[${s.timestamp}] ${s.speaker}:\n${s.text}\n`)
      .join("\n")
    navigator.clipboard.writeText(fullText)
    setCopiedAll(true)
    setTimeout(() => setCopiedAll(false), 2000)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        overlayClassName="bg-black/15 dark:bg-black/35 backdrop-blur-[0.5px]"
        className="w-full sm:max-w-md lg:max-w-lg p-0 flex flex-col h-full bg-background/98 dark:bg-zinc-950/98 backdrop-blur-2xl border-l border-border/80 shadow-2xl select-none"
      >
        {/* Drawer Header */}
        <SheetHeader className="p-4 sm:p-5 border-b border-border/60 space-y-3 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Volume2 className="size-4" />
              </div>
              <div>
                <SheetTitle className="text-sm font-bold text-foreground">
                  Meeting Transcript
                </SheetTitle>
                <div className="text-[11px] text-muted-foreground truncate max-w-[220px]">
                  {meetingTitle}
                </div>
              </div>
            </div>

            {isRecording && (
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <Radio className="size-3 animate-pulse text-emerald-500" />
                <span>Live Audio</span>
              </span>
            )}
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="size-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search words spoken in call..."
              className="w-full pl-8 pr-8 py-1.5 rounded-lg border border-border/70 bg-muted/30 focus:bg-background text-xs text-foreground placeholder:text-muted-foreground/50 outline-none transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3" />
              </button>
            )}
          </div>

          {/* Filter Pills & Copy All */}
          <div className="flex items-center justify-between pt-1 text-xs">
            <div className="flex items-center gap-1 rounded-lg border border-border/60 bg-muted/40 p-0.5">
              <button
                type="button"
                onClick={() => setSpeakerFilter("all")}
                className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition cursor-pointer ${
                  speakerFilter === "all"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All ({transcript.length})
              </button>
              <button
                type="button"
                onClick={() => setSpeakerFilter("self")}
                className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition cursor-pointer ${
                  speakerFilter === "self"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                You
              </button>
              <button
                type="button"
                onClick={() => setSpeakerFilter("others")}
                className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition cursor-pointer ${
                  speakerFilter === "others"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Others
              </button>
            </div>

            <button
              type="button"
              onClick={handleCopyAll}
              className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition cursor-pointer"
            >
              {copiedAll ? (
                <>
                  <Check className="size-3 text-emerald-500" />
                  <span className="text-emerald-600 font-medium">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="size-3" />
                  <span>Copy All</span>
                </>
              )}
            </button>
          </div>
        </SheetHeader>

        {/* Transcript Dialogue Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 invisible-scrollbar">
          {filteredSegments.length > 0 ? (
            filteredSegments.map((seg) => {
              const isHighlighted = highlightTimestamp === seg.timestamp
              const isCopied = copiedId === seg.id
              const isInserted = insertedId === seg.id
              const isPlaying = playingSegId === seg.id

              return (
                <div
                  key={seg.id}
                  id={`seg-${seg.timestamp}`}
                  className={`group relative rounded-xl p-3.5 transition-all duration-200 ${
                    isHighlighted
                      ? "bg-emerald-500/10 border-2 border-emerald-500/60 shadow-md ring-2 ring-emerald-500/20"
                      : seg.isSelf
                        ? "bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/20"
                        : "bg-muted/30 hover:bg-muted/50 border border-border/50"
                  }`}
                >
                  {/* Bubble Header */}
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      {seg.isSelf ? (
                        <span className="size-5 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center">
                          <Mic className="size-3" />
                        </span>
                      ) : (
                        <span className="size-5 rounded-full bg-secondary text-foreground flex items-center justify-center text-[10px] font-bold">
                          {seg.speaker
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </span>
                      )}

                      <span
                        className={`text-xs font-semibold ${
                          seg.isSelf
                            ? "text-emerald-700 dark:text-emerald-300"
                            : "text-foreground"
                        }`}
                      >
                        {seg.speaker}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Audio Playback Toggle */}
                      <button
                        type="button"
                        onClick={() =>
                          setPlayingSegId(isPlaying ? null : seg.id)
                        }
                        className={`p-1 rounded transition cursor-pointer ${
                          isPlaying
                            ? "bg-emerald-500/15 text-emerald-600"
                            : "text-muted-foreground/60 hover:text-foreground"
                        }`}
                        title={isPlaying ? "Pause audio" : "Listen to audio segment"}
                      >
                        {isPlaying ? (
                          <div className="flex items-center gap-0.5 h-3 px-1">
                            <span className="w-0.5 h-3 bg-emerald-500 animate-pulse rounded-full" />
                            <span className="w-0.5 h-2 bg-emerald-500 animate-pulse rounded-full delay-75" />
                            <span className="w-0.5 h-2.5 bg-emerald-500 animate-pulse rounded-full delay-150" />
                          </div>
                        ) : (
                          <Play className="size-2.5 fill-current" />
                        )}
                      </button>

                      <span className="text-[10px] font-mono text-muted-foreground/75">
                        {seg.timestamp}
                      </span>

                      {/* Bubble Actions on Hover */}
                      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
                        <button
                          type="button"
                          onClick={() => handleCopySegment(seg)}
                          className="p-1 text-muted-foreground hover:text-foreground rounded transition"
                          title="Copy quote"
                        >
                          {isCopied ? (
                            <Check className="size-3 text-emerald-500" />
                          ) : (
                            <Copy className="size-3" />
                          )}
                        </button>

                        {onInsertQuoteToNotes && (
                          <button
                            type="button"
                            onClick={() => handleInsertSegment(seg)}
                            className="p-1 text-muted-foreground hover:text-foreground rounded transition"
                            title="Add quote to rough notes"
                          >
                            {isInserted ? (
                              <Check className="size-3 text-emerald-500" />
                            ) : (
                              <Plus className="size-3 text-emerald-600" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Verbatim Spoken Text */}
                  <p className="text-xs sm:text-sm leading-relaxed text-foreground/90 font-sans">
                    {seg.text}
                  </p>
                </div>
              )
            })
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-center text-xs text-muted-foreground space-y-2">
              <Search className="size-6 text-muted-foreground/40" />
              <span>No transcript segments match "{searchQuery}"</span>
            </div>
          )}
        </div>

        {/* Drawer Footer Status */}
        <div className="p-3 border-t border-border/60 bg-muted/20 flex items-center justify-between text-[11px] text-muted-foreground shrink-0">
          <span>{transcript.length} segments captured</span>
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            <span>Dual-channel diarized</span>
          </span>
        </div>
      </SheetContent>
    </Sheet>
  )
}
