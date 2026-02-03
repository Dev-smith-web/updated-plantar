import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Search, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

/*
 * PlantLibrary Component
 * Displays all plants in the database
 * Includes search functionality
 */
export default function PlantLibrary() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch plants from database
  const { data: plants = [], isLoading } = useQuery({
    queryKey: ['plants'],
    queryFn: () => base44.entities.Plant.list(),
  });

  // Default plant images
  function getDefaultImage(name) {
    const defaults = {
      'Sunflower': 'https://images.unsplash.com/photo-1597848212624-e530bb09e59f?w=400',
      'Rose': 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400',
      'Cactus': 'https://images.unsplash.com/photo-1509937528035-ad76254b0356?w=400',
    };
    return defaults[name] || 'https://images.unsplash.com/photo-1466781783364-36c955e42a7f?w=400';
  }

  // Filter plants based on search
  const filteredPlants = plants.filter(plant => {
    const query = searchQuery.toLowerCase();
    const nameMatch = plant.name.toLowerCase().includes(query);
    const sciMatch = plant.scientific_name?.toLowerCase().includes(query);
    return nameMatch || sciMatch;
  });

  return (
    <div className="min-h-screen bg-slate-900 text-white pb-28">
      <div className="max-w-4xl mx-auto p-4">
        
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(createPageUrl("Home"))}
            className="mb-3 text-teal-400"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <h1 className="text-2xl font-bold text-center mb-2">Plant Library</h1>
          <p className="text-slate-400 text-center text-sm">
            Browse and explore different plants
          </p>

          {/* Search */}
          <div className="max-w-sm mx-auto mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search plants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-700"
            />
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="bg-slate-800 border-slate-700">
                <Skeleton className="h-32 w-full rounded-t-lg bg-slate-700" />
                <div className="p-3">
                  <Skeleton className="h-4 w-3/4 mb-2 bg-slate-700" />
                  <Skeleton className="h-3 w-1/2 bg-slate-700" />
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredPlants.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-400 mb-2">
              {searchQuery ? "No plants match your search" : "No plants yet"}
            </p>
            {!searchQuery && (
              <p className="text-slate-500 text-sm">
                Use the scanner to add plants or ask a teacher
              </p>
            )}
          </div>
        )}

        {/* Plant Grid */}
        {!isLoading && filteredPlants.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {filteredPlants.map((plant) => (
              <Link 
                key={plant.id} 
                to={`${createPageUrl("PlantExplorer")}?id=${plant.id}`}
              >
                <Card className="bg-slate-800 border-slate-700 hover:bg-slate-750 transition-colors overflow-hidden h-full">
                  <div className="h-32 overflow-hidden">
                    <img
                      src={plant.image_url || getDefaultImage(plant.name)}
                      alt={plant.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-medium text-sm mb-1">{plant.name}</h3>
                    {plant.scientific_name && (
                      <p className="text-xs text-teal-400 italic mb-1">
                        {plant.scientific_name}
                      </p>
                    )}
                    <p className="text-xs text-slate-400 line-clamp-2">
                      {plant.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}