import { useOffline } from '../../hooks/useOffline';

export default function OfflineBanner() {
  const isOffline = useOffline();
  if (!isOffline) return null;
  return (
    <div className="bg-yellow-500 text-white text-center text-sm py-2 px-4 font-medium">
      ⚠️ You are offline — data will sync when connection returns
    </div>
  );
}
