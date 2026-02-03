"use client"

import { X, Sparkles, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { PlantPart } from "./plant-explorer"

type PlantInfoProps = {
  part: PlantPart
  onClose: () => void
}

export default function PlantInfo({ part, onClose }: PlantInfoProps) {
  return (
    <div className="absolute bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-[480px] z-20 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-white/95 backdrop-blur-md border-2 border-gray-200 rounded-3xl shadow-2xl overflow-hidden">
        <div className="h-3 w-full" style={{ backgroundColor: part.color }} />
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ backgroundColor: `${part.color}30` }}
              >
                <Sparkles className="w-7 h-7" style={{ color: part.color }} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{part.name}</h3>
                <p className="text-sm text-gray-500">Plant Component</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-gray-100">
              <X className="w-5 h-5" />
            </Button>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="fun">Fun Fact</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-3">
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-gray-700 leading-relaxed">{part.description}</p>
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-3">
              <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                <p className="text-gray-700 leading-relaxed text-sm">{part.detailedInfo}</p>
              </div>
            </TabsContent>

            <TabsContent value="fun" className="space-y-3">
              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700 leading-relaxed text-sm">{part.funFact}</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex items-center gap-2 text-sm text-gray-500 mt-4 pt-4 border-t border-gray-200">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: part.color }} />
            <span>Click other parts to explore more</span>
          </div>
        </div>
      </div>
    </div>
  )
}
