import { useSync } from '../../hooks/useSync';
import { useOffline } from '../../hooks/useOffline';
import { formatDateTime } from '../../utils/formatDate';

export default function SyncStatus() {
  const { syncing, lastSync, syncNow } = useSync();
  const isOffline = useOffline();

  return (
    <div className="flex items-center gap-2 text-xs text-gray-500">
      <span className={`w-2 h-2 rounded-full ${isOffline ? 'bg-yellow-400' : 'bg-green-400'}`} />
      {isOffline ? 'Offline' : lastSync ? `Synced ${formatDateTime(lastSync)}` : 'Online'}
      {!isOffline && (
        <button onClick={syncNow} disabled={syncing} className="text-green-600 underline">
          {syncing ? 'Syncing...' : 'Sync'}
        </button>
      )}
    </div>
  );
}
