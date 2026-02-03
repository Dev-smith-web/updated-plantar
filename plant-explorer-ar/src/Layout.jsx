import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Home, Camera, BookOpen } from "lucide-react";

/*
 * Layout Component
 * Wraps all pages and handles authentication routing
 * Provides bottom navigation for authenticated users
 */
export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Configure app for standalone usage (hide URL bar)
  useEffect(() => {
    // iOS standalone mode
    const metaCapable = document.createElement('meta');
    metaCapable.name = 'apple-mobile-web-app-capable';
    metaCapable.content = 'yes';
    document.head.appendChild(metaCapable);

    const metaStatus = document.createElement('meta');
    metaStatus.name = 'apple-mobile-web-app-status-bar-style';
    metaStatus.content = 'black-translucent';
    document.head.appendChild(metaStatus);
    
    // Android/Generic standalone
    const metaMobile = document.createElement('meta');
    metaMobile.name = 'mobile-web-app-capable';
    metaMobile.content = 'yes';
    document.head.appendChild(metaMobile);
  }, []);

  // Check authentication status on page change
  useEffect(() => {
    async function checkAuth() {
      try {
        const authenticated = await base44.auth.isAuthenticated();
        setIsAuthenticated(authenticated);
        
        // Redirect logic
        const publicPages = ['Landing', 'Login'];
        
        if (authenticated && publicPages.includes(currentPageName)) {
          // Logged in users shouldn't see landing/login
          navigate(createPageUrl("Home"));
        } else if (!authenticated && !publicPages.includes(currentPageName)) {
          // Non-logged in users can only see public pages
          navigate(createPageUrl("Landing"));
        }
      } catch (err) {
        setIsAuthenticated(false);
        if (!['Landing', 'Login'].includes(currentPageName)) {
          navigate(createPageUrl("Landing"));
        }
      } finally {
        setIsLoading(false);
      }
    }
    
    checkAuth();
  }, [location.pathname, currentPageName, navigate]);

  // Pages that should NOT show bottom navigation
  const hideNavPages = ['Landing', 'Login', 'Settings', 'TeacherDashboard', 'PlantExplorer', 'Quiz'];
  const showBottomNav = isAuthenticated && !hideNavPages.includes(currentPageName);

  // Navigation items
  const navItems = [
    { name: "Home", page: "Home", icon: Home },
    { name: "Scan", page: "PlantScanner", icon: Camera, highlight: true },
    { name: "Library", page: "PlantLibrary", icon: BookOpen }
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Page Content */}
      <main className="min-h-screen">
        {children}
      </main>

      {/* Bottom Navigation Bar */}
      {showBottomNav && (
        <nav className="fixed bottom-0 left-0 right-0 bg-slate-800/95 border-t border-slate-700 pb-safe z-50">
          <div className="max-w-lg mx-auto px-4 py-3">
            <div className="flex items-center justify-around">
              {navItems.map((item) => {
                const isActive = location.pathname === createPageUrl(item.page);
                const Icon = item.icon;
                
                // Center scan button with special styling
                if (item.highlight) {
                  return (
                    <Link key={item.page} to={createPageUrl(item.page)}>
                      <button className="w-14 h-14 bg-teal-600 rounded-full flex items-center justify-center -mt-4 shadow-lg">
                        <Icon className="w-6 h-6 text-white" />
                      </button>
                    </Link>
                  );
                }

                return (
                  <Link key={item.page} to={createPageUrl(item.page)}>
                    <div className="flex flex-col items-center gap-1">
                      <Icon className={`w-5 h-5 ${isActive ? 'text-teal-400' : 'text-slate-500'}`} />
                      <span className={`text-xs ${isActive ? 'text-teal-400' : 'text-slate-500'}`}>
                        {item.name}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
      )}
    </div>
  );
}