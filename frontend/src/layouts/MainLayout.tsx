import { Outlet, Link } from "react-router-dom";
import { BookOpen, GraduationCap, LayoutDashboard } from "lucide-react";

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="font-bold hidden sm:inline-block">Adaptive Engine</span>
          </div>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 transition-colors hover:text-foreground/80 text-foreground/60"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              to="/diagnostic"
              className="flex items-center gap-2 transition-colors hover:text-foreground/80 text-foreground/60"
            >
              <BookOpen className="h-4 w-4" />
              Diagnostic
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
