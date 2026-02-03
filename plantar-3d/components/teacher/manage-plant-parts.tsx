"use client";

import { useState } from "react";
import {
  usePlantParts,
  useCreatePlantPart,
  useUpdatePlantPart,
  useDeletePlantPart,
} from "@/hooks/use-plant-parts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Edit, X } from "lucide-react";

const PART_NAMES = ["Roots", "Stem", "Leaves", "Flowers", "Seeds", "Fruits"] as const;

const emptyForm = {
  partName: "Roots" as (typeof PART_NAMES)[number],
  description: "",
  detailedInfo: "",
  funFact: "",
  function: "",
  color: "#10B981",
};

interface ManagePlantPartsProps {
  plantId: string;
  plantName: string;
  onClose: () => void;
}

export default function ManagePlantParts({
  plantId,
  plantName,
  onClose,
}: ManagePlantPartsProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm);

  const { data: parts = [] } = usePlantParts(plantId);
  const createPart = useCreatePlantPart();
  const updatePart = useUpdatePlantPart();
  const deletePart = useDeletePlantPart();

  function resetForm() {
    setFormData(emptyForm);
    setEditingId(null);
    setShowForm(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = {
      plantId,
      partName: formData.partName,
      description: formData.description,
      detailedInfo: formData.detailedInfo || null,
      funFact: formData.funFact || null,
      function: formData.function || null,
      color: formData.color || null,
    };

    if (editingId) {
      updatePart.mutate({ id: editingId, data }, { onSuccess: resetForm });
    } else {
      createPart.mutate(data, { onSuccess: resetForm });
    }
  }

  function handleEdit(part: (typeof parts)[0]) {
    setEditingId(part.id);
    setFormData({
      partName: part.partName as (typeof PART_NAMES)[number],
      description: part.description,
      detailedInfo: part.detailedInfo || "",
      funFact: part.funFact || "",
      function: part.function || "",
      color: part.color || "#10B981",
    });
    setShowForm(true);
  }

  return (
    <Card className="bg-white/90 backdrop-blur border-2 shadow-xl">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl text-gray-900">
              Parts for {plantName}
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              Manage the parts of this plant
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowForm(!showForm)}
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Part
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="mb-6 p-4 bg-blue-50 rounded-xl space-y-3 border-2 border-blue-200"
          >
            <div>
              <Label htmlFor="partName" className="text-gray-700">
                Part Name *
              </Label>
              <select
                id="partName"
                value={formData.partName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    partName: e.target.value as (typeof PART_NAMES)[number],
                  })
                }
                className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {PART_NAMES.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="partDescription" className="text-gray-700">
                Description *
              </Label>
              <Textarea
                id="partDescription"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
                placeholder="Describe this plant part..."
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="detailedInfo" className="text-gray-700">
                Detailed Info
              </Label>
              <Textarea
                id="detailedInfo"
                value={formData.detailedInfo}
                onChange={(e) =>
                  setFormData({ ...formData, detailedInfo: e.target.value })
                }
                placeholder="Additional details..."
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="partFunFact" className="text-gray-700">
                Fun Fact
              </Label>
              <Input
                id="partFunFact"
                value={formData.funFact}
                onChange={(e) =>
                  setFormData({ ...formData, funFact: e.target.value })
                }
                placeholder="An interesting fact about this part"
              />
            </div>

            <div>
              <Label htmlFor="partFunction" className="text-gray-700">
                Function
              </Label>
              <Input
                id="partFunction"
                value={formData.function}
                onChange={(e) =>
                  setFormData({ ...formData, function: e.target.value })
                }
                placeholder="What does this part do?"
              />
            </div>

            <div>
              <Label htmlFor="partColor" className="text-gray-700">
                Highlight Color
              </Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="partColor"
                  type="color"
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  className="w-14 h-9 p-1"
                />
                <span className="text-sm text-gray-500">{formData.color}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700"
                size="sm"
              >
                {editingId ? "Update" : "Create"} Part
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

        <div className="space-y-3">
          {parts.map((part) => (
            <Card key={part.id} className="border">
              <CardContent className="p-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {part.color && (
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: part.color }}
                        />
                      )}
                      <h4 className="font-medium text-gray-900">
                        {part.partName}
                      </h4>
                    </div>
                    <p className="text-sm text-gray-600">{part.description}</p>
                    {part.function && (
                      <p className="text-xs text-gray-500 mt-1">
                        <strong>Function:</strong> {part.function}
                      </p>
                    )}
                    {part.funFact && (
                      <p className="text-xs text-blue-600 mt-1">
                        💡 {part.funFact}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => handleEdit(part)}
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-red-500 hover:text-red-700"
                      onClick={() => deletePart.mutate(part.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {parts.length === 0 && !showForm && (
            <p className="text-center text-gray-500 py-4 text-sm">
              No parts added yet. Click &quot;Add Part&quot; to get started!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
