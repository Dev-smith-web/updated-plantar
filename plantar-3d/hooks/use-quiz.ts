import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { quizQuestionsApi, quizResultsApi } from "@/lib/api-client";
import type { NewQuizQuestion } from "@/lib/db/schema";

// ── Quiz Questions ──────────────────────────────────────────────────────────

export function useQuizQuestions(params?: {
  plantId?: string;
  difficulty?: string;
}) {
  return useQuery({
    queryKey: ["quiz-questions", params],
    queryFn: () => quizQuestionsApi.list(params),
  });
}

export function useQuizQuestion(id: string) {
  return useQuery({
    queryKey: ["quiz-questions", id],
    queryFn: () => quizQuestionsApi.get(id),
    enabled: !!id,
  });
}

export function useCreateQuizQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: quizQuestionsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["quiz-questions"] });
    },
  });
}

export function useUpdateQuizQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<NewQuizQuestion>;
    }) => quizQuestionsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["quiz-questions"] });
    },
  });
}

export function useDeleteQuizQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: quizQuestionsApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["quiz-questions"] });
    },
  });
}

// ── Quiz Results ────────────────────────────────────────────────────────────

export function useQuizResults(userId?: string) {
  return useQuery({
    queryKey: ["quiz-results", { userId }],
    queryFn: () => quizResultsApi.list(userId),
  });
}

export function useQuizResult(id: string) {
  return useQuery({
    queryKey: ["quiz-results", id],
    queryFn: () => quizResultsApi.get(id),
    enabled: !!id,
  });
}

export function useSubmitQuizResult() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: quizResultsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["quiz-results"] });
    },
  });
}
