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
  config: {
    defaultCategory?: string;
    defaultTags?: string[];
    ttfEmail?: string;
    ttfAuthorName?: string;
    communityKeyPrefix?: string;
    linkedinProfileName?: string;
    linkedinEmail?: string;
    linkedinPersonUrn?: string;
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

export type AiProfile = {
  aboutYou: string;
  goals: string;
  references: string;
  voice: string;
  audience: string;
  hasContext?: boolean;
  updatedAt?: string;
};

export type GeneratedPost = {
  title: string;
  content: string;
  category: string;
  tags: string[];
};

export type AutoRunConfig = {
  enabled: boolean;
  intervalHours: number;
  connectionIds: string[];
  topics: string[];
  promptHint: string;
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
    queryFn: () =>
      api<{ success: boolean; data: { ai: AiConfig; profile: AiProfile } }>('/social-deck/ai'),
  });
}

export function useSaveAiProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<AiProfile>) =>
      api<{ success: boolean; data: { profile: AiProfile } }>('/social-deck/ai/profile', {
        method: 'PUT',
        body: JSON.stringify(body),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.ai }),
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
    mutationFn: (body: { prompt: string; connectionIds: string[] }) =>
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
        data: { auto: AutoRunConfig; intervalOptions: number[] };
      }>('/social-deck/auto-run'),
  });
}

export function useUpdateAutoRun() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<AutoRunConfig> & { topicsText?: string }) =>
      api<{ success: boolean; data: { auto: AutoRunConfig } }>('/social-deck/auto-run', {
        method: 'PUT',
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.autoRun });
      qc.invalidateQueries({ queryKey: keys.posts });
    },
  });
}

export function useRunAutoNow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      api<{ success: boolean; data: Record<string, unknown> }>('/social-deck/auto-run/run-now', {
        method: 'POST',
        body: JSON.stringify({}),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.autoRun });
      qc.invalidateQueries({ queryKey: keys.posts });
    },
  });
}
