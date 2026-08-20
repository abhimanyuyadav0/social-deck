import { Link, useParams } from 'react-router-dom';
import { useConnections } from '@/api/services/socialDeck';
import ConnectedPlatformPanel from '@/components/platform/ConnectedPlatformPanel';

export default function FacebookDetailPage() {
  const { connectionId = '' } = useParams();
  const { data, isLoading } = useConnections();

  const connection = (data?.data?.connections ?? []).find(
    (c) => c.id === connectionId && c.type === 'facebook',
  );

  if (isLoading) {
    return <p className="text-sm text-gray-400">Loading…</p>;
  }

  if (!connection || connection.status !== 'connected') {
    return (
      <div className="max-w-6xl space-y-4">
        <p className="text-sm text-gray-400">
          This Facebook Page isn&apos;t connected anymore. Go back to{' '}
          <Link to="/facebook" className="text-purple-600 hover:underline">
            Facebook Pages
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
      type="facebook"
      backTo={{ to: '/facebook', label: 'All Facebook Pages' }}
    />
  );
}
