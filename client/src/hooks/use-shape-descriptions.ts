import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface ShapeDescription {
  id: number;
  shapeId: string;
  title: string;
  description: string;
  updatedAt: string;
}

export function useShapeDescriptions() {
  return useQuery({
    queryKey: ["shapeDescriptions"],
    queryFn: async () => {
      const res = await fetch("/api/shapes/descriptions");
      return res.json() as Promise<ShapeDescription[]>;
    },
  });
}

export function useShapeDescription(shapeId: string) {
  return useQuery({
    queryKey: ["shapeDescription", shapeId],
    queryFn: async () => {
      const res = await fetch(`/api/shapes/descriptions/${shapeId}`);
      if (!res.ok) return null;
      return res.json() as Promise<ShapeDescription>;
    },
  });
}

export function useUpdateShapeDescription() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ shapeId, title, description }: { shapeId: string; title: string; description: string }) => {
      const res = await fetch(`/api/shapes/descriptions/${shapeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
      if (!res.ok) throw new Error("Failed to update description");
      return res.json() as Promise<ShapeDescription>;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["shapeDescription", variables.shapeId] });
      queryClient.invalidateQueries({ queryKey: ["shapeDescriptions"] });
    },
  });
}
