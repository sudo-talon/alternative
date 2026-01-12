import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface QuizPlayerProps {
  quizId: string;
  onComplete?: (score: number, total: number) => void;
}

export function QuizPlayer({ quizId, onComplete }: QuizPlayerProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  // Fetch quiz details
  const { data: quiz } = useQuery({
    queryKey: ["quiz", quizId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quizzes")
        .select("*")
        .eq("id", quizId)
        .single();
      if (error) throw error;
      return data;
    },
  });

  // Fetch questions
  const { data: questions, isLoading } = useQuery({
    queryKey: ["quiz-questions", quizId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quiz_questions")
        .select("*")
        .eq("quiz_id", quizId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Check for existing submission
  const { data: existingSubmission } = useQuery({
    queryKey: ["quiz-submission", quizId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("quiz_submissions")
        .select("*")
        .eq("quiz_id", quizId)
        .eq("student_id", user.id)
        .order("submitted_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (existingSubmission) {
      setSubmitted(true);
      setScore(existingSubmission.score);
      // We could also restore answers if we want
      if (existingSubmission.answers && typeof existingSubmission.answers === 'object') {
        setAnswers(existingSubmission.answers as Record<string, string>);
      }
    } else {
      setSubmitted(false);
      setScore(null);
      setAnswers({});
    }
  }, [existingSubmission, quizId]);


  const submitQuizMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Calculate score
      let correctCount = 0;
      questions?.forEach(q => {
        if (answers[q.id] === q.correct_answer) {
          correctCount++;
        }
      });
      const calculatedScore = Math.round((correctCount / (questions?.length || 1)) * 100);

      const { error } = await supabase
        .from("quiz_submissions")
        .insert([{
          quiz_id: quizId,
          student_id: user.id,
          answers: answers,
          score: calculatedScore,
        }]);
      
      if (error) throw error;
      return { score: calculatedScore, total: questions?.length || 0 };
    },
    onSuccess: (result) => {
      setSubmitted(true);
      setScore(result.score);
      toast.success(`Quiz submitted! Score: ${result.score}%`);
      if (onComplete) onComplete(result.score, result.total);
    },
    onError: (error) => {
      toast.error(`Failed to submit quiz: ${error.message}`);
    },
  });

  const handleSubmit = () => {
    if (!questions) return;
    
    // Check if all questions answered
    const answeredCount = Object.keys(answers).length;
    if (answeredCount < questions.length) {
      toast.error(`Please answer all questions (${answeredCount}/${questions.length})`);
      return;
    }

    submitQuizMutation.mutate();
  };

  if (isLoading) return <div>Loading quiz...</div>;
  if (!questions || questions.length === 0) return <div>No questions in this quiz.</div>;

  return (
    <div className="space-y-8 max-w-3xl mx-auto py-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">{quiz?.title}</h1>
        <p className="text-muted-foreground">{quiz?.description}</p>
        {submitted && score !== null && (
          <div className={`p-4 rounded-lg border ${score >= 70 ? "bg-green-50 border-green-200 text-green-800" : "bg-yellow-50 border-yellow-200 text-yellow-800"}`}>
            <h3 className="font-bold text-lg">
              Result: {score}% 
              {score >= 70 ? " - Passed" : " - Keep Practicing"}
            </h3>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {questions.map((q, index) => {
          const isCorrect = answers[q.id] === q.correct_answer;
          const showResult = submitted;

          return (
            <Card key={q.id} className={`${showResult ? (isCorrect ? "border-green-200" : "border-red-200") : ""}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex gap-2">
                  <span className="text-muted-foreground">{index + 1}.</span>
                  {q.question}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup 
                  value={answers[q.id]} 
                  onValueChange={(val) => !submitted && setAnswers(prev => ({ ...prev, [q.id]: val }))}
                  className="space-y-2"
                >
                  {(q.options as string[]).map((option, optIdx) => (
                    <div key={optIdx} className="flex items-center space-x-2">
                      <RadioGroupItem 
                        value={option} 
                        id={`q${q.id}-opt${optIdx}`} 
                        disabled={submitted}
                      />
                      <Label 
                        htmlFor={`q${q.id}-opt${optIdx}`}
                        className={`flex-1 py-1 cursor-pointer ${
                          submitted && option === q.correct_answer 
                            ? "text-green-600 font-bold" 
                            : submitted && answers[q.id] === option && option !== q.correct_answer
                            ? "text-red-600 line-through"
                            : ""
                        }`}
                      >
                        {option}
                        {submitted && option === q.correct_answer && (
                          <CheckCircle2 className="inline ml-2 h-4 w-4 text-green-600" />
                        )}
                        {submitted && answers[q.id] === option && option !== q.correct_answer && (
                          <XCircle className="inline ml-2 h-4 w-4 text-red-600" />
                        )}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {!submitted && (
        <div className="flex justify-end">
          <Button size="lg" onClick={handleSubmit} disabled={submitQuizMutation.isPending}>
            {submitQuizMutation.isPending ? "Submitting..." : "Submit Quiz"}
          </Button>
        </div>
      )}
    </div>
  );
}
