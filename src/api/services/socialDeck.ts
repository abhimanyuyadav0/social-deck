import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';

export type Platform = {
  id: string;
  name: string;
  description: string;
  status: 'available' | 'coming_soon';
  icon: string;
};

export type Connection = {
  id: string;
  type: string;
  name: string;
  status: string;
  contextIds: string[];
  config: {
    defaultCategory?: string;
    defaultTags?: string[];
    ttfEmail?: string;
    ttfAuthorName?: string;
    communityKeyPrefix?: string;
    linkedinProfileName?: string;
    linkedinEmail?: string;
    linkedinPersonUrn?: string;
    youtubeChannelId?: string;
    youtubeChannelTitle?: string;
    linkedAt?: string;
  };
  lastUsedAt?: string;
  lastError?: string;
};

export type SocialPost = {
  id: string;
  title: string;
  content: string;
  image?: string;
  category: string;
  tags: string[];
  status: string;
  publishedAt?: string;
  targetConnectionIds?: string[];
  results: Array<{
    connectionId?: string;
    connectionType?: string;
    connectionName: string;
    status: string;
    externalUrl?: string;
    error?: string;
  }>;
  createdAt: string;
};

const keys = {
  platforms: ['social-deck', 'platforms'] as const,
  connections: ['social-deck', 'connections'] as const,
  posts: ['social-deck', 'posts'] as const,
  ai: ['social-deck', 'ai'] as const,
  aiContexts: ['social-deck', 'ai-contexts'] as const,
  autoRun: ['social-deck', 'auto-run'] as const,
};

export type AiConfig = {
  connected: boolean;
  provider?: string;
  model?: string;
  keyPrefix?: string;
  connectedAt?: string;
  lastUsedAt?: string;
};

export type AiContext = {
  id: string;
  name: string;
  aboutYou: string;
  goals: string;
  references: string;
  voice: string;
  audience: string;
  imageStyle?: string;
  hasContext?: boolean;
  connectionCount?: number;
  updatedAt?: string;
};

export type GeneratedPost = {
  title: string;
  content: string;
  category: string;
  tags: string[];
  image?: string;
};

export type AutoRunConfig = {
  contextId: string;
  contextName: string;
  connectionCount: number;
  enabled: boolean;
  intervalHours: number;
  topics: string[];
  promptHint: string;
  generateImage?: boolean;
  nextRunAt?: string | null;
  lastRunAt?: string | null;
  lastError?: string;
  lastStatus?: 'idle' | 'running' | 'success' | 'failed' | 'skipped';
  runCount?: number;
  lastPostId?: string | null;
};

export function usePlatforms() {
  return useQuery({
    queryKey: keys.platforms,
    queryFn: () =>
      api<{ success: boolean; data: { platforms: Platform[] } }>('/social-deck/platforms'),
  });
}

export function useConnections() {
  return useQuery({
    queryKey: keys.connections,
    queryFn: () =>
      api<{ success: boolean; data: { connections: Connection[] } }>('/social-deck/connections'),
  });
}

export function usePosts() {
  return useQuery({
    queryKey: keys.posts,
    queryFn: () =>
      api<{ success: boolean; data: { posts: SocialPost[] } }>('/social-deck/posts'),
  });
}

export function useConnectCommunity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { developerKey: string; name?: string }) =>
      api('/social-deck/connections/community', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.connections }),
  });
}

export function useStartLinkedInConnect() {
  return useMutation({
    mutationFn: () =>
      api<{ success: boolean; data: { url: string } }>('/social-deck/connections/linkedin/start'),
  });
}

export function useStartYouTubeConnect() {
  return useMutation({
    mutationFn: () =>
      api<{ success: boolean; data: { url: string } }>('/social-deck/connections/youtube/start'),
  });
}

export function useDisconnectConnection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api(`/social-deck/connections/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.connections }),
  });
}

export function useAiConfig() {
  return useQuery({
    queryKey: keys.ai,
    queryFn: () => api<{ success: boolean; data: { ai: AiConfig } }>('/social-deck/ai'),
  });
}

export function useAiContexts() {
  return useQuery({
    queryKey: keys.aiContexts,
    queryFn: () =>
      api<{ success: boolean; data: { contexts: AiContext[] } }>('/social-deck/ai/contexts'),
  });
}

export function useCreateAiContext() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<AiContext> & { name: string }) =>
      api<{ success: boolean; data: { context: AiContext } }>('/social-deck/ai/contexts', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.aiContexts });
      qc.invalidateQueries({ queryKey: keys.autoRun });
    },
  });
}

export function useUpdateAiContext() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: Partial<AiContext> & { id: string }) =>
      api<{ success: boolean; data: { context: AiContext } }>(`/social-deck/ai/contexts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.aiContexts });
      qc.invalidateQueries({ queryKey: keys.autoRun });
    },
  });
}

export function useDeleteAiContext() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api<{ success: boolean; data: { unassignedConnections: number } }>(
        `/social-deck/ai/contexts/${id}`,
        { method: 'DELETE' },
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.aiContexts });
      qc.invalidateQueries({ queryKey: keys.connections });
      qc.invalidateQueries({ queryKey: keys.autoRun });
    },
  });
}

export function useSetConnectionContexts() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, contextIds }: { id: string; contextIds: string[] }) =>
      api<{ success: boolean; data: { connection: Connection } }>(
        `/social-deck/connections/${id}/contexts`,
        { method: 'PUT', body: JSON.stringify({ contextIds }) },
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.connections });
      qc.invalidateQueries({ queryKey: keys.aiContexts });
      qc.invalidateQueries({ queryKey: keys.autoRun });
    },
  });
}

export function useConnectAi() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { apiKey: string; model?: string }) =>
      api('/social-deck/ai/connect', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.ai }),
  });
}

export function useDisconnectAi() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api('/social-deck/ai', { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.ai }),
  });
}

export function useGenerateWithAi() {
  return useMutation({
    mutationFn: (body: { prompt: string; connectionIds: string[]; generateImage?: boolean }) =>
      api<{ success: boolean; data: { post: GeneratedPost } }>('/social-deck/ai/generate', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
  });
}

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      title: string;
      content: string;
      image?: string;
      category?: string;
      tags?: string[];
      connectionIds: string[];
      publish?: boolean;
    }) =>
      api('/social-deck/posts', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.posts }),
  });
}

export function usePublishPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, connectionIds }: { id: string; connectionIds?: string[] }) =>
      api(`/social-deck/posts/${id}/publish`, {
        method: 'POST',
        body: JSON.stringify({ connectionIds }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.posts }),
  });
}

export function useAutoRun() {
  return useQuery({
    queryKey: keys.autoRun,
    queryFn: () =>
      api<{
        success: boolean;
        data: { autoRuns: AutoRunConfig[]; intervalOptions: number[] };
      }>('/social-deck/auto-run'),
  });
}

export function useUpdateAutoRun(contextId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<AutoRunConfig> & { topicsText?: string }) =>
      api<{ success: boolean; data: { auto: AutoRunConfig } }>(
        `/social-deck/auto-run/${contextId}`,
        { method: 'PUT', body: JSON.stringify(body) },
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.autoRun });
      qc.invalidateQueries({ queryKey: keys.posts });
    },
  });
}

export function useRunAutoNow(contextId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      api<{ success: boolean; data: Record<string, unknown> }>(
        `/social-deck/auto-run/${contextId}/run-now`,
        { method: 'POST', body: JSON.stringify({}) },
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.autoRun });
      qc.invalidateQueries({ queryKey: keys.posts });
    },
  });
}
