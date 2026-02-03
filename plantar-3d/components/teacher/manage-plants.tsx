"use client";

import { useState } from "react";
import {
  usePlants,
  useCreatePlant,
  useUpdatePlant,
  useDeletePlant,
} from "@/hooks/use-plants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Edit, Layers } from "lucide-react";
import ManagePlantParts from "./manage-plant-parts";

const emptyForm = {
  name: "",
  scientificName: "",
  description: "",
  funFacts: "",
  imageUrl: "",
  color: "#10B981",
};

export default function ManagePlants() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [managingPartsForPlant, setManagingPartsForPlant] = useState<string | null>(null);

  const { data: plants = [] } = usePlants();
  const createPlant = useCreatePlant();
  const updatePlant = useUpdatePlant();
  const deletePlant = useDeletePlant();

  function resetForm() {
    setFormData(emptyForm);
    setEditingId(null);
    setShowForm(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = {
      name: formData.name,
      scientificName: formData.scientificName || null,
      description: formData.description,
      funFacts: formData.funFacts
        ? formData.funFacts.split("\n").filter((f) => f.trim())
        : null,
      imageUrl: formData.imageUrl || null,
      color: formData.color,
    };

    if (editingId) {
      updatePlant.mutate({ id: editingId, data }, { onSuccess: resetForm });
    } else {
      createPlant.mutate(data, { onSuccess: resetForm });
    }
  }

  function handleEdit(plant: (typeof plants)[0]) {
    setEditingId(plant.id);
    setFormData({
      name: plant.name,
      scientificName: plant.scientificName || "",
      description: plant.description,
      funFacts: plant.funFacts ? (plant.funFacts as string[]).join("\n") : "",
      imageUrl: plant.imageUrl || "",
      color: plant.color || "#10B981",
    });
    setShowForm(true);
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white/90 backdrop-blur border-2 shadow-xl">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl text-gray-900">Manage Plants</CardTitle>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Plant
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showForm && (
            <form
              onSubmit={handleSubmit}
              className="mb-6 p-6 bg-green-50 rounded-xl space-y-4 border-2 border-green-200"
            >
              <div>
                <Label htmlFor="name" className="text-gray-700">Plant Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  placeholder="e.g., Sunflower"
                />
              </div>

              <div>
                <Label htmlFor="scientificName" className="text-gray-700">Scientific Name</Label>
                <Input
                  id="scientificName"
                  value={formData.scientificName}
                  onChange={(e) =>
                    setFormData({ ...formData, scientificName: e.target.value })
                  }
                  placeholder="e.g., Helianthus annuus"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-gray-700">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                  placeholder="Tell students about this plant..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="funFacts" className="text-gray-700">Fun Facts (one per line)</Label>
                <Textarea
                  id="funFacts"
                  value={formData.funFacts}
                  onChange={(e) =>
                    setFormData({ ...formData, funFacts: e.target.value })
                  }
                  placeholder={"Sunflowers can grow up to 12 feet tall!\nThey always face the sun."}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="imageUrl" className="text-gray-700">Image URL</Label>
                <Input
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700"
                >
                  {editingId ? "Update" : "Create"} Plant
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            {plants.map((plant) => (
              <Card key={plant.id} className="border-2">
                <CardHeader>
                  <CardTitle className="flex justify-between items-start text-gray-900">
                    <span>{plant.name}</span>
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() =>
                          setManagingPartsForPlant(
                            managingPartsForPlant === plant.id ? null : plant.id
                          )
                        }
                        title="Manage Parts"
                      >
                        <Layers className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEdit(plant)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deletePlant.mutate(plant.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardTitle>
                  {plant.scientificName && (
                    <p className="text-sm italic text-gray-500">
                      {plant.scientificName}
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 text-sm line-clamp-3">
                    {plant.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {managingPartsForPlant && (
            <ManagePlantParts
              plantId={managingPartsForPlant}
              plantName={
                plants.find((p) => p.id === managingPartsForPlant)?.name || ""
              }
              onClose={() => setManagingPartsForPlant(null)}
            />
          )}

          {plants.length === 0 && !showForm && (
            <p className="text-center text-gray-500 py-8">
              No plants added yet. Click &quot;Add Plant&quot; to get started!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
