import { useEffect, useState } from "react"
import { ServiceProvider, useGranolaService } from "@/services/ServiceContext"
import { FolderItem, RecentNoteItem, UpcomingMeetingItem } from "@/services/granolaService"
import { DesktopShell } from "@/components/desktop-shell"
import { CommandPalette } from "@/components/command-palette"
import { HomeDashboard } from "@/components/home-dashboard"
import { AudioVisualizerPill } from "@/components/audio-visualizer-pill"
import { NoteEditor } from "@/components/note-editor"
import { Folder } from "lucide-react"

function GranolaWorkspace() {
  const { service, backendMode, toggleBackendMode } = useGranolaService()

  const [activeView, setActiveView] = useState<string>("home")
  const [isRecording, setIsRecording] = useState<boolean>(true)
  const [searchOpen, setSearchOpen] = useState<boolean>(false)
  const [folders, setFolders] = useState<FolderItem[]>([])
  const [recentNotes, setRecentNotes] = useState<RecentNoteItem[]>([])
  const [upcomingMeetings, setUpcomingMeetings] = useState<UpcomingMeetingItem[]>([])

  useEffect(() => {
    service.getFolders().then(setFolders)
    service.getRecentNotes().then(setRecentNotes)
    service.getUpcomingMeetings().then(setUpcomingMeetings)
  }, [service])

  // Global Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setSearchOpen((prev) => !prev)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const handleNewNote = async () => {
    const created = await service.createNewNote()
    const updated = await service.getRecentNotes()
    setRecentNotes(updated)
    setActiveView(`note:${created.id}`)
    setIsRecording(true)
  }

  const handleTakeNotesForMeeting = async (meeting: UpcomingMeetingItem) => {
    const created = await service.createNewNote(meeting.title)
    const updated = await service.getRecentNotes()
    setRecentNotes(updated)
    setActiveView(`note:${created.id}`)
    setIsRecording(true)
  }

  // Dynamic breadcrumb label
  const breadcrumbTitle = (() => {
    if (activeView === "home") return "All Notes"
    if (activeView === "upcoming") return "Upcoming Meetings"
    if (activeView.startsWith("folder:")) {
      const folderId = activeView.replace("folder:", "")
      const f = folders.find((item) => item.id === folderId)
      return f ? `Folders / ${f.name}` : "Folders"
    }
    if (activeView.startsWith("note:")) {
      const noteId = activeView.replace("note:", "")
      const n = recentNotes.find((item) => item.id === noteId)
      return n ? n.title : "Meeting Note"
    }
    return activeView
  })()

  // Find active note if currently viewing a note
  const currentNote = activeView.startsWith("note:")
    ? recentNotes.find((n) => n.id === activeView.replace("note:", ""))
    : null

  // Find active folder if currently viewing a folder
  const currentFolder = activeView.startsWith("folder:")
    ? folders.find((f) => f.id === activeView.replace("folder:", ""))
    : null

  return (
    <DesktopShell
      breadcrumbTitle={breadcrumbTitle}
      isRecording={isRecording}
      onToggleRecord={() => setIsRecording(!isRecording)}
      activeView={activeView}
      onSelectView={setActiveView}
      onNewNote={handleNewNote}
      onOpenSearch={() => setSearchOpen(true)}
      onOpenSettings={() => alert("Component #18 (Settings Modal) goes here!")}
      folders={folders}
      recentNotes={recentNotes}
      backendMode={backendMode}
      onToggleBackendMode={toggleBackendMode}
    >
      <div className="mx-auto max-w-5xl space-y-6">
        {currentNote ? (
          <NoteEditor
            note={currentNote}
            folders={folders}
            onUpdateNote={(updated) => {
              setRecentNotes((prev) =>
                prev.map((n) => (n.id === updated.id ? updated : n))
              )
            }}
            isRecording={isRecording}
          />
        ) : currentFolder ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1 rounded bg-muted px-2 py-0.5">
                <Folder className="size-3 text-amber-500" /> Folder
              </span>
              <span>•</span>
              <span>{currentFolder.noteCount} notes</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {currentFolder.name}
            </h1>
            <div className="grid gap-3 sm:grid-cols-2">
              {recentNotes
                .filter((n) => n.folderId === currentFolder.id)
                .map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => setActiveView(`note:${n.id}`)}
                    className="flex flex-col items-start gap-1 p-4 rounded-xl border bg-card hover:bg-accent/50 text-left transition"
                  >
                    <span className="font-medium text-sm text-foreground truncate w-full">
                      {n.title}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {n.dateLabel}
                    </span>
                  </button>
                ))}
            </div>
          </div>
        ) : (
          <HomeDashboard
            upcomingMeetings={upcomingMeetings}
            recentNotes={recentNotes}
            folders={folders}
            onSelectNote={(noteId) => setActiveView(`note:${noteId}`)}
            onTakeNotesForMeeting={handleTakeNotesForMeeting}
            onNewNote={handleNewNote}
            backendMode={backendMode}
          />
        )}
      </div>

      <AudioVisualizerPill
        isRecording={isRecording}
        onToggleRecord={() => setIsRecording(!isRecording)}
        onEndAndEnhance={() => {
          setIsRecording(false)
          if (!activeView.startsWith("note:") && recentNotes[0]) {
            setActiveView(`note:${recentNotes[0].id}`)
          }
        }}
        meetingTitle={currentNote?.title}
      />

      <CommandPalette
        open={searchOpen}
        onOpenChange={setSearchOpen}
        recentNotes={recentNotes}
        folders={folders}
        onSelectNote={(noteId) => setActiveView(`note:${noteId}`)}
        onSelectFolder={(folderId) => setActiveView(`folder:${folderId}`)}
        onNewNote={handleNewNote}
        onOpenSettings={() => alert("Component #18 (Settings Modal) goes here!")}
        onToggleBackendMode={toggleBackendMode}
        backendMode={backendMode}
      />
    </DesktopShell>
  )
}

export default function App() {
  return (
    <ServiceProvider>
      <GranolaWorkspace />
    </ServiceProvider>
  )
}
