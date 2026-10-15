import { useState } from "react"
import { UpcomingMeetingItem } from "@/services/granolaService"
import { Sparkles, Video, X } from "lucide-react"

interface MeetingDetectedBannerProps {
  meeting: UpcomingMeetingItem
  isRecording: boolean
  onTakeNotes: (meeting: UpcomingMeetingItem) => void
  onDismiss?: () => void
  className?: string
}

export function MeetingDetectedBanner({
  meeting,
  isRecording,
  onTakeNotes,
  onDismiss,
  className = "",
}: MeetingDetectedBannerProps) {
  const [dismissed, setDismissed] = useState<boolean>(false)

  // Don't show if user is already recording or dismissed
  if (isRecording || dismissed) return null

  const handleDismiss = () => {
    setDismissed(true)
    onDismiss?.()
  }

  const platformBadge = {
    meet: { label: "Google Meet", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
    zoom: { label: "Zoom Call", color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
    teams: { label: "MS Teams", color: "text-purple-500 bg-purple-500/10 border-purple-500/20" },
  }[meeting.platform] || { label: "Live Call", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" }

  return (
    <aside
      aria-label="Meeting detected"
      className={`fixed top-14 left-1/2 -translate-x-1/2 z-40 w-full max-w-xl px-4 animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-none select-none ${className}`}
    >
      <div className="pointer-events-auto flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl border border-emerald-500/30 bg-background/95 dark:bg-zinc-900/95 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all">
        {/* Left: Pulsing Status & Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>

          <div className="flex items-center gap-1.5 min-w-0">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border shrink-0 ${platformBadge.color}`}>
              <Video className="size-2.5 inline mr-1" />
              {platformBadge.label}
            </span>
            <span className="text-xs font-medium text-foreground truncate max-w-[200px] sm:max-w-[260px]">
              {meeting.title}
            </span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onTakeNotes(meeting)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white shadow-xs transition-all cursor-pointer"
          >
            <Sparkles className="size-3.5" />
            <span>Take Notes</span>
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer"
            title="Dismiss notification"
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>
    </aside>
  )
}
