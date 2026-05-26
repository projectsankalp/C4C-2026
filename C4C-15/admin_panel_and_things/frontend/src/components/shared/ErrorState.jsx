import { AlertTriangle, RefreshCcw } from 'lucide-react';

export default function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-surface-1 border border-status-red/20 rounded-xl">
      <div className="w-12 h-12 rounded-full bg-status-red/10 flex items-center justify-center mb-4 border border-status-red/20">
        <AlertTriangle className="w-6 h-6 text-status-red" />
      </div>
      <h3 className="text-sm font-medium text-text-main">Connection Error</h3>
      <p className="text-xs text-text-muted mt-1 max-w-sm mb-4">
        {message || 'Unable to retrieve data from the operations server. Please check your offline sync status.'}
      </p>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-surface-2 hover:bg-border-primary border border-border-primary text-text-main text-xs font-medium rounded-md transition-colors"
        >
          <RefreshCcw className="w-3.5 h-3.5" />
          <span>Retry Connection</span>
        </button>
      )}
    </div>
  );
}
