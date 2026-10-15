import { Video, Clock, Mic, ChevronRight } from "lucide-react"
import { UpcomingMeetingItem } from "@/services/granolaService"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface UpcomingMeetingsProps {
  meetings: UpcomingMeetingItem[]
  onTakeNotes: (meeting: UpcomingMeetingItem) => void
  onOpenBrief: (meeting: UpcomingMeetingItem) => void
}

export function UpcomingMeetings({
  meetings,
  onTakeNotes,
  onOpenBrief,
}: UpcomingMeetingsProps) {
  if (meetings.length === 0) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold tracking-wide text-foreground">
            Upcoming Today
          </h2>
          <Badge variant="secondary" className="text-[11px] font-normal h-5 px-1.5">
            {meetings.length} scheduled
          </Badge>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {meetings.map((meeting) => {
          const platformLabel =
            meeting.platform === "meet"
              ? "Google Meet"
              : meeting.platform === "zoom"
              ? "Zoom"
              : "Teams"

          return (
            <div
              key={meeting.id}
              className="group relative flex flex-col justify-between rounded-xl border bg-card p-4 transition-all hover:border-sidebar-ring/40 hover:shadow-xs"
            >
              <div className="space-y-3">
                {/* Top Row: Platform & Timing */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-medium">
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium border ${
                        meeting.platform === "meet"
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                          : meeting.platform === "zoom"
                          ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                          : "bg-purple-500/10 text-purple-600 border-purple-500/20"
                      }`}
                    >
                      <Video className="size-3" />
                      {platformLabel}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-muted-foreground text-[11px]">
                    {meeting.isLive ? (
                      <span className="flex items-center gap-1 text-emerald-600 font-medium">
                        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Live Now
                      </span>
                    ) : (
                      <>
                        <Clock className="size-3" />
                        <span>{meeting.timeLabel}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Meeting Title & Brief trigger */}
                <div>
                  <button
                    type="button"
                    onClick={() => onOpenBrief(meeting)}
                    className="text-left font-semibold text-sm text-foreground hover:text-emerald-600 transition-colors line-clamp-1 cursor-pointer w-full"
                    title="Click to view Pre-Meeting Brief"
                  >
                    {meeting.title}
                  </button>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                    {meeting.agenda || "No agenda set"}
                  </p>
                </div>

                {/* Attendee Avatar Stack */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center -space-x-1.5 overflow-hidden">
                    {meeting.attendees.map((attendee) => (
                      <div
                        key={attendee.email}
                        title={`${attendee.name} (${attendee.role || attendee.company || attendee.email})`}
                        className="inline-flex size-6 shrink-0 items-center justify-center rounded-full border border-background bg-muted text-[10px] font-semibold text-muted-foreground select-none"
                      >
                        {attendee.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpenBrief(meeting)}
                    className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    <span>Brief</span>
                    <ChevronRight className="size-3" />
                  </button>
                </div>
              </div>

              {/* Bottom CTA: Take Notes */}
              <div className="mt-4 pt-3 border-t">
                <Button
                  size="sm"
                  onClick={() => onTakeNotes(meeting)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs h-8 cursor-pointer gap-1.5 shadow-xs"
                >
                  <Mic className="size-3.5" />
                  <span>Take Notes</span>
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
