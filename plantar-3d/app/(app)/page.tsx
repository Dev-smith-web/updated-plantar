"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePlants } from "@/hooks/use-plants";
import { useQuizResults } from "@/hooks/use-quiz";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Camera,
  Settings,
  Brain,
  GraduationCap,
  BookOpen,
  ArrowRight,
  Leaf,
} from "lucide-react";

const menuItems = [
  {
    icon: Camera,
    title: "Scan Plant",
    desc: "Identify plants using camera",
    href: "/scanner",
  },
  {
    icon: BookOpen,
    title: "Plant Library",
    desc: "Browse saved plants",
    href: "/library",
  },
  {
    icon: Brain,
    title: "Quiz Mode",
    desc: "Test your knowledge",
    href: "/quiz",
  },
];

export default function DashboardPage() {
  const { data: session } = useSession();
  const { data: plants = [] } = usePlants();
  const { data: quizResults = [] } = useQuizResults(session?.user?.id);

  const user = session?.user;
  const isTeacher = user?.role === "teacher" || user?.role === "admin";

  const totalQuizzes = quizResults.length;
  const totalPlants = plants.length;

  let avgScore = 0;
  if (quizResults.length > 0) {
    const sum = quizResults.reduce((acc, r) => {
      return acc + (r.score / r.totalQuestions) * 100;
    }, 0);
    avgScore = Math.round(sum / quizResults.length);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Leaf className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-primary">Plantar</h1>
              <p className="text-xs text-muted-foreground">
                {user?.name || "Welcome"}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            {isTeacher && (
              <Link href="/teacher">
                <Button variant="ghost" size="icon" className="text-accent">
                  <GraduationCap className="w-5 h-5" />
                </Button>
              </Link>
            )}
            <Link href="/settings">
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <Settings className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </header>

        {/* Welcome */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-1">Welcome Back!</h2>
          <p className="text-muted-foreground text-sm">
            Explore and learn about plants interactively
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold">{totalQuizzes}</p>
              <p className="text-xs text-muted-foreground">Quizzes</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold">{totalPlants}</p>
              <p className="text-xs text-muted-foreground">Plants</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold">{avgScore}%</p>
              <p className="text-xs text-muted-foreground">Avg Score</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Quick Actions</h3>
          <div className="space-y-3">
            {menuItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <item.icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">{item.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Plants */}
        {plants.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Recent Plants</h3>
              <Link href="/library">
                <Button
                  variant="link"
                  className="text-primary p-0 h-auto text-sm"
                >
                  View All
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {plants.slice(0, 4).map((plant) => (
                <Link key={plant.id} href={`/explorer/${plant.id}`}>
                  <Card className="overflow-hidden hover:bg-muted/50 transition-colors">
                    <div className="h-24 overflow-hidden">
                      <img
                        src={
                          plant.imageUrl ||
                          "https://images.unsplash.com/photo-1466781783364-36c955e42a7f?w=400"
                        }
                        alt={plant.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="p-2">
                      <p className="font-medium text-sm truncate">
                        {plant.name}
                      </p>
                      {plant.scientificName && (
                        <p className="text-xs text-primary italic truncate">
                          {plant.scientificName}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
        {/* Recent Quiz Results */}
        {quizResults.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Recent Results</h3>
              <Link href="/quiz">
                <Button
                  variant="link"
                  className="text-primary p-0 h-auto text-sm"
                >
                  Take Quiz
                </Button>
              </Link>
            </div>

            <div className="space-y-2">
              {[...quizResults]
                .sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
                )
                .slice(0, 5)
                .map((result) => {
                  const percent = Math.round(
                    (result.score / result.totalQuestions) * 100
                  );
                  const colorClass =
                    percent >= 80
                      ? "text-green-600"
                      : percent >= 60
                        ? "text-yellow-600"
                        : "text-red-600";

                  return (
                    <Card key={result.id}>
                      <CardContent className="p-3 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">
                            {result.score}/{result.totalQuestions} correct
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(result.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <p className={`text-lg font-bold ${colorClass}`}>
                          {percent}%
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
