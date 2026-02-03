import React from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Leaf, BookOpen } from "lucide-react";
import InstallPrompt from "@/components/ui/InstallPrompt";

/*
 * Landing Page Component
 * Entry point for unauthenticated users
 * Displays app features and login options
 */
export default function Landing() {
  const navigate = useNavigate();

  // Feature list for display
  const features = [
    {
      icon: Camera,
      title: "Plant Scanner",
      description: "Identify plants instantly using your camera"
    },
    {
      icon: Leaf,
      title: "Plant Database",
      description: "Access information on many plant species"
    },
    {
      icon: BookOpen,
      title: "Learning Quizzes",
      description: "Test and improve your plant knowledge"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-md mx-auto">
        
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690ebb53f135a788e129c2d4/e70368864_image.png"
            alt="PlantAR Logo"
            className="w-20 h-20 object-contain mx-auto mb-3"
          />
          <h1 className="text-4xl font-bold text-teal-400 mb-2">PlantAR</h1>
          <p className="text-slate-400">
            Learn about plants with augmented reality
          </p>
        </div>

        {/* Features */}
        <div className="w-full space-y-3 mb-8">
          {features.map((feature) => (
            <Card key={feature.title} className="bg-slate-800 border-slate-700">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-600/20 rounded-lg flex items-center justify-center shrink-0">
                  <feature.icon className="w-5 h-5 text-teal-400" />
                </div>
                <div>
                  <h3 className="font-medium">{feature.title}</h3>
                  <p className="text-sm text-slate-400">{feature.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Install App Button */}
        <InstallPrompt />

        {/* Login Buttons */}
        <div className="w-full space-y-3 mt-3">
          <Button
            onClick={() => base44.auth.redirectToLogin(createPageUrl("Home"))}
            className="w-full py-5 bg-teal-600 hover:bg-teal-700"
          >
            Sign In
          </Button>

          <Button
            onClick={() => base44.auth.redirectToLogin(createPageUrl("Home"))}
            variant="outline"
            className="w-full py-5 border-slate-600 text-slate-300 hover:bg-slate-800"
          >
            Create Account
          </Button>
        </div>

        <p className="text-xs text-slate-500 mt-4 text-center">
          Your data is stored securely on your device
        </p>
      </div>
    </div>
  );
}