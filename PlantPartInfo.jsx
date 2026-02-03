import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Sparkles, Volume2, X } from "lucide-react";

export default function PlantPartInfo({ part, onClose, onSpeak }) {
  if (!part) return null; // Safety fallback

  const partName = part.part_name || "Plant Part";
  const description = part.description || part.function || "No description available.";
  const funFact = part.fun_fact || part.fun_facts?.[0] || null;

  const partEmojis = {
    Roots: "🌱",
    Stem: "🎋",
    Leaves: "🍃",
    Flowers: "🌸",
    Seeds: "🌰",
    Fruits: "🍎"
  };

  const partColors = {
    Roots: "from-amber-400 to-orange-500",
    Stem: "from-green-400 to-green-600",
    Leaves: "from-lime-400 to-green-500",
    Flowers: "from-pink-400 to-rose-500",
    Seeds: "from-yellow-400 to-orange-400",
    Fruits: "from-red-400 to-pink-500"
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
    >
      <Card
        className={`bg-gradient-to-br ${
          partColors[partName] || "from-green-300 to-green-500"
        } border-2 border-white shadow-2xl`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="text-4xl">
                {partEmojis[partName] || "🌿"}
              </span>
              <CardTitle className="text-2xl text-white">
                {partName}
              </CardTitle>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Description */}
          <div className="bg-white/90 backdrop-blur rounded-lg p-4">
            <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
              📖 What it does:
            </h4>
            <p className="text-gray-700">{description}</p>
          </div>

          {/* Fun Fact */}
          {funFact && (
            <div className="bg-white/90 backdrop-blur rounded-lg p-4">
              <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Fun Fact:
              </h4>
              <p className="text-gray-700">
                {funFact}
              </p>
            </div>
          )}

          {/* Text-to-Speech Button */}
          <Button
            onClick={() => onSpeak(`${description} ${funFact ? funFact : ""}`)}
            className="w-full bg-white/90 hover:bg-white text-gray-800"
          >
            <Volume2 className="w-4 h-4 mr-2" />
            Listen to Description
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
