import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Settings,
  Mic,
  Bot,
  Calendar,
  Keyboard,
  CheckCircle2,
} from "lucide-react"

interface SettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  backendMode: "mock" | "real"
  onToggleBackendMode: () => void
}

type SettingsSection = "audio" | "ai" | "calendar" | "shortcuts"

export function SettingsModal({
  open,
  onOpenChange,
  backendMode,
  onToggleBackendMode,
}: SettingsModalProps) {
  const [activeSection, setActiveSection] = useState<SettingsSection>("audio")
  const [inputDevice, setInputDevice] = useState<string>("default")
  const [systemAudioLoopback, setSystemAudioLoopback] = useState<boolean>(true)
  const [autoDetectCalls, setAutoDetectCalls] = useState<boolean>(true)
  const [noiseSuppression, setNoiseSuppression] = useState<boolean>(true)
  const [customVocab, setCustomVocab] = useState<string>("Acme Corp, VPC, Okta, SAML 2.0, DPA, MSA, SLA")
  const [modelChoice, setModelChoice] = useState<string>("gemini-flash")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden bg-background/98 dark:bg-zinc-950/98 backdrop-blur-2xl border-border/80 shadow-2xl select-none">
        <DialogHeader className="sr-only">
          <DialogTitle>Granola Settings</DialogTitle>
          <DialogDescription>
            Manage audio devices, AI models, calendar sync, and keyboard shortcuts.
          </DialogDescription>
        </DialogHeader>

        <div className="flex h-[480px]">
          {/* Left Navigation Sidebar */}
          <aside className="w-48 border-r border-border/60 bg-muted/20 p-3 space-y-1 shrink-0">
            <div className="px-3 py-2 text-xs font-bold text-foreground flex items-center gap-2 mb-2">
              <Settings className="size-3.5 text-emerald-500" />
              <span>Settings</span>
            </div>

            {[
              { id: "audio", label: "Audio & Mic", icon: Mic },
              { id: "ai", label: "AI & Synthesis", icon: Bot },
              { id: "calendar", label: "Calendar Sync", icon: Calendar },
              { id: "shortcuts", label: "Shortcuts", icon: Keyboard },
            ].map((sec) => {
              const Icon = sec.icon
              const isActive = activeSection === sec.id
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setActiveSection(sec.id as SettingsSection)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer text-left ${
                    isActive
                      ? "bg-secondary text-foreground font-semibold shadow-2xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <Icon className="size-3.5" />
                  <span>{sec.label}</span>
                </button>
              )
            })}

            {/* Bottom Backend Indicator */}
            <div className="pt-24 px-2">
              <div className="rounded-xl border border-border/60 p-2.5 bg-background/60 text-[11px] space-y-1.5">
                <div className="text-muted-foreground font-medium">Backend Engine</div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 capitalize">
                    {backendMode} Mode
                  </span>
                  <button
                    type="button"
                    onClick={onToggleBackendMode}
                    className="text-[10px] text-muted-foreground hover:text-foreground underline cursor-pointer"
                  >
                    Switch
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* Right Content Area */}
          <main className="flex-1 overflow-y-auto p-6 space-y-5 select-text">
            {activeSection === "audio" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Audio & Microphone</h3>
                  <p className="text-xs text-muted-foreground">
                    Configure your audio input devices and dual-channel system capture.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground block">
                      Microphone Input Device
                    </label>
                    <select
                      value={inputDevice}
                      onChange={(e) => setInputDevice(e.target.value)}
                      className="w-full text-xs rounded-lg border border-border bg-background p-2 text-foreground outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="default">Default — Built-in Studio Microphone</option>
                      <option value="airpods">AirPods Pro (Bluetooth Audio)</option>
                      <option value="usb">USB Condenser Cardioid Mic</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/20">
                    <div>
                      <div className="text-xs font-medium text-foreground">
                        Dual-Channel System Audio Loopback
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        Captures meeting attendees directly from system audio for studio clarity.
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={systemAudioLoopback}
                      onChange={(e) => setSystemAudioLoopback(e.target.checked)}
                      className="accent-emerald-600 size-4 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/20">
                    <div>
                      <div className="text-xs font-medium text-foreground">
                        AI Background Noise Suppression
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        Filters out keyboard clicks, ambient room rumble, and echo.
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={noiseSuppression}
                      onChange={(e) => setNoiseSuppression(e.target.checked)}
                      className="accent-emerald-600 size-4 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeSection === "ai" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">AI & Synthesis</h3>
                  <p className="text-xs text-muted-foreground">
                    Tailor how Granola synthesizes meeting rough notes with audio transcripts.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground block">
                      Synthesis Model
                    </label>
                    <select
                      value={modelChoice}
                      onChange={(e) => setModelChoice(e.target.value)}
                      className="w-full text-xs rounded-lg border border-border bg-background p-2 text-foreground outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="gemini-flash">Gemini 2.5 Flash (Ultra-fast, lowest latency)</option>
                      <option value="gemini-pro">Gemini 2.5 Pro (Deep reasoning, complex transcripts)</option>
                      <option value="claude-sonnet">Claude 3.5 Sonnet (Nuanced business synthesis)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground block">
                      Custom Vocabulary & Domain Acronyms
                    </label>
                    <textarea
                      rows={3}
                      value={customVocab}
                      onChange={(e) => setCustomVocab(e.target.value)}
                      placeholder="e.g. company names, acronyms, team jargon..."
                      className="w-full text-xs rounded-lg border border-border bg-background p-2 text-foreground outline-none focus:border-emerald-500 resize-none font-mono"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Comma-separated words to bias speech recognition accuracy.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "calendar" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Calendar Integration</h3>
                  <p className="text-xs text-muted-foreground">
                    Sync upcoming meetings for pre-meeting briefs and live call detection.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/20">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                        <CheckCircle2 className="size-4" />
                      </div>
                      <div>
                        <div className="text-xs font-medium text-foreground">
                          Google Calendar (Connected)
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          naveen@acmecorp.com • Primary Workspace
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 font-medium">
                      Active
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/20">
                    <div>
                      <div className="text-xs font-medium text-foreground">
                        Auto-Detect Live Calls
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        Show a floating banner when Zoom, Meet, or Teams opens.
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={autoDetectCalls}
                      onChange={(e) => setAutoDetectCalls(e.target.checked)}
                      className="accent-emerald-600 size-4 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeSection === "shortcuts" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Global Keyboard Shortcuts</h3>
                  <p className="text-xs text-muted-foreground">
                    Accelerate your workflow with system-wide desktop shortcuts.
                  </p>
                </div>

                <div className="space-y-2 pt-2 text-xs">
                  {[
                    { action: "Toggle Recording / Audio Pill", keys: ["⌥ Option", "Space"] },
                    { action: "Quick New Note", keys: ["⌘ Cmd", "N"] },
                    { action: "Global Command Palette & Search", keys: ["⌘ Cmd", "K"] },
                    { action: "Toggle Sidebar Collapse", keys: ["⌘ Cmd", "B"] },
                    { action: "Enhance Note with AI", keys: ["⌘ Cmd", "E"] },
                  ].map((s) => (
                    <div
                      key={s.action}
                      className="flex items-center justify-between p-2.5 rounded-lg border border-border/40 hover:bg-muted/20 transition"
                    >
                      <span className="text-muted-foreground font-medium">{s.action}</span>
                      <div className="flex items-center gap-1 font-mono text-[10px]">
                        {s.keys.map((k) => (
                          <kbd
                            key={k}
                            className="px-2 py-0.5 rounded border border-border/80 bg-muted/60 text-foreground font-semibold shadow-2xs"
                          >
                            {k}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </main>
        </div>
      </DialogContent>
    </Dialog>
  )
}
