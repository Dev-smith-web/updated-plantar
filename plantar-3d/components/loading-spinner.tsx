"use client"

import { useProgress } from "@react-three/drei"
import { Loader2 } from "lucide-react"

export default function LoadingSpinner() {
  const { active, progress } = useProgress()

  if (!active) return null

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <div className="text-center">
          <p className="text-lg font-semibold text-foreground">Loading Plant</p>
          <p className="text-sm text-muted-foreground">{Math.round(progress)}%</p>
        </div>
      </div>
    </div>
  )
}
