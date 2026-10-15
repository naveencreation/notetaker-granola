import { useEffect, useRef, useState } from "react"

// Types for Web Speech API
interface SpeechRecognitionEventLike extends Event {
  resultIndex: number
  results: {
    length: number
    [index: number]: {
      isFinal: boolean
      [index: number]: {
        transcript: string
        confidence: number
      }
    }
  }
}

interface SpeechRecognitionErrorEventLike extends Event {
  error: string
  message?: string
}

interface SpeechRecognitionInstance {
  continuous: boolean
  interimResults: boolean
  lang: string
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null
  onend: (() => void) | null
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance
  }
}

interface UseLiveSpeechRecognitionProps {
  active: boolean
  isPaused?: boolean
  isMuted?: boolean
  onFinalTranscript: (text: string) => void
}

export function useLiveSpeechRecognition({
  active,
  isPaused = false,
  isMuted = false,
  onFinalTranscript,
}: UseLiveSpeechRecognitionProps) {
  const [interimText, setInterimText] = useState<string>("")
  const [isListening, setIsListening] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const shouldListenRef = useRef<boolean>(false)

  // Track active desired state
  shouldListenRef.current = active && !isPaused && !isMuted

  const isSupported =
    typeof window !== "undefined" &&
    Boolean(window.SpeechRecognition || window.webkitSpeechRecognition)

  useEffect(() => {
    if (!isSupported) {
      setError("Speech recognition is not supported in this environment.")
      return undefined
    }

    const SpeechRecClass =
      window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecClass) return undefined

    const recognition = new SpeechRecClass()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = "en-US"
    recognitionRef.current = recognition

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      let interim = ""
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const text = result[0]?.transcript || ""
        if (result.isFinal) {
          const trimmed = text.trim()
          if (trimmed) {
            onFinalTranscript(trimmed)
          }
        } else {
          interim += text
        }
      }
      setInterimText(interim)
    }

    recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
      // "no-speech" is normal when user is quiet
      if (event.error === "no-speech") return
      console.warn("Speech recognition notice:", event.error)
      setError(event.error)
    }

    recognition.onend = () => {
      setIsListening(false)
      setInterimText("")
      // Automatically keep listening if still active
      if (shouldListenRef.current) {
        try {
          recognition.start()
          setIsListening(true)
        } catch {
          // Ignore start attempt if already starting
        }
      }
    }

    return () => {
      shouldListenRef.current = false
      try {
        recognition.stop()
      } catch {
        // Safe unmount
      }
      recognitionRef.current = null
    }
  }, [isSupported, onFinalTranscript])

  // Reactively start or stop based on active & pause states
  useEffect(() => {
    const recognition = recognitionRef.current
    if (!recognition) return

    if (active && !isPaused && !isMuted) {
      try {
        recognition.start()
        setIsListening(true)
        setError(null)
      } catch {
        // Recognition already active
      }
    } else {
      try {
        recognition.stop()
        setIsListening(false)
        setInterimText("")
      } catch {
        // Already stopped
      }
    }
  }, [active, isPaused, isMuted])

  return {
    interimText,
    isListening,
    error,
    isSupported,
  }
}
