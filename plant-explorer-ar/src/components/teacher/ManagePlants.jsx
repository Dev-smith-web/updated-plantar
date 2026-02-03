import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Edit } from "lucide-react";
import { motion } from "framer-motion";

export default function ManagePlants() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingPlant, setEditingPlant] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    scientific_name: "",
    description: "",
    fun_facts: "",
    image_url: "",
    color: "#10B981"
  });

  const { data: plants, isLoading } = useQuery({
    queryKey: ['plants'],
    queryFn: () => base44.entities.Plant.list(),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Plant.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plants'] });
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Plant.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plants'] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Plant.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plants'] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      fun_facts: formData.fun_facts ? formData.fun_facts.split('\n').filter(f => f.trim()) : []
    };

    if (editingPlant) {
      updateMutation.mutate({ id: editingPlant.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (plant) => {
    setEditingPlant(plant);
    setFormData({
      name: plant.name,
      scientific_name: plant.scientific_name || "",
      description: plant.description,
      fun_facts: plant.fun_facts ? plant.fun_facts.join('\n') : "",
      image_url: plant.image_url || "",
      color: plant.color || "#10B981"
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      scientific_name: "",
      description: "",
      fun_facts: "",
      image_url: "",
      color: "#10B981"
    });
    setEditingPlant(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/90 backdrop-blur border-2 shadow-xl">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl">Manage Plants</CardTitle>
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
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleSubmit}
              className="mb-6 p-6 bg-green-50 rounded-xl space-y-4 border-2 border-green-200"
            >
              <div>
                <Label htmlFor="name">Plant Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g., Sunflower"
                />
              </div>

              <div>
                <Label htmlFor="scientific_name">Scientific Name</Label>
                <Input
                  id="scientific_name"
                  value={formData.scientific_name}
                  onChange={(e) => setFormData({ ...formData, scientific_name: e.target.value })}
                  placeholder="e.g., Helianthus annuus"
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  placeholder="Tell students about this plant..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="fun_facts">Fun Facts (one per line)</Label>
                <Textarea
                  id="fun_facts"
                  value={formData.fun_facts}
                  onChange={(e) => setFormData({ ...formData, fun_facts: e.target.value })}
                  placeholder="Sunflowers can grow up to 12 feet tall!&#10;They always face the sun."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="flex gap-3">
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  {editingPlant ? 'Update' : 'Create'} Plant
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </motion.form>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            {plants.map((plant) => (
              <Card key={plant.id} className="border-2">
                <CardHeader>
                  <CardTitle className="flex justify-between items-start">
                    <span>{plant.name}</span>
                    <div className="flex gap-2">
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
                        onClick={() => deleteMutation.mutate(plant.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardTitle>
                  {plant.scientific_name && (
                    <p className="text-sm italic text-gray-500">{plant.scientific_name}</p>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 text-sm line-clamp-3">{plant.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {plants.length === 0 && !showForm && (
            <p className="text-center text-gray-500 py-8">
              No plants added yet. Click "Add Plant" to get started!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}