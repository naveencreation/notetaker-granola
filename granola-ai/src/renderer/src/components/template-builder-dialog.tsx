import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { TemplateItem } from "@/services/granolaService"
import {
  LayoutTemplate,
  Plus,
  Trash2,
  Sparkles,
  Check,
  X,
  Layers,
  Wand2,
} from "lucide-react"

interface TemplateBuilderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  templates: TemplateItem[]
  onSaveTemplate: (template: TemplateItem) => Promise<void> | void
  onDeleteTemplate: (templateId: string) => Promise<void> | void
  activeTemplateName?: string
  onSelectTemplate?: (templateName: string) => void
}

const EMOJI_OPTIONS = ["🎯", "🚀", "💡", "👥", "📊", "⚡", "📝", "🔍", "🤝", "🔥"]

export function TemplateBuilderDialog({
  open,
  onOpenChange,
  templates,
  onSaveTemplate,
  onDeleteTemplate,
  activeTemplateName,
  onSelectTemplate,
}: TemplateBuilderDialogProps) {
  const [selectedId, setSelectedId] = useState<string>("")
  const [name, setName] = useState<string>("")
  const [icon, setIcon] = useState<string>("🎯")
  const [description, setDescription] = useState<string>("")
  const [promptInstructions, setPromptInstructions] = useState<string>("")
  const [sections, setSections] = useState<string[]>([])
  const [newSectionInput, setNewSectionInput] = useState<string>("")
  const [isSaved, setIsSaved] = useState<boolean>(false)

  // Initialize selected template when opened
  useEffect(() => {
    if (open && templates.length > 0) {
      const match =
        templates.find((t) => t.name === activeTemplateName) || templates[0]
      if (match) {
        loadTemplate(match)
      }
    }
  }, [open, activeTemplateName, templates])

  const loadTemplate = (t: TemplateItem) => {
    setSelectedId(t.id)
    setName(t.name)
    setIcon(t.icon || "🎯")
    setDescription(t.description || "")
    setPromptInstructions(t.promptInstructions || "")
    setSections([...(t.sections || [])])
    setIsSaved(false)
  }

  const handleCreateNew = () => {
    const newId = `custom-tpl-${Date.now()}`
    setSelectedId(newId)
    setName("Custom Extraction Template")
    setIcon("⚡")
    setDescription("Customized AI extraction instructions for team syncs.")
    setPromptInstructions(
      "Extract the primary strategic decisions, document specific numbers and deadlines mentioned, and list action items with assigned owners."
    )
    setSections(["Executive Summary", "Key Decisions", "Immediate Action Items"])
    setIsSaved(false)
  }

  const handleAddSection = () => {
    const s = newSectionInput.trim()
    if (s && !sections.includes(s)) {
      setSections((prev) => [...prev, s])
      setNewSectionInput("")
    }
  }

  const handleRemoveSection = (sectionToRemove: string) => {
    setSections((prev) => prev.filter((s) => s !== sectionToRemove))
  }

  const handleSave = async () => {
    if (!name.trim()) return

    const tpl: TemplateItem = {
      id: selectedId,
      name: name.trim(),
      icon,
      description: description.trim(),
      promptInstructions: promptInstructions.trim(),
      sections,
      isCustom: true,
    }

    await onSaveTemplate(tpl)
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2000)
    onSelectTemplate?.(tpl.name)
  }

  const handleDelete = async () => {
    if (!selectedId) return
    await onDeleteTemplate(selectedId)
    if (templates.length > 1) {
      const remaining = templates.filter((t) => t.id !== selectedId)
      if (remaining[0]) {
        loadTemplate(remaining[0])
      }
    }
  }

  const currentTemplate = templates.find((t) => t.id === selectedId)
  const isCustom = currentTemplate?.isCustom || selectedId.startsWith("custom-")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl p-0 overflow-hidden bg-background/98 dark:bg-zinc-950/98 backdrop-blur-2xl border-border/80 shadow-2xl select-none">
        <DialogHeader className="sr-only">
          <DialogTitle>Meeting Template Customizer</DialogTitle>
          <DialogDescription>
            Build custom AI meeting templates with tailored prompt directives and extraction sections.
          </DialogDescription>
        </DialogHeader>

        <div className="flex h-[560px]">
          {/* Left Navigation: Templates List */}
          <aside className="w-60 border-r border-border/60 bg-muted/20 p-3 flex flex-col justify-between shrink-0">
            <div className="space-y-3">
              <div className="flex items-center justify-between px-2 pt-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                  <LayoutTemplate className="size-3.5 text-emerald-500" />
                  <span>Templates</span>
                </div>

                <button
                  type="button"
                  onClick={handleCreateNew}
                  className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition cursor-pointer shadow-2xs"
                  title="Create new custom template"
                >
                  <Plus className="size-3" />
                  <span>New</span>
                </button>
              </div>

              {/* Template Items */}
              <div className="space-y-1 overflow-y-auto max-h-[440px] invisible-scrollbar pr-1">
                {templates.map((t) => {
                  const isSelected = selectedId === t.id
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => loadTemplate(t)}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition cursor-pointer ${
                        isSelected
                          ? "bg-secondary text-foreground font-semibold shadow-2xs"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm shrink-0">{t.icon || "🎯"}</span>
                        <div className="truncate">
                          <div className="truncate font-medium">{t.name}</div>
                          <div className="text-[10px] text-muted-foreground truncate">
                            {t.sections.length} sections
                          </div>
                        </div>
                      </div>

                      {t.isCustom && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-600 shrink-0 font-medium ml-1">
                          Custom
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="p-2 border-t border-border/40 text-[11px] text-muted-foreground flex items-center gap-1.5">
              <Wand2 className="size-3.5 text-emerald-500 shrink-0" />
              <span>AI adapts synthesis to selected template</span>
            </div>
          </aside>

          {/* Right Editor: Template Customization */}
          <main className="flex-1 overflow-y-auto p-6 space-y-5 select-text">
            {/* Header / Name / Emoji */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {/* Emoji Selector */}
                <div className="relative group shrink-0">
                  <div className="size-11 rounded-xl border border-border/70 bg-muted/30 flex items-center justify-center text-xl shadow-2xs cursor-pointer hover:border-emerald-500 transition">
                    {icon}
                  </div>
                  <div className="absolute top-12 left-0 hidden group-hover:flex items-center gap-1 p-1.5 rounded-xl border border-border/80 bg-background shadow-xl z-20">
                    {EMOJI_OPTIONS.map((e) => (
                      <button
                        key={e}
                        type="button"
                        onClick={() => setIcon(e)}
                        className="p-1 hover:bg-muted rounded text-sm transition cursor-pointer"
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex-1 space-y-1">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Template Name"
                    className="w-full text-base font-bold text-foreground bg-transparent border-none outline-none focus:ring-0 p-0 placeholder:text-muted-foreground/40"
                  />
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of when to use this template..."
                    className="w-full text-xs text-muted-foreground bg-transparent border-none outline-none focus:ring-0 p-0 placeholder:text-muted-foreground/40"
                  />
                </div>
              </div>
            </div>

            {/* Target Output Sections */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <Layers className="size-3.5 text-emerald-500" />
                  <span>Output Brief Sections</span>
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {sections.length} sections defined
                </span>
              </div>

              {/* Sections Chips */}
              <div className="flex flex-wrap items-center gap-1.5">
                {sections.map((sec) => (
                  <span
                    key={sec}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border/70 bg-muted/40 text-xs font-medium text-foreground/90 shadow-2xs"
                  >
                    <span>{sec}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSection(sec)}
                      className="text-muted-foreground hover:text-foreground p-0.5 rounded transition"
                      title="Remove section"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Add Section Input */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={newSectionInput}
                  onChange={(e) => setNewSectionInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddSection()
                    }
                  }}
                  placeholder="Add custom section (e.g. Objections, Budget, KPIs)..."
                  className="flex-1 text-xs rounded-lg border border-border/70 bg-background p-2 text-foreground outline-none focus:border-emerald-500 transition"
                />
                <button
                  type="button"
                  onClick={handleAddSection}
                  className="px-3 py-2 rounded-lg text-xs font-medium bg-secondary hover:bg-secondary/80 text-foreground transition cursor-pointer shrink-0"
                >
                  Add Section
                </button>
              </div>
            </div>

            {/* Custom AI Prompt Directives */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-emerald-500" />
                  <span>AI Extraction Prompt Directives</span>
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Granola Prompt Engine
                </span>
              </div>

              <textarea
                rows={5}
                value={promptInstructions}
                onChange={(e) => setPromptInstructions(e.target.value)}
                placeholder="Instruct the AI what to look for in the audio transcript and notes..."
                className="w-full text-xs font-mono rounded-xl border border-border/70 bg-background p-3 text-foreground outline-none focus:border-emerald-500 transition leading-relaxed resize-none shadow-inner"
              />

              <p className="text-[11px] text-muted-foreground">
                These instructions guide Granola's synthesis engine to extract relevant quotes and timestamp grounding.
              </p>
            </div>

            {/* Bottom Actions Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-border/60">
              {isCustom ? (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-red-500 hover:bg-red-500/10 transition cursor-pointer"
                  title="Delete template"
                >
                  <Trash2 className="size-3.5" />
                  <span>Delete</span>
                </button>
              ) : (
                <span className="text-[11px] text-muted-foreground italic">
                  Built-in template (Save creates custom variant)
                </span>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground transition cursor-pointer"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!name.trim()}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white shadow-xs transition-all cursor-pointer disabled:opacity-40"
                >
                  {isSaved ? (
                    <>
                      <Check className="size-3.5" />
                      <span>Template Saved!</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-3.5" />
                      <span>Save Template</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </main>
        </div>
      </DialogContent>
    </Dialog>
  )
}
