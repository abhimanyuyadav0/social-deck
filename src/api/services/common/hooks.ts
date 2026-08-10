import { useQuery } from '@tanstack/react-query';
import { getCommonApps } from './service';

export const COMMON_APPS_QUERY_KEY = ['common', 'apps'] as const;

export function useCommonApps() {
  return useQuery({
    queryKey: COMMON_APPS_QUERY_KEY,
    queryFn: getCommonApps,
    staleTime: 5 * 60 * 1000,
  });
}
