import * as React from "react"
import {
  Calendar,
  ChevronDown,
  ChevronsUpDown,
  Database,
  FileText,
  Folder,
  FolderPlus,
  Home,
  Mic,
  Plus,
  Search,
  Settings,
  Sparkles,
  Users,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { FolderItem, RecentNoteItem } from "@/services/granolaService"

interface AppSidebarProps {
  activeView: string
  onSelectView: (viewId: string) => void
  onNewNote: () => void
  onOpenSearch: () => void
  onOpenSettings: () => void
  folders: FolderItem[]
  recentNotes: RecentNoteItem[]
  backendMode: "mock" | "real"
  onToggleBackendMode: () => void
}

export function AppSidebar({
  activeView,
  onSelectView,
  onNewNote,
  onOpenSearch,
  onOpenSettings,
  folders,
  recentNotes,
  backendMode,
  onToggleBackendMode,
}: AppSidebarProps) {
  const [foldersOpen, setFoldersOpen] = React.useState(true)
  const [profileOpen, setProfileOpen] = React.useState(false)
  const { state } = useSidebar()

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      {/* Sticky Header */}
      <SidebarHeader className="pt-3">
        <SidebarMenu>
          {/* Granola AI Brand Header */}
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="font-semibold">
              <div className="flex aspect-square size-7 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm">
                <Sparkles className="size-4" />
              </div>
              {state === "expanded" && (
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Granola AI</span>
                  <span className="truncate text-xs text-muted-foreground">
                    AI Notepad
                  </span>
                </div>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Primary Action: New Meeting Note */}
          <SidebarMenuItem className="mt-1">
            <SidebarMenuButton
              onClick={onNewNote}
              className="bg-emerald-600 text-white hover:bg-emerald-700 hover:text-white font-medium shadow-sm"
            >
              <Plus className="size-4 shrink-0" />
              {state === "expanded" && <span>New Meeting Note</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Cmd+K Search Trigger */}
          <SidebarMenuItem className="mt-0.5">
            <SidebarMenuButton onClick={onOpenSearch}>
              <Search className="size-4 shrink-0 text-muted-foreground" />
              {state === "expanded" && <span>Search notes...</span>}
              <SidebarMenuBadge className="text-[10px] border rounded px-1">
                ⌘K
              </SidebarMenuBadge>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Scrollable Navigation Content */}
      <SidebarContent>
        {/* Main Views */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeView === "home"}
                  onClick={() => onSelectView("home")}
                >
                  <Home className="size-4 shrink-0" />
                  {state === "expanded" && <span>All Notes</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeView === "upcoming"}
                  onClick={() => onSelectView("upcoming")}
                >
                  <Calendar className="size-4 shrink-0" />
                  {state === "expanded" && <span>Upcoming Meetings</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Collapsible Folders Section */}
        <SidebarGroup>
          <SidebarGroupLabel
            onClick={() => setFoldersOpen(!foldersOpen)}
            className="cursor-pointer select-none hover:text-sidebar-foreground"
          >
            <span>Folders</span>
            <ChevronDown
              className={`ml-auto mr-6 size-3.5 transition-transform ${
                foldersOpen ? "rotate-0" : "-rotate-90"
              }`}
            />
          </SidebarGroupLabel>
          <SidebarGroupAction title="Create Folder">
            <FolderPlus className="size-3.5" />
          </SidebarGroupAction>

          {foldersOpen && (
            <SidebarGroupContent>
              <SidebarMenu>
                {folders.map((folder) => (
                  <SidebarMenuItem key={folder.id}>
                    <SidebarMenuButton
                      isActive={activeView === `folder:${folder.id}`}
                      onClick={() => onSelectView(`folder:${folder.id}`)}
                    >
                      {folder.isShared ? (
                        <Users className="size-4 shrink-0 text-blue-500" />
                      ) : (
                        <Folder className="size-4 shrink-0 text-amber-500" />
                      )}
                      {state === "expanded" && (
                        <span className="truncate">{folder.name}</span>
                      )}
                    </SidebarMenuButton>
                    <SidebarMenuBadge>{folder.noteCount}</SidebarMenuBadge>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          )}
        </SidebarGroup>

        {/* Recent Notes Section */}
        {state === "expanded" && (
          <SidebarGroup>
            <SidebarGroupLabel>Recent Notes</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {recentNotes.map((note) => (
                  <SidebarMenuItem key={note.id}>
                    <SidebarMenuButton
                      isActive={activeView === `note:${note.id}`}
                      onClick={() => onSelectView(`note:${note.id}`)}
                    >
                      {note.isRecording ? (
                        <Mic className="size-4 shrink-0 text-emerald-500 animate-pulse" />
                      ) : (
                        <FileText className="size-4 shrink-0 text-muted-foreground" />
                      )}
                      <span className="truncate pr-12">{note.title}</span>
                    </SidebarMenuButton>
                    <SidebarMenuBadge className="text-[10px]">
                      {note.dateLabel}
                    </SidebarMenuBadge>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      {/* Sticky Footer: User Profile & Quick Switchers */}
      <SidebarFooter className="relative">
        {/* Profile Popover */}
        {profileOpen && (
          <div className="absolute bottom-full left-2 right-2 mb-2 rounded-xl border bg-popover p-1.5 shadow-lg text-popover-foreground text-xs space-y-1 z-50 animate-in fade-in-0 zoom-in-95">
            <div className="px-2 py-1.5 border-b pb-2 mb-1">
              <p className="font-semibold text-foreground">Naveen</p>
              <p className="text-[11px] text-muted-foreground">naveen@example.com</p>
            </div>
            <button
              type="button"
              onClick={() => {
                onOpenSettings()
                setProfileOpen(false)
              }}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent text-foreground transition cursor-pointer"
            >
              <Settings className="size-3.5 text-muted-foreground" />
              <span>Settings & Audio</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onToggleBackendMode()
                setProfileOpen(false)
              }}
              className="flex w-full items-center justify-between rounded-md px-2 py-1.5 hover:bg-accent text-foreground transition cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Database className={`size-3.5 ${backendMode === "mock" ? "text-amber-500" : "text-emerald-500"}`} />
                <span>Backend Mode</span>
              </span>
              <span className="font-bold text-[10px] uppercase bg-muted px-1.5 py-0.5 rounded">
                {backendMode}
              </span>
            </button>
          </div>
        )}

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              onClick={() => setProfileOpen(!profileOpen)}
              title="Naveen (Pro Workspace)"
              className="hover:bg-sidebar-accent transition rounded-lg"
            >
              <div className="flex aspect-square size-7 shrink-0 items-center justify-center rounded-lg bg-emerald-600/15 text-emerald-700 dark:text-emerald-400 font-bold text-xs">
                N
              </div>
              {state === "expanded" && (
                <>
                  <div className="grid flex-1 text-left text-xs leading-tight">
                    <span className="truncate font-semibold text-foreground">Naveen</span>
                    <span className="truncate text-[11px] text-muted-foreground">
                      Pro Workspace
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
                </>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
