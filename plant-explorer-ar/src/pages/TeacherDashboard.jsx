import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, Sprout, Brain, BarChart3, ArrowLeft } from "lucide-react";
import ManagePlants from "../components/teacher/ManagePlants";
import ManageQuizzes from "../components/teacher/ManageQuizzes";
import ViewResults from "../components/teacher/ViewResults";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";

export default function TeacherDashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a1628] text-white p-6 md:p-12 pb-32">
      <div className="max-w-7xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl("Home"))}
          className="mb-6 text-cyan-400 hover:text-cyan-300"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Home
        </Button>

        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-2xl flex items-center justify-center shadow-xl">
              <GraduationCap className="w-9 h-9 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Teacher Dashboard
          </h1>
          <p className="text-lg text-slate-400">
            Manage plants, create quizzes, and track student progress 📚
          </p>
        </div>

        <Tabs defaultValue="plants" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto h-auto p-2 bg-[#1a3a52] backdrop-blur border-0">
            <TabsTrigger value="plants" className="py-4 text-base data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-400 data-[state=active]:to-blue-500 data-[state=active]:text-white">
              <Sprout className="w-5 h-5 mr-2" />
              Plants
            </TabsTrigger>
            <TabsTrigger value="quizzes" className="py-4 text-base data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-400 data-[state=active]:to-pink-500 data-[state=active]:text-white">
              <Brain className="w-5 h-5 mr-2" />
              Quizzes
            </TabsTrigger>
            <TabsTrigger value="results" className="py-4 text-base data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-400 data-[state=active]:to-red-500 data-[state=active]:text-white">
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