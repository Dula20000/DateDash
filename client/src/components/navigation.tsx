import { Link, useLocation } from "wouter";
import { Home, Dumbbell, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Navigation() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Home", testId: "nav-home" },
    { path: "/workout", icon: Dumbbell, label: "Workout", testId: "nav-workout" },
    { path: "/progress", icon: TrendingUp, label: "Progress", testId: "nav-progress" }
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-card border-t border-border z-50">
      <div className="flex justify-around py-2">
        {navItems.map(({ path, icon: Icon, label, testId }) => (
          <Link key={path} href={path}>
            <button 
              data-testid={testId}
              className={cn(
                "flex flex-col items-center py-2 px-4 app-transition",
                location === path 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-primary"
              )}
            >
              <Icon className="text-xl mb-1" size={20} />
              <span className="text-xs">{label}</span>
            </button>
          </Link>
        ))}
      </div>
    </nav>
  );
}
