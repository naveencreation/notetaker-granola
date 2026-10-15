import { useEffect, useState } from "react"
import { Sparkles, ArrowRight, X } from "lucide-react"

export interface AiEnhancingLoaderProps {
  noteTitle?: string
  durationLabel?: string
  onComplete?: () => void
  onCancel?: () => void
  className?: string
  autoAdvance?: boolean
}

const PHASES = [
  "Transcribing audio & diarizing speakers...",
  "Cross-referencing notes with transcript...",
  "Extracting decisions, metrics & action items...",
  "Formatting structured meeting document...",
]

export function AiEnhancingLoader({
  noteTitle = "Untitled Meeting Note",
  durationLabel = "14m",
  onComplete,
  onCancel,
  className = "",
  autoAdvance = true,
}: AiEnhancingLoaderProps) {
  const [phaseIndex, setPhaseIndex] = useState<number>(0)
  const [progress, setProgress] = useState<number>(20)

  useEffect(() => {
    if (!autoAdvance) return

    const intervals = [1600, 1800, 1800, 1400]
    let timeout: NodeJS.Timeout

    if (phaseIndex < PHASES.length - 1) {
      timeout = setTimeout(() => {
        setPhaseIndex((prev) => {
          const next = prev + 1
          setProgress(Math.round(((next + 1) / PHASES.length) * 92))
          return next
        })
      }, intervals[phaseIndex])
    } else {
      timeout = setTimeout(() => {
        setProgress(100)
        setTimeout(() => {
          if (onComplete) onComplete()
        }, 500)
      }, 1200)
    }

    return () => clearTimeout(timeout)
  }, [phaseIndex, autoAdvance, onComplete])

  return (
    <div
      className={`w-full max-w-3xl mx-auto py-4 space-y-8 select-none animate-in fade-in duration-200 ${className}`}
    >
      {/* Document Header (Directly Blended) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium border border-emerald-500/20">
              <Sparkles className="size-3 animate-pulse" />
              <span>AI Enhancing</span>
            </span>
            <span>•</span>
            <span>{durationLabel} recorded</span>
          </div>

          <div className="flex items-center gap-3">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="size-3.5" />
                <span>Cancel</span>
              </button>
            )}
            {onComplete && (
              <button
                type="button"
                onClick={onComplete}
                className="flex items-center gap-1 font-medium text-emerald-600 hover:text-emerald-500 transition-colors cursor-pointer"
              >
                <span>Finish Now</span>
                <ArrowRight className="size-3" />
              </button>
            )}
          </div>
        </div>

        {/* Native Note Title */}
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          {noteTitle}
        </h1>

        {/* Dynamic Shimmering Status Line */}
        <div className="flex items-center gap-2 pt-1 text-sm">
          <div className="size-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="animate-shimmer-text font-medium">
            {PHASES[phaseIndex]}
          </span>
        </div>

        {/* Sleek Minimalist Progress Rule */}
        <div className="h-1 w-full bg-muted/60 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Embedded Document Skeleton (No Box / No Border) */}
      <div className="space-y-8 pt-4">
        {/* Section 1: Summary Skeleton */}
        <div className="space-y-3">
          <div className="h-4 w-32 bg-muted/70 rounded animate-pulse" />
          <div className="space-y-2">
            <div className="h-3.5 w-full bg-muted/40 rounded animate-pulse" />
            <div className="h-3.5 w-11/12 bg-muted/40 rounded animate-pulse" />
            <div className="h-3.5 w-4/5 bg-muted/40 rounded animate-pulse" />
          </div>
        </div>

        {/* Section 2: Key Decisions Skeleton */}
        <div className="space-y-3">
          <div className="h-4 w-40 bg-muted/70 rounded animate-pulse" />
          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5">
              <div className="size-1.5 rounded-full bg-emerald-500/50 shrink-0" />
              <div className="h-3.5 w-10/12 bg-muted/40 rounded animate-pulse" />
            </div>
            <div className="flex items-center gap-2.5">
              <div className="size-1.5 rounded-full bg-emerald-500/50 shrink-0" />
              <div className="h-3.5 w-9/12 bg-muted/40 rounded animate-pulse" />
            </div>
            <div className="flex items-center gap-2.5">
              <div className="size-1.5 rounded-full bg-emerald-500/50 shrink-0" />
              <div className="h-3.5 w-4/5 bg-muted/40 rounded animate-pulse" />
            </div>
          </div>
        </div>

        {/* Section 3: Action Items Skeleton */}
        <div className="space-y-3">
          <div className="h-4 w-36 bg-muted/70 rounded animate-pulse" />
          <div className="space-y-2.5">
            <div className="flex items-center gap-3">
              <div className="size-4 rounded-md border border-border/80 bg-muted/40 shrink-0" />
              <div className="h-3.5 w-7/12 bg-muted/40 rounded animate-pulse" />
            </div>
            <div className="flex items-center gap-3">
              <div className="size-4 rounded-md border border-border/80 bg-muted/40 shrink-0" />
              <div className="h-3.5 w-8/12 bg-muted/40 rounded animate-pulse" />
            </div>
            <div className="flex items-center gap-3">
              <div className="size-4 rounded-md border border-border/80 bg-muted/40 shrink-0" />
              <div className="h-3.5 w-1/2 bg-muted/40 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
