import { useEffect, useState } from "react"
import { LiveWaveform } from "@/components/ui/live-waveform"
import {
  Mic,
  MicOff,
  Pause,
  Play,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react"

interface AudioVisualizerPillProps {
  isRecording: boolean
  onToggleRecord: () => void
  onEndAndEnhance?: () => void
  meetingTitle?: string
  className?: string
}

export function AudioVisualizerPill({
  isRecording,
  onToggleRecord,
  onEndAndEnhance,
  meetingTitle,
  className = "",
}: AudioVisualizerPillProps) {
  const [seconds, setSeconds] = useState<number>(0)
  const [isPaused, setIsPaused] = useState<boolean>(false)
  const [isMuted, setIsMuted] = useState<boolean>(false)
  const [isMinimized, setIsMinimized] = useState<boolean>(false)

  // Running elapsed stopwatch
  useEffect(() => {
    if (!isRecording || isPaused) return
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [isRecording, isPaused])

  // Format MM:SS
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  if (!isRecording) return null

  // Minimized floating badge
  if (isMinimized) {
    return (
      <div
        className={`fixed bottom-5 right-6 z-50 transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 ${className}`}
      >
        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/80 bg-background/90 dark:bg-zinc-900/90 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all cursor-pointer group"
          title="Expand audio visualizer"
        >
          <span className="relative flex h-2 w-2">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isPaused ? "bg-amber-400" : "bg-emerald-400"
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isPaused ? "bg-amber-500" : "bg-emerald-500"
              }`}
            />
          </span>
          <span className="text-xs font-mono font-medium text-foreground">
            {formatTime(seconds)}
          </span>
          <ChevronUp className="size-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
        </button>
      </div>
    )
  }

  return (
    <aside
      aria-label="Live audio capture"
      className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 ${className}`}
    >
      <div className="flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2 rounded-full border border-border/70 bg-background/95 dark:bg-zinc-900/95 backdrop-blur-2xl shadow-[0_12px_40px_-6px_rgba(0,0,0,0.22)] dark:shadow-[0_12px_40px_-6px_rgba(0,0,0,0.6)] select-none">
        {/* Pulsing Audio Status Indicator */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="relative flex h-2.5 w-2.5">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isPaused || isMuted ? "bg-amber-400" : "bg-emerald-400"
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isPaused || isMuted ? "bg-amber-500" : "bg-emerald-500"
              }`}
            />
          </span>
          {meetingTitle && (
            <span className="hidden md:inline-block max-w-[120px] truncate text-[11px] font-medium text-muted-foreground">
              {meetingTitle}
            </span>
          )}
        </div>

        {/* Real-time Live Waveform Canvas */}
        <div className="w-16 sm:w-24 shrink-0 flex items-center justify-center">
          <LiveWaveform
            active={isRecording && !isMuted}
            isPaused={isPaused || isMuted}
            barWidth={2.5}
            barGap={2}
            barRadius={1.5}
            height={20}
            barColor={isPaused || isMuted ? "#f59e0b" : "#10b981"}
          />
        </div>

        {/* Stopwatch Timer */}
        <div className="flex items-center gap-1 font-mono text-xs font-semibold text-foreground/90 shrink-0">
          <span>{formatTime(seconds)}</span>
        </div>

        {/* Divider */}
        <div className="h-4 w-px bg-border/80 shrink-0" />

        {/* Audio Controls */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Mute Toggle */}
          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            className={`p-1.5 rounded-full transition-colors cursor-pointer ${
              isMuted
                ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
            title={isMuted ? "Unmute microphone" : "Mute microphone"}
          >
            {isMuted ? <MicOff className="size-3.5" /> : <Mic className="size-3.5" />}
          </button>

          {/* Pause / Resume Toggle */}
          <button
            type="button"
            onClick={() => setIsPaused(!isPaused)}
            className={`p-1.5 rounded-full transition-colors cursor-pointer ${
              isPaused
                ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
            title={isPaused ? "Resume transcribing" : "Pause transcribing"}
          >
            {isPaused ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}
          </button>
        </div>

        {/* Divider */}
        <div className="h-4 w-px bg-border/80 shrink-0" />

        {/* Granola Signature: End & Enhance Button */}
        <button
          type="button"
          onClick={() => {
            if (onEndAndEnhance) {
              onEndAndEnhance()
            } else {
              onToggleRecord()
            }
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white shadow-sm transition-all cursor-pointer shrink-0"
        >
          <Sparkles className="size-3.5" />
          <span>End & Enhance</span>
        </button>

        {/* Minimize Button */}
        <button
          type="button"
          onClick={() => setIsMinimized(true)}
          className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors cursor-pointer shrink-0"
          title="Minimize to badge"
        >
          <ChevronDown className="size-3.5" />
        </button>
      </div>
    </aside>
  )
}
