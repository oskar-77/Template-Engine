import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type TemplateInput } from "@shared/routes";

// GET /api/templates
export function useTemplates() {
  return useQuery({
    queryKey: [api.templates.list.path],
    queryFn: async () => {
      const res = await fetch(api.templates.list.path);
      if (!res.ok) throw new Error("Failed to fetch templates");
      return api.templates.list.responses[200].parse(await res.json());
    },
  });
}

// POST /api/templates
export function useCreateTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: TemplateInput) => {
      const res = await fetch(api.templates.create.path, {
        method: api.templates.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.templates.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create template");
      }
      return api.templates.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.templates.list.path] });
    },
  });
}

// DELETE /api/templates/:id
export function useDeleteTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.templates.delete.path, { id });
      const res = await fetch(url, {
        method: api.templates.delete.method,
      });
      if (!res.ok) {
        if (res.status === 404) throw new Error("Template not found");
        throw new Error("Failed to delete template");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.templates.list.path] });
    },
  });
}
