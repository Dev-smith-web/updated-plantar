"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, Flower2 } from "lucide-react"
import type { PlantType } from "./plant-explorer"

type PlantSelectorProps = {
  plants: PlantType[]
  selectedPlant: PlantType
  onSelectPlant: (plant: PlantType) => void
}

export default function PlantSelector({ plants, selectedPlant, onSelectPlant }: PlantSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 bg-card/90 backdrop-blur-sm border-border hover:bg-card">
          <Flower2 className="w-4 h-4" />
          {selectedPlant.name}
          <ChevronDown className="w-4 h-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {plants.map((plant) => (
          <DropdownMenuItem key={plant.id} onClick={() => onSelectPlant(plant)} className="cursor-pointer">
            <div className="flex flex-col gap-1">
              <span className="font-medium">{plant.name}</span>
              <span className="text-xs text-muted-foreground">{plant.description}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
