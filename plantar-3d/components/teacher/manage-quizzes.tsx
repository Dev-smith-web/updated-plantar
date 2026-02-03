"use client";

import { useState } from "react";
import { usePlants } from "@/hooks/use-plants";
import {
  useQuizQuestions,
  useCreateQuizQuestion,
  useUpdateQuizQuestion,
  useDeleteQuizQuestion,
} from "@/hooks/use-quiz";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Edit } from "lucide-react";

const emptyForm = {
  question: "",
  option1: "",
  option2: "",
  option3: "",
  option4: "",
  correctAnswer: "",
  difficulty: "easy" as const,
  plantId: "",
};

export default function ManageQuizzes() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm);

  const { data: questions = [] } = useQuizQuestions();
  const { data: plants = [] } = usePlants();
  const createQuestion = useCreateQuizQuestion();
  const updateQuestion = useUpdateQuizQuestion();
  const deleteQuestion = useDeleteQuizQuestion();

  function resetForm() {
    setFormData(emptyForm);
    setEditingId(null);
    setShowForm(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const options = [
      formData.option1,
      formData.option2,
      formData.option3,
      formData.option4,
    ].filter((o) => o.trim());

    const data = {
      question: formData.question,
      options,
      correctAnswer: formData.correctAnswer,
      difficulty: formData.difficulty,
      plantId: formData.plantId || null,
      createdByTeacher: true,
    };

    if (editingId) {
      updateQuestion.mutate({ id: editingId, data }, { onSuccess: resetForm });
    } else {
      createQuestion.mutate(data, { onSuccess: resetForm });
    }
  }

  function handleEdit(question: (typeof questions)[0]) {
    const opts = question.options as string[];
    setEditingId(question.id);
    setFormData({
      question: question.question,
      option1: opts[0] || "",
      option2: opts[1] || "",
      option3: opts[2] || "",
      option4: opts[3] || "",
      correctAnswer: question.correctAnswer,
      difficulty: (question.difficulty || "easy") as "easy" | "medium" | "hard",
      plantId: question.plantId || "",
    });
    setShowForm(true);
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white/90 backdrop-blur border-2 shadow-xl">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl text-gray-900">
              Manage Quiz Questions
            </CardTitle>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Question
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showForm && (
            <form
              onSubmit={handleSubmit}
              className="mb-6 p-6 bg-purple-50 rounded-xl space-y-4 border-2 border-purple-200"
            >
              <div>
                <Label htmlFor="question" className="text-gray-700">Question *</Label>
                <Input
                  id="question"
                  value={formData.question}
                  onChange={(e) =>
                    setFormData({ ...formData, question: e.target.value })
                  }
                  required
                  placeholder="What part of the plant absorbs water?"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="option1" className="text-gray-700">Option A *</Label>
                  <Input
                    id="option1"
                    value={formData.option1}
                    onChange={(e) =>
                      setFormData({ ...formData, option1: e.target.value })
                    }
                    required
                    placeholder="Roots"
                  />
                </div>
                <div>
                  <Label htmlFor="option2" className="text-gray-700">Option B *</Label>
                  <Input
                    id="option2"
                    value={formData.option2}
                    onChange={(e) =>
                      setFormData({ ...formData, option2: e.target.value })
                    }
                    required
                    placeholder="Leaves"
                  />
                </div>
                <div>
                  <Label htmlFor="option3" className="text-gray-700">Option C</Label>
                  <Input
                    id="option3"
                    value={formData.option3}
                    onChange={(e) =>
                      setFormData({ ...formData, option3: e.target.value })
                    }
                    placeholder="Stem"
                  />
                </div>
                <div>
                  <Label htmlFor="option4" className="text-gray-700">Option D</Label>
                  <Input
                    id="option4"
                    value={formData.option4}
                    onChange={(e) =>
                      setFormData({ ...formData, option4: e.target.value })
                    }
                    placeholder="Flowers"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="correctAnswer" className="text-gray-700">Correct Answer *</Label>
                <Input
                  id="correctAnswer"
                  value={formData.correctAnswer}
                  onChange={(e) =>
                    setFormData({ ...formData, correctAnswer: e.target.value })
                  }
                  required
                  placeholder="Must match one of the options exactly"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="difficulty" className="text-gray-700">Difficulty</Label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        difficulty: value as "easy" | "medium" | "hard",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="plantId" className="text-gray-700">Related Plant (Optional)</Label>
                  <Select
                    value={formData.plantId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, plantId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a plant" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {plants.map((plant) => (
                        <SelectItem key={plant.id} value={plant.id}>
                          {plant.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {editingId ? "Update" : "Create"} Question
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          )}

          <div className="space-y-4">
            {questions.map((question, index) => (
              <Card key={question.id} className="border-2">
                <CardHeader>
                  <CardTitle className="flex justify-between items-start text-base text-gray-900">
                    <span className="flex-1">
                      <span className="font-bold text-purple-600">
                        Q{index + 1}:
                      </span>{" "}
                      {question.question}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEdit(question)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteQuestion.mutate(question.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 text-sm">
                    {(question.options as string[]).map(
                      (option: string, i: number) => (
                        <div
                          key={i}
                          className={`p-2 rounded ${
                            option === question.correctAnswer
                              ? "bg-green-100 text-green-800 font-medium"
                              : "text-gray-600"
                          }`}
                        >
                          {String.fromCharCode(65 + i)}. {option}
                          {option === question.correctAnswer && " \u2713"}
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {questions.length === 0 && !showForm && (
            <p className="text-center text-gray-500 py-8">
              No questions added yet. Click &quot;Add Question&quot; to create
              your first quiz question!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
