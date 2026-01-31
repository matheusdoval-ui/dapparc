"use client"

import { useEffect, useRef, useState } from "react"
import { Volume2, VolumeX } from "lucide-react"

export function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [enabled, setEnabled] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    if (enabled) return
    const handleFirstInteraction = () => {
      if (!audioRef.current) return
      audioRef.current.volume = 0.15
      audioRef.current.play()
        .then(() => {
          setEnabled(true)
          setIsPlaying(true)
        })
        .catch(() => setEnabled(true))
    }
    window.addEventListener("click", handleFirstInteraction, { once: true })
    return () => window.removeEventListener("click", handleFirstInteraction)
  }, [enabled])

  const togglePlayPause = () => {
    if (!audioRef.current) return
    if (!enabled) {
      audioRef.current.volume = 0.15
      audioRef.current.play().then(() => {
        setEnabled(true)
        setIsPlaying(true)
      }).catch(() => {})
      return
    }
    if (audioRef.current.paused) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {})
    } else {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  return (
    <>
      <audio
        ref={audioRef}
        loop
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      >
        <source src="/audio/futuristic-ambient.mp3" type="audio/mpeg" />
      </audio>

      <button
        onClick={togglePlayPause}
        aria-label={isPlaying ? "Mute background music" : "Play background music"}
        className="fixed bottom-4 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-lg border border-arc-accent/20 bg-black/60 text-white backdrop-blur transition-all hover:border-arc-accent/40 hover:bg-arc-accent/10 hover:text-arc-accent"
      >
        {isPlaying ? (
          <Volume2 className="h-5 w-5" />
        ) : (
          <VolumeX className="h-5 w-5" />
        )}
      </button>
    </>
  )
}
