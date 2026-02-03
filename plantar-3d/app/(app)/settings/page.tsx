"use client";

import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  User,
  Mail,
  Lock,
  Trash2,
  LogOut,
  ChevronRight,
} from "lucide-react";

const menuItems = [
  {
    icon: Mail,
    title: "Change Email",
    desc: "Update your email address",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Lock,
    title: "Change Password",
    desc: "Update your password",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Trash2,
    title: "Delete Account",
    desc: "Remove your account permanently",
    color: "text-destructive",
    bg: "bg-destructive/10",
  },
];

export default function SettingsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;

  function handleMenuClick(title: string) {
    if (title === "Delete Account") {
      if (confirm("Are you sure? This cannot be undone.")) {
        alert("Contact support to delete account");
      }
    } else {
      alert("Contact support to change your " + title.toLowerCase().replace("change ", ""));
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-lg mx-auto p-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/")}
            className="text-primary"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">Settings</h1>
        </div>

        {/* Profile Card */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                {user?.image ? (
                  <img
                    src={user.image}
                    alt={user.name || ""}
                    className="w-12 h-12 rounded-full"
                  />
                ) : (
                  <User className="w-6 h-6 text-primary-foreground" />
                )}
              </div>
              <div>
                <h2 className="font-semibold">{user?.name || "User"}</h2>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Options */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Account</h3>
          <div className="space-y-2">
            {menuItems.map((item) => (
              <Card
                key={item.title}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleMenuClick(item.title)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 ${item.bg} rounded-lg flex items-center justify-center`}
                      >
                        <item.icon className={`w-4 h-4 ${item.color}`} />
                      </div>
                      <div>
                        <p
                          className={`font-medium text-sm ${
                            item.title === "Delete Account"
                              ? "text-destructive"
                              : ""
                          }`}
                        >
                          {item.title}
                        </p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Sign Out */}
        <Button
          onClick={() => signOut({ callbackUrl: "/login" })}
          variant="outline"
          className="w-full py-5 text-destructive hover:bg-destructive/10"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
