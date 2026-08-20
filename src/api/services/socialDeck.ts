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
  /** Each connection has exactly one dedicated AI context — null until a briefing is saved. */
  contextId: string | null;
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
    instagramUserId?: string;
    instagramUsername?: string;
    linkedAt?: string;
  };
  lastUsedAt?: string;
  lastError?: string;
};

export type SocialPost = {
  id: string;
  title: string;
  content: string;
  images: string[];
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
  aiUsage: ['social-deck', 'ai-usage'] as const,
  aiContexts: ['social-deck', 'ai-contexts'] as const,
  autoRun: ['social-deck', 'auto-run'] as const,
  videoSeries: ['social-deck', 'video-series'] as const,
  videoGenerations: (connectionId: string) => ['social-deck', 'video-generations', connectionId] as const,
};

export type AiProvider = 'openai' | 'gemini';

export type AiConfig = {
  connected: boolean;
  provider?: AiProvider;
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
  images: string[];
  videoJob?: VideoGenerationJob | null;
};

export type AutoRunConfig = {
  contextId: string;
  contextName: string;
  connectionCount: number;
  enabled: boolean;
  intervalHours: number;
  topics: string[];
  promptHint: string;
  mediaType?: 'none' | 'image' | 'video';
  durationSeconds?: number;
  nextRunAt?: string | null;
  lastRunAt?: string | null;
  lastError?: string;
  lastStatus?: 'idle' | 'running' | 'success' | 'failed' | 'skipped' | 'video_pending';
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

export function useStartInstagramConnect() {
  return useMutation({
    mutationFn: () =>
      api<{ success: boolean; data: { url: string } }>('/social-deck/connections/instagram/start'),
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

export type AiUsage = {
  callsLastHour: number;
  callsLast24h: number;
  lastCallAt: string | null;
  lastError: {
    at: string;
    statusCode: number;
    rateLimited: boolean;
    message: string;
    provider: AiProvider;
    retryAfterSeconds: number;
    retryAt: string | null;
  } | null;
};

/**
 * Google/OpenAI don't expose a quota-remaining API to callers like us, so this is *our own*
 * call volume/error tracking — the closest thing to "usage" we can actually show.
 */
export function useAiUsage(enabled: boolean) {
  return useQuery({
    queryKey: keys.aiUsage,
    queryFn: () => api<{ success: boolean; data: { usage: AiUsage } }>('/social-deck/ai/usage'),
    enabled,
    refetchInterval: 30_000,
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

export function useSetConnectionContext() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, contextId }: { id: string; contextId: string | null }) =>
      api<{ success: boolean; data: { connection: Connection } }>(
        `/social-deck/connections/${id}/context`,
        { method: 'PUT', body: JSON.stringify({ contextId }) },
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
    mutationFn: (body: { apiKey: string; provider?: AiProvider; model?: string }) =>
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
    mutationFn: (body: {
      prompt: string;
      connectionIds: string[];
      mediaType?: 'none' | 'image' | 'video';
      durationSeconds?: number;
    }) =>
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
      images?: string[];
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
    // The cron that runs these ticks every 15 min server-side, independent of this page being
    // open — poll while the page is open so status/next-run stay current without a manual reload.
    refetchInterval: 60_000,
  });
}

export function useUpdateAutoRun() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      contextId,
      ...body
    }: Partial<AutoRunConfig> & { topicsText?: string; contextId: string }) =>
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

export function useRunAutoNow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (contextId: string) =>
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

export type VideoSeriesPart = {
  order: number;
  videoUrl: string;
  status: 'pending' | 'posted' | 'failed' | 'skipped';
  durationSeconds: number;
  externalId: string;
  externalUrl?: string;
  postedAt?: string;
  error: string;
};

export type VideoSeries = {
  id: string;
  connectionId: string;
  caption: string;
  sourceVideoUrl: string;
  parts: VideoSeriesPart[];
  intervalMinutes: number;
  segmentSeconds: number;
  status:
    | 'scheduled'
    | 'running'
    | 'paused'
    | 'completed'
    | 'cleaning_up'
    | 'cleaned_up'
    | 'failed';
  currentPartIndex: number;
  nextPostAt?: string | null;
  lastError: string;
  createdAt: string;
  /** True once removed from the active list — hidden from Video Reel Series, kept for Post History. */
  removed: boolean;
};

export function useVideoSeriesList() {
  return useQuery({
    queryKey: keys.videoSeries,
    queryFn: () =>
      api<{ success: boolean; data: { series: VideoSeries[] } }>('/social-deck/video-series'),
    refetchInterval: 60_000,
  });
}

export function useCreateVideoSeries() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      video: File;
      connectionId: string;
      caption: string;
      intervalMinutes: number;
      segmentSeconds: number;
    }) => {
      const form = new FormData();
      form.append('video', body.video);
      form.append('connectionId', body.connectionId);
      form.append('caption', body.caption);
      form.append('intervalMinutes', String(body.intervalMinutes));
      form.append('segmentSeconds', String(body.segmentSeconds));
      return api<{ success: boolean; data: { series: VideoSeries } }>('/social-deck/video-series', {
        method: 'POST',
        body: form,
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.videoSeries }),
  });
}

export function usePauseVideoSeries() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api<{ success: boolean; data: { series: VideoSeries } }>(
        `/social-deck/video-series/${id}/pause`,
        { method: 'POST', body: JSON.stringify({}) },
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.videoSeries }),
  });
}

export function useResumeVideoSeries() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api<{ success: boolean; data: { series: VideoSeries } }>(
        `/social-deck/video-series/${id}/resume`,
        { method: 'POST', body: JSON.stringify({}) },
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.videoSeries }),
  });
}

/** Change the Post gap on an existing series — e.g. after Instagram's own rate limiting hit. */
export function useUpdateVideoSeriesInterval() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, intervalMinutes }: { id: string; intervalMinutes: number }) =>
      api<{ success: boolean; data: { series: VideoSeries } }>(
        `/social-deck/video-series/${id}/interval`,
        { method: 'PUT', body: JSON.stringify({ intervalMinutes }) },
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.videoSeries }),
  });
}

/**
 * Removes the series from the active Video Reel Series list and deletes every video file this
 * app uploaded for it. The record itself is kept (not deleted) so already-posted parts still
 * show up in Post History. Does NOT delete anything from Instagram — Meta's API has no delete
 * endpoint for the "Instagram API with Instagram Login" connection type this app uses, only for
 * the Facebook-Login variant. Any already-posted Reels stay live on Instagram.
 */
export function useRemoveVideoSeries() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api<{ success: boolean; data: { removed: boolean; hadPostedParts: boolean } }>(
        `/social-deck/video-series/${id}`,
        { method: 'DELETE' },
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.videoSeries }),
  });
}

/** Cancel one not-yet-posted part before it publishes — e.g. it cut too short to be worth posting. */
export function useSkipVideoSeriesPart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, order }: { id: string; order: number }) =>
      api<{ success: boolean; data: { series: VideoSeries } }>(
        `/social-deck/video-series/${id}/parts/${order}/skip`,
        { method: 'POST', body: JSON.stringify({}) },
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.videoSeries }),
  });
}

/**
 * Retry a failed or skipped part — resets it to pending and immediately attempts to publish it,
 * same "try now, show the result" behavior as publish-now. A skipped part can only be retried if
 * it was skipped after retry support shipped — older skips already deleted the video file.
 */
export function useRetryVideoSeriesPart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, order }: { id: string; order: number }) =>
      api<{ success: boolean; data: { series: VideoSeries } }>(
        `/social-deck/video-series/${id}/parts/${order}/retry`,
        { method: 'POST', body: JSON.stringify({}) },
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.videoSeries }),
  });
}

/**
 * Manually publish the next pending part right now instead of waiting for the scheduled Post
 * gap. If you never use this, the normal schedule still posts it automatically.
 */
export function usePublishVideoSeriesPartNow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api<{ success: boolean; data: { series: VideoSeries } }>(
        `/social-deck/video-series/${id}/publish-now`,
        { method: 'POST', body: JSON.stringify({}) },
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.videoSeries }),
  });
}

// --- AI video generation (Gemini/Veo -> Instagram Reels) ---

export type VideoGenerationJob = {
  id: string;
  connectionId: string;
  prompt: string;
  caption: string;
  status: 'generating' | 'ready' | 'publishing' | 'published' | 'failed';
  videoUrl: string;
  externalUrl: string;
  error: string;
  createdAt: string;
  updatedAt: string;
};

/** Polls while any job is still generating/publishing — stops once everything's settled. */
export function useVideoGenerations(connectionId: string | undefined) {
  return useQuery({
    queryKey: keys.videoGenerations(connectionId ?? ''),
    queryFn: () =>
      api<{ success: boolean; data: { jobs: VideoGenerationJob[] } }>(
        `/social-deck/video-generations?connectionId=${connectionId}`,
      ),
    enabled: !!connectionId,
    refetchInterval: (query) => {
      const jobs = query.state.data?.data.jobs ?? [];
      const inFlight = jobs.some((j) => j.status === 'generating' || j.status === 'publishing');
      return inFlight ? 5000 : false;
    },
  });
}

export function usePublishVideoGeneration(connectionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (jobId: string) =>
      api<{ success: boolean; data: { job: VideoGenerationJob } }>(
        `/social-deck/video-generations/${jobId}/publish`,
        { method: 'POST', body: JSON.stringify({}) },
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.videoGenerations(connectionId) }),
  });
}
