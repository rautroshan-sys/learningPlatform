import { Outlet, Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Map, PenTool, LineChart, TerminalSquare, Settings as SettingsIcon, Bell, Zap, BookOpen } from "lucide-react";

export default function MainLayout() {
  const location = useLocation();
  
  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "My Learning Path", path: "/path", icon: Map },
    { name: "Course", path: "/course", icon: BookOpen },
    { name: "Practice", path: "/diagnostic", icon: PenTool },
    { name: "Code Sandbox", path: "/sandbox", icon: TerminalSquare },
    { name: "Progress", path: "/progress", icon: LineChart },
    { name: "Settings", path: "/settings", icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-[#0f1115] text-white flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#16181d] border-r border-[#272b35] flex flex-col">
        <div className="p-4 flex items-center gap-3 border-b border-[#272b35]">
          <div className="bg-blue-500 p-1.5 rounded-lg shadow-lg shadow-blue-500/20">
            <Zap className="h-5 w-5 text-white" fill="currentColor" />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight text-white">Gap to Grow</h1>
            <p className="text-[10px] text-gray-400">Turn knowledge gaps into growth.</p>
          </div>
        </div>
        
        <nav className="flex-1 py-6 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive 
                    ? "bg-[#272b35] text-white shadow-sm" 
                    : "text-gray-400 hover:text-white hover:bg-[#272b35]/50"
                }`}
              >
                <Icon className={`h-[18px] w-[18px] ${isActive ? "text-blue-400" : ""}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-[#272b35] flex items-center gap-3">
          <Link to="/settings" className="w-8 h-8 rounded-full bg-[#1e293b] flex items-center justify-center text-blue-400 text-xs font-bold border border-[#334155] hover:bg-[#2c3e50] transition-colors">
            RR
          </Link>
          <div>
            <p className="text-sm font-medium text-white leading-tight">Roshan Raut</p>
            <p className="text-xs text-gray-400">6-day streak</p>
          </div>
          <Link to="/settings" className="ml-auto">
            <SettingsIcon className="h-4 w-4 text-gray-500 hover:text-white transition-colors" />
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#0f1115]">
        {/* Top Header */}
        <header className="h-14 border-b border-[#272b35] bg-[#16181d] flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center text-gray-400">
            <span className="uppercase text-[10px] font-semibold tracking-wider mr-3">Current Course</span>
            <span className="text-sm text-white font-medium">Data Structures & Algorithms</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search concepts..." 
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    window.location.href = `/search?q=${encodeURIComponent(e.currentTarget.value)}`;
                  }
                }}
                className="bg-[#0f1115] border border-[#272b35] rounded-full text-xs px-4 py-1.5 w-64 focus:outline-none focus:border-gray-500 text-white placeholder-gray-500"
              />
            </div>
            <button className="text-gray-400 hover:text-white relative">
              <Bell className="h-[18px] w-[18px]" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
            </button>
            <Link to="/settings" className="w-7 h-7 rounded-full bg-[#1e293b] flex items-center justify-center text-[10px] text-blue-400 font-bold border border-[#334155] hover:bg-[#2c3e50] transition-colors cursor-pointer">
              RR
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8 relative">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
