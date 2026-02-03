"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { usePlants, useDeletePlant } from "@/hooks/use-plants";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Trash2, Pencil } from "lucide-react";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1466781783364-36c955e42a7f?w=400";

export default function PlantLibraryPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const isTeacher =
    session?.user?.role === "teacher" || session?.user?.role === "admin";
  const [searchQuery, setSearchQuery] = useState("");
  const { data: plants = [], isLoading } = usePlants();
  const deletePlant = useDeletePlant();

  const filteredPlants = plants.filter((plant) => {
    const query = searchQuery.toLowerCase();
    const nameMatch = plant.name.toLowerCase().includes(query);
    const sciMatch = plant.scientificName?.toLowerCase().includes(query);
    return nameMatch || sciMatch;
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="mb-3 text-primary"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <h1 className="text-2xl font-bold text-center mb-2">Plant Library</h1>
          <p className="text-muted-foreground text-center text-sm">
            Browse and explore different plants
          </p>

          {/* Search */}
          <div className="max-w-sm mx-auto mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search plants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <Skeleton className="h-32 w-full rounded-t-lg" />
                <div className="p-3">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Empty */}
        {!isLoading && filteredPlants.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-2">
              {searchQuery ? "No plants match your search" : "No plants yet"}
            </p>
            {!searchQuery && (
              <p className="text-muted-foreground/70 text-sm">
                Use the scanner to add plants or ask a teacher
              </p>
            )}
          </div>
        )}

        {/* Plant Grid */}
        {!isLoading && filteredPlants.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {filteredPlants.map((plant) => (
              <div key={plant.id} className="relative">
                {isTeacher && (
                  <div className="absolute top-2 right-2 z-10 flex gap-1">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-7 w-7 bg-background/80 backdrop-blur-sm"
                      onClick={() => router.push("/teacher")}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-7 w-7 bg-background/80 backdrop-blur-sm text-destructive"
                      onClick={() => {
                        if (confirm(`Delete "${plant.name}"?`)) {
                          deletePlant.mutate(plant.id);
                        }
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}
                <Link href={`/explorer/${plant.id}`}>
                  <Card className="hover:bg-muted/50 transition-colors overflow-hidden h-full">
                    <div className="h-32 overflow-hidden">
                      <img
                        src={plant.imageUrl || DEFAULT_IMAGE}
                        alt={plant.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="p-3">
                      <h3 className="font-medium text-sm mb-1">{plant.name}</h3>
                      {plant.scientificName && (
                        <p className="text-xs text-primary italic mb-1">
                          {plant.scientificName}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {plant.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
