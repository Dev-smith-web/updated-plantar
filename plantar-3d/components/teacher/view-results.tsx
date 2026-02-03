"use client";

import { useQuizResults } from "@/hooks/use-quiz";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Users, Target, TrendingUp } from "lucide-react";
import { format } from "date-fns";

export default function ViewResults() {
  const { data: results = [], isLoading } = useQuizResults();

  const stats = {
    totalAttempts: results.length,
    averageScore:
      results.length > 0
        ? Math.round(
            results.reduce(
              (sum, r) => sum + (r.score / r.totalQuestions) * 100,
              0
            ) / results.length
          )
        : 0,
    uniqueStudents: new Set(results.map((r) => r.studentName)).size,
    perfectScores: results.filter((r) => r.score === r.totalQuestions).length,
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Attempts</p>
                <p className="text-3xl font-bold">{stats.totalAttempts}</p>
              </div>
              <Target className="w-10 h-10 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Average Score</p>
                <p className="text-3xl font-bold">{stats.averageScore}%</p>
              </div>
              <TrendingUp className="w-10 h-10 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Students</p>
                <p className="text-3xl font-bold">{stats.uniqueStudents}</p>
              </div>
              <Users className="w-10 h-10 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">Perfect Scores</p>
                <p className="text-3xl font-bold">{stats.perfectScores}</p>
              </div>
              <Trophy className="w-10 h-10 text-yellow-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/90 backdrop-blur border-2 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl text-gray-900">Recent Quiz Results</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center text-gray-500 py-8">Loading...</p>
          ) : results.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No quiz results yet. Students will see their results here after
              taking quizzes!
            </p>
          ) : (
            <div className="space-y-3">
              {results.map((result) => {
                const percentage = Math.round(
                  (result.score / result.totalQuestions) * 100
                );
                const colorClass =
                  percentage >= 80
                    ? "text-green-600"
                    : percentage >= 60
                      ? "text-yellow-600"
                      : "text-red-600";

                return (
                  <Card key={result.id} className="border-2">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-lg text-gray-900">
                            {result.studentName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {result.createdAt
                              ? format(
                                  new Date(result.createdAt),
                                  "MMM d, yyyy h:mm a"
                                )
                              : ""}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">
                            {result.score}/{result.totalQuestions}
                          </p>
                          <p className={`text-sm font-medium ${colorClass}`}>
                            {percentage}%
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
