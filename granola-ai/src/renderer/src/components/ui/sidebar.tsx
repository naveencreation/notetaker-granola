import * as React from "react"
import { PanelLeft } from "lucide-react"
import { cn } from "@/lib/utils"

const SIDEBAR_KEYBOARD_SHORTCUT = "b"

interface SidebarContextType {
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: (open: boolean) => void
  toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContextType | null>(null)

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }
  return context
}

export function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
}: React.ComponentProps<"div"> & {
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const [_open, _setOpen] = React.useState(defaultOpen)
  const open = openProp ?? _open

  const setOpen = React.useCallback(
    (value: boolean) => {
      if (setOpenProp) {
        setOpenProp(value)
      } else {
        _setOpen(value)
      }
    },
    [setOpenProp]
  )

  const toggleSidebar = React.useCallback(() => {
    setOpen(!open)
  }, [open, setOpen])

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault()
        toggleSidebar()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [toggleSidebar])

  const state = open ? "expanded" : "collapsed"

  return (
    <SidebarContext.Provider value={{ state, open, setOpen, toggleSidebar }}>
      <div
        style={
          {
            "--sidebar-width": "16.5rem",
            "--sidebar-width-icon": "3.25rem",
            ...style,
          } as React.CSSProperties
        }
        className={cn(
          "group/sidebar-wrapper flex h-full w-full bg-sidebar text-sidebar-foreground overflow-hidden",
          className
        )}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  )
}

export function Sidebar({
  collapsible = "icon",
  variant = "inset",
  className,
  children,
}: React.ComponentProps<"aside"> & {
  collapsible?: "offcanvas" | "icon" | "none"
  variant?: "sidebar" | "floating" | "inset"
}) {
  const { state } = useSidebar()

  return (
    <aside
      data-state={state}
      data-collapsible={state === "collapsed" ? collapsible : ""}
      data-variant={variant}
      className={cn(
        "group peer relative flex h-full shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200 ease-in-out select-none",
        state === "expanded"
          ? "w-[var(--sidebar-width)]"
          : collapsible === "icon"
          ? "w-[var(--sidebar-width-icon)]"
          : "w-0 overflow-hidden border-none",
        className
      )}
    >
      {children}
    </aside>
  )
}

export function SidebarInset({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "relative flex h-full min-w-0 flex-1 flex-col bg-background overflow-hidden",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function SidebarTrigger({
  className,
  ...props
}: React.ComponentProps<"button">) {
  const { toggleSidebar } = useSidebar()
  return (
    <button
      type="button"
      onClick={toggleSidebar}
      title="Toggle Sidebar (Ctrl/Cmd + B)"
      className={cn(
        "inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors",
        className
      )}
      {...props}
    >
      <PanelLeft className="size-4" />
      <span className="sr-only">Toggle Sidebar</span>
    </button>
  )
}

export function SidebarHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col gap-1.5 p-2", className)}
      {...props}
    />
  )
}

export function SidebarContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden px-2 py-1 invisible-scrollbar",
        className
      )}
      {...props}
    />
  )
}

export function SidebarFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 border-t border-sidebar-border p-2",
        className
      )}
      {...props}
    />
  )
}

export function SidebarGroup({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("relative flex w-full min-w-0 flex-col py-1.5", className)}
      {...props}
    />
  )
}

export function SidebarGroupLabel({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { state } = useSidebar()
  if (state === "collapsed") return null
  return (
    <div
      className={cn(
        "flex h-7 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/60",
        className
      )}
      {...props}
    />
  )
}

export function SidebarGroupAction({
  className,
  ...props
}: React.ComponentProps<"button">) {
  const { state } = useSidebar()
  if (state === "collapsed") return null
  return (
    <button
      type="button"
      className={cn(
        "absolute right-2 top-2.5 flex size-5 items-center justify-center rounded-md text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground",
        className
      )}
      {...props}
    />
  )
}

export function SidebarGroupContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div className={cn("w-full text-sm", className)} {...props} />
}

export function SidebarMenu({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      className={cn("flex w-full min-w-0 flex-col gap-0.5", className)}
      {...props}
    />
  )
}

export function SidebarMenuItem({
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      className={cn("group/menu-item relative flex items-center", className)}
      {...props}
    />
  )
}

export function SidebarMenuButton({
  isActive = false,
  size = "default",
  className,
  children,
  ...props
}: React.ComponentProps<"button"> & {
  isActive?: boolean
  size?: "default" | "lg"
}) {
  const { state } = useSidebar()
  return (
    <button
      type="button"
      data-active={isActive}
      className={cn(
        "flex w-full items-center gap-2.5 overflow-hidden rounded-md px-2 text-left text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        size === "lg" ? "h-11" : "h-8",
        isActive &&
          "bg-sidebar-accent font-medium text-sidebar-accent-foreground",
        state === "collapsed" && "justify-center px-0",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function SidebarMenuBadge({
  className,
  ...props
}: React.ComponentProps<"span">) {
  const { state } = useSidebar()
  if (state === "collapsed") return null
  return (
    <span
      className={cn(
        "pointer-events-none absolute right-2 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums text-sidebar-foreground/60",
        className
      )}
      {...props}
    />
  )
}

export function SidebarRail() {
  const { toggleSidebar } = useSidebar()
  return (
    <button
      type="button"
      onClick={toggleSidebar}
      aria-label="Toggle Sidebar"
      className="absolute inset-y-0 -right-1 z-20 hidden w-2 cursor-ew-resize transition-colors hover:bg-emerald-500/30 sm:block"
    />
  )
}
