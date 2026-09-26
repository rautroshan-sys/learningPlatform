import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, ChevronRight, Code2, Rocket, Brain } from "lucide-react";

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [experience, setExperience] = useState("");
  const [goal, setGoal] = useState("");

  const handleComplete = () => {
    localStorage.setItem("userExperience", experience);
    localStorage.setItem("userGoal", goal);
    navigate("/course");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f1115] relative overflow-hidden text-white font-sans">
      <div className="absolute top-0 left-0 w-full h-full bg-grid-white/[0.02] bg-[length:50px_50px]" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[128px]" />
      
      <div className="relative z-10 w-full max-w-2xl p-8 bg-[#16181d] rounded-2xl border border-[#272b35] shadow-2xl animate-in fade-in zoom-in-95 duration-500 mx-4">
        
        {step === 1 && (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">Welcome to Adaptive Engine</h1>
              <p className="text-gray-400">Let's personalize your learning experience.</p>
            </div>

            <div className="space-y-4">
              <h2 className="font-semibold text-lg">What is your programming experience?</h2>
              
              <button 
                onClick={() => setExperience("beginner")}
                className={`w-full p-4 rounded-xl border flex items-center gap-4 transition-all ${experience === 'beginner' ? 'bg-[#0ea5e9]/10 border-[#0ea5e9]' : 'bg-[#0f1115] border-[#272b35] hover:border-gray-600'}`}
              >
                <div className={`p-3 rounded-lg ${experience === 'beginner' ? 'bg-[#0ea5e9]' : 'bg-[#272b35]'}`}>
                  <Rocket className="w-5 h-5 text-white" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-medium text-white">Absolute Beginner</div>
                  <div className="text-xs text-gray-400">I have never written code before.</div>
                </div>
                {experience === 'beginner' && <CheckCircle2 className="w-5 h-5 text-[#0ea5e9]" />}
              </button>

              <button 
                onClick={() => setExperience("intermediate")}
                className={`w-full p-4 rounded-xl border flex items-center gap-4 transition-all ${experience === 'intermediate' ? 'bg-[#0ea5e9]/10 border-[#0ea5e9]' : 'bg-[#0f1115] border-[#272b35] hover:border-gray-600'}`}
              >
                <div className={`p-3 rounded-lg ${experience === 'intermediate' ? 'bg-[#0ea5e9]' : 'bg-[#272b35]'}`}>
                  <Code2 className="w-5 h-5 text-white" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-medium text-white">Some Experience</div>
                  <div className="text-xs text-gray-400">I know loops, variables, and basic logic.</div>
                </div>
                {experience === 'intermediate' && <CheckCircle2 className="w-5 h-5 text-[#0ea5e9]" />}
              </button>

              <button 
                onClick={() => setExperience("advanced")}
                className={`w-full p-4 rounded-xl border flex items-center gap-4 transition-all ${experience === 'advanced' ? 'bg-[#0ea5e9]/10 border-[#0ea5e9]' : 'bg-[#0f1115] border-[#272b35] hover:border-gray-600'}`}
              >
                <div className={`p-3 rounded-lg ${experience === 'advanced' ? 'bg-[#0ea5e9]' : 'bg-[#272b35]'}`}>
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-medium text-white">Advanced</div>
                  <div className="text-xs text-gray-400">I want to learn algorithms and architecture.</div>
                </div>
                {experience === 'advanced' && <CheckCircle2 className="w-5 h-5 text-[#0ea5e9]" />}
              </button>
            </div>

            <div className="flex justify-end pt-4">
              <button 
                disabled={!experience}
                onClick={() => setStep(2)}
                className="bg-[#0ea5e9] hover:bg-[#0284c7] disabled:opacity-50 disabled:hover:bg-[#0ea5e9] text-white px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">Curating your path</h1>
              <p className="text-gray-400">What do you want to achieve?</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {['Web Development', 'Data Science', 'Mobile Apps', 'Game Dev', 'Algorithms', 'Machine Learning'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setGoal(opt)}
                  className={`p-4 rounded-xl border transition-all text-sm font-medium ${goal === opt ? 'bg-[#0ea5e9]/10 border-[#0ea5e9] text-[#0ea5e9]' : 'bg-[#0f1115] border-[#272b35] text-gray-300 hover:border-gray-600'}`}
                >
                  {opt}
                </button>
              ))}
            </div>

            <div className="flex justify-between pt-4">
              <button 
                onClick={() => setStep(1)}
                className="bg-transparent hover:bg-[#272b35] text-gray-400 px-6 py-2.5 rounded-lg font-medium transition-colors"
              >
                Back
              </button>
              <button 
                disabled={!goal}
                onClick={handleComplete}
                className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white px-8 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                Start Learning <Rocket className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
