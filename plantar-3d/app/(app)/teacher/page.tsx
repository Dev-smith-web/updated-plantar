"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  Sprout,
  Brain,
  BarChart3,
  ArrowLeft,
} from "lucide-react";
import ManagePlants from "@/components/teacher/manage-plants";
import ManageQuizzes from "@/components/teacher/manage-quizzes";
import ViewResults from "@/components/teacher/view-results";

export default function TeacherDashboardPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const role = session?.user?.role;
  if (role !== "teacher" && role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-foreground">
        <div className="text-center">
          <p className="mb-4">You don&apos;t have permission to view this page.</p>
          <Button onClick={() => router.push("/")}>Back to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => router.push("/")}
          className="mb-6 text-primary"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Home
        </Button>

        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center shadow-lg">
              <GraduationCap className="w-9 h-9 text-accent" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Teacher Dashboard
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage plants, create quizzes, and track student progress
          </p>
        </div>

        <Tabs defaultValue="plants" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto h-auto p-2">
            <TabsTrigger value="plants" className="py-4 text-base">
              <Sprout className="w-5 h-5 mr-2" />
              Plants
            </TabsTrigger>
            <TabsTrigger value="quizzes" className="py-4 text-base">
              <Brain className="w-5 h-5 mr-2" />
              Quizzes
            </TabsTrigger>
            <TabsTrigger value="results" className="py-4 text-base">
              <BarChart3 className="w-5 h-5 mr-2" />
              Results
            </TabsTrigger>
          </TabsList>

          <TabsContent value="plants">
            <ManagePlants />
          </TabsContent>

          <TabsContent value="quizzes">
            <ManageQuizzes />
          </TabsContent>

          <TabsContent value="results">
            <ViewResults />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
