import {
  Database,
  FileText,
  Folder,
  Mic,
  Plus,
  Settings,
  Users,
} from "lucide-react"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { FolderItem, RecentNoteItem } from "@/services/granolaService"

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  recentNotes: RecentNoteItem[]
  folders: FolderItem[]
  onSelectNote: (noteId: string) => void
  onSelectFolder: (folderId: string) => void
  onNewNote: () => void
  onOpenSettings: () => void
  onToggleBackendMode: () => void
  backendMode: "mock" | "real"
}

export function CommandPalette({
  open,
  onOpenChange,
  recentNotes,
  folders,
  onSelectNote,
  onSelectFolder,
  onNewNote,
  onOpenSettings,
  onToggleBackendMode,
  backendMode,
}: CommandPaletteProps) {
  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search meetings, folders, or commands... (⌘K)" />
      <CommandList className="max-h-[360px] invisible-scrollbar p-1">
        <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
          No matching notes, folders, or actions found.
        </CommandEmpty>

        {/* Quick Actions */}
        <CommandGroup heading="Actions">
          <CommandItem
            onSelect={() => {
              onNewNote()
              onOpenChange(false)
            }}
            className="flex items-center gap-2 cursor-pointer py-2"
          >
            <div className="flex size-5 items-center justify-center rounded bg-emerald-600 text-white">
              <Plus className="size-3" />
            </div>
            <span className="font-medium text-foreground">New Meeting Note</span>
            <CommandShortcut>⌘N</CommandShortcut>
          </CommandItem>

          <CommandItem
            onSelect={() => {
              onToggleBackendMode()
              onOpenChange(false)
            }}
            className="flex items-center gap-2 cursor-pointer py-2"
          >
            <Database
              className={`size-4 ${
                backendMode === "mock" ? "text-amber-500" : "text-emerald-500"
              }`}
            />
            <span>
              Toggle Data Mode (Active:{" "}
              <strong className="uppercase">{backendMode}</strong>)
            </span>
          </CommandItem>

          <CommandItem
            onSelect={() => {
              onOpenSettings()
              onOpenChange(false)
            }}
            className="flex items-center gap-2 cursor-pointer py-2"
          >
            <Settings className="size-4 text-muted-foreground" />
            <span>Settings & Audio</span>
            <CommandShortcut>⌘,</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Meeting Notes */}
        <CommandGroup heading="Recent Notes">
          {recentNotes.map((note) => (
            <CommandItem
              key={note.id}
              value={`${note.title} ${note.id}`}
              onSelect={() => {
                onSelectNote(note.id)
                onOpenChange(false)
              }}
              className="flex items-center justify-between cursor-pointer py-2"
            >
              <div className="flex items-center gap-2.5 truncate">
                {note.isRecording ? (
                  <Mic className="size-4 shrink-0 text-emerald-500 animate-pulse" />
                ) : (
                  <FileText className="size-4 shrink-0 text-muted-foreground" />
                )}
                <span className="truncate text-foreground font-medium">
                  {note.title}
                </span>
              </div>
              <CommandShortcut className="text-[11px] text-muted-foreground shrink-0 pl-3">
                {note.dateLabel}
              </CommandShortcut>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        {/* Folders */}
        <CommandGroup heading="Folders">
          {folders.map((folder) => (
            <CommandItem
              key={folder.id}
              value={`${folder.name} folder`}
              onSelect={() => {
                onSelectFolder(folder.id)
                onOpenChange(false)
              }}
              className="flex items-center justify-between cursor-pointer py-2"
            >
              <div className="flex items-center gap-2.5 truncate">
                {folder.isShared ? (
                  <Users className="size-4 shrink-0 text-blue-500" />
                ) : (
                  <Folder className="size-4 shrink-0 text-amber-500" />
                )}
                <span className="truncate text-foreground font-medium">
                  {folder.name}
                </span>
              </div>
              <CommandShortcut className="text-[11px] text-muted-foreground shrink-0 pl-3">
                {folder.noteCount} notes
              </CommandShortcut>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
