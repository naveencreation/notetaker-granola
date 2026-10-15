import * as React from "react"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { AppSidebar } from "./app-sidebar"
import { FolderItem, RecentNoteItem } from "@/services/granolaService"
import { ChevronLeft, ChevronRight, Radio } from "lucide-react"

interface DesktopShellProps {
  children: React.ReactNode
  breadcrumbTitle?: string
  isRecording?: boolean
  onToggleRecord?: () => void
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

export function DesktopShell({
  children,
  breadcrumbTitle = "All Notes",
  isRecording = false,
  onToggleRecord,
  ...sidebarProps
}: DesktopShellProps) {
  return (
    <SidebarProvider>
      <AppSidebar {...sidebarProps} />

      <SidebarInset>
        {/* Top Desktop Bar */}
        <header className="flex h-11 shrink-0 items-center justify-between border-b px-3 bg-background/95 backdrop-blur-sm select-none">
          <div className="flex items-center gap-1.5 min-w-0 pr-3">
            <SidebarTrigger />
            <div className="flex items-center text-muted-foreground shrink-0">
              <button
                type="button"
                className="p-1 hover:text-foreground rounded-md transition-colors"
                title="Back"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                className="p-1 hover:text-foreground rounded-md transition-colors"
                title="Forward"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
            <span className="ml-1 truncate text-xs font-medium text-foreground/85 px-2 py-0.5 rounded-md bg-muted/60 max-w-[280px] sm:max-w-[420px]">
              {breadcrumbTitle}
            </span>
          </div>

          {/* Right Quick Record Indicator */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onToggleRecord}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition cursor-pointer select-none ${
                isRecording
                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 shadow-xs"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              <Radio
                className={`size-3.5 ${
                  isRecording ? "text-emerald-500 animate-pulse" : "text-muted-foreground"
                }`}
              />
              <span className="hidden sm:inline">
                {isRecording ? "Listening to Call..." : "Start Transcribing"}
              </span>
              <span className="sm:hidden">
                {isRecording ? "Listening" : "Record"}
              </span>
            </button>
          </div>
        </header>

        {/* Main Workspace Canvas */}
        <main className="flex-1 overflow-y-auto p-6 invisible-scrollbar">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
