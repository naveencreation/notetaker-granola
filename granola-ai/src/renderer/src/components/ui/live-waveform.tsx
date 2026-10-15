import { useEffect, useRef } from "react"

interface LiveWaveformProps {
  active?: boolean
  isPaused?: boolean
  barWidth?: number
  barGap?: number
  barRadius?: number
  barColor?: string
  height?: number
  className?: string
}

export function LiveWaveform({
  active = true,
  isPaused = false,
  barWidth = 3,
  barGap = 2,
  barRadius = 1.5,
  barColor = "#10b981", // Emerald-500
  height = 24,
  className = "",
}: LiveWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const isMicConnectedRef = useRef<boolean>(false)

  // Initialize Web Audio API for real microphone if available
  useEffect(() => {
    if (!active || isPaused) return

    let isMounted = true

    const initAudio = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) return

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true },
        })

        if (!isMounted) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }

        streamRef.current = stream
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext

        const audioCtx = new AudioContextClass()
        const analyser = audioCtx.createAnalyser()
        analyser.fftSize = 64
        analyser.smoothingTimeConstant = 0.8

        const source = audioCtx.createMediaStreamSource(stream)
        source.connect(analyser)

        audioContextRef.current = audioCtx
        analyserRef.current = analyser
        isMicConnectedRef.current = true
      } catch {
        // Microphone access denied or running without real hardware:
        // Gracefully fall back to synthetic voice simulation
        isMicConnectedRef.current = false
      }
    }

    initAudio()

    return () => {
      isMounted = false
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
        streamRef.current = null
      }
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close().catch(() => {})
        audioContextRef.current = null
      }
      isMicConnectedRef.current = false
    }
  }, [active, isPaused])

  // Canvas render loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let phase = 0

    const render = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()

      if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
        canvas.width = rect.width * dpr
        canvas.height = rect.height * dpr
      }

      ctx.save()
      ctx.scale(dpr, dpr)
      ctx.clearRect(0, 0, rect.width, rect.height)

      const totalBarSpace = barWidth + barGap
      const barCount = Math.floor(rect.width / totalBarSpace)
      const centerY = rect.height / 2

      ctx.fillStyle = barColor

      // Case 1: Audio is paused
      if (isPaused || !active) {
        for (let i = 0; i < barCount; i++) {
          const x = i * totalBarSpace
          const minH = 3
          ctx.beginPath()
          ctx.roundRect(x, centerY - minH / 2, barWidth, minH, barRadius)
          ctx.fill()
        }
        ctx.restore()
        return
      }

      // Case 2: Read from real AnalyserNode if connected
      if (isMicConnectedRef.current && analyserRef.current) {
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
        analyserRef.current.getByteFrequencyData(dataArray)

        for (let i = 0; i < barCount; i++) {
          const binIndex = Math.floor((i / barCount) * dataArray.length)
          const value = dataArray[binIndex] / 255.0 // 0 to 1
          const calculatedH = Math.max(3, value * rect.height * 0.95)
          const x = i * totalBarSpace

          ctx.beginPath()
          ctx.roundRect(x, centerY - calculatedH / 2, barWidth, calculatedH, barRadius)
          ctx.fill()
        }
      } else {
        // Case 3: Organic simulated harmonic speech waveform
        phase += 0.08
        for (let i = 0; i < barCount; i++) {
          const norm = i / barCount
          // Symmetric wave envelope (higher in center, lower at edges)
          const envelope = Math.sin(norm * Math.PI)
          const wave1 = Math.sin(phase + i * 0.35)
          const wave2 = Math.cos(phase * 1.5 + i * 0.2)
          const combined = Math.abs((wave1 + wave2) / 2)
          const calculatedH = Math.max(
            3,
            combined * envelope * (rect.height * 0.85) + 3
          )
          const x = i * totalBarSpace

          ctx.beginPath()
          ctx.roundRect(x, centerY - calculatedH / 2, barWidth, calculatedH, barRadius)
          ctx.fill()
        }
      }

      ctx.restore()
      animationFrameRef.current = requestAnimationFrame(render)
    }

    render()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [active, isPaused, barColor, barWidth, barGap, barRadius])

  return (
    <canvas
      ref={canvasRef}
      style={{ height }}
      className={`w-full block select-none ${className}`}
    />
  )
}
