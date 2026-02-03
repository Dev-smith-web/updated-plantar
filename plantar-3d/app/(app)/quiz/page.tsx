"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuizQuestions, useSubmitQuizResult } from "@/hooks/use-quiz";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Brain,
  Trophy,
  ArrowRight,
  RotateCcw,
  ArrowLeft,
} from "lucide-react";

export default function QuizPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [studentName, setStudentName] = useState(
    session?.user?.name || ""
  );
  const [hasStarted, setHasStarted] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [finished, setFinished] = useState(false);

  const isTeacher =
    session?.user?.role === "teacher" || session?.user?.role === "admin";

  const { data: questions = [], isLoading } = useQuizQuestions();
  const submitResult = useSubmitQuizResult();

  // Auto-start for teachers
  useEffect(() => {
    if (isTeacher && questions.length > 0 && !hasStarted) {
      setStudentName("Teacher Preview");
      setHasStarted(true);
    }
  }, [isTeacher, questions.length]);

  function handleStart() {
    if (studentName.trim()) {
      setHasStarted(true);
      setQuestionIndex(0);
      setScore(0);
      setFinished(false);
    }
  }

  function handleSelectAnswer(option: string) {
    if (answered) return;
    setSelectedOption(option);
    setAnswered(true);
    if (option === questions[questionIndex].correctAnswer) {
      setScore((prev) => prev + 1);
    }
  }

  function handleNext() {
    if (questionIndex + 1 < questions.length) {
      setQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setAnswered(false);
    } else {
      setFinished(true);
      if (!isTeacher) {
        submitResult.mutate({
          studentName,
          score,
          totalQuestions: questions.length,
        });
      }
    }
  }

  function handleReset() {
    setHasStarted(false);
    setStudentName(session?.user?.name || "");
    setQuestionIndex(0);
    setScore(0);
    setSelectedOption(null);
    setAnswered(false);
    setFinished(false);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-background text-foreground p-4">
        <div className="max-w-md mx-auto pt-10">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="mb-4 text-primary"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <Card>
            <CardContent className="p-6 text-center">
              <Brain className="w-12 h-12 mx-auto text-accent mb-3" />
              <h2 className="text-xl font-bold mb-2">No Questions Available</h2>
              <p className="text-muted-foreground text-sm">
                Teachers can add questions from the dashboard.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Start screen
  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-background text-foreground p-4">
        <div className="max-w-md mx-auto pt-10">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="mb-4 text-primary"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 bg-accent/10 rounded-xl flex items-center justify-center">
                <Brain className="w-8 h-8 text-accent" />
              </div>
              <CardTitle className="text-2xl">Plant Quiz</CardTitle>
              <p className="text-muted-foreground text-sm mt-1">
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
                  className="mt-1"
                  onKeyDown={(e) => e.key === "Enter" && handleStart()}
                />
              </div>

              <div className="bg-muted rounded-lg p-3 text-sm">
                <p className="text-muted-foreground">
                  &#8226; {questions.length} questions
                  <br />
                  &#8226; No time limit
                  <br />
                  &#8226; Select the best answer
                </p>
              </div>

              <Button
                onClick={handleStart}
                disabled={!studentName.trim()}
                className="w-full"
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

  // Results
  if (finished) {
    const percent = Math.round((score / questions.length) * 100);
    let message = "Keep practicing!";
    if (percent === 100) message = "Perfect score!";
    else if (percent >= 80) message = "Excellent work!";
    else if (percent >= 60) message = "Good job!";

    return (
      <div className="min-h-screen bg-background text-foreground p-4">
        <div className="max-w-md mx-auto pt-10">
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 bg-accent/10 rounded-full flex items-center justify-center">
                <Trophy className="w-8 h-8 text-accent" />
              </div>
              <CardTitle className="text-2xl">{message}</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 text-center">
              {isTeacher && (
                <div className="p-3 bg-accent/10 border border-accent rounded-lg text-sm font-medium text-accent">
                  Preview Mode — Results will not be saved
                </div>
              )}

              <div className="bg-muted rounded-lg p-4">
                <p className="text-4xl font-bold">
                  {score}/{questions.length}
                </p>
                <p className="text-muted-foreground">Correct Answers</p>
                <p className="text-2xl font-bold text-primary mt-2">
                  {percent}%
                </p>
              </div>

              <div className="bg-muted rounded-lg p-3 text-left text-sm">
                {isTeacher ? (
                  <p className="text-muted-foreground">
                    This was a preview. No results were saved.
                  </p>
                ) : (
                  <>
                    <p>
                      <strong>Student:</strong> {studentName}
                    </p>
                    <p>
                      <strong>Total Questions:</strong> {questions.length}
                    </p>
                    <p>
                      <strong>Score:</strong> {score} correct
                    </p>
                  </>
                )}
              </div>

              <div className="space-y-2">
                <Button
                  onClick={handleReset}
                  className="w-full"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>

                <Button
                  onClick={() => router.push("/")}
                  variant="outline"
                  className="w-full"
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

  // Active question
  const currentQuestion = questions[questionIndex];
  const progressPercent = ((questionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      <div className="max-w-lg mx-auto pt-4">
        <Button
          variant="ghost"
          onClick={() => router.push("/")}
          className="mb-4 text-primary"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Exit
        </Button>

        {/* Teacher Preview Banner */}
        {isTeacher && (
          <div className="mb-4 p-3 bg-accent/10 border border-accent rounded-lg text-center text-sm font-medium text-accent">
            Preview Mode — Results will not be saved
          </div>
        )}

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">
              Question {questionIndex + 1} of {questions.length}
            </span>
            <span className="text-primary font-medium">Score: {score}</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Question */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {currentQuestion.question}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-2">
            {(currentQuestion.options as string[]).map(
              (option: string, idx: number) => {
                const isSelected = selectedOption === option;
                const isCorrect = option === currentQuestion.correctAnswer;

                let btnClass =
                  "w-full text-left p-3 h-auto justify-start";

                if (answered) {
                  if (isCorrect) {
                    btnClass +=
                      " bg-green-600/10 border-green-600 text-green-700";
                  } else if (isSelected && !isCorrect) {
                    btnClass += " bg-destructive/10 border-destructive text-destructive";
                  }
                } else if (isSelected) {
                  btnClass += " bg-primary/10 border-primary";
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
                    {answered && isCorrect && (
                      <span className="ml-auto">&#10003;</span>
                    )}
                    {answered && isSelected && !isCorrect && (
                      <span className="ml-auto">&#10007;</span>
                    )}
                  </Button>
                );
              }
            )}

            {answered && (
              <Button
                onClick={handleNext}
                className="w-full mt-4"
              >
                {questionIndex + 1 < questions.length
                  ? "Next Question"
                  : "See Results"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
