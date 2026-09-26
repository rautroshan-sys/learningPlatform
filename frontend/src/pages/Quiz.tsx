import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import type { Question } from "../types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { Textarea } from "../components/ui/textarea";
import { Brain, AlertTriangle, Lightbulb, Activity } from "lucide-react";
import { toast } from "sonner";

export default function Quiz() {
  const { conceptId } = useParams();
  const navigate = useNavigate();
  
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  
  // Hint state (CS50 duck pedagogical guardrails)
  const [hintLoading, setHintLoading] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  // Scrimba style edit-in-place state
  const [scratchpad, setScratchpad] = useState<string>("");

  const loadNextQuestion = async () => {
    setLoading(true);
    setSelected(null);
    setHint(null);
    setAttemptCount(0);
    setScratchpad("");
    try {
      // In a real app, we'd pass the conceptId and get a tiered question
      const res = await api.getNextQuiz("student-1");
      setQuestion(res.question);
    } catch (e) {
      toast.error("Failed to load question");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNextQuestion();
  }, [conceptId]);

  const handleAnswer = async () => {
    if (!selected || !question) return;
    
    setSubmitting(true);
    try {
      const res = await api.submitQuizAnswer({
        student_id: "student-1",
        question_id: question.id,
        selected
      });
      
      const newAttemptCount = attemptCount + 1;
      setAttemptCount(newAttemptCount);

      if (res.correct) {
        toast.success("Correct! Neural connection strengthened.", {
          icon: <Activity className="h-4 w-4 text-green-500" />
        });
        
        if (res.tier_changed) {
          toast.info("Mastery increased: Moving to harder questions.", {
            duration: 4000,
            icon: <TrendingUpIcon className="h-4 w-4 text-blue-500" />
          });
        }
        
        setTimeout(() => loadNextQuestion(), 1500);
      } else {
        toast.error("Incorrect. Let's rethink this.", {
          icon: <AlertTriangle className="h-4 w-4 text-red-500" />
        });
        
        if (res.gap_concept_id) {
          toast.warning("Gap Detected!", {
            description: "You seem to be struggling due to an unmet prerequisite. Path has been reordered.",
            duration: 6000,
          });
          setTimeout(() => navigate("/dashboard"), 3000);
          return;
        }

        if (res.tier_changed) {
          toast.info("Dropping difficulty tier to rebuild foundation.", {
            duration: 4000,
          });
          setTimeout(() => loadNextQuestion(), 2000);
        }
      }
    } catch (e) {
      toast.error("Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const askTutor = async () => {
    if (!question) return;
    setHintLoading(true);
    try {
      const res = await api.getHint({
        student_id: "student-1",
        question_id: question.id,
        attempt_number: attemptCount + 1
      });
      setHint(res.hint);
      
      if (!res.full_explanation_unlocked) {
        toast("Tutor Nudge", {
          description: "I've given you a hint, but not the full answer. Try again!",
          icon: <Lightbulb className="h-4 w-4 text-yellow-500" />
        });
      }
    } catch (e) {
      toast.error("Tutor is currently unavailable.");
    } finally {
      setHintLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <Brain className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Generating adaptive scenario...</p>
      </div>
    );
  }

  if (!question) return null;

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pt-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold tracking-tight">Active Learning</h2>
          <span className="text-sm font-medium px-3 py-1 bg-primary/10 text-primary rounded-full">
            Tier {question.difficulty_tier}
          </span>
        </div>

        <Card className="border-primary/20 shadow-lg shadow-primary/5">
          <CardHeader>
            <CardTitle className="text-xl leading-relaxed">{question.body}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {question.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => setSelected(opt)}
                className={`flex items-center justify-between p-4 rounded-xl border text-left transition-all duration-200 ${
                  selected === opt 
                    ? "border-primary bg-primary/10 ring-1 ring-primary/50 shadow-sm" 
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                }`}
              >
                <span className="font-mono text-sm">{opt}</span>
              </button>
            ))}
          </CardContent>
          <CardFooter className="flex justify-between border-t p-4 bg-muted/20">
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              Back to Path
            </Button>
            <Button 
              onClick={handleAnswer} 
              disabled={!selected || submitting}
              className="min-w-[120px]"
            >
              {submitting ? <Brain className="h-4 w-4 animate-spin" /> : "Submit Answer"}
            </Button>
          </CardFooter>
        </Card>

        {/* Scrimba-style edit-in-place practice area */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Interactive Scratchpad
          </h3>
          <Textarea 
            placeholder="Test your mental model here before answering... (e.g. write pseudocode)"
            className="font-mono text-sm h-32 bg-card/50 resize-none border-dashed border-primary/30 focus-visible:border-primary/60"
            value={scratchpad}
            onChange={(e) => setScratchpad(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-6">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Brain className="h-5 w-5 text-primary" />
              AI Tutor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!hint ? (
              <div className="text-sm text-muted-foreground text-center py-6">
                <p className="mb-4">Stuck? The tutor will guide you, but won't give you the answer outright.</p>
                <Button 
                  variant="secondary" 
                  onClick={askTutor} 
                  disabled={hintLoading}
                  className="w-full gap-2 shadow-sm"
                >
                  {hintLoading ? <Brain className="h-4 w-4 animate-spin" /> : <Lightbulb className="h-4 w-4" />}
                  Ask for a Nudge
                </Button>
              </div>
            ) : (
              <Alert className="bg-background border-primary/30 shadow-sm animate-in fade-in zoom-in">
                <Lightbulb className="h-4 w-4 text-yellow-500" />
                <AlertTitle>Tutor says:</AlertTitle>
                <AlertDescription className="mt-2 text-sm leading-relaxed">
                  {hint}
                </AlertDescription>
              </Alert>
            )}
            
            {attemptCount > 0 && !hint && (
              <p className="text-xs text-center text-muted-foreground animate-pulse">
                You've made {attemptCount} attempt{attemptCount > 1 ? 's' : ''}. Consider asking the tutor.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function TrendingUpIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}
