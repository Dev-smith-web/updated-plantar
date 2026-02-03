"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  Camera,
  Upload,
  Loader2,
  Check,
  X,
  Leaf,
  Sparkles,
  Clock,
} from "lucide-react";
import { useCreatePlant } from "@/hooks/use-plants";

type PlantIdentification = {
  name: string;
  scientificName: string;
  description: string;
  funFacts: string[];
  careInstructions?: {
    light: string;
    water: string;
    soil: string;
    temperature: string;
  };
  confidence: number;
};

export default function ScannerPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [identifying, setIdentifying] = useState(false);
  const [result, setResult] = useState<PlantIdentification | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [rateLimitCountdown, setRateLimitCountdown] = useState(0);

  const createPlant = useCreatePlant();

  // Countdown timer for rate limit
  useEffect(() => {
    if (rateLimitCountdown <= 0) return;

    const timer = setInterval(() => {
      setRateLimitCountdown((prev) => {
        if (prev <= 1) {
          setError(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [rateLimitCountdown]);

  const compressImage = (file: File, maxWidth = 512, quality = 0.5): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let { width, height } = img;
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) return reject(new Error("Canvas not supported"));
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        };
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (file: File) => {
    setError(null);
    setResult(null);

    try {
      const compressed = await compressImage(file);
      setImageUrl(compressed);
    } catch {
      // Fallback to raw base64 if compression fails
      const reader = new FileReader();
      reader.onload = (e) => setImageUrl(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleIdentifyResponse = useCallback(async (res: Response) => {
    const data = await res.json();

    if (!res.ok) {
      // Handle rate limit error
      if (res.status === 429 && data.retryAfter) {
        setRateLimitCountdown(data.retryAfter);
        throw new Error(data.error || "Rate limit reached");
      }
      throw new Error(data.error || "Failed to identify plant");
    }

    return data;
  }, []);

  const handleUploadAndIdentify = async () => {
    if (!imageUrl) return;
    if (rateLimitCountdown > 0) return;

    setIdentifying(true);
    setError(null);

    try {
      const identifyRes = await fetch("/api/identify-plant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl }),
      });

      const plant = await handleIdentifyResponse(identifyRes);
      setResult(plant);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIdentifying(false);
    }
  };

  const handleSaveToLibrary = async () => {
    if (!result || !session?.user) return;

    setSaving(true);
    try {
      await createPlant.mutateAsync({
        name: result.name,
        scientificName: result.scientificName,
        description: result.description,
        funFacts: result.funFacts,
        imageUrl: imageUrl || undefined,
      });
      router.push("/library");
    } catch {
      setError("Failed to save plant");
    } finally {
      setSaving(false);
    }
  };

  const resetScanner = () => {
    setImageUrl(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 pb-24">
      <div className="max-w-md mx-auto">
        <Button
          variant="ghost"
          onClick={() => router.push("/")}
          className="mb-4 text-primary"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <h1 className="text-2xl font-bold mb-4">Plant Scanner</h1>

        {/* Upload Section */}
        {!imageUrl && (
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div
                  className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Upload className="w-8 h-8 text-primary" />
                  </div>
                  <p className="font-medium mb-1">Upload an image</p>
                  <p className="text-sm text-muted-foreground">
                    Click to browse or drag and drop
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      or
                    </span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => cameraInputRef.current?.click()}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Take a Photo
                </Button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
              />
            </CardContent>
          </Card>
        )}

        {/* Preview & Identify */}
        {imageUrl && !result && (
          <Card>
            <CardContent className="p-4">
              <div className="relative rounded-lg overflow-hidden mb-4">
                <img
                  src={imageUrl}
                  alt="Plant preview"
                  className="w-full h-64 object-cover"
                />
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={resetScanner}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg mb-4">
                  {rateLimitCountdown > 0 ? (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>
                        {error} ({rateLimitCountdown}s remaining)
                      </span>
                    </div>
                  ) : (
                    error
                  )}
                </div>
              )}

              <Button
                className="w-full"
                onClick={handleUploadAndIdentify}
                disabled={identifying || rateLimitCountdown > 0}
              >
                {identifying ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                    Identifying...
                  </>
                ) : rateLimitCountdown > 0 ? (
                  <>
                    <Clock className="w-4 h-4 mr-2" />
                    Wait {rateLimitCountdown}s
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Identify Plant
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                {imageUrl && (
                  <img
                    src={imageUrl}
                    alt={result.name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                )}

                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h2 className="text-xl font-bold">{result.name}</h2>
                    <p className="text-sm text-primary italic">
                      {result.scientificName}
                    </p>
                  </div>
                  <div className="bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded">
                    {result.confidence}% match
                  </div>
                </div>

                <p className="text-muted-foreground text-sm mb-4">
                  {result.description}
                </p>

                {result.funFacts && result.funFacts.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold mb-2 flex items-center gap-1">
                      <Leaf className="w-4 h-4 text-primary" />
                      Fun Facts
                    </h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {result.funFacts.map((fact, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-primary">•</span>
                          {fact}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.careInstructions && (
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-muted p-2 rounded">
                      <p className="font-medium">Light</p>
                      <p className="text-muted-foreground">
                        {result.careInstructions.light}
                      </p>
                    </div>
                    <div className="bg-muted p-2 rounded">
                      <p className="font-medium">Water</p>
                      <p className="text-muted-foreground">
                        {result.careInstructions.water}
                      </p>
                    </div>
                    <div className="bg-muted p-2 rounded">
                      <p className="font-medium">Soil</p>
                      <p className="text-muted-foreground">
                        {result.careInstructions.soil}
                      </p>
                    </div>
                    <div className="bg-muted p-2 rounded">
                      <p className="font-medium">Temperature</p>
                      <p className="text-muted-foreground">
                        {result.careInstructions.temperature}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={resetScanner}>
                Scan Another
              </Button>
              <Button
                className="flex-1"
                onClick={handleSaveToLibrary}
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Check className="w-4 h-4 mr-2" />
                )}
                Save to Library
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
