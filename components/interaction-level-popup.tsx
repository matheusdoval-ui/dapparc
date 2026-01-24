"use client"

import React, { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Trophy, Star, Flame, Sparkles, Zap, Target, Crown, Rocket, Share2, ChevronRight } from "lucide-react"

interface InteractionLevelPopupProps {
  isOpen: boolean
  onClose: () => void
  interactions: number
}

interface LevelInfo {
  level: number
  title: string
  icon: React.ReactNode
  color: string
  textColor: string
  bgColor: string
  borderColor: string
  glowColor: string
  minTx: number
  maxTx: number
  description: string
}

const levels: LevelInfo[] = [
  {
    level: 1,
    title: "Newcomer",
    icon: <Target className="h-10 w-10" />,
    color: "gray",
    textColor: "text-gray-400",
    bgColor: "from-gray-500/20 to-gray-600/20",
    borderColor: "border-gray-500/50",
    glowColor: "rgba(156, 163, 175, 0.5)",
    minTx: 0,
    maxTx: 49,
    description: "Starting your journey on ARC Network",
  },
  {
    level: 2,
    title: "Explorer",
    icon: <Zap className="h-10 w-10" />,
    color: "green",
    textColor: "text-green-400",
    bgColor: "from-green-500/20 to-emerald-600/20",
    borderColor: "border-green-500/50",
    glowColor: "rgba(74, 222, 128, 0.5)",
    minTx: 50,
    maxTx: 199,
    description: "Exploring the possibilities of ARC",
  },
  {
    level: 3,
    title: "Active User",
    icon: <Star className="h-10 w-10" />,
    color: "blue",
    textColor: "text-blue-400",
    bgColor: "from-blue-500/20 to-cyan-600/20",
    borderColor: "border-blue-500/50",
    glowColor: "rgba(96, 165, 250, 0.5)",
    minTx: 200,
    maxTx: 499,
    description: "A consistent presence on the network",
  },
  {
    level: 4,
    title: "Power User",
    icon: <Flame className="h-10 w-10" />,
    color: "orange",
    textColor: "text-orange-400",
    bgColor: "from-orange-500/20 to-amber-600/20",
    borderColor: "border-orange-500/50",
    glowColor: "rgba(251, 146, 60, 0.5)",
    minTx: 500,
    maxTx: 999,
    description: "Pushing the limits of ARC Network",
  },
  {
    level: 5,
    title: "Expert",
    icon: <Sparkles className="h-10 w-10" />,
    color: "purple",
    textColor: "text-purple-400",
    bgColor: "from-purple-500/20 to-violet-600/20",
    borderColor: "border-purple-500/50",
    glowColor: "rgba(192, 132, 252, 0.5)",
    minTx: 1000,
    maxTx: 2499,
    description: "A true master of decentralized tech",
  },
  {
    level: 6,
    title: "Elite",
    icon: <Trophy className="h-10 w-10" />,
    color: "yellow",
    textColor: "text-yellow-400",
    bgColor: "from-yellow-500/20 to-amber-500/20",
    borderColor: "border-yellow-500/50",
    glowColor: "rgba(250, 204, 21, 0.5)",
    minTx: 2500,
    maxTx: 4999,
    description: "Among the top users on ARC Network",
  },
  {
    level: 7,
    title: "Legend",
    icon: <Crown className="h-10 w-10" />,
    color: "cyan",
    textColor: "text-arc-accent",
    bgColor: "from-arc-accent/20 to-cyan-400/20",
    borderColor: "border-arc-accent/50",
    glowColor: "rgba(0, 174, 239, 0.5)",
    minTx: 5000,
    maxTx: 9999,
    description: "A legendary figure in the ARC ecosystem",
  },
  {
    level: 8,
    title: "OG Whale",
    icon: <Rocket className="h-10 w-10" />,
    color: "pink",
    textColor: "text-pink-400",
    bgColor: "from-pink-500/20 to-rose-500/20",
    borderColor: "border-pink-500/50",
    glowColor: "rgba(244, 114, 182, 0.5)",
    minTx: 10000,
    maxTx: Infinity,
    description: "The ultimate ARC Network power user",
  },
]

function getLevelInfo(interactions: number): LevelInfo {
  for (let i = levels.length - 1; i >= 0; i--) {
    if (interactions >= levels[i].minTx) {
      return levels[i]
    }
  }
  return levels[0]
}

function getProgressToNextLevel(interactions: number, currentLevel: LevelInfo): number {
  if (currentLevel.level === 8) return 100
  const nextLevel = levels[currentLevel.level]
  const progress = ((interactions - currentLevel.minTx) / (nextLevel.minTx - currentLevel.minTx)) * 100
  return Math.min(100, Math.max(0, progress))
}

function AnimatedNumber({ value, delay = 0 }: { value: number; delay?: number }) {
  const [displayValue, setDisplayValue] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    if (hasAnimated) return
    
    const timer = setTimeout(() => {
      const duration = 1500
      const steps = 60
      const increment = value / steps
      let current = 0
      
      const interval = setInterval(() => {
        current += increment
        if (current >= value) {
          setDisplayValue(value)
          clearInterval(interval)
        } else {
          setDisplayValue(Math.floor(current))
        }
      }, duration / steps)
      
      setHasAnimated(true)
    }, delay)
    
    return () => clearTimeout(timer)
  }, [value, delay, hasAnimated])

  return <span>{displayValue.toLocaleString()}</span>
}

export function InteractionLevelPopup({ isOpen, onClose, interactions }: InteractionLevelPopupProps) {
  const levelInfo = getLevelInfo(interactions)
  const progress = getProgressToNextLevel(interactions, levelInfo)
  const nextLevel = levelInfo.level < 8 ? levels[levelInfo.level] : null
  const [showContent, setShowContent] = useState(false)
  const [hoveredLevel, setHoveredLevel] = useState<number | null>(null)

  useEffect(() => {
    if (isOpen) {
      setShowContent(false)
      const timer = setTimeout(() => setShowContent(true), 100)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const handleShareToX = () => {
    const tweetText = `I just checked my @arc stats!

Level: ${levelInfo.title} (Lvl ${levelInfo.level})
Transactions: ${interactions.toLocaleString()} TX
${levelInfo.level === 8 ? "Maximum Level Achieved!" : `Progress to ${nextLevel?.title}: ${Math.round(progress)}%`}

Check your wallet interaction level on ARC Network!

#ArcNetwork #Web3 #Testnet`

    const tweetUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(tweetText)}`
    window.open(tweetUrl, "_blank", "noopener,noreferrer")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="overflow-hidden border-white/10 bg-background/95 p-0 backdrop-blur-xl sm:max-w-lg">
        <DialogTitle className="sr-only">Interaction Level</DialogTitle>
        
        {/* Animated Background Particles */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className={`absolute h-2 w-2 rounded-full ${levelInfo.textColor} animate-particle opacity-30`}
              style={{
                left: `${10 + (i * 8) % 80}%`,
                top: `${15 + (i * 13) % 70}%`,
                animationDelay: `${i * 0.3}s`,
                animationDuration: `${3 + (i % 3)}s`,
              }}
            />
          ))}
        </div>

        {/* Rotating Glow Ring */}
        <div 
          className="pointer-events-none absolute left-1/2 top-24 h-40 w-40 -translate-x-1/2 animate-spin-slow rounded-full opacity-20"
          style={{
            background: `conic-gradient(from 0deg, transparent, ${levelInfo.glowColor}, transparent, ${levelInfo.glowColor}, transparent)`,
          }}
        />
        
        <div className="relative flex flex-col items-center px-6 py-8">
          {/* Level Badge with Animation */}
          <div 
            className={`relative mb-6 ${showContent ? 'animate-scale-in' : 'opacity-0'}`}
            style={{ animationDelay: '0.1s' }}
          >
            {/* Outer glow ring */}
            <div 
              className={`absolute -inset-4 rounded-3xl blur-xl opacity-40`}
              style={{ backgroundColor: levelInfo.glowColor }}
            />
            
            {/* Badge container */}
            <div className={`relative flex h-28 w-28 items-center justify-center rounded-2xl border-2 bg-gradient-to-br ${levelInfo.bgColor} ${levelInfo.borderColor} transition-transform duration-300 hover:scale-110`}>
              {/* Shimmer overlay */}
              <div className="absolute inset-0 animate-shimmer rounded-2xl" />
              
              {/* Icon with glow */}
              <div className={`${levelInfo.textColor} animate-glow-pulse`}>
                {levelInfo.icon}
              </div>
              
              {/* Level number badge */}
              <div 
                className={`absolute -right-3 -top-3 flex h-10 w-10 items-center justify-center rounded-full border-2 ${levelInfo.borderColor} bg-background text-lg font-bold ${levelInfo.textColor} animate-bounce-in`}
                style={{ animationDelay: '0.4s' }}
              >
                {levelInfo.level}
              </div>
            </div>
          </div>

          {/* Title with Animation */}
          <div 
            className={`mb-1 ${showContent ? 'animate-slide-up' : 'opacity-0'}`}
            style={{ animationDelay: '0.2s' }}
          >
            <h3 className={`text-3xl font-bold ${levelInfo.textColor}`}>
              {levelInfo.title}
            </h3>
          </div>
          
          <p 
            className={`mb-6 text-center text-sm text-muted-foreground ${showContent ? 'animate-slide-up' : 'opacity-0'}`}
            style={{ animationDelay: '0.3s' }}
          >
            {levelInfo.description}
          </p>

          {/* Stats Cards with Staggered Animation */}
          <div 
            className={`mb-6 grid w-full grid-cols-2 gap-3 ${showContent ? 'animate-slide-up' : 'opacity-0'}`}
            style={{ animationDelay: '0.4s' }}
          >
            <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-4 transition-all duration-300 hover:border-arc-accent/30 hover:bg-white/10">
              <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/5 to-transparent transition-transform duration-500 group-hover:translate-x-[100%]" />
              <p className="mb-1 text-xs text-muted-foreground">Total Transactions</p>
              <p className="text-2xl font-bold text-foreground">
                <AnimatedNumber value={interactions} delay={600} />
              </p>
            </div>
            
            <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-4 transition-all duration-300 hover:border-arc-accent/30 hover:bg-white/10">
              <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/5 to-transparent transition-transform duration-500 group-hover:translate-x-[100%]" />
              <p className="mb-1 text-xs text-muted-foreground">Current Level</p>
              <p className={`text-2xl font-bold ${levelInfo.textColor}`}>
                {levelInfo.title}
              </p>
            </div>
          </div>

          {/* Progress Bar with Animation */}
          {nextLevel && (
            <div 
              className={`mb-6 w-full ${showContent ? 'animate-slide-up' : 'opacity-0'}`}
              style={{ animationDelay: '0.5s' }}
            >
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className={`font-medium ${levelInfo.textColor}`}>{levelInfo.title}</span>
                <span className="text-muted-foreground">
                  <ChevronRight className="inline h-3 w-3" /> {nextLevel.title}
                </span>
              </div>
              <div className="relative h-4 w-full overflow-hidden rounded-full bg-white/10">
                {/* Animated progress fill */}
                <div
                  className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${levelInfo.bgColor.replace('/20', '/80')} animate-progress-fill`}
                  style={{ 
                    width: `${progress}%`,
                    boxShadow: `0 0 20px ${levelInfo.glowColor}`,
                  }}
                />
                {/* Shimmer on progress bar */}
                <div 
                  className="absolute inset-0 animate-shimmer"
                  style={{ animationDuration: '3s' }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>{interactions.toLocaleString()} TX</span>
                <span className="font-medium text-foreground">{Math.round(progress)}%</span>
                <span>{nextLevel.minTx.toLocaleString()} TX</span>
              </div>
              <p className="mt-2 text-center text-xs text-muted-foreground">
                <span className={`font-semibold ${levelInfo.textColor}`}>
                  {(nextLevel.minTx - interactions).toLocaleString()}
                </span> transactions to level up
              </p>
            </div>
          )}

          {levelInfo.level === 8 && (
            <div 
              className={`mb-6 flex items-center gap-2 rounded-full border border-pink-500/30 bg-pink-500/10 px-4 py-2 ${showContent ? 'animate-bounce-in' : 'opacity-0'}`}
              style={{ animationDelay: '0.5s' }}
            >
              <Rocket className="h-4 w-4 animate-pulse text-pink-400" />
              <span className="text-sm font-medium text-pink-400">Maximum Level Achieved!</span>
            </div>
          )}

          {/* Interactive Level Preview */}
          <div 
            className={`mb-6 w-full ${showContent ? 'animate-slide-up' : 'opacity-0'}`}
            style={{ animationDelay: '0.6s' }}
          >
            <p className="mb-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
              All Levels
            </p>
            <div className="flex justify-center gap-2">
              {levels.map((level, index) => {
                const isUnlocked = level.level <= levelInfo.level
                const isCurrent = level.level === levelInfo.level
                const isHovered = hoveredLevel === level.level
                
                return (
                  <div
                    key={level.level}
                    className="relative"
                    onMouseEnter={() => setHoveredLevel(level.level)}
                    onMouseLeave={() => setHoveredLevel(null)}
                  >
                    {/* Tooltip */}
                    {isHovered && (
                      <div className="absolute -top-12 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-background/95 px-3 py-1.5 text-xs backdrop-blur-sm">
                        <p className={`font-semibold ${level.textColor}`}>{level.title}</p>
                        <p className="text-muted-foreground">{level.minTx.toLocaleString()}+ TX</p>
                      </div>
                    )}
                    
                    <div
                      className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border transition-all duration-300 ${
                        isCurrent
                          ? `${level.borderColor} ${level.textColor} bg-gradient-to-br ${level.bgColor} scale-110 shadow-lg`
                          : isUnlocked
                            ? `${level.borderColor} ${level.textColor} bg-gradient-to-br ${level.bgColor} hover:scale-110`
                            : "border-white/10 bg-white/5 text-muted-foreground/30 hover:border-white/20"
                      }`}
                      style={{
                        animationDelay: `${0.7 + index * 0.05}s`,
                        boxShadow: isCurrent ? `0 0 20px ${level.glowColor}` : undefined,
                      }}
                    >
                      <span className="text-sm font-bold">{level.level}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Action Buttons with Animation */}
          <div 
            className={`flex w-full gap-3 ${showContent ? 'animate-slide-up' : 'opacity-0'}`}
            style={{ animationDelay: '0.7s' }}
          >
            <Button
              onClick={handleShareToX}
              variant="outline"
              className="group relative flex-1 gap-2 overflow-hidden rounded-xl border-white/10 bg-white/5 py-6 font-semibold transition-all duration-300 hover:border-arc-accent/50 hover:bg-arc-accent/10 hover:text-arc-accent"
            >
              <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-arc-accent/10 to-transparent transition-transform duration-500 group-hover:translate-x-[100%]" />
              <Share2 className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
              Share on X
            </Button>
            <Button
              onClick={onClose}
              className="relative flex-1 overflow-hidden rounded-xl bg-arc-accent py-6 font-semibold text-white transition-all duration-300 hover:bg-arc-accent/90 hover:shadow-[0_0_30px_rgba(0,174,239,0.4)]"
            >
              <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 hover:translate-x-[100%]" />
              Continue
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
