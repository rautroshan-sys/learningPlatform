import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import type { DiagnosticQuestion } from "../types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { Brain, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function Diagnostic() {
  const [questions, setQuestions] = useState<DiagnosticQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDiagnostic = async () => {
      try {
        const res = await api.startDiagnostic();
        setQuestions(res.questions);
      } catch (e) {
        toast.error("Failed to load diagnostic");
      } finally {
        setLoading(false);
      }
    };
    fetchDiagnostic();
  }, []);

  const handleSelect = (option: string) => {
    const currentQ = questions[currentIndex];
    setAnswers(prev => ({ ...prev, [currentQ.id]: option }));
  };

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Submit
      setSubmitting(true);
      try {
        const formattedAnswers = Object.entries(answers).map(([id, selected]) => ({
          question_id: id,
          selected
        }));
        await api.submitDiagnostic({ answers: formattedAnswers });
        toast.success("Diagnostic complete! Profiling neural pathways...", {
          icon: <Brain className="h-4 w-4 text-primary" />
        });
        setTimeout(() => navigate("/dashboard"), 1500);
      } catch (e) {
        toast.error("Failed to submit diagnostic");
        setSubmitting(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <Brain className="h-10 w-10 animate-bounce text-primary" />
        <p className="text-muted-foreground animate-pulse">Calibrating assessment engine...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return <div>No questions available.</div>;
  }

  const currentQ = questions[currentIndex];
  const progress = ((currentIndex) / questions.length) * 100;
  const isAnswered = !!answers[currentQ.id];

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500 pt-10">
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Diagnostic Assessment</span>
          <span>Question {currentIndex + 1} of {questions.length}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card className="border-primary/20 shadow-lg shadow-primary/5 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-2xl leading-relaxed">{currentQ.body}</CardTitle>
          <CardDescription>Select the most accurate response.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {currentQ.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleSelect(opt)}
              className={`flex items-center justify-between p-4 rounded-xl border text-left transition-all duration-200 ${
                answers[currentQ.id] === opt 
                  ? "border-primary bg-primary/10 ring-1 ring-primary/50 shadow-sm" 
                  : "border-border hover:border-primary/50 hover:bg-muted/50"
              }`}
            >
              <span>{opt}</span>
              {answers[currentQ.id] === opt && <CheckCircle2 className="h-5 w-5 text-primary animate-in zoom-in" />}
            </button>
          ))}
        </CardContent>
        <CardFooter className="flex justify-end pt-4">
          <Button 
            onClick={handleNext} 
            disabled={!isAnswered || submitting}
            size="lg"
            className="w-full sm:w-auto min-w-[120px]"
          >
            {submitting ? (
              <Brain className="h-4 w-4 animate-spin" />
            ) : currentIndex === questions.length - 1 ? (
              "Complete Assessment"
            ) : (
              "Next Question"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
