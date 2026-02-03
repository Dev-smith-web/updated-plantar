"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment, PerspectiveCamera } from "@react-three/drei"
import { Suspense, useState } from "react"
import PlantScene from "./plant-scene"
import PlantInfo from "./plant-info"
import LoadingSpinner from "./loading-spinner"
import { Leaf, RotateCw, ZoomIn, ZoomOut, Info, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"

export type PlantPart = {
  id: string
  name: string
  description: string
  detailedInfo: string
  funFact: string
  color: string
}

export type PlantType = {
  id: string
  name: string
  scientificName: string
  description: string
  habitat: string
  growthTime: string
  parts: PlantPart[]
}

const plants: PlantType[] = [
  {
    id: "sunflower",
    name: "Sunflower",
    scientificName: "Helianthus annuus",
    description: "A tall, bright flowering plant that tracks the sun's movement across the sky",
    habitat: "Native to North America, grows in sunny areas with well-drained soil",
    growthTime: "70-100 days from seed to flower",
    parts: [
      {
        id: "flower",
        name: "Flower Head",
        description: "The flower produces seeds and attracts pollinators with its bright yellow petals",
        detailedInfo:
          "The sunflower head is actually made up of thousands of tiny flowers called florets. The outer ray florets are the yellow petals we see, while the inner disk florets develop into seeds.",
        funFact: "A single sunflower head can contain up to 2,000 seeds!",
        color: "#FFD700",
      },
      {
        id: "petals",
        name: "Petals (Ray Florets)",
        description: "Bright yellow petals that attract bees, butterflies, and other pollinators",
        detailedInfo:
          "Each petal is actually a complete flower called a ray floret. They're sterile and exist only to attract pollinators to the fertile disk florets in the center.",
        funFact: "Sunflower petals always grow in a Fibonacci spiral pattern!",
        color: "#FFC107",
      },
      {
        id: "center",
        name: "Disk Florets (Center)",
        description: "The dark center contains hundreds of tiny flowers that become seeds",
        detailedInfo:
          "The disk florets are arranged in a mesmerizing spiral pattern. Each tiny floret will develop into a sunflower seed after pollination.",
        funFact: "The spiral pattern in the center follows the golden ratio found throughout nature!",
        color: "#8B4513",
      },
      {
        id: "leaves",
        name: "Leaves",
        description: "Large, heart-shaped leaves that use sunlight to make food through photosynthesis",
        detailedInfo:
          "Sunflower leaves are broad and rough-textured, with serrated edges. They're arranged alternately along the stem and can grow up to 12 inches long.",
        funFact: "Sunflower leaves can track the sun during the day, a behavior called heliotropism!",
        color: "#4CAF50",
      },
      {
        id: "stem",
        name: "Stem",
        description: "A strong, thick stem that supports the heavy flower and transports water and nutrients",
        detailedInfo:
          "The stem can grow 3-10 feet tall and is covered with coarse hairs. It contains vascular tissue that moves water up from the roots and sugar down from the leaves.",
        funFact: "Sunflower stems are so strong they've been used to make paper and building materials!",
        color: "#8BC34A",
      },
      {
        id: "roots",
        name: "Root System",
        description: "Deep roots that anchor the plant and absorb water and minerals from the soil",
        detailedInfo:
          "Sunflowers have a taproot that can extend 6 feet deep, with lateral roots spreading 3 feet wide. This extensive root system helps them survive drought.",
        funFact: "Sunflower roots can remove toxic substances from soil, a process called phytoremediation!",
        color: "#795548",
      },
    ],
  },
]

export default function PlantExplorer() {
  const [selectedPlant] = useState<PlantType>(plants[0])
  const [selectedPart, setSelectedPart] = useState<PlantPart | null>(null)
  const [isRotating, setIsRotating] = useState(true)
  const [showLabels, setShowLabels] = useState(true)
  const [lightIntensity, setLightIntensity] = useState([1])
  const [zoom, setZoom] = useState(8)

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-sky-50 via-amber-50/30 to-green-50/20">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10 p-4 md:p-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
              <Leaf className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">PlantAR Explorer</h1>
              <p className="text-sm text-gray-600 hidden md:block">Interactive 3D Plant Learning</p>
            </div>
          </div>

          {/* Plant Info Badge */}
          <div className="hidden md:flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl px-4 py-2 shadow-sm">
            <Info className="w-4 h-4 text-amber-600" />
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-900">{selectedPlant.name}</p>
              <p className="text-xs text-gray-500 italic">{selectedPlant.scientificName}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Control Panel */}
      <div className="absolute top-24 right-4 md:right-6 z-10 space-y-3">
        <div className="bg-white/90 backdrop-blur-md border border-gray-200 rounded-2xl p-4 shadow-lg space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Controls</span>
            </div>

            <Button
              variant={isRotating ? "default" : "outline"}
              size="sm"
              onClick={() => setIsRotating(!isRotating)}
              className="w-full justify-start gap-2"
            >
              <RotateCw className={`w-4 h-4 ${isRotating ? "animate-spin" : ""}`} />
              Auto Rotate
            </Button>

            <Button
              variant={showLabels ? "default" : "outline"}
              size="sm"
              onClick={() => setShowLabels(!showLabels)}
              className="w-full justify-start gap-2"
            >
              {showLabels ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              Show Labels
            </Button>
          </div>

          <div className="space-y-2 pt-2 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-600">Lighting</span>
              <span className="text-xs text-gray-500">{Math.round(lightIntensity[0] * 100)}%</span>
            </div>
            <Slider
              value={lightIntensity}
              onValueChange={setLightIntensity}
              min={0.3}
              max={2}
              step={0.1}
              className="w-full"
            />
          </div>

          <div className="space-y-2 pt-2 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-600">Zoom</span>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setZoom(Math.min(zoom + 1, 15))}>
                  <ZoomIn className="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setZoom(Math.max(zoom - 1, 5))}>
                  <ZoomOut className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Plant Details Card */}
        <div className="bg-white/90 backdrop-blur-md border border-gray-200 rounded-2xl p-4 shadow-lg space-y-2 max-w-xs">
          <h3 className="text-sm font-semibold text-gray-900">About This Plant</h3>
          <p className="text-xs text-gray-600 leading-relaxed">{selectedPlant.description}</p>
          <div className="space-y-1 pt-2 border-t border-gray-200">
            <div className="flex items-start gap-2">
              <span className="text-xs font-medium text-gray-500 min-w-[60px]">Habitat:</span>
              <span className="text-xs text-gray-700">{selectedPlant.habitat}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-xs font-medium text-gray-500 min-w-[60px]">Growth:</span>
              <span className="text-xs text-gray-700">{selectedPlant.growthTime}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3D Canvas */}
      <Canvas className="w-full h-full">
        <PerspectiveCamera makeDefault position={[0, 2, zoom]} />
        <Suspense fallback={null}>
          <Environment preset="sunset" />
          <ambientLight intensity={0.4 * lightIntensity[0]} />
          <directionalLight position={[10, 10, 5]} intensity={1.2 * lightIntensity[0]} castShadow />
          <directionalLight position={[-5, 5, -5]} intensity={0.5 * lightIntensity[0]} />
          <spotLight position={[0, 15, 0]} angle={0.3} penumbra={1} intensity={0.8 * lightIntensity[0]} />

          <PlantScene
            plant={selectedPlant}
            onPartClick={setSelectedPart}
            isRotating={isRotating}
            showLabels={showLabels}
          />

          <OrbitControls
            enablePan={false}
            minDistance={5}
            maxDistance={15}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2}
            onChange={() => setIsRotating(false)}
          />
        </Suspense>
      </Canvas>

      {/* Loading Spinner */}
      <Suspense fallback={null}>
        <LoadingSpinner />
      </Suspense>

      {/* Info Panel */}
      {selectedPart && <PlantInfo part={selectedPart} onClose={() => setSelectedPart(null)} />}

      {/* Instructions */}
      {!selectedPart && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
          <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl px-6 py-3 shadow-lg">
            <p className="text-sm text-gray-600 text-center">
              <span className="font-semibold text-gray-900">Click</span> on plant parts to learn •
              <span className="font-semibold text-gray-900"> Drag</span> to rotate •
              <span className="font-semibold text-gray-900"> Scroll</span> to zoom
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
