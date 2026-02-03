import type {
  Plant,
  NewPlant,
  PlantPart,
  NewPlantPart,
  QuizQuestion,
  NewQuizQuestion,
  QuizResult,
  NewQuizResult,
} from "@/lib/db/schema";

async function fetcher<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

// ── Plants ──────────────────────────────────────────────────────────────────

export const plantsApi = {
  list: (createdBy?: string) =>
    fetcher<(Plant & { parts: PlantPart[] })[]>(
      `/api/plants${createdBy ? `?createdBy=${createdBy}` : ""}`
    ),

  get: (id: string) =>
    fetcher<Plant & { parts: PlantPart[] }>(`/api/plants/${id}`),

  create: (data: Omit<NewPlant, "id" | "createdBy" | "createdAt" | "updatedAt">) =>
    fetcher<Plant>("/api/plants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<NewPlant>) =>
    fetcher<Plant>(`/api/plants/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetcher<Plant>(`/api/plants/${id}`, { method: "DELETE" }),
};

// ── Plant Parts ─────────────────────────────────────────────────────────────

export const plantPartsApi = {
  list: (plantId?: string) =>
    fetcher<PlantPart[]>(
      `/api/plant-parts${plantId ? `?plantId=${plantId}` : ""}`
    ),

  get: (id: string) => fetcher<PlantPart>(`/api/plant-parts/${id}`),

  create: (data: Omit<NewPlantPart, "id" | "createdAt">) =>
    fetcher<PlantPart>("/api/plant-parts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<NewPlantPart>) =>
    fetcher<PlantPart>(`/api/plant-parts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetcher<PlantPart>(`/api/plant-parts/${id}`, { method: "DELETE" }),
};

// ── Quiz Questions ──────────────────────────────────────────────────────────

export const quizQuestionsApi = {
  list: (params?: { plantId?: string; difficulty?: string }) => {
    const sp = new URLSearchParams();
    if (params?.plantId) sp.set("plantId", params.plantId);
    if (params?.difficulty) sp.set("difficulty", params.difficulty);
    const qs = sp.toString();
    return fetcher<QuizQuestion[]>(`/api/quiz-questions${qs ? `?${qs}` : ""}`);
  },

  get: (id: string) => fetcher<QuizQuestion>(`/api/quiz-questions/${id}`),

  create: (data: Omit<NewQuizQuestion, "id" | "createdAt">) =>
    fetcher<QuizQuestion>("/api/quiz-questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<NewQuizQuestion>) =>
    fetcher<QuizQuestion>(`/api/quiz-questions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetcher<QuizQuestion>(`/api/quiz-questions/${id}`, { method: "DELETE" }),
};

// ── Quiz Results ────────────────────────────────────────────────────────────

export const quizResultsApi = {
  list: (userId?: string) =>
    fetcher<QuizResult[]>(
      `/api/quiz-results${userId ? `?userId=${userId}` : ""}`
    ),

  get: (id: string) => fetcher<QuizResult>(`/api/quiz-results/${id}`),

  create: (data: Omit<NewQuizResult, "id" | "userId" | "createdAt">) =>
    fetcher<QuizResult>("/api/quiz-results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
};
