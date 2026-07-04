import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface KnowledgeEntry {
  id: string;
  category: string;
  label: string;
  value: string;
  sortOrder: number;
}

interface KnowledgeFile {
  id: string;
  name: string;
  filename: string;
  filepath: string;
  fileType: string;
  mimeType: string;
  sizeBytes: number;
}

interface KnowledgeData {
  entries: KnowledgeEntry[];
  files: KnowledgeFile[];
}

export function useKnowledge() {
  return useQuery<KnowledgeData>({
    queryKey: ["knowledge"],
    queryFn: async () => {
      const res = await fetch("/api/knowledge");
      if (!res.ok) throw new Error("Failed to fetch knowledge base");
      return res.json();
    },
  });
}

export function useCreateKnowledgeEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<KnowledgeEntry, "id">) => {
      const res = await fetch("/api/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create knowledge entry");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge"] });
    },
  });
}

export function useBulkUpdateKnowledge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entries: Partial<KnowledgeEntry>[]) => {
      const res = await fetch("/api/knowledge", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries }),
      });
      if (!res.ok) throw new Error("Failed to update knowledge base");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge"] });
    },
  });
}

export function useDeleteKnowledgeEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/knowledge?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete knowledge entry");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge"] });
    },
  });
}
