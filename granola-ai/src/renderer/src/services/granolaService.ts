export interface FolderItem {
  id: string
  name: string
  noteCount: number
  isShared?: boolean
}

export interface MeetingAttendee {
  name: string
  email: string
  avatar?: string
  role?: string
  company?: string
}

export interface UpcomingMeetingItem {
  id: string
  title: string
  timeLabel: string
  duration: string
  platform: "meet" | "zoom" | "teams"
  isLive?: boolean
  attendees: MeetingAttendee[]
  agenda?: string
  lastMetTitle?: string
}

export interface RecentNoteItem {
  id: string
  title: string
  dateLabel: string
  folderId?: string
  isRecording?: boolean
  duration?: string
  attendees?: string[]
}

export interface IGranolaService {
  getFolders(): Promise<FolderItem[]>
  getRecentNotes(): Promise<RecentNoteItem[]>
  getUpcomingMeetings(): Promise<UpcomingMeetingItem[]>
  createNewNote(title?: string, folderId?: string): Promise<RecentNoteItem>
}

// 1. MOCK BACKEND (Active during frontend development)
export class MockGranolaService implements IGranolaService {
  private notes: RecentNoteItem[] = [
    {
      id: "note-1",
      title: "Acme Corp — Q4 Enterprise Demo",
      dateLabel: "Just now",
      folderId: "sales",
      isRecording: true,
      duration: "14m",
      attendees: ["Sarah Lin", "Dave Miller"],
    },
    {
      id: "note-2",
      title: "Weekly Product & Design Sync",
      dateLabel: "Yesterday",
      folderId: "product",
      duration: "45m",
      attendees: ["Alex Rivera", "Elena Rostova"],
    },
    {
      id: "note-3",
      title: "1:1 with Sarah (Frontend Architecture)",
      dateLabel: "Oct 12",
      folderId: "1on1",
      duration: "30m",
      attendees: ["Sarah Lin"],
    },
    {
      id: "note-4",
      title: "Seed Extension Investor Prep",
      dateLabel: "Oct 10",
      folderId: "private",
      duration: "52m",
      attendees: ["Marcus Vance", "Chloe Bennett"],
    },
  ]

  private upcomingMeetings: UpcomingMeetingItem[] = [
    {
      id: "meet-1",
      title: "Acme Corp — Security & Deployment Review",
      timeLabel: "In 15m • 11:30 AM",
      duration: "45m",
      platform: "meet",
      isLive: true,
      attendees: [
        {
          name: "Sarah Lin",
          email: "sarah.lin@acme.com",
          role: "VP Engineering",
          company: "Acme Corp",
        },
        {
          name: "Dave Miller",
          email: "dave.m@acme.com",
          role: "Head of Infrastructure",
          company: "Acme Corp",
        },
      ],
      agenda:
        "Finalize VPC network isolation, SSO SAML 2.0 enforcement, and data encryption keys before production signoff.",
      lastMetTitle: "Acme Corp — Q4 Enterprise Demo (Just now)",
    },
    {
      id: "meet-2",
      title: "Design System & Waveform Polish",
      timeLabel: "Today • 2:00 PM",
      duration: "30m",
      platform: "zoom",
      attendees: [
        {
          name: "Alex Rivera",
          email: "alex@granola.ai",
          role: "Design Lead",
          company: "Granola",
        },
        {
          name: "Elena Rostova",
          email: "elena@granola.ai",
          role: "Staff UX Researcher",
          company: "Granola",
        },
      ],
      agenda:
        "Review interaction states for the floating mic indicator, dark mode tokens, and transcript side drawer.",
      lastMetTitle: "Weekly Product & Design Sync (Yesterday)",
    },
    {
      id: "meet-3",
      title: "Q4 Investor Roadmap & Metrics Sync",
      timeLabel: "Today • 4:30 PM",
      duration: "45m",
      platform: "teams",
      attendees: [
        {
          name: "Marcus Vance",
          email: "m.vance@sequoia.com",
          role: "Partner",
          company: "Sequoia Capital",
        },
        {
          name: "Chloe Bennett",
          email: "chloe@sequoia.com",
          role: "Investment Associate",
          company: "Sequoia Capital",
        },
      ],
      agenda:
        "Quarterly check-in on enterprise annual recurring revenue, organic retention, and hiring plan.",
      lastMetTitle: "Seed Extension Investor Prep (Oct 10)",
    },
  ]

  async getFolders(): Promise<FolderItem[]> {
    return [
      { id: "sales", name: "Sales Discovery", noteCount: 12, isShared: true },
      { id: "1on1", name: "Team 1-on-1s", noteCount: 8, isShared: false },
      { id: "product", name: "Product Syncs", noteCount: 19, isShared: true },
      { id: "private", name: "Private Scratchpad", noteCount: 4, isShared: false },
    ]
  }

  async getRecentNotes(): Promise<RecentNoteItem[]> {
    return [...this.notes]
  }

  async getUpcomingMeetings(): Promise<UpcomingMeetingItem[]> {
    return [...this.upcomingMeetings]
  }

  async createNewNote(title?: string, folderId?: string): Promise<RecentNoteItem> {
    const newNote: RecentNoteItem = {
      id: `note-${Date.now()}`,
      title: title || "Untitled Meeting Note",
      dateLabel: "Now",
      folderId,
      isRecording: true,
      duration: "0m",
    }
    this.notes = [newNote, ...this.notes]
    return newNote
  }
}

// 2. REAL ELECTRON / API BACKEND (Ready to swap in with 1 click)
export class RealElectronGranolaService implements IGranolaService {
  async getFolders(): Promise<FolderItem[]> {
    if (window.electron?.ipcRenderer) {
      return await window.electron.ipcRenderer.invoke("granola:get-folders")
    }
    return []
  }

  async getRecentNotes(): Promise<RecentNoteItem[]> {
    if (window.electron?.ipcRenderer) {
      return await window.electron.ipcRenderer.invoke("granola:get-recent-notes")
    }
    return []
  }

  async getUpcomingMeetings(): Promise<UpcomingMeetingItem[]> {
    if (window.electron?.ipcRenderer) {
      return await window.electron.ipcRenderer.invoke("granola:get-upcoming-meetings")
    }
    return []
  }

  async createNewNote(title?: string, folderId?: string): Promise<RecentNoteItem> {
    if (window.electron?.ipcRenderer) {
      return await window.electron.ipcRenderer.invoke("granola:create-note", { title, folderId })
    }
    throw new Error("Electron IPC not connected yet")
  }
}
