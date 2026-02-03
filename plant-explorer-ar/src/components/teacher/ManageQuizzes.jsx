import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Edit } from "lucide-react";
import { motion } from "framer-motion";

export default function ManageQuizzes() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [formData, setFormData] = useState({
    question: "",
    option1: "",
    option2: "",
    option3: "",
    option4: "",
    correct_answer: "",
    difficulty: "easy",
    plant_id: ""
  });

  const { data: questions, isLoading } = useQuery({
    queryKey: ['quizQuestions'],
    queryFn: () => base44.entities.QuizQuestion.list(),
    initialData: [],
  });

  const { data: plants } = useQuery({
    queryKey: ['plants'],
    queryFn: () => base44.entities.Plant.list(),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.QuizQuestion.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizQuestions'] });
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.QuizQuestion.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizQuestions'] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.QuizQuestion.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizQuestions'] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const options = [formData.option1, formData.option2, formData.option3, formData.option4].filter(o => o.trim());
    
    const data = {
      question: formData.question,
      options: options,
      correct_answer: formData.correct_answer,
      difficulty: formData.difficulty,
      plant_id: formData.plant_id || null,
      created_by_teacher: true
    };

    if (editingQuestion) {
      updateMutation.mutate({ id: editingQuestion.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (question) => {
    setEditingQuestion(question);
    setFormData({
      question: question.question,
      option1: question.options[0] || "",
      option2: question.options[1] || "",
      option3: question.options[2] || "",
      option4: question.options[3] || "",
      correct_answer: question.correct_answer,
      difficulty: question.difficulty,
      plant_id: question.plant_id || ""
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      question: "",
      option1: "",
      option2: "",
      option3: "",
      option4: "",
      correct_answer: "",
      difficulty: "easy",
      plant_id: ""
    });
    setEditingQuestion(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/90 backdrop-blur border-2 shadow-xl">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl">Manage Quiz Questions</CardTitle>
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
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleSubmit}
              className="mb-6 p-6 bg-purple-50 rounded-xl space-y-4 border-2 border-purple-200"
            >
              <div>
                <Label htmlFor="question">Question *</Label>
                <Input
                  id="question"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  required
                  placeholder="What part of the plant absorbs water?"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="option1">Option A *</Label>
                  <Input
                    id="option1"
                    value={formData.option1}
                    onChange={(e) => setFormData({ ...formData, option1: e.target.value })}
                    required
                    placeholder="Roots"
                  />
                </div>
                <div>
                  <Label htmlFor="option2">Option B *</Label>
                  <Input
                    id="option2"
                    value={formData.option2}
                    onChange={(e) => setFormData({ ...formData, option2: e.target.value })}
                    required
                    placeholder="Leaves"
                  />
                </div>
                <div>
                  <Label htmlFor="option3">Option C</Label>
                  <Input
                    id="option3"
                    value={formData.option3}
                    onChange={(e) => setFormData({ ...formData, option3: e.target.value })}
                    placeholder="Stem"
                  />
                </div>
                <div>
                  <Label htmlFor="option4">Option D</Label>
                  <Input
                    id="option4"
                    value={formData.option4}
                    onChange={(e) => setFormData({ ...formData, option4: e.target.value })}
                    placeholder="Flowers"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="correct_answer">Correct Answer *</Label>
                <Input
                  id="correct_answer"
                  value={formData.correct_answer}
                  onChange={(e) => setFormData({ ...formData, correct_answer: e.target.value })}
                  required
                  placeholder="Must match one of the options exactly"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
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
                  <Label htmlFor="plant_id">Related Plant (Optional)</Label>
                  <Select
                    value={formData.plant_id}
                    onValueChange={(value) => setFormData({ ...formData, plant_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a plant" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={null}>None</SelectItem>
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
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                  {editingQuestion ? 'Update' : 'Create'} Question
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </motion.form>
          )}

          <div className="space-y-4">
            {questions.map((question, index) => (
              <Card key={question.id} className="border-2">
                <CardHeader>
                  <CardTitle className="flex justify-between items-start text-base">
                    <span className="flex-1">
                      <span className="font-bold text-purple-600">Q{index + 1}:</span> {question.question}
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
                        onClick={() => deleteMutation.mutate(question.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 text-sm">
                    {question.options.map((option, i) => (
                      <div
                        key={i}
                        className={`p-2 rounded ${
                          option === question.correct_answer
                            ? 'bg-green-100 text-green-800 font-medium'
                            : 'text-gray-600'
                        }`}
                      >
                        {String.fromCharCode(65 + i)}. {option}
                        {option === question.correct_answer && ' ✓'}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {questions.length === 0 && !showForm && (
            <p className="text-center text-gray-500 py-8">
              No questions added yet. Click "Add Question" to create your first quiz question!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}