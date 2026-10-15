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

export interface CitationItem {
  id: string
  timestamp: string
  speaker: string
  quote: string
}

export interface EnhancedNotesData {
  summary: string
  keyDecisions: {
    text: string
    citation?: CitationItem
  }[]
  actionItems: {
    id: string
    text: string
    owner: string
    completed: boolean
    citation?: CitationItem
  }[]
  nextSteps?: string
}

export interface RecentNoteItem {
  id: string
  title: string
  dateLabel: string
  folderId?: string
  isRecording?: boolean
  duration?: string
  attendees?: string[]
  template?: string
  roughNotes?: string
  enhancedNotes?: EnhancedNotesData
}

export interface IGranolaService {
  getFolders(): Promise<FolderItem[]>
  getRecentNotes(): Promise<RecentNoteItem[]>
  getUpcomingMeetings(): Promise<UpcomingMeetingItem[]>
  createNewNote(title?: string, folderId?: string): Promise<RecentNoteItem>
  updateNote(noteId: string, updates: Partial<RecentNoteItem>): Promise<RecentNoteItem>
}

// 1. MOCK BACKEND (Active during frontend development)
export class MockGranolaService implements IGranolaService {
  private notes: RecentNoteItem[] = [
    {
      id: "note-1",
      title: "Acme Corp — Q4 Enterprise Demo",
      dateLabel: "Just now",
      folderId: "sales",
      isRecording: false,
      duration: "14m",
      attendees: ["Sarah Lin", "Dave Miller"],
      template: "Sales Discovery",
      roughNotes: `• Dave confirmed VPC peering is complete on AWS us-east-1
• Need SAML SSO setup by Oct 24 for security compliance
• Sarah asked about enterprise SLA (99.99%) & custom DPA
• Pricing proposal: Enterprise Tier ($24,000/yr) for 50 seats
• Action: send security whitepaper + revised MSA by Friday`,
      enhancedNotes: {
        summary:
          "Acme Corp completed their technical evaluation for the Q4 Enterprise rollout. VPC network isolation is confirmed on AWS us-east-1. The team agreed on a target go-live date of October 24th, pending SAML SSO integration and legal review of the enterprise SLA.",
        keyDecisions: [
          {
            text: "VPC peering successfully configured with AWS us-east-1 production clusters",
            citation: {
              id: "c1",
              timestamp: "04:12",
              speaker: "Dave Miller",
              quote:
                "We finished the VPC peering routes yesterday and latency benchmarks came back under 8ms.",
            },
          },
          {
            text: "SAML 2.0 SSO rollout scheduled for October 24th with Acme IT team",
            citation: {
              id: "c2",
              timestamp: "08:45",
              speaker: "Dave Miller",
              quote:
                "Let's lock in Oct 24 for the Okta SAML connector so IT can provision user groups in one batch.",
            },
          },
          {
            text: "Enterprise Tier agreed at $24,000/yr covering 50 seats with 99.99% SLA",
            citation: {
              id: "c3",
              timestamp: "11:20",
              speaker: "Sarah Lin",
              quote:
                "The pricing tier works within our Q4 budget, provided the SLA includes 24/7 dedicated Slack support.",
            },
          },
        ],
        actionItems: [
          {
            id: "a1",
            text: "Send revised Enterprise MSA and security whitepaper",
            owner: "You",
            completed: false,
            citation: {
              id: "c4",
              timestamp: "13:30",
              speaker: "Sarah Lin",
              quote:
                "Send over the updated MSA by Thursday so our legal counsel can turn around revisions by Friday.",
            },
          },
          {
            id: "a2",
            text: "Configure Okta SAML metadata XML file in staging",
            owner: "Dave Miller",
            completed: true,
            citation: {
              id: "c5",
              timestamp: "12:15",
              speaker: "Dave Miller",
              quote:
                "I'll upload the metadata XML to your staging environment before Monday morning.",
            },
          },
          {
            id: "a3",
            text: "Schedule 30m onboarding session for engineering team",
            owner: "Sarah Lin",
            completed: false,
          },
        ],
        nextSteps: "Follow up with Sarah on Friday with the signed DPA and scheduling link.",
      },
    },
    {
      id: "note-2",
      title: "Weekly Product & Design Sync",
      dateLabel: "Yesterday",
      folderId: "product",
      duration: "45m",
      attendees: ["Alex Rivera", "Elena Rostova"],
      template: "Product Sync",
      roughNotes: `• Elena shared user feedback on the audio visualizer: needs to blend directly, no outer card borders
• Alex refined dark mode tokens for the sidebar
• Review command palette fuzzy match performance
• Decision: Launch v1.2 next Tuesday`,
      enhancedNotes: {
        summary:
          "Reviewed sprint deliverables for the design system overhaul. The team prioritized canvas-blended components over card containers and finalized dark mode tokens.",
        keyDecisions: [
          {
            text: "Adopt canvas-blended design system with invisible scrollbars across all desktop views",
          },
          {
            text: "Schedule v1.2 release for next Tuesday following QA verification",
          },
        ],
        actionItems: [
          {
            id: "a4",
            text: "Refine audio visualizer docking states",
            owner: "Alex Rivera",
            completed: true,
          },
          {
            id: "a5",
            text: "Conduct 5 user usability interviews on transcript citations",
            owner: "Elena Rostova",
            completed: false,
          },
        ],
      },
    },
    {
      id: "note-3",
      title: "1:1 with Sarah (Frontend Architecture)",
      dateLabel: "Oct 12",
      folderId: "1on1",
      duration: "30m",
      attendees: ["Sarah Lin"],
      template: "1:1 Meeting",
      roughNotes: `• Sarah feeling confident about the modular service layer pattern
• Discussed career goals: Staff Engineer path in Q1
• Feedback: pair programming sessions are going really well`,
    },
    {
      id: "note-4",
      title: "Seed Extension Investor Prep",
      dateLabel: "Oct 10",
      folderId: "private",
      duration: "52m",
      attendees: ["Marcus Vance", "Chloe Bennett"],
      template: "Executive Brief",
      roughNotes: `• $1.2M ARR run-rate milestone reached
• Retention is 84% at Month 6
• Next board meeting set for November 15`,
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
      roughNotes: "",
    }
    this.notes = [newNote, ...this.notes]
    return newNote
  }

  async updateNote(noteId: string, updates: Partial<RecentNoteItem>): Promise<RecentNoteItem> {
    const index = this.notes.findIndex((n) => n.id === noteId)
    if (index === -1) {
      throw new Error(`Note not found: ${noteId}`)
    }
    const updated = { ...this.notes[index], ...updates }
    this.notes[index] = updated
    return updated
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

  async updateNote(noteId: string, updates: Partial<RecentNoteItem>): Promise<RecentNoteItem> {
    if (window.electron?.ipcRenderer) {
      return await window.electron.ipcRenderer.invoke("granola:update-note", { noteId, updates })
    }
    throw new Error("Electron IPC not connected yet")
  }
}
