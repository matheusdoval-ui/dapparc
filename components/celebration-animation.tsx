"use client"

import { useEffect, useState } from "react"

interface FallingItem {
  id: number
  x: number
  delay: number
  duration: number
  type: "smile" | "logo"
}

export function CelebrationAnimation({ isActive }: { isActive: boolean }) {
  const [items, setItems] = useState<FallingItem[]>([])

  useEffect(() => {
    if (isActive) {
      const newItems: FallingItem[] = []
      for (let i = 0; i < 30; i++) {
        newItems.push({
          id: i,
          x: Math.random() * 100,
          delay: Math.random() * 0.5,
          duration: 2 + Math.random() * 2,
          type: Math.random() > 0.3 ? "smile" : "logo",
        })
      }
      setItems(newItems)

      const timeout = setTimeout(() => {
        setItems([])
      }, 4500)

      return () => clearTimeout(timeout)
    }
  }, [isActive])

  if (!isActive || items.length === 0) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {items.map((item) => (
        <div
          key={item.id}
          className="absolute animate-fall"
          style={{
            left: `${item.x}%`,
            animationDelay: `${item.delay}s`,
            animationDuration: `${item.duration}s`,
          }}
        >
          {item.type === "smile" ? (
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-lg"
            >
              <circle cx="16" cy="16" r="14" fill="#00AEEF" />
              <circle cx="11" cy="13" r="2" fill="white" />
              <circle cx="21" cy="13" r="2" fill="white" />
              <path
                d="M10 19C10 19 12 23 16 23C20 23 22 19 22 19"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-arc-accent shadow-lg shadow-arc-accent/30">
              <span className="text-lg font-bold text-white">A</span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
