import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UpcomingMeetingItem } from "@/services/granolaService"
import {
  Clock,
  FileText,
  Mail,
  Mic,
  Sparkles,
  Users,
  Video,
} from "lucide-react"

interface PreMeetingBriefDialogProps {
  meeting: UpcomingMeetingItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onTakeNotes: (meeting: UpcomingMeetingItem) => void
  onOpenNote?: (noteId: string) => void
}

export function PreMeetingBriefDialog({
  meeting,
  open,
  onOpenChange,
  onTakeNotes,
}: PreMeetingBriefDialogProps) {
  if (!meeting) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 overflow-hidden shadow-xl rounded-xl">
        {/* Header Banner */}
        <div className="bg-muted/40 p-6 border-b space-y-2">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="capitalize text-xs font-medium border-emerald-500/30 text-emerald-600 bg-emerald-500/10"
            >
              <Video className="size-3 mr-1" />
              {meeting.platform}
            </Badge>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="size-3" />
              {meeting.timeLabel} ({meeting.duration})
            </span>
          </div>

          <DialogTitle className="text-xl font-bold text-foreground">
            {meeting.title}
          </DialogTitle>
        </div>

        <div className="p-6 space-y-6 max-h-[420px] overflow-y-auto invisible-scrollbar">
          {/* AI Pre-Meeting Brief / Agenda */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Sparkles className="size-3.5 text-emerald-600" />
              <span>Meeting Objectives & Context</span>
            </div>
            <p className="text-sm text-foreground/90 leading-relaxed rounded-lg border bg-card p-3.5 shadow-xs">
              {meeting.agenda || "No pre-set agenda. Granola AI will generate real-time structure once live transcription begins."}
            </p>
          </div>

          {/* Attendees Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Users className="size-3.5 text-muted-foreground" />
              <span>Participants ({meeting.attendees.length})</span>
            </div>
            <div className="divide-y rounded-lg border bg-card">
              {meeting.attendees.map((attendee) => (
                <div
                  key={attendee.email}
                  className="flex items-center justify-between p-3 text-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-600/15 text-emerald-700 dark:text-emerald-400 font-bold text-xs select-none">
                      {attendee.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{attendee.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {attendee.role
                          ? `${attendee.role} • ${attendee.company || ""}`
                          : attendee.email}
                      </p>
                    </div>
                  </div>
                  <a
                    href={`mailto:${attendee.email}`}
                    title={`Email ${attendee.name}`}
                    className="p-1.5 text-muted-foreground hover:text-foreground rounded-md transition"
                  >
                    <Mail className="size-4" />
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Past Notes with these Attendees */}
          {meeting.lastMetTitle && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <FileText className="size-3.5 text-muted-foreground" />
                <span>Previous Note with Attendees</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border bg-card p-3 text-sm">
                <div className="flex items-center gap-2 truncate pr-2">
                  <FileText className="size-4 text-emerald-600 shrink-0" />
                  <span className="truncate text-foreground font-medium">
                    {meeting.lastMetTitle}
                  </span>
                </div>
                <Badge variant="outline" className="text-[10px] shrink-0">
                  Past Context
                </Badge>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 p-4 border-t bg-muted/20">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer text-xs"
          >
            Close
          </Button>
          <Button
            size="sm"
            onClick={() => {
              onTakeNotes(meeting)
              onOpenChange(false)
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs cursor-pointer gap-1.5 shadow-xs"
          >
            <Mic className="size-3.5" />
            <span>Launch Note & Transcribe</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
