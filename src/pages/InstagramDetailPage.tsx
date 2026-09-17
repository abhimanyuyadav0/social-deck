import { Link, useParams } from 'react-router-dom';
import { useConnections } from '@/api/services/socialDeck';
import ConnectedPlatformPanel from '@/components/platform/ConnectedPlatformPanel';

export default function InstagramDetailPage() {
  const { connectionId = '' } = useParams();
  const { data, isLoading } = useConnections();

  const connection = (data?.data?.connections ?? []).find(
    (c) => c.id === connectionId && c.type === 'instagram',
  );

  if (isLoading) {
    return <p className="text-sm text-[var(--sd-subtle)]">Loading…</p>;
  }

  if (!connection || connection.status !== 'connected') {
    return (
      <div className="max-w-6xl space-y-4">
        <p className="text-sm text-[var(--sd-subtle)]">
          This Instagram account isn&apos;t connected anymore. Go back to{' '}
          <Link to="/instagram" className="text-purple-600 hover:underline">
            Instagram accounts
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <ConnectedPlatformPanel
      key={connection.id}
      connection={connection}
      type="instagram"
      backTo={{ to: '/instagram', label: 'All Instagram accounts' }}
    />
  );
}
