import { useConnections } from '@/api/services/socialDeck';
import ConnectPanel, { type PlatformType } from '@/components/platform/ConnectPanel';
import ConnectedPlatformPanel from '@/components/platform/ConnectedPlatformPanel';

/** Route-level platform type -> the actual `Connection.type` value stored on the backend. */
const CONNECTION_TYPE: Record<PlatformType, string> = {
  linkedin: 'linkedin',
  instagram: 'instagram',
  youtube: 'youtube',
  community: 'ttf_community',
  facebook: 'facebook',
};

/** Single-account platform page (LinkedIn/YouTube/Community). Instagram and Facebook use their
 * own multi-account list + detail pages instead (InstagramAccountsPage/InstagramDetailPage,
 * FacebookPagesPage/FacebookDetailPage) since a user can manage several accounts/Pages. */
export default function PlatformPage({ type }: { type: PlatformType }) {
  const { data, isLoading } = useConnections();

  const connection = (data?.data?.connections ?? []).find((c) => c.type === CONNECTION_TYPE[type]);
  const connected = connection?.status === 'connected';

  if (isLoading) {
    return <p className="text-sm text-gray-400">Loading…</p>;
  }

  if (!connected || !connection) {
    return <ConnectPanel type={type} />;
  }

  return <ConnectedPlatformPanel key={connection.id} connection={connection} type={type} />;
}
