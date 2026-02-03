import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { plantPartsApi } from "@/lib/api-client";
import type { NewPlantPart } from "@/lib/db/schema";

export function usePlantParts(plantId?: string) {
  return useQuery({
    queryKey: ["plant-parts", { plantId }],
    queryFn: () => plantPartsApi.list(plantId),
  });
}

export function usePlantPart(id: string) {
  return useQuery({
    queryKey: ["plant-parts", id],
    queryFn: () => plantPartsApi.get(id),
    enabled: !!id,
  });
}

export function useCreatePlantPart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: plantPartsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["plant-parts"] });
      qc.invalidateQueries({ queryKey: ["plants"] });
    },
  });
}

export function useUpdatePlantPart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<NewPlantPart> }) =>
      plantPartsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["plant-parts"] });
      qc.invalidateQueries({ queryKey: ["plants"] });
    },
  });
}

export function useDeletePlantPart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: plantPartsApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["plant-parts"] });
      qc.invalidateQueries({ queryKey: ["plants"] });
    },
  });
}
