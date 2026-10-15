import { Clock, FileText, Folder, Mic, Users } from "lucide-react"
import { FolderItem, RecentNoteItem } from "@/services/granolaService"
import { Badge } from "@/components/ui/badge"

interface PastMeetingsFeedProps {
  notes: RecentNoteItem[]
  folders: FolderItem[]
  onSelectNote: (noteId: string) => void
}

export function PastMeetingsFeed({
  notes,
  folders,
  onSelectNote,
}: PastMeetingsFeedProps) {
  // Helper to find folder name & color
  const getFolder = (folderId?: string) => {
    if (!folderId) return null
    return folders.find((f) => f.id === folderId)
  }

  // Group notes into Today, Yesterday, Earlier
  const groups = [
    {
      label: "Today",
      items: notes.filter(
        (n) =>
          n.dateLabel.toLowerCase().includes("now") ||
          n.dateLabel.toLowerCase().includes("today")
      ),
    },
    {
      label: "Yesterday",
      items: notes.filter((n) =>
        n.dateLabel.toLowerCase().includes("yesterday")
      ),
    },
    {
      label: "Earlier This Month",
      items: notes.filter(
        (n) =>
          !n.dateLabel.toLowerCase().includes("now") &&
          !n.dateLabel.toLowerCase().includes("today") &&
          !n.dateLabel.toLowerCase().includes("yesterday")
      ),
    },
  ].filter((g) => g.items.length > 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-2">
        <h2 className="text-sm font-semibold tracking-wide text-foreground">
          Past Meetings & Transcripts
        </h2>
        <span className="text-xs text-muted-foreground">
          {notes.length} total notes
        </span>
      </div>

      <div className="space-y-6">
        {groups.map((group) => (
          <div key={group.label} className="space-y-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 pl-1">
              {group.label}
            </h3>

            <div className="divide-y divide-border/60 rounded-xl border bg-card overflow-hidden shadow-xs">
              {group.items.map((note) => {
                const folder = getFolder(note.folderId)

                return (
                  <button
                    key={note.id}
                    type="button"
                    onClick={() => onSelectNote(note.id)}
                    className="group flex w-full items-center justify-between p-3.5 hover:bg-muted/40 transition-colors text-left cursor-pointer"
                  >
                    {/* Left: Icon, Title & Meta */}
                    <div className="flex items-center gap-3 min-w-0 pr-4">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground group-hover:text-foreground group-hover:bg-accent transition-colors">
                        {note.isRecording ? (
                          <Mic className="size-4 text-emerald-600 animate-pulse" />
                        ) : (
                          <FileText className="size-4" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="truncate font-medium text-sm text-foreground group-hover:text-emerald-600 transition-colors">
                            {note.title}
                          </span>
                          {note.isRecording && (
                            <Badge
                              variant="outline"
                              className="text-[10px] h-4 px-1 border-emerald-500/40 text-emerald-600 bg-emerald-500/10 font-normal shrink-0"
                            >
                              Live
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                          {folder && (
                            <span className="inline-flex items-center gap-1 text-[11px]">
                              {folder.isShared ? (
                                <Users className="size-3 text-blue-500" />
                              ) : (
                                <Folder className="size-3 text-amber-500" />
                              )}
                              <span>{folder.name}</span>
                            </span>
                          )}

                          {note.duration && (
                            <>
                              <span>•</span>
                              <span className="inline-flex items-center gap-1 text-[11px]">
                                <Clock className="size-3" />
                                {note.duration}
                              </span>
                            </>
                          )}

                          {note.attendees && note.attendees.length > 0 && (
                            <>
                              <span>•</span>
                              <span className="text-[11px]">
                                {note.attendees.slice(0, 2).join(", ")}
                                {note.attendees.length > 2 &&
                                  ` +${note.attendees.length - 2}`}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Date Badge */}
                    <div className="shrink-0 text-right">
                      <span className="text-xs text-muted-foreground font-medium">
                        {note.dateLabel}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
