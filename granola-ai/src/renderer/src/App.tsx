import { useEffect, useState } from "react"
import { ServiceProvider, useGranolaService } from "@/services/ServiceContext"
import { FolderItem, RecentNoteItem } from "@/services/granolaService"
import { DesktopShell } from "@/components/desktop-shell"
import { CommandPalette } from "@/components/command-palette"
import { FileText, Folder, Mic, Sparkles } from "lucide-react"

function GranolaWorkspace() {
  const { service, backendMode, toggleBackendMode } = useGranolaService()

  const [activeView, setActiveView] = useState<string>("home")
  const [isRecording, setIsRecording] = useState<boolean>(true)
  const [searchOpen, setSearchOpen] = useState<boolean>(false)
  const [folders, setFolders] = useState<FolderItem[]>([])
  const [recentNotes, setRecentNotes] = useState<RecentNoteItem[]>([])

  useEffect(() => {
    service.getFolders().then(setFolders)
    service.getRecentNotes().then(setRecentNotes)
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
      <div className="mx-auto max-w-4xl space-y-6">
        {currentNote ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1 rounded bg-muted px-2 py-0.5">
                <FileText className="size-3" /> Note ID: {currentNote.id}
              </span>
              <span>•</span>
              <span>{currentNote.dateLabel}</span>
              {currentNote.isRecording && (
                <span className="flex items-center gap-1 text-emerald-600 font-medium">
                  <Mic className="size-3 animate-pulse" /> Live Session Active
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {currentNote.title}
            </h1>
            <div className="pt-2 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Sparkles className="size-4 text-emerald-600" />
                <span>Ready for Note Content & AI Enhancement</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                You are viewing this meeting note inside the blended Desktop Shell. Next components ready to hook in: <strong>#7 Floating Mic & Audio Visualizer Pill</strong> and <strong>#12 Dual-Mode Note Editor (Rough vs. Enhanced)</strong>.
              </p>
            </div>
          </div>
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
          <div className="space-y-6">
            <div className="pb-1">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-2">
                <Sparkles className="size-3" /> Granola AI Desktop
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                All Notes
              </h1>
              <p className="mt-1 text-sm text-muted-foreground max-w-xl leading-relaxed">
                Navigation is live and connected to your swappable <strong>{backendMode.toUpperCase()}</strong> service. Toggle the sidebar anytime with <kbd className="rounded border bg-muted px-1.5 py-0.5 text-xs font-mono">⌘B</kbd> or <kbd className="rounded border bg-muted px-1.5 py-0.5 text-xs font-mono">Ctrl+B</kbd>.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Recent Notes
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {recentNotes.map((note) => (
                  <button
                    key={note.id}
                    type="button"
                    onClick={() => setActiveView(`note:${note.id}`)}
                    className="flex flex-col items-start justify-between p-4 rounded-xl border bg-card hover:border-sidebar-ring/40 hover:shadow-xs transition text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2 w-full">
                      {note.isRecording ? (
                        <Mic className="size-4 shrink-0 text-emerald-500 animate-pulse" />
                      ) : (
                        <FileText className="size-4 shrink-0 text-muted-foreground" />
                      )}
                      <span className="font-medium text-sm text-foreground truncate">
                        {note.title}
                      </span>
                    </div>
                    <span className="mt-2 text-xs text-muted-foreground">
                      {note.dateLabel}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

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
