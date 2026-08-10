import { api } from '@/api/client';

export interface CommonApp {
  id: string;
  name: string;
  path: string;
  description: string;
  color: string;
  external: boolean;
  icon: string;
  order: number;
}

interface CommonAppsResponse {
  success?: boolean;
  data?: { apps: CommonApp[] };
}

export async function getCommonApps(): Promise<CommonApp[]> {
  const res = await api<CommonAppsResponse>('common/apps');
  const apps = res?.data?.apps ?? (res as { apps?: CommonApp[] })?.apps;
  if (!Array.isArray(apps)) {
    throw new Error('Invalid common apps response');
  }
  return apps;
}
