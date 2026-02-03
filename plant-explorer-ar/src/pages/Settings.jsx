import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, User, Mail, Lock, Trash2, LogOut, ChevronRight, HelpCircle, Smartphone } from "lucide-react";
import InstallPrompt from "@/components/ui/InstallPrompt";

/*
 * Settings Component
 * Account management and user profile
 */
export default function Settings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user data on mount
  useEffect(() => {
    async function loadUserData() {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (err) {
        navigate(createPageUrl("Landing"));
      } finally {
        setLoading(false);
      }
    }
    loadUserData();
  }, [navigate]);

  // Sign out handler
  function handleSignOut() {
    base44.auth.logout(createPageUrl("Landing"));
  }

  // Account options menu
  const menuItems = [
    {
      icon: Mail,
      title: "Change Email",
      desc: "Update your email address",
      color: "text-teal-400",
      bg: "bg-teal-500/10",
      onClick: () => alert("Contact support to change email")
    },
    {
      icon: Lock,
      title: "Change Password",
      desc: "Update your password",
      color: "text-green-400",
      bg: "bg-green-500/10",
      onClick: () => alert("Contact support to change password")
    },
    {
      icon: Trash2,
      title: "Delete Account",
      desc: "Remove your account permanently",
      color: "text-red-400",
      bg: "bg-red-500/10",
      onClick: () => {
        if (confirm("Are you sure? This cannot be undone.")) {
          alert("Contact support to delete account");
        }
      }
    }
  ];

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white pb-24">
      <div className="max-w-lg mx-auto p-4">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(createPageUrl("Home"))}
            className="text-teal-400"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">Settings</h1>
        </div>

        {/* Profile Card */}
        <Card className="bg-slate-800 border-slate-700 mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-semibold">{user?.full_name || "User"}</h2>
                <p className="text-sm text-slate-400">{user?.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* App Installation */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-slate-400 mb-3">App Settings</h3>
          <div className="space-y-2">
            <InstallPrompt />
          </div>
        </div>

        {/* Account Options */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-slate-400 mb-3">Account</h3>
          <div className="space-y-2">
            {menuItems.map((item) => (
              <Card 
                key={item.title}
                className="bg-slate-800 border-slate-700 cursor-pointer hover:bg-slate-750"
                onClick={item.onClick}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 ${item.bg} rounded-lg flex items-center justify-center`}>
                        <item.icon className={`w-4 h-4 ${item.color}`} />
                      </div>
                      <div>
                        <p className={`font-medium text-sm ${item.title === 'Delete Account' ? 'text-red-400' : ''}`}>
                          {item.title}
                        </p>
                        <p className="text-xs text-slate-400">{item.desc}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Sign Out */}
        <Button
          onClick={handleSignOut}
          variant="outline"
          className="w-full py-5 border-slate-700 text-red-400 hover:bg-red-500/10"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}