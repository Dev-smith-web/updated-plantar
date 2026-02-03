import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Settings, Brain, GraduationCap, BookOpen, ArrowRight } from "lucide-react";
import InstallPrompt from "@/components/ui/InstallPrompt";

/*
 * Home Page Component
 * Main dashboard for PlantAR application
 * Displays user stats and navigation to key features
 */
export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load current user on component mount
  useEffect(() => {
    async function fetchUser() {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (err) {
        console.log("User not logged in");
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  // Fetch quiz results for stats
  const { data: quizResults = [] } = useQuery({
    queryKey: ['quizResults'],
    queryFn: () => base44.entities.QuizResult.list(),
  });

  // Fetch plants for library count
  const { data: plants = [] } = useQuery({
    queryKey: ['plants'],
    queryFn: () => base44.entities.Plant.list(),
  });

  // Calculate statistics
  const totalQuizzes = quizResults.length;
  const totalPlants = plants.length;
  
  let avgScore = 0;
  if (quizResults.length > 0) {
    const sum = quizResults.reduce((acc, r) => {
      return acc + (r.score / r.total_questions) * 100;
    }, 0);
    avgScore = Math.round(sum / quizResults.length);
  }

  // Navigation options
  const menuItems = [
    {
      icon: Camera,
      title: "Scan Plant",
      desc: "Identify plants using camera",
      page: "PlantScanner",
      bgColor: "bg-teal-600"
    },
    {
      icon: BookOpen,
      title: "Plant Library",
      desc: "Browse saved plants",
      page: "PlantLibrary",
      bgColor: "bg-green-600"
    },
    {
      icon: Brain,
      title: "Quiz Mode",
      desc: "Test your knowledge",
      page: "Quiz",
      bgColor: "bg-purple-600"
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-lg mx-auto px-4 py-6 pb-28">
        
        {/* Install Prompt (only shows if not installed) */}
        <InstallPrompt />

        {/* Header Section */}
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690ebb53f135a788e129c2d4/e70368864_image.png"
              alt="PlantAR Logo"
              className="w-10 h-10 object-contain"
            />
            <div>
              <h1 className="text-lg font-bold text-teal-400">PlantAR</h1>
              <p className="text-xs text-slate-400">
                {user?.full_name || 'Welcome'}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            {/* Show teacher dashboard link for admin users */}
            {user?.role === 'admin' && (
              <Link to={createPageUrl("TeacherDashboard")}>
                <Button variant="ghost" size="icon" className="text-orange-400">
                  <GraduationCap className="w-5 h-5" />
                </Button>
              </Link>
            )}
            <Link to={createPageUrl("Settings")}>
              <Button variant="ghost" size="icon" className="text-slate-400">
                <Settings className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </header>

        {/* Welcome Message */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-1">Welcome Back!</h2>
          <p className="text-slate-400 text-sm">
            Explore and learn about plants with augmented reality
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold">{totalQuizzes}</p>
              <p className="text-xs text-slate-400">Quizzes</p>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold">{totalPlants}</p>
              <p className="text-xs text-slate-400">Plants</p>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold">{avgScore}%</p>
              <p className="text-xs text-slate-400">Avg Score</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Menu */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Quick Actions</h3>
          <div className="space-y-3">
            {menuItems.map((item) => (
              <Link key={item.page} to={createPageUrl(item.page)}>
                <Card className="bg-slate-800 border-slate-700 hover:bg-slate-750 transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${item.bgColor} rounded-lg flex items-center justify-center`}>
                          <item.icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium">{item.title}</h4>
                          <p className="text-sm text-slate-400">{item.desc}</p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-500" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Plants Section */}
        {plants.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Recent Plants</h3>
              <Link to={createPageUrl("PlantLibrary")}>
                <Button variant="link" className="text-teal-400 p-0 h-auto text-sm">
                  View All
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {plants.slice(0, 4).map((plant) => (
                <Link 
                  key={plant.id} 
                  to={`${createPageUrl("PlantExplorer")}?id=${plant.id}`}
                >
                  <Card className="bg-slate-800 border-slate-700 overflow-hidden hover:bg-slate-750 transition-colors">
                    <div className="h-24 overflow-hidden">
                      <img
                        src={plant.image_url || 'https://images.unsplash.com/photo-1466781783364-36c955e42a7f?w=400'}
                        alt={plant.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="p-2">
                      <p className="font-medium text-sm truncate">{plant.name}</p>
                      {plant.scientific_name && (
                        <p className="text-xs text-teal-400 italic truncate">
                          {plant.scientific_name}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}