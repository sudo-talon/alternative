import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Trash, CheckCircle2, Circle, ArrowLeft, Edit } from "lucide-react";
import { toast } from "sonner";

interface QuizQuestionsEditorProps {
  quizId: string;
  onBack: () => void;
}

export function QuizQuestionsEditor({ quizId, onBack }: QuizQuestionsEditorProps) {
  const queryClient = useQueryClient();
  const [questionDialogOpen, setQuestionDialogOpen] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [questionForm, setQuestionForm] = useState({
    question: "",
    options: ["", "", "", ""],
    correct_answer: "",
  });

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

  const createQuestionMutation = useMutation({
    mutationFn: async (questionData: typeof questionForm) => {
      // Validate
      if (!questionData.question.trim()) throw new Error("Question text is required");
      if (questionData.options.some(o => !o.trim())) throw new Error("All options are required");
      if (!questionData.correct_answer) throw new Error("Please select the correct answer");
      if (!questionData.options.includes(questionData.correct_answer)) throw new Error("Correct answer must match one of the options");

      const { error } = await supabase
        .from("quiz_questions")
        .insert([{
          quiz_id: quizId,
          question: questionData.question,
          options: questionData.options,
          correct_answer: questionData.correct_answer,
        }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quiz-questions", quizId] });
      setQuestionDialogOpen(false);
      setQuestionForm({
        question: "",
        options: ["", "", "", ""],
        correct_answer: "",
      });
      toast.success("Question added successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateQuestionMutation = useMutation({
    mutationFn: async (questionData: typeof questionForm & { id: string }) => {
      if (!questionData.question.trim()) throw new Error("Question text is required");
      if (questionData.options.some(o => !o.trim())) throw new Error("All options are required");
      if (!questionData.correct_answer) throw new Error("Please select the correct answer");
      if (!questionData.options.includes(questionData.correct_answer)) throw new Error("Correct answer must match one of the options");

      const { error } = await supabase
        .from("quiz_questions")
        .update({
          question: questionData.question,
          options: questionData.options,
          correct_answer: questionData.correct_answer,
        })
        .eq("id", questionData.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quiz-questions", quizId] });
      setQuestionDialogOpen(false);
      setEditingQuestionId(null);
      setQuestionForm({
        question: "",
        options: ["", "", "", ""],
        correct_answer: "",
      });
      toast.success("Question updated successfully");
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: async (questionId: string) => {
      const { error } = await supabase
        .from("quiz_questions")
        .delete()
        .eq("id", questionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quiz-questions", quizId] });
      toast.success("Question deleted");
    },
  });

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...questionForm.options];
    newOptions[index] = value;
    
    if (questionForm.correct_answer === questionForm.options[index]) {
       setQuestionForm(prev => ({ ...prev, options: newOptions, correct_answer: value }));
    } else {
       setQuestionForm(prev => ({ ...prev, options: newOptions }));
    }
  };

  const handleEditClick = (q: { id: string; question: string; options: string[]; correct_answer: string }) => {
    setEditingQuestionId(q.id);
    setQuestionForm({
      question: q.question,
      options: q.options as string[],
      correct_answer: q.correct_answer,
    });
    setQuestionDialogOpen(true);
  };

  const handleCreateClick = () => {
    setEditingQuestionId(null);
    setQuestionForm({
      question: "",
      options: ["", "", "", ""],
      correct_answer: "",
    });
    setQuestionDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Quizzes
        </Button>
        <div>
          <h2 className="text-xl font-bold">Edit Quiz: {quiz?.title}</h2>
          <p className="text-muted-foreground text-sm">{quiz?.description}</p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Questions</h3>
        <Dialog open={questionDialogOpen} onOpenChange={setQuestionDialogOpen}>
          <Button onClick={handleCreateClick}>
            <Plus className="mr-2 h-4 w-4" /> Add Question
          </Button>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingQuestionId ? "Edit Question" : "Add New Question"}</DialogTitle>
              <DialogDescription>
                {editingQuestionId ? "Update the question details." : "Create a multiple choice question."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="question">Question Text</Label>
                <Textarea
                  id="question"
                  value={questionForm.question}
                  onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                  placeholder="e.g. What is the capital of Nigeria?"
                />
              </div>

              <div className="space-y-4">
                <Label>Options (Select the correct answer)</Label>
                {questionForm.options.map((option, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={questionForm.correct_answer === option && option !== "" ? "text-green-600" : "text-muted-foreground"}
                      onClick={() => {
                        if (option.trim() === "") {
                          toast.error("Please enter option text first");
                          return;
                        }
                        setQuestionForm({ ...questionForm, correct_answer: option });
                      }}
                    >
                      {questionForm.correct_answer === option && option !== "" ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <Circle className="h-5 w-5" />
                      )}
                    </Button>
                    <Input
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      className={questionForm.correct_answer === option && option !== "" ? "border-green-500 ring-1 ring-green-500" : ""}
                    />
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => {
                if (editingQuestionId) {
                  updateQuestionMutation.mutate({ ...questionForm, id: editingQuestionId });
                } else {
                  createQuestionMutation.mutate(questionForm);
                }
              }}>
                {editingQuestionId ? "Update Question" : "Save Question"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div>Loading questions...</div>
      ) : questions?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">No questions added yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {questions?.map((q, i) => (
            <Card key={q.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base font-medium">
                    {i + 1}. {q.question}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => {
                      if (confirm("Delete this question?")) deleteQuestionMutation.mutate(q.id);
                    }}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {(q.options as string[]).map((opt, idx) => (
                    <div 
                      key={idx} 
                      className={`p-2 rounded border text-sm ${
                        opt === q.correct_answer 
                          ? "bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300" 
                          : "bg-muted/50 border-transparent"
                      }`}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
