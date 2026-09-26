import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import type { MasteryRecord } from "../types";
import { Brain, ArrowRight, Zap, CheckCircle2, ChevronRight, Lock, AlertTriangle, PenTool } from "lucide-react";
import { Progress } from "../components/ui/progress";

export default function Dashboard() {
  const [mastery, setMastery] = useState<MasteryRecord[]>([]);
  const [path, setPath] = useState<MasteryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [masteryRes, pathRes] = await Promise.all([
          api.getMastery("student-1"),
          api.getPath("student-1"),
        ]);
        setMastery(masteryRes.mastery);
        setPath(pathRes.path);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Brain className="h-8 w-8 animate-pulse text-blue-500" />
          <p className="text-sm text-gray-400 animate-pulse">Loading neural profile...</p>
        </div>
      </div>
    );
  }

  const currentConcept = path.find(c => c.recommended) || path[0] || { name: "Functions", p_mastery: 0.31 };
  
  // Fake gap detection for demonstration based on screenshot
  const gapConcept = "Functions";
  const targetConcept = "Recursion";

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Welcome back.</h1>
        <p className="text-gray-400 text-sm">Continue your learning journey.</p>
      </div>

      {/* Top Banner */}
      <div className="bg-[#16181d] rounded-xl border border-[#272b35] p-6 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-6">
          <div className="relative w-16 h-16 flex items-center justify-center">
            {/* SVG Circle for 31% progress */}
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#272b35" strokeWidth="8" />
              <circle cx="50" cy="50" r="45" fill="none" stroke="#f59e0b" strokeWidth="8" strokeDasharray="283" strokeDashoffset={283 - (283 * 0.31)} strokeLinecap="round" />
            </svg>
            <span className="absolute text-sm font-bold text-white">31%</span>
          </div>
          
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Current Concept</p>
            <h2 className="text-xl font-bold text-white mb-2">Understanding {currentConcept.name || targetConcept}</h2>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1 text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                <AlertTriangle className="w-3 h-3" /> Needs practice
              </span>
              <span className="text-gray-400">Prerequisite: {gapConcept}</span>
              <span className="text-gray-400">~45 min left</span>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-xs text-gray-500">Lesson 2 of 6</span>
              <div className="w-32 h-1.5 bg-[#272b35] rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-1/3"></div>
              </div>
            </div>
          </div>
        </div>
        
        <button 
          onClick={() => navigate(`/quiz/${currentConcept.concept_id}`)}
          className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm shadow-lg shadow-[#0ea5e9]/20"
        >
          Continue Learning <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Knowledge Profile */}
        <div className="bg-[#16181d] rounded-xl border border-[#272b35] p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Knowledge Profile</p>
              <h3 className="text-white font-medium">Concept mastery</h3>
            </div>
            <button className="text-xs text-gray-400 hover:text-white transition-colors">Details &rarr;</button>
          </div>
          
          <div className="space-y-6">
            {mastery.slice(0, 4).map((m, i) => {
              const val = Math.round(m.p_mastery * 100);
              const color = val > 75 ? "bg-emerald-500" : val > 40 ? "bg-amber-500" : "bg-red-500";
              return (
                <div key={m.concept_id}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-200">{m.name || m.concept_id}</span>
                    <span className="text-gray-400">{val}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#272b35] rounded-full overflow-hidden">
                    <div className={`h-full ${color}`} style={{ width: `${val}%` }}></div>
                  </div>
                </div>
              );
            })}
            
            <div className="pt-2 border-t border-[#272b35] flex items-center justify-between text-gray-500">
              <span className="text-sm">Trees</span>
              <Lock className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Knowledge Gap */}
        <div className="bg-[#16181d] rounded-xl border border-amber-500/20 p-6 shadow-[0_0_15px_rgba(245,158,11,0.05)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
          
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1">Knowledge Gap</p>
          <h3 className="text-amber-500 font-medium flex items-center gap-2 mb-6">
            <Zap className="w-4 h-4" fill="currentColor" /> Blocking your progress
          </h3>
          
          <p className="text-sm text-gray-300 mb-4">
            <strong className="text-amber-500 font-medium">{gapConcept}</strong> is currently blocking your progress in {targetConcept}.
          </p>
          
          <div className="bg-[#0f1115] border border-[#272b35] rounded-lg p-4 mb-4">
            <p className="text-[10px] uppercase text-gray-500 font-semibold tracking-wider mb-2">Reason</p>
            <p className="text-xs text-gray-400">
              Recursion depends on understanding function calls and return values.
            </p>
          </div>
          
          <div className="flex items-center gap-4 mb-6 text-xs font-medium">
            <span className="text-amber-500 border border-amber-500/30 bg-amber-500/5 px-2 py-1 rounded">Functions 48%</span>
            <span className="text-gray-500">&rarr;</span>
            <span className="text-gray-400 bg-[#272b35] px-2 py-1 rounded">Recursion 31%</span>
          </div>
          
          <button className="w-full bg-[#272b35] hover:bg-[#333845] text-white py-2.5 rounded-lg text-sm font-medium transition-colors border border-[#3a3f4e]">
            Review {gapConcept}
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-[#16181d] rounded-xl border border-[#272b35] p-6">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1">Recent Activity</p>
        <h3 className="text-white font-medium mb-6">What changed recently</h3>
        
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="mt-0.5 bg-amber-500/10 p-1.5 rounded text-amber-500 border border-amber-500/20">
              <Zap className="w-4 h-4" fill="currentColor" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between">
                <p className="text-sm font-medium text-gray-200">Knowledge gap detected</p>
                <span className="text-xs text-gray-500">12 min ago</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">Functions flagged as a prerequisite for Recursion</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="mt-0.5 bg-gray-800 p-1.5 rounded text-gray-400 border border-gray-700">
              <PenTool className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between">
                <p className="text-sm font-medium text-gray-200">Adaptive quiz - Recursion</p>
                <span className="text-xs text-gray-500">40 min ago</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">3 of 3 correct - difficulty raised to Medium</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="mt-0.5 bg-emerald-500/10 p-1.5 rounded text-emerald-500 border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between">
                <p className="text-sm font-medium text-gray-200">Lesson completed</p>
                <span className="text-xs text-gray-500">1 h ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
