import type { AiProvider } from '@/api/services/socialDeck';

export type ProviderInfo = {
  label: string;
  blurb: string;
  keyPlaceholder: string;
  helpUrl: string;
  helpLabel: string;
  usageUrl: string;
  usageLabel: string;
  looksValid: (key: string) => boolean;
  iconBg: string;
  iconColor: string;
};

export const AI_PROVIDER_ORDER: AiProvider[] = ['openai', 'gemini', 'claude'];

export const AI_PROVIDER_INFO: Record<AiProvider, ProviderInfo> = {
  openai: {
    label: 'OpenAI',
    blurb: 'GPT text drafts plus DALL·E / gpt-image-1 image generation.',
    keyPlaceholder: 'sk-...',
    helpUrl: 'https://platform.openai.com/api-keys',
    helpLabel: 'platform.openai.com',
    usageUrl: 'https://platform.openai.com/usage',
    usageLabel: "OpenAI's usage dashboard",
    looksValid: (key) => key.trim().startsWith('sk-'),
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-700',
  },
  gemini: {
    label: 'Gemini',
    blurb: 'Text, image (Nano Banana), and video (Veo) — the only provider that can generate video.',
    keyPlaceholder: 'AIza...',
    helpUrl: 'https://aistudio.google.com/app/api-keys',
    helpLabel: 'aistudio.google.com',
    usageUrl: 'https://ai.dev/rate-limit',
    usageLabel: "Google's rate-limit dashboard",
    looksValid: (key) => key.trim().length > 10,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-700',
  },
  claude: {
    label: 'Claude',
    blurb: 'Anthropic text drafts. Claude doesn’t generate images or video.',
    keyPlaceholder: 'sk-ant-...',
    helpUrl: 'https://console.anthropic.com/settings/keys',
    helpLabel: 'console.anthropic.com',
    usageUrl: 'https://console.anthropic.com/settings/usage',
    usageLabel: "Anthropic's usage dashboard",
    looksValid: (key) => key.trim().startsWith('sk-ant-'),
    iconBg: 'bg-orange-50',
    iconColor: 'text-orange-700',
  },
};
