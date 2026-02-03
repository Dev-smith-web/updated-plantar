import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Upload, Loader2, CheckCircle, ArrowLeft, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

/*
 * PlantScanner Component
 * Uses AI to identify plants from uploaded images
 * Allows saving identified plants to the library
 */
export default function PlantScanner() {
  const navigate = useNavigate();
  
  // Component state
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  
  // File input refs
  const fileInput = useRef(null);
  const cameraInput = useRef(null);

  // Analyze plant image using AI
  async function analyzePlantImage(file) {
    setIsScanning(true);
    setScanResult(null);
    setErrorMsg(null);

    try {
      // Upload the image first
      const uploadResponse = await base44.integrations.Core.UploadFile({ file });
      const imageUrl = uploadResponse.file_url;
      setImagePreview(imageUrl);

      // Send to AI for analysis
      const aiResponse = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this plant image and identify the species. Provide:
        - Common name
        - Scientific name  
        - Brief description (2-3 sentences)
        - 3 interesting facts
        - Where it typically grows
        
        Return as JSON with: common_name, scientific_name, description, fun_facts (array), habitat`,
        file_urls: [imageUrl],
        response_json_schema: {
          type: "object",
          properties: {
            common_name: { type: "string" },
            scientific_name: { type: "string" },
            description: { type: "string" },
            fun_facts: { type: "array", items: { type: "string" } },
            habitat: { type: "string" }
          }
        }
      });

      setScanResult({
        ...aiResponse,
        image_url: imageUrl
      });
      
    } catch (err) {
      console.error("Scan error:", err);
      setErrorMsg("Could not identify plant. Please try a clearer image.");
    } finally {
      setIsScanning(false);
    }
  }

  // Handle file selection
  function onFileSelected(e) {
    const file = e.target.files[0];
    if (file) {
      analyzePlantImage(file);
    }
  }

  // Save plant to library
  async function savePlant() {
    if (!scanResult) return;

    try {
      await base44.entities.Plant.create({
        name: scanResult.common_name,
        scientific_name: scanResult.scientific_name,
        description: scanResult.description,
        fun_facts: scanResult.fun_facts,
        image_url: scanResult.image_url,
        color: "#10B981"
      });
      alert("Plant saved to library!");
    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to save plant.");
    }
  }

  // Reset scanner
  function resetScanner() {
    setScanResult(null);
    setImagePreview(null);
    setErrorMsg(null);
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white pb-24">
      <div className="max-w-2xl mx-auto p-4">
        
        {/* Header - only show when not scanning/no result */}
        {!isScanning && !scanResult && (
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate(createPageUrl("Home"))}
              className="mb-3 text-teal-400"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-3 bg-teal-600 rounded-xl flex items-center justify-center">
                <Camera className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl font-bold mb-1">Plant Scanner</h1>
              <p className="text-slate-400 text-sm">
                Take a photo or upload an image to identify a plant
              </p>
            </div>
          </div>
        )}

        {/* Upload Options */}
        {!isScanning && !scanResult && (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => cameraInput.current?.click()}
                  className="h-28 bg-teal-600 hover:bg-teal-700 flex-col gap-2"
                >
                  <Camera className="w-8 h-8" />
                  <span>Take Photo</span>
                </Button>

                <Button
                  onClick={() => fileInput.current?.click()}
                  className="h-28 bg-blue-600 hover:bg-blue-700 flex-col gap-2"
                >
                  <Upload className="w-8 h-8" />
                  <span>Upload</span>
                </Button>
              </div>

              {/* Hidden file inputs */}
              <input
                ref={cameraInput}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={onFileSelected}
                className="hidden"
              />
              <input
                ref={fileInput}
                type="file"
                accept="image/*"
                onChange={onFileSelected}
                className="hidden"
              />

              {/* Tips */}
              <div className="mt-6 p-4 bg-slate-700 rounded-lg">
                <h3 className="font-medium mb-2">Tips for best results:</h3>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>• Good lighting helps accuracy</li>
                  <li>• Include leaves and flowers if possible</li>
                  <li>• Keep the plant in focus</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Scanning State */}
        {isScanning && (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-8 text-center">
              {imagePreview && (
                <img 
                  src={imagePreview} 
                  alt="Scanning" 
                  className="w-full max-w-sm mx-auto rounded-lg mb-4"
                />
              )}
              <Loader2 className="w-10 h-10 mx-auto text-teal-400 animate-spin mb-3" />
              <h3 className="text-lg font-medium">Analyzing Plant...</h3>
              <p className="text-slate-400 text-sm">This may take a few seconds</p>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {errorMsg && (
          <Card className="bg-slate-800 border-red-500/50">
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-10 h-10 mx-auto text-red-400 mb-3" />
              <h3 className="text-lg font-medium text-red-400 mb-2">Scan Failed</h3>
              <p className="text-slate-400 text-sm mb-4">{errorMsg}</p>
              <Button onClick={resetScanner} className="bg-teal-600 hover:bg-teal-700">
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {scanResult && !errorMsg && (
          <div>
            <Button
              variant="ghost"
              onClick={resetScanner}
              className="mb-3 text-teal-400"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              New Scan
            </Button>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="bg-teal-600 rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  {scanResult.common_name}
                </CardTitle>
                <p className="text-teal-100 italic text-sm">
                  {scanResult.scientific_name}
                </p>
              </CardHeader>
              
              <CardContent className="p-4 space-y-4">
                {/* Image */}
                {scanResult.image_url && (
                  <img 
                    src={scanResult.image_url} 
                    alt={scanResult.common_name}
                    className="w-full rounded-lg"
                  />
                )}

                {/* Description */}
                <div>
                  <h4 className="font-medium mb-1">Description</h4>
                  <p className="text-slate-300 text-sm">{scanResult.description}</p>
                </div>

                {/* Fun Facts */}
                {scanResult.fun_facts?.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-1">Fun Facts</h4>
                    <ul className="text-slate-300 text-sm space-y-1">
                      {scanResult.fun_facts.map((fact, i) => (
                        <li key={i}>• {fact}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Habitat */}
                {scanResult.habitat && (
                  <div>
                    <h4 className="font-medium mb-1">Habitat</h4>
                    <p className="text-slate-300 text-sm">{scanResult.habitat}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Button
                    onClick={savePlant}
                    className="bg-teal-600 hover:bg-teal-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Save Plant
                  </Button>
                  <Button
                    onClick={resetScanner}
                    variant="outline"
                    className="border-slate-600"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Scan Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}