import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { plantsApi } from "@/lib/api-client";
import type { NewPlant } from "@/lib/db/schema";

export function usePlants(createdBy?: string) {
  return useQuery({
    queryKey: ["plants", { createdBy }],
    queryFn: () => plantsApi.list(createdBy),
  });
}

export function usePlant(id: string) {
  return useQuery({
    queryKey: ["plants", id],
    queryFn: () => plantsApi.get(id),
    enabled: !!id,
  });
}

export function useCreatePlant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: plantsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["plants"] });
    },
  });
}

export function useUpdatePlant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<NewPlant> }) =>
      plantsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["plants"] });
    },
  });
}

export function useDeletePlant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: plantsApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["plants"] });
    },
  });
}
