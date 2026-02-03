import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Volume2, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import PlantViewer3D from "../components/plant/PlantViewer3D";
import PlantPartInfo from "../components/plant/PlantPartInfo";

/*
 * PlantExplorer Component
 * Interactive 3D plant viewer with educational content
 * Shows plant parts and fun facts
 */
export default function PlantExplorer() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const plantId = urlParams.get('id');
  
  const [selectedPart, setSelectedPart] = useState(null);
  const [resetKey, setResetKey] = useState(0);

  // Fetch plant data
  const { data: plant, isLoading: plantLoading } = useQuery({
    queryKey: ['plant', plantId],
    queryFn: async () => {
      const plants = await base44.entities.Plant.list();
      return plants.find(p => p.id === plantId);
    },
    enabled: !!plantId,
  });

  // Fetch plant parts
  const { data: plantParts = [], isLoading: partsLoading } = useQuery({
    queryKey: ['plantParts', plantId],
    queryFn: () => base44.entities.PlantPart.filter({ plant_id: plantId }),
    enabled: !!plantId,
  });

  // Handle part selection
  function handlePartClick(partName) {
    const part = plantParts.find(p => p.part_name === partName);
    setSelectedPart(part || null);
  }

  // Reset view
  function handleReset() {
    setResetKey(prev => prev + 1);
    setSelectedPart(null);
  }

  // Text to speech
  function speakText(text) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  }

  // No plant ID provided
  if (!plantId) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <p>No plant selected</p>
      </div>
    );
  }

  // Loading state
  if (plantLoading || partsLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  // Plant not found
  if (!plant) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="text-center">
          <p className="mb-4">Plant not found</p>
          <Button onClick={() => navigate(createPageUrl("PlantLibrary"))}>
            Back to Library
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 pb-24">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            onClick={() => navigate(createPageUrl("PlantLibrary"))}
            className="text-teal-400"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button
            variant="ghost"
            onClick={handleReset}
            className="text-slate-400"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          
          {/* 3D Viewer */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <h2 className="text-xl font-bold mb-1">{plant.name}</h2>
                {plant.scientific_name && (
                  <p className="text-sm italic text-teal-400 mb-3">
                    {plant.scientific_name}
                  </p>
                )}
                <PlantViewer3D 
                  plant={plant} 
                  onPartClick={handlePartClick}
                  resetTrigger={resetKey}
                />
                <p className="text-slate-400 text-sm text-center mt-3">
                  Tap on plant parts to learn more
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Info Panel */}
          <div className="space-y-4">
            
            {/* About */}
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">About</h3>
                <p className="text-sm text-slate-300">{plant.description}</p>
                
                {plant.fun_facts?.length > 0 && (
                  <div className="mt-3">
                    <h4 className="font-medium text-sm mb-1">Fun Facts:</h4>
                    <ul className="text-sm text-slate-300 space-y-1">
                      {plant.fun_facts.map((fact, i) => (
                        <li key={i}>• {fact}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Selected Part Info */}
            {selectedPart && (
              <PlantPartInfo 
                part={selectedPart} 
                onClose={() => setSelectedPart(null)}
                onSpeak={speakText}
              />
            )}

            {/* Parts List */}
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">Plant Parts</h3>
                <div className="space-y-1">
                  {plantParts.map((part) => (
                    <Button
                      key={part.id}
                      variant="ghost"
                      className="w-full justify-start text-left h-auto py-2 text-sm"
                      onClick={() => setSelectedPart(part)}
                    >
                      {part.part_name}
                    </Button>
                  ))}
                  {plantParts.length === 0 && (
                    <p className="text-sm text-slate-500">
                      No parts added yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}