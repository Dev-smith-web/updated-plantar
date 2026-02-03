import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, Share, PlusSquare } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Check if already in standalone mode
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || 
                            window.navigator.standalone || 
                            document.referrer.includes('android-app://');
    setIsStandalone(isStandaloneMode);

    // Check if iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(ios);

    // Capture install prompt (Android/Desktop)
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  // Force show logic:
  // 1. Component must be mounted
  // 2. MUST NOT be standalone (already installed)
  if (!isMounted || isStandalone) return null;

  // Primary Button (If Native Prompt is available)
  if (deferredPrompt) {
    return (
      <div className="w-full mb-4">
        <Button 
          onClick={handleInstall}
          className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-semibold py-6 shadow-lg animate-pulse"
        >
          <Download className="w-5 h-5 mr-2" />
          Install App
        </Button>
      </div>
    );
  }

  // Fallback Button (For iOS / Others)
  // This will always show if not standalone and no native prompt
  return (
    <div className="w-full mb-4">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full border-teal-500/50 text-teal-400 hover:bg-teal-900/20 py-6">
            <PlusSquare className="w-5 h-5 mr-2" />
            Add to Home Screen
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-slate-900 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>Add to Home Screen</DialogTitle>
            <DialogDescription className="text-slate-400">
              This browser requires manual installation. Follow these steps:
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col gap-4 mt-2">
            {isIOS ? (
              <>
                <div className="flex items-center gap-3 text-sm">
                  <span className="flex items-center justify-center w-8 h-8 bg-slate-800 rounded-full shrink-0">1</span>
                  <span>Tap the <Share className="inline w-4 h-4 mx-1" /> <strong>Share</strong> button</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="flex items-center justify-center w-8 h-8 bg-slate-800 rounded-full shrink-0">2</span>
                  <span>Scroll down and tap <PlusSquare className="inline w-4 h-4 mx-1" /> <strong>Add to Home Screen</strong></span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 text-sm">
                  <span className="flex items-center justify-center w-8 h-8 bg-slate-800 rounded-full shrink-0">1</span>
                  <span>Tap the browser menu (three dots)</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="flex items-center justify-center w-8 h-8 bg-slate-800 rounded-full shrink-0">2</span>
                  <span>Select <strong>Install App</strong> or <strong>Add to Home Screen</strong></span>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}