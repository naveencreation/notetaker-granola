export interface FolderItem {
  id: string
  name: string
  noteCount: number
  isShared?: boolean
}

export interface RecentNoteItem {
  id: string
  title: string
  dateLabel: string
  folderId?: string
  isRecording?: boolean
}

export interface IGranolaService {
  getFolders(): Promise<FolderItem[]>
  getRecentNotes(): Promise<RecentNoteItem[]>
  createNewNote(): Promise<RecentNoteItem>
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
    },
    {
      id: "note-2",
      title: "Weekly Product & Design Sync",
      dateLabel: "Yesterday",
      folderId: "product",
    },
    {
      id: "note-3",
      title: "1:1 with Sarah (Frontend Architecture)",
      dateLabel: "Oct 12",
      folderId: "1on1",
    },
    {
      id: "note-4",
      title: "Seed Extension Investor Prep",
      dateLabel: "Oct 10",
      folderId: "private",
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

  async createNewNote(): Promise<RecentNoteItem> {
    const newNote: RecentNoteItem = {
      id: `note-${Date.now()}`,
      title: "Untitled Meeting Note",
      dateLabel: "Now",
      isRecording: true,
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

  async createNewNote(): Promise<RecentNoteItem> {
    if (window.electron?.ipcRenderer) {
      return await window.electron.ipcRenderer.invoke("granola:create-note")
    }
    throw new Error("Electron IPC not connected yet")
  }
}
