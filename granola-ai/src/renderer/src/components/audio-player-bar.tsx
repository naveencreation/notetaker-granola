import { useEffect, useMemo, useRef, useState, useCallback } from "react"
import { TranscriptSegment } from "@/services/granolaService"
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Gauge,
  FileText,
  ChevronUp,
  ChevronDown,
  User,
  Radio,
} from "lucide-react"

export interface AudioPlayerBarProps {
  transcript?: TranscriptSegment[]
  meetingTitle?: string
  durationFormatted?: string
  seekRequest?: { timestamp: string; nonce: number } | null
  onTimeUpdate?: (seconds: number, formattedTimestamp: string) => void
  onToggleTranscript?: () => void
  isTranscriptOpen?: boolean
}

// Convert "MM:SS" or "HH:MM:SS" to seconds
export function parseTimestampToSeconds(ts: string): number {
  if (!ts) return 0
  const parts = ts.trim().split(":").map(Number)
  if (parts.length === 3) {
    return (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0)
  }
  if (parts.length === 2) {
    return (parts[0] || 0) * 60 + (parts[1] || 0)
  }
  return 0
}

// Convert seconds to "MM:SS"
export function formatSecondsToTimestamp(totalSecs: number): string {
  const clamped = Math.max(0, Math.floor(totalSecs))
  const minutes = Math.floor(clamped / 60)
  const seconds = clamped % 60
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
}

const SPEED_OPTIONS = [1, 1.25, 1.5, 2]

export function AudioPlayerBar({
  transcript = [],
  meetingTitle = "Meeting Recording",
  durationFormatted,
  seekRequest,
  onTimeUpdate,
  onToggleTranscript,
  isTranscriptOpen = false,
}: AudioPlayerBarProps) {
  // Calculate total duration in seconds from transcript or duration prop
  const totalDuration = useMemo(() => {
    let maxSec = 180 // default minimum 3 minutes
    transcript.forEach((seg) => {
      const s = parseTimestampToSeconds(seg.timestamp)
      if (s > maxSec) maxSec = s
    })
    if (durationFormatted) {
      if (durationFormatted.includes("m")) {
        const mins = parseInt(durationFormatted, 10)
        if (!isNaN(mins) && mins * 60 > maxSec) {
          maxSec = mins * 60
        }
      }
    }
    return maxSec + 15 // add small padding after last speech
  }, [transcript, durationFormatted])

  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1)
  const [isMuted, setIsMuted] = useState<boolean>(false)
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false)
  const [hoveredProgressTime, setHoveredProgressTime] = useState<number | null>(null)

  // AudioContext reference for ambient speech murmur synthesis
  const audioCtxRef = useRef<AudioContext | null>(null)
  const murmurNodesRef = useRef<{
    osc: OscillatorNode
    gain: GainNode
    filter: BiquadFilterNode
  } | null>(null)

  // Start synthetic murmur audio to provide realistic playback presence
  const startMurmur = useCallback(() => {
    if (isMuted) return
    try {
      if (!audioCtxRef.current) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext
        if (AudioCtx) {
          audioCtxRef.current = new AudioCtx()
        }
      }
      const ctx = audioCtxRef.current
      if (!ctx) return
      if (ctx.state === "suspended") {
        ctx.resume()
      }

      if (murmurNodesRef.current) return

      const osc = ctx.createOscillator()
      const filter = ctx.createBiquadFilter()
      const gain = ctx.createGain()

      // Set gentle vocal-formant frequency (~220Hz bandpass)
      osc.type = "sawtooth"
      osc.frequency.setValueAtTime(180, ctx.currentTime)

      filter.type = "bandpass"
      filter.frequency.setValueAtTime(600, ctx.currentTime)
      filter.Q.setValueAtTime(3.0, ctx.currentTime)

      // Very subtle gain so it's pleasant ambient feedback
      gain.gain.setValueAtTime(0.015, ctx.currentTime)

      osc.connect(filter)
      filter.connect(gain)
      gain.connect(ctx.destination)

      osc.start()
      murmurNodesRef.current = { osc, gain, filter }
    } catch {
      // Audio playback autoplay policy or browser restriction
    }
  }, [isMuted])

  const stopMurmur = useCallback(() => {
    if (murmurNodesRef.current) {
      try {
        murmurNodesRef.current.osc.stop()
        murmurNodesRef.current.osc.disconnect()
        murmurNodesRef.current.gain.disconnect()
      } catch {
        // Ignored
      }
      murmurNodesRef.current = null
    }
  }, [])

  // Audio Playback loop using requestAnimationFrame
  const lastTickRef = useRef<number>(performance.now())

  useEffect(() => {
    if (!isPlaying) {
      stopMurmur()
      return undefined
    }

    startMurmur()
    lastTickRef.current = performance.now()

    let animId: number
    const tick = (now: number) => {
      const deltaSec = ((now - lastTickRef.current) / 1000) * playbackSpeed
      lastTickRef.current = now

      setCurrentTime((prev) => {
        const next = prev + deltaSec
        if (next >= totalDuration) {
          setIsPlaying(false)
          return totalDuration
        }
        return next
      })

      animId = requestAnimationFrame(tick)
    }

    animId = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(animId)
      stopMurmur()
    }
  }, [isPlaying, playbackSpeed, totalDuration, startMurmur, stopMurmur])

  // Handle external seek requests (e.g. from citation click or transcript click)
  useEffect(() => {
    if (!seekRequest) return
    const targetSec = parseTimestampToSeconds(seekRequest.timestamp)
    setCurrentTime(Math.min(targetSec, totalDuration))
    setIsPlaying(true)
  }, [seekRequest, totalDuration])

  // Notify parent on time change
  useEffect(() => {
    const formatted = formatSecondsToTimestamp(currentTime)
    onTimeUpdate?.(currentTime, formatted)
  }, [currentTime, onTimeUpdate])

  // Current active transcript segment
  const activeSegment = useMemo(() => {
    if (!transcript.length) return null
    let current = transcript[0]
    for (const seg of transcript) {
      const s = parseTimestampToSeconds(seg.timestamp)
      if (s <= currentTime) {
        current = seg
      } else {
        break
      }
    }
    return current
  }, [transcript, currentTime])

  // Controls
  const togglePlay = () => {
    if (currentTime >= totalDuration) {
      setCurrentTime(0)
    }
    setIsPlaying((prev) => !prev)
  }

  const skipSeconds = (delta: number) => {
    setCurrentTime((prev) => Math.max(0, Math.min(totalDuration, prev + delta)))
  }

  const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSec = parseFloat(e.target.value)
    setCurrentTime(newSec)
  }

  const cycleSpeed = () => {
    const idx = SPEED_OPTIONS.indexOf(playbackSpeed)
    const nextIdx = (idx + 1) % SPEED_OPTIONS.length
    setPlaybackSpeed(SPEED_OPTIONS[nextIdx])
  }

  const progressPercent = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0

  return (
    <div
      className={`relative w-full rounded-2xl border border-border/80 bg-card/95 backdrop-blur-md shadow-xs transition-all duration-200 overflow-hidden ${
        isCollapsed ? "p-2 sm:p-2.5" : "p-3 sm:p-4"
      }`}
    >
      {/* Collapsed Minimal Bar */}
      {isCollapsed ? (
        <div className="flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={togglePlay}
              className="size-7 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center transition cursor-pointer shrink-0"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="size-3.5 fill-current" />
              ) : (
                <Play className="size-3.5 fill-current ml-0.5" />
              )}
            </button>
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground shrink-0">
              <span className="font-semibold text-foreground">
                {formatSecondsToTimestamp(currentTime)}
              </span>
              <span>/</span>
              <span>{formatSecondsToTimestamp(totalDuration)}</span>
            </div>
            {activeSegment && (
              <span className="text-xs text-muted-foreground truncate hidden sm:inline">
                <strong className="text-foreground">{activeSegment.speaker}:</strong>{" "}
                {activeSegment.text}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={cycleSpeed}
              className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-muted hover:bg-muted/80 text-foreground transition cursor-pointer"
            >
              {playbackSpeed}x
            </button>
            <button
              type="button"
              onClick={() => setIsCollapsed(false)}
              className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer"
              title="Expand player"
            >
              <ChevronDown className="size-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Full Expanded Player */
        <div className="space-y-2.5">
          {/* Header Row: Title & Active Speaker Snippet */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="size-6 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0">
                <Radio className={`size-3.5 ${isPlaying ? "animate-pulse" : ""}`} />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-foreground truncate">
                    {meetingTitle}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium shrink-0">
                    Recording
                  </span>
                </div>
                {activeSegment && (
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground truncate">
                    <User className="size-3 text-emerald-600 shrink-0" />
                    <span className="font-medium text-foreground shrink-0">
                      {activeSegment.speaker}
                    </span>
                    <span className="truncate italic">"{activeSegment.text}"</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {onToggleTranscript && (
                <button
                  type="button"
                  onClick={onToggleTranscript}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition cursor-pointer ${
                    isTranscriptOpen
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                      : "bg-background border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                  title="View synced transcript drawer"
                >
                  <FileText className="size-3.5" />
                  <span className="hidden sm:inline">Transcript</span>
                  <span className="text-[10px] font-mono font-semibold">
                    {transcript.length}
                  </span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsCollapsed(true)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer"
                title="Collapse player"
              >
                <ChevronUp className="size-4" />
              </button>
            </div>
          </div>

          {/* Scrubber Timeline with Speaker/Citation Markers */}
          <div className="space-y-1">
            <div
              className="relative group"
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                if (rect.width > 0) {
                  const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
                  setHoveredProgressTime(ratio * totalDuration)
                }
              }}
              onMouseLeave={() => setHoveredProgressTime(null)}
            >
              {/* Range Input Slider */}
              <input
                type="range"
                min={0}
                max={totalDuration}
                step={0.1}
                value={currentTime}
                onChange={handleScrubberChange}
                aria-label="Audio playback scrub bar"
                className="w-full h-1.5 sm:h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-emerald-600 transition focus:outline-none"
              />

              {/* Progress Fill Background Overlay */}
              <div
                className="absolute left-0 top-0 h-1.5 sm:h-2 bg-emerald-600 rounded-l-lg pointer-events-none transition-all"
                style={{ width: `${progressPercent}%` }}
              />

              {/* Transcript Segment Tick Markers */}
              <div className="absolute inset-x-0 top-0 h-1.5 sm:h-2 pointer-events-none overflow-hidden rounded-lg">
                {transcript.map((seg) => {
                  const segSec = parseTimestampToSeconds(seg.timestamp)
                  const leftPos = (segSec / totalDuration) * 100
                  if (leftPos <= 0 || leftPos >= 100) return null
                  return (
                    <div
                      key={seg.id}
                      className="absolute top-0 bottom-0 w-0.5 bg-background/80 hover:bg-emerald-400 transition"
                      style={{ left: `${leftPos}%` }}
                      title={`[${seg.timestamp}] ${seg.speaker}`}
                    />
                  )
                })}
              </div>
            </div>

            {/* Time Indicators */}
            <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
              <span>{formatSecondsToTimestamp(currentTime)}</span>
              {hoveredProgressTime !== null && (
                <span className="text-emerald-600">
                  Seek: {formatSecondsToTimestamp(hoveredProgressTime)}
                </span>
              )}
              <span>{formatSecondsToTimestamp(totalDuration)}</span>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex items-center justify-between pt-1">
            {/* Speed & Audio Murmur Toggle */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={cycleSpeed}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-medium border border-border/70 bg-background hover:bg-muted/50 text-foreground transition cursor-pointer"
                title="Change playback speed"
              >
                <Gauge className="size-3 text-muted-foreground" />
                <span>{playbackSpeed}x</span>
              </button>

              <button
                type="button"
                onClick={() => setIsMuted((prev) => !prev)}
                className={`p-1.5 rounded-lg border border-border/70 transition cursor-pointer ${
                  isMuted
                    ? "bg-muted text-muted-foreground"
                    : "bg-background text-foreground hover:bg-muted/50"
                }`}
                title={isMuted ? "Unmute simulated audio" : "Mute simulated audio"}
              >
                {isMuted ? (
                  <VolumeX className="size-3.5" />
                ) : (
                  <Volume2 className="size-3.5 text-emerald-600" />
                )}
              </button>
            </div>

            {/* Center Playback Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => skipSeconds(-10)}
                className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer"
                title="Skip back 10 seconds"
              >
                <RotateCcw className="size-4" />
              </button>

              <button
                type="button"
                onClick={togglePlay}
                className="size-9 rounded-full bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white flex items-center justify-center shadow-xs transition cursor-pointer"
                title={isPlaying ? "Pause (Space)" : "Play (Space)"}
              >
                {isPlaying ? (
                  <Pause className="size-4 fill-current" />
                ) : (
                  <Play className="size-4 fill-current ml-0.5" />
                )}
              </button>

              <button
                type="button"
                onClick={() => skipSeconds(10)}
                className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer"
                title="Skip forward 10 seconds"
              >
                <RotateCw className="size-4" />
              </button>
            </div>

            {/* Playing Status Pill */}
            <div className="flex items-center gap-2">
              {isPlaying && (
                <div className="flex items-center gap-1 h-3 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-medium">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span>Playing</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
