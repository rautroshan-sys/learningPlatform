import { useEffect, useState } from "react";
import { api } from "../services/api";
import type { MasteryRecord } from "../types";
import { CheckCircle2, Circle, AlertTriangle, ArrowRight, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Path() {
  const [path, setPath] = useState<MasteryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await api.getPath("student-1");
        setPath(res.path);
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

  if (loading) return null;

  const currentConcept = path.find(c => c.recommended) || path[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-1">My Learning Path</h1>
        <p className="text-gray-400 text-sm">Ordered by prerequisites and re-ordered by your results.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-4">
          {path.map((concept, idx) => {
            const mastery = Math.round(concept.p_mastery * 100);
            const isCompleted = mastery > 75;
            const isNeedsPractice = !isCompleted && mastery < 50 && !concept.recommended;
            const isCurrent = concept.recommended;
            const isLocked = !isCompleted && !isNeedsPractice && !isCurrent;
            
            const statusColor = isCompleted 
              ? "border-emerald-500/30 text-emerald-500" 
              : isNeedsPractice 
                ? "border-amber-500 text-amber-500" 
                : isCurrent 
                  ? "border-[#0ea5e9] text-[#0ea5e9]" 
                  : "border-[#272b35] text-gray-500";
            
            const Icon = isCompleted ? CheckCircle2 : isNeedsPractice ? AlertTriangle : isCurrent ? Circle : Lock;

            return (
              <div 
                key={concept.concept_id}
                className={`bg-[#16181d] rounded-xl p-5 border ${isCurrent || isNeedsPractice ? statusColor : 'border-[#272b35]'} flex gap-5 transition-all`}
              >
                <div className={`mt-1 flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-[#16181d]`}>
                  <Icon className={`w-5 h-5 ${statusColor.split(' ')[1]}`} />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className={`font-semibold ${isCompleted || isCurrent || isNeedsPractice ? 'text-white' : 'text-gray-400'}`}>
                      {concept.name || concept.concept_id}
                    </h3>
                    
                    {isCompleted && <span className="text-[10px] uppercase font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Completed</span>}
                    {isNeedsPractice && <span className="text-[10px] uppercase font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Needs practice</span>}
                    {isCurrent && <span className="text-[10px] uppercase font-bold text-[#0ea5e9] bg-[#0ea5e9]/10 px-2 py-0.5 rounded border border-[#0ea5e9]/20 flex items-center gap-1">Current</span>}
                  </div>
                  
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                      <div className="flex gap-0.5">
                        <div className="w-1 h-3 bg-gray-500 rounded-sm"></div>
                        <div className="w-1 h-3 bg-gray-500 rounded-sm"></div>
                        <div className="w-1 h-3 bg-[#272b35] rounded-sm"></div>
                      </div>
                      Medium
                    </span>
                    {idx > 0 && <span>Requires {path[idx - 1].name || path[idx - 1].concept_id}</span>}
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-medium text-gray-400 w-16">Mastery</span>
                    <div className="flex-1 h-1.5 bg-[#272b35] rounded-full overflow-hidden">
                      <div className={`h-full ${isCompleted ? 'bg-emerald-500' : isNeedsPractice ? 'bg-amber-500' : 'bg-[#0ea5e9]'}`} style={{ width: `${mastery}%` }}></div>
                    </div>
                    <span className="text-xs font-medium text-gray-400 w-8 text-right">{mastery}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="w-full lg:w-[320px] space-y-4">
          <div className="bg-[#16181d] rounded-xl border border-[#272b35] p-5">
            <h3 className="text-[#0ea5e9] font-medium text-sm flex items-center gap-2 mb-3">
              <Circle className="w-4 h-4 fill-current" /> Why was my path changed?
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Your <strong className="text-white">Functions</strong> mastery dropped to 48%, so Recursion was temporarily moved down and Functions practice was added first.
            </p>
          </div>
          
          <div className="bg-[#16181d] rounded-xl border border-[#272b35] p-5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1">Recommended Next</p>
            <h3 className="text-white font-medium mb-3">Practice Functions</h3>
            <p className="text-xs text-gray-400 mb-5">
              Functions (48%) is the weakest prerequisite of your current concept, Recursion.
            </p>
            <button 
              onClick={() => navigate('/diagnostic')}
              className="w-full bg-[#0ea5e9] hover:bg-[#0284c7] text-white py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              Practice Functions <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="bg-[#16181d] rounded-xl border border-[#272b35] p-5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-3">Legend</p>
            <div className="grid grid-cols-2 gap-3 text-xs text-gray-400">
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Completed</div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#0ea5e9]"></div> Current</div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Needs practice</div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#0ea5e9]/50"></div> Knowledge gap</div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-gray-500"></div> Locked</div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#0ea5e9] animate-pulse"></div> Recommended</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
