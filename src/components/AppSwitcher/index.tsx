import { AppSwitcher as SuiteAppSwitcher } from 'glintly-ui';
import { useCommonApps } from '@/api/services/common';

const CURRENT_APP_ID = 'social-deck';

export function AppSwitcher() {
  const { data, isLoading, isError } = useCommonApps();
  return (
    <SuiteAppSwitcher
      currentAppId={CURRENT_APP_ID}
      apps={data}
      isLoading={isLoading}
      isError={isError}
    />
  );
}
