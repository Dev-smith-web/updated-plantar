"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { usePlant } from "@/hooks/use-plants";
import { usePlantParts } from "@/hooks/use-plant-parts";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Volume2, X, Sparkles } from "lucide-react";
import type { PlantPart } from "@/lib/db/schema";
import dynamic from "next/dynamic";

const PlantExplorer3D = dynamic(() => import("@/components/plant-explorer"), {
  ssr: false,
  loading: () => (
    <div className="h-[60vh] bg-muted flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
    </div>
  ),
});

export default function ExplorerPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [selectedPart, setSelectedPart] = useState<PlantPart | null>(null);

  const { data: plant, isLoading: plantLoading } = usePlant(params.id);
  const { data: plantParts = [], isLoading: partsLoading } = usePlantParts(
    params.id
  );

  function speakText(text: string) {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  }

  if (plantLoading || partsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  if (!plant) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-foreground">
        <div className="text-center">
          <p className="mb-4">Plant not found</p>
          <Button onClick={() => router.push("/library")}>
            Back to Library
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header overlay */}
      <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.push("/library")}
          className="text-primary bg-background/60 backdrop-blur-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="bg-background/60 backdrop-blur-sm rounded-lg px-3 py-1.5">
          <p className="font-semibold text-sm">{plant.name}</p>
          {plant.scientificName && (
            <p className="text-xs text-primary italic">
              {plant.scientificName}
            </p>
          )}
        </div>
      </div>

      {/* 3D Viewer */}
      <div className="h-[60vh] w-full">
        <PlantExplorer3D />
      </div>

      {/* Info Panel */}
      <div className="p-4 space-y-4">
        {/* About */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2">About</h3>
            <p className="text-sm text-muted-foreground">{plant.description}</p>

            {plant.funFacts && (plant.funFacts as string[]).length > 0 && (
              <div className="mt-3">
                <h4 className="font-medium text-sm mb-1">Fun Facts:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {(plant.funFacts as string[]).map(
                    (fact: string, i: number) => (
                      <li key={i}>&#8226; {fact}</li>
                    )
                  )}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Selected Part */}
        {selectedPart && (
          <Card className="bg-primary text-primary-foreground border-0 shadow-xl">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-xl font-bold">{selectedPart.partName}</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedPart(null)}
                  className="text-primary-foreground hover:bg-primary-foreground/20"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="bg-background/90 backdrop-blur rounded-lg p-3 mb-2">
                <p className="text-foreground text-sm">
                  {selectedPart.function || selectedPart.description}
                </p>
              </div>

              {selectedPart.funFact && (
                <div className="bg-background/90 backdrop-blur rounded-lg p-3 mb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-foreground" />
                    <span className="font-bold text-foreground text-sm">
                      Fun Fact
                    </span>
                  </div>
                  <p className="text-foreground text-sm">
                    {selectedPart.funFact}
                  </p>
                </div>
              )}

              <Button
                onClick={() =>
                  speakText(
                    selectedPart.description +
                      (selectedPart.funFact
                        ? ". " + selectedPart.funFact
                        : "")
                  )
                }
                className="w-full bg-background/90 hover:bg-background text-foreground"
              >
                <Volume2 className="w-4 h-4 mr-2" />
                Listen
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Parts List */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2">Plant Parts</h3>
            <div className="space-y-1">
              {plantParts.map((part) => (
                <Button
                  key={part.id}
                  variant="ghost"
                  className={`w-full justify-start text-left h-auto py-2 text-sm ${
                    selectedPart?.id === part.id
                      ? "bg-primary/10 text-primary"
                      : ""
                  }`}
                  onClick={() => setSelectedPart(part)}
                >
                  {part.partName}
                </Button>
              ))}
              {plantParts.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No parts added yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
