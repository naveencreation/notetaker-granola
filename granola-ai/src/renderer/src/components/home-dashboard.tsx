import { useState } from "react"
import { Sparkles, Plus } from "lucide-react"
import {
  FolderItem,
  RecentNoteItem,
  UpcomingMeetingItem,
} from "@/services/granolaService"
import { UpcomingMeetings } from "./upcoming-meetings"
import { PreMeetingBriefDialog } from "./pre-meeting-brief-dialog"
import { PastMeetingsFeed } from "./past-meetings-feed"
import { Button } from "@/components/ui/button"

interface HomeDashboardProps {
  upcomingMeetings: UpcomingMeetingItem[]
  recentNotes: RecentNoteItem[]
  folders: FolderItem[]
  onSelectNote: (noteId: string) => void
  onTakeNotesForMeeting: (meeting: UpcomingMeetingItem) => void
  onNewNote: () => void
  backendMode: "mock" | "real"
}

export function HomeDashboard({
  upcomingMeetings,
  recentNotes,
  folders,
  onSelectNote,
  onTakeNotesForMeeting,
  onNewNote,
  backendMode,
}: HomeDashboardProps) {
  const [selectedBriefMeeting, setSelectedBriefMeeting] =
    useState<UpcomingMeetingItem | null>(null)
  const [briefOpen, setBriefOpen] = useState(false)

  const handleOpenBrief = (meeting: UpcomingMeetingItem) => {
    setSelectedBriefMeeting(meeting)
    setBriefOpen(true)
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-12">
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-2">
            <Sparkles className="size-3" />
            <span>Granola AI • {backendMode.toUpperCase()} Mode</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Good morning, Naveen
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            You have{" "}
            <span className="font-medium text-foreground">
              {upcomingMeetings.length} meetings
            </span>{" "}
            scheduled today. Granola is ready to transcribe and enhance.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            onClick={onNewNote}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs h-9 cursor-pointer gap-1.5 shadow-xs"
          >
            <Plus className="size-4" />
            <span>New Scratchpad Note</span>
          </Button>
        </div>
      </div>

      {/* Component #4: Upcoming Meetings Carousel/Grid */}
      <UpcomingMeetings
        meetings={upcomingMeetings}
        onTakeNotes={onTakeNotesForMeeting}
        onOpenBrief={handleOpenBrief}
      />

      {/* Component #6: Past Meetings Feed List */}
      <PastMeetingsFeed
        notes={recentNotes}
        folders={folders}
        onSelectNote={onSelectNote}
      />

      {/* Component #5: Pre-Meeting Brief Popover Dialog */}
      <PreMeetingBriefDialog
        meeting={selectedBriefMeeting}
        open={briefOpen}
        onOpenChange={setBriefOpen}
        onTakeNotes={onTakeNotesForMeeting}
        onOpenNote={onSelectNote}
      />
    </div>
  )
}
