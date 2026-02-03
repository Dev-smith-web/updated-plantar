"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Home, Camera, BookOpen, GraduationCap } from "lucide-react";

const baseNavItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Scan", href: "/scanner", icon: Camera, highlight: true },
  { name: "Library", href: "/library", icon: BookOpen },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isTeacher =
    session?.user?.role === "teacher" || session?.user?.role === "admin";

  const navItems = isTeacher
    ? [...baseNavItems, { name: "Manage", href: "/teacher", icon: GraduationCap }]
    : baseNavItems;

  return (
    <div className="min-h-screen bg-background">
      <main className="min-h-screen pb-20">{children}</main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border pb-[env(safe-area-inset-bottom)] z-50">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-around">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              if (item.highlight) {
                return (
                  <Link key={item.href} href={item.href}>
                    <button className="w-14 h-14 bg-primary rounded-full flex items-center justify-center -mt-4 shadow-lg">
                      <Icon className="w-6 h-6 text-primary-foreground" />
                    </button>
                  </Link>
                );
              }

              return (
                <Link key={item.href} href={item.href}>
                  <div className="flex flex-col items-center gap-1">
                    <Icon
                      className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground"}`}
                    />
                    <span
                      className={`text-xs ${isActive ? "text-primary" : "text-muted-foreground"}`}
                    >
                      {item.name}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
