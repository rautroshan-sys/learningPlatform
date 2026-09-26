import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import type { MasteryRecord } from "../types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { Brain, ArrowRight, TrendingUp } from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

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
    
    // Polling interval for live updates per MVP requirements
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Brain className="h-8 w-8 animate-pulse text-primary" />
          <p className="text-sm text-muted-foreground animate-pulse">Loading neural profile...</p>
        </div>
      </div>
    );
  }

  // Format data for radar chart (value scaled to 100 for better visuals)
  const chartData = mastery.map(m => ({
    subject: m.name || m.concept_id,
    A: Math.round(m.p_mastery * 100),
    fullMark: 100,
  }));

  const recommendedConcept = path.find(c => c.recommended) || path[0];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Neural Profile</h1>
          <p className="text-muted-foreground mt-1">Live mastery tracking across all Python concepts.</p>
        </div>
        {recommendedConcept && (
          <Button onClick={() => navigate(`/quiz/${recommendedConcept.concept_id}`)} size="lg" className="gap-2 shadow-lg hover:shadow-primary/25 transition-all">
            Continue Learning <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 shadow-md bg-card/50 backdrop-blur border-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Mastery Radar
            </CardTitle>
            <CardDescription>Visual representation of your current skill levels.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'currentColor', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Radar name="Mastery" dataKey="A" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 shadow-md bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle>Recommended Path</CardTitle>
            <CardDescription>Topologically sorted learning path based on prerequisite mastery.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {path.map((concept, idx) => (
                <div key={concept.concept_id} className="group relative">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                        concept.recommended 
                          ? "border-primary bg-primary/20 text-primary animate-pulse" 
                          : "border-muted bg-muted/50 text-muted-foreground"
                      }`}>
                        {idx + 1}
                      </div>
                      <div>
                        <span className="font-semibold block">{concept.name || concept.concept_id}</span>
                        {concept.recommended && <span className="text-xs text-primary font-medium">Currently active</span>}
                      </div>
                    </div>
                    <span className="text-sm font-medium">
                      {Math.round(concept.p_mastery * 100)}%
                    </span>
                  </div>
                  <Progress 
                    value={concept.p_mastery * 100} 
                    className={`h-2 transition-all ${concept.recommended ? 'bg-primary/20' : ''}`}
                  />
                  {idx < path.length - 1 && (
                    <div className="absolute left-4 top-8 h-full w-px bg-border -z-10" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
