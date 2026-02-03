import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brain, Trophy, ArrowRight, RotateCcw, ArrowLeft } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

/*
 * Quiz Component
 * Interactive quiz for testing plant knowledge
 * Tracks scores and saves results to database
 */
export default function Quiz() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Quiz state management
  const [studentName, setStudentName] = useState("");
  const [hasStarted, setHasStarted] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [finished, setFinished] = useState(false);

  // Fetch questions from database
  const { data: questions = [], isLoading } = useQuery({
    queryKey: ['quizQuestions'],
    queryFn: () => base44.entities.QuizQuestion.list(),
  });

  // Save result mutation
  const saveResult = useMutation({
    mutationFn: (data) => base44.entities.QuizResult.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizResults'] });
    },
  });

  // Start the quiz
  function handleStart() {
    if (studentName.trim() !== "") {
      setHasStarted(true);
      setQuestionIndex(0);
      setScore(0);
      setFinished(false);
    }
  }

  // Handle answer selection
  function handleSelectAnswer(option) {
    if (answered) return;
    
    setSelectedOption(option);
    setAnswered(true);
    
    // Check if correct
    const currentQ = questions[questionIndex];
    if (option === currentQ.correct_answer) {
      setScore(prev => prev + 1);
    }
  }

  // Move to next question or finish
  function handleNext() {
    if (questionIndex + 1 < questions.length) {
      setQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setAnswered(false);
    } else {
      // Quiz finished - save result
      setFinished(true);
      saveResult.mutate({
        student_name: studentName,
        score: score,
        total_questions: questions.length
      });
    }
  }

  // Reset quiz to start over
  function handleReset() {
    setHasStarted(false);
    setStudentName("");
    setQuestionIndex(0);
    setScore(0);
    setSelectedOption(null);
    setAnswered(false);
    setFinished(false);
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // No questions available
  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-4">
        <div className="max-w-md mx-auto pt-10">
          <Button
            variant="ghost"
            onClick={() => navigate(createPageUrl("Home"))}
            className="mb-4 text-teal-400"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6 text-center">
              <Brain className="w-12 h-12 mx-auto text-purple-400 mb-3" />
              <h2 className="text-xl font-bold mb-2">No Questions Available</h2>
              <p className="text-slate-400 text-sm">
                Teachers can add questions from the dashboard.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Start screen - enter name
  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-4">
        <div className="max-w-md mx-auto pt-10">
          <Button
            variant="ghost"
            onClick={() => navigate(createPageUrl("Home"))}
            className="mb-4 text-teal-400"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 bg-purple-600 rounded-xl flex items-center justify-center">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl">Plant Quiz</CardTitle>
              <p className="text-slate-400 text-sm mt-1">
                Test your plant knowledge!
              </p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="studentName">Enter your name</Label>
                <Input
                  id="studentName"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Your name"
                  className="mt-1 bg-slate-700 border-slate-600"
                  onKeyDown={(e) => e.key === 'Enter' && handleStart()}
                />
              </div>
              
              <div className="bg-slate-700 rounded-lg p-3 text-sm">
                <p className="text-slate-300">
                  • {questions.length} questions<br />
                  • No time limit<br />
                  • Select the best answer
                </p>
              </div>
              
              <Button
                onClick={handleStart}
                disabled={!studentName.trim()}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                Start Quiz
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Quiz completed - show results
  if (finished) {
    const percent = Math.round((score / questions.length) * 100);
    
    let message = "Keep practicing!";
    if (percent === 100) message = "Perfect score!";
    else if (percent >= 80) message = "Excellent work!";
    else if (percent >= 60) message = "Good job!";

    return (
      <div className="min-h-screen bg-slate-900 text-white p-4">
        <div className="max-w-md mx-auto pt-10">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 bg-yellow-500 rounded-full flex items-center justify-center">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl">{message}</CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4 text-center">
              <div className="bg-slate-700 rounded-lg p-4">
                <p className="text-4xl font-bold">{score}/{questions.length}</p>
                <p className="text-slate-400">Correct Answers</p>
                <p className="text-2xl font-bold text-purple-400 mt-2">{percent}%</p>
              </div>
              
              <div className="bg-slate-700 rounded-lg p-3 text-left text-sm">
                <p><strong>Student:</strong> {studentName}</p>
                <p><strong>Total Questions:</strong> {questions.length}</p>
                <p><strong>Score:</strong> {score} correct</p>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={handleReset}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                
                <Button
                  onClick={() => navigate(createPageUrl("Home"))}
                  variant="outline"
                  className="w-full border-slate-600"
                >
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Active quiz - show current question
  const currentQuestion = questions[questionIndex];
  const progressPercent = ((questionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4">
      <div className="max-w-lg mx-auto pt-4">
        {/* Exit button */}
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl("Home"))}
          className="mb-4 text-teal-400"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Exit
        </Button>

        {/* Progress indicator */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-400">
              Question {questionIndex + 1} of {questions.length}
            </span>
            <span className="text-purple-400">Score: {score}</span>
          </div>
          <Progress value={progressPercent} className="h-2 bg-slate-700" />
        </div>

        {/* Question card */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg">{currentQuestion.question}</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-2">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = selectedOption === option;
              const isCorrect = option === currentQuestion.correct_answer;
              
              // Determine button style based on state
              let btnClass = "w-full text-left p-3 h-auto justify-start border-slate-600";
              
              if (answered) {
                if (isCorrect) {
                  btnClass += " bg-green-600/20 border-green-500 text-green-300";
                } else if (isSelected && !isCorrect) {
                  btnClass += " bg-red-600/20 border-red-500 text-red-300";
                }
              } else if (isSelected) {
                btnClass += " bg-purple-600/20 border-purple-500";
              }

              return (
                <Button
                  key={idx}
                  variant="outline"
                  className={btnClass}
                  onClick={() => handleSelectAnswer(option)}
                  disabled={answered}
                >
                  <span className="mr-2 font-bold">
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  {option}
                  {answered && isCorrect && <span className="ml-auto">✓</span>}
                  {answered && isSelected && !isCorrect && <span className="ml-auto">✗</span>}
                </Button>
              );
            })}

            {/* Next button - shown after answering */}
            {answered && (
              <Button
                onClick={handleNext}
                className="w-full mt-4 bg-purple-600 hover:bg-purple-700"
              >
                {questionIndex + 1 < questions.length ? 'Next Question' : 'See Results'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}