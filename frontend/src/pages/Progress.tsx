import { useEffect, useState } from "react";
import { api } from "../services/api";
import type { MasteryRecord } from "../types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function Progress() {
  const [mastery, setMastery] = useState<MasteryRecord[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await api.getMastery("student-1");
        setMastery(res.mastery);
      } catch (e) {
        console.error(e);
      }
    };
    loadData();
  }, []);

  const overallMastery = mastery.length 
    ? Math.round(mastery.reduce((acc, m) => acc + m.p_mastery, 0) / mastery.length * 100) 
    : 64;
    
  const masteredCount = mastery.filter(m => m.p_mastery > 0.75).length;
  const needsPracticeCount = mastery.filter(m => m.p_mastery < 0.50).length;

  const mockChartData = [
    { name: "W1", var: 30, loop: 25, func: 15, rec: 0 },
    { name: "W2", var: 45, loop: 35, func: 20, rec: 5 },
    { name: "W3", var: 60, loop: 45, func: 35, rec: 15 },
    { name: "W4", var: 70, loop: 55, func: 50, rec: 25 },
    { name: "W5", var: 80, loop: 65, func: 55, rec: 25 },
    { name: "W6", var: 86, loop: 79, func: 48, rec: 31 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Progress</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#16181d] rounded-xl border border-[#272b35] p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Overall mastery</p>
          <p className="text-3xl font-bold text-white">{overallMastery}%</p>
        </div>
        <div className="bg-[#16181d] rounded-xl border border-[#272b35] p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Concepts mastered</p>
          <p className="text-3xl font-bold text-white">{masteredCount}/{mastery.length || 8}</p>
        </div>
        <div className="bg-[#16181d] rounded-xl border border-[#272b35] p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Needs practice</p>
          <p className="text-3xl font-bold text-white">{needsPracticeCount}</p>
        </div>
        <div className="bg-[#16181d] rounded-xl border border-[#272b35] p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">This week</p>
          <p className="text-3xl font-bold text-white">214 <span className="text-sm font-normal text-gray-500">min</span></p>
        </div>
      </div>

      <div className="bg-[#16181d] rounded-xl border border-[#272b35] p-6 mb-6">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1">Trend</p>
        <h3 className="text-white font-medium mb-6">Mastery over time</h3>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockChartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#272b35" vertical={false} />
              <XAxis dataKey="name" stroke="#4b5563" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis stroke="#4b5563" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#16181d', borderColor: '#272b35', color: '#fff' }}
                itemStyle={{ color: '#fff' }}
              />
              <Line type="monotone" dataKey="var" name="Variables" stroke="#0ea5e9" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="loop" name="Loops" stroke="#10b981" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="func" name="Functions" stroke="#f59e0b" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="rec" name="Recursion" stroke="#ef4444" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#16181d] rounded-xl border border-[#272b35] p-6">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1">Now</p>
          <h3 className="text-white font-medium mb-6">Concept mastery</h3>
          <div className="space-y-4">
            {mastery.slice(0, 5).map((m) => {
              const val = Math.round(m.p_mastery * 100);
              const color = val > 75 ? "bg-emerald-500" : val > 40 ? "bg-amber-500" : "bg-red-500";
              return (
                <div key={m.concept_id}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-gray-200 font-medium">{m.name || m.concept_id}</span>
                    <span className="text-gray-400">{val}%</span>
                  </div>
                  <div className="h-1 bg-[#272b35] rounded-full overflow-hidden">
                    <div className={`h-full ${color}`} style={{ width: `${val}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="bg-[#16181d] rounded-xl border border-[#272b35] p-6">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1">Last 7 Days</p>
          <h3 className="text-white font-medium mb-6">Learning activity (minutes)</h3>
          <div className="flex items-end justify-between h-[180px] gap-2">
            {[30, 45, 15, 60, 25, 40, 0].map((h, i) => (
              <div key={i} className="flex flex-col items-center flex-1 gap-2 group">
                <div className="w-full bg-[#0ea5e9] transition-all hover:bg-[#38bdf8] rounded-t-sm" style={{ height: `${h}%` }}></div>
                <span className="text-[10px] text-gray-500 uppercase">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
