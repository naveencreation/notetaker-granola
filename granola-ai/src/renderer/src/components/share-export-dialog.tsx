import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { RecentNoteItem } from "@/services/granolaService"
import {
  Share2,
  Copy,
  Check,
  Mail,
  MessageSquare,
  FileText,
  Sparkles,
  Layers,
  CheckSquare,
} from "lucide-react"

interface ShareExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  note: RecentNoteItem
}

type ExportFormat = "slack" | "email" | "markdown" | "notion" | "linear"

export function ShareExportDialog({
  open,
  onOpenChange,
  note,
}: ShareExportDialogProps) {
  const [activeTab, setActiveTab] = useState<ExportFormat>("slack")
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null)

  // Generate format-specific previews
  const getFormattedContent = (format: ExportFormat): string => {
    const summary = note.enhancedNotes?.summary || note.roughNotes || "No summary recorded."
    const decisions = note.enhancedNotes?.keyDecisions.map((k) => `• ${k.text}`).join("\n") || "• None recorded"
    const actions = note.enhancedNotes?.actionItems.map((a) => `• [${a.completed ? "x" : " "}] *${a.owner}*: ${a.text}`).join("\n") || "• None recorded"

    switch (format) {
      case "slack":
        return `*📋 ${note.title}*
_${note.dateLabel} • ${note.duration || "30m"} • Attendees: ${note.attendees?.join(", ") || "Team"}_

*Summary*
${summary}

*Key Decisions*
${decisions}

*Action Items*
${note.enhancedNotes?.actionItems.map((a) => `${a.completed ? "✅" : "⬜"} *${a.owner}*: ${a.text}`).join("\n") || "• None recorded"}

_Generated with Granola AI_`

      case "email":
        return `Subject: Recap & Next Steps: ${note.title}

Hi everyone,

Thank you for your time during our sync today. Here is the distilled summary, decisions reached, and our active next steps:

SUMMARY
${summary}

KEY DECISIONS
${decisions}

NEXT STEPS & ACTION ITEMS
${note.enhancedNotes?.actionItems.map((a) => `• ${a.owner}: ${a.text} (Status: ${a.completed ? "Done" : "Pending"})`).join("\n") || "• None"}

Best regards,
${note.attendees?.[0] || "Team"}`

      case "markdown":
        return `# ${note.title}
Date: ${note.dateLabel}
Attendees: ${note.attendees?.join(", ") || "Team"}

## Executive Summary
${summary}

## Key Decisions
${decisions}

## Action Items
${note.enhancedNotes?.actionItems.map((a) => `- [${a.completed ? "x" : " "}] **${a.owner}**: ${a.text}`).join("\n") || "- None"}

## Verbatim Highlights
${note.transcript?.slice(0, 3).map((t) => `> **${t.speaker}** [${t.timestamp}]: ${t.text}`).join("\n\n") || "No transcript segments recorded."}`

      case "notion":
        return `[Notion Page Block Schema]
Title: ${note.title}
Properties:
  - Date: ${note.dateLabel}
  - Attendees: ${note.attendees?.join(", ")}
  - Status: Documented
Blocks:
  - Callout: ${summary}
  - Heading 2: Key Decisions
  - Bulleted List: ${decisions}
  - Heading 2: Action Items
  - To-do items: ${actions}`

      case "linear":
        return `Linear Issue Export:
Project: Customer Rollout
Issues Created:
${note.enhancedNotes?.actionItems.map((a, i) => `${i + 1}. [TODO] ${a.text} (Assignee: ${a.owner})`).join("\n") || "No open action items"}`
    }
  }

  const currentContent = getFormattedContent(activeTab)

  const handleCopy = (format: string) => {
    navigator.clipboard.writeText(currentContent)
    setCopiedFormat(format)
    setTimeout(() => setCopiedFormat(null), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden bg-background/98 dark:bg-zinc-950/98 backdrop-blur-2xl border-border/80 shadow-2xl select-none">
        <DialogHeader className="px-6 pt-5 pb-3 border-b border-border/60">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <Share2 className="size-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Share & Export
            </span>
          </div>
          <DialogTitle className="text-base font-bold text-foreground">
            {note.title}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Export formatted notes with 1-click styling tailored for your communication tools.
          </DialogDescription>
        </DialogHeader>

        {/* Format Switcher Tabs */}
        <div className="flex items-center gap-1.5 px-6 pt-3 border-b border-border/40 overflow-x-auto invisible-scrollbar">
          {[
            { id: "slack", label: "Slack", icon: MessageSquare },
            { id: "email", label: "Email", icon: Mail },
            { id: "markdown", label: "Markdown", icon: FileText },
            { id: "notion", label: "Notion", icon: Layers },
            { id: "linear", label: "Linear", icon: CheckSquare },
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as ExportFormat)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border-b-2 transition cursor-pointer shrink-0 ${
                  isActive
                    ? "border-emerald-500 text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                }`}
              >
                <Icon className="size-3.5" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Content Preview Box */}
        <div className="p-6 space-y-4">
          <div className="relative rounded-xl border border-border/70 bg-muted/30 p-4 font-mono text-xs text-foreground/90 max-h-60 overflow-y-auto select-text whitespace-pre-wrap leading-relaxed shadow-inner">
            {currentContent}
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Sparkles className="size-3 text-emerald-500" />
              Includes AI summary, decisions & actions
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleCopy(activeTab)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white shadow-xs transition-all cursor-pointer"
              >
                {copiedFormat === activeTab ? (
                  <>
                    <Check className="size-3.5" />
                    <span>Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-3.5" />
                    <span>Copy for {activeTab.toUpperCase()}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
