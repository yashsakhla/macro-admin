import { Loader2, AlertTriangle, Inbox } from 'lucide-react';
import '../connect.css';

// Wraps a list/detail view body with consistent loading/error/empty states —
// real API calls can fail or be slow, unlike the old instant mock data.
export default function AsyncState({
  loading,
  loadingLabel = 'Loading…',
  error,
  empty,
  emptyIcon: EmptyIcon = Inbox,
  emptyTitle = 'Nothing here yet',
  emptyMessage = '',
  emptyAction,
  onRetry,
  children,
}) {
  if (loading) {
    return (
      <div className="empty-state">
        <Loader2 size={22} className="connect-spin" style={{ marginBottom: 10, opacity: 0.6 }} />
        <h4>{loadingLabel}</h4>
      </div>
    );
  }

  if (error) {
    return (
      <div className="empty-state">
        <AlertTriangle size={22} style={{ marginBottom: 10, opacity: 0.6, color: 'var(--danger)' }} />
        <h4>Something went wrong</h4>
        <p>{error.message || 'Please try again.'}</p>
        {onRetry && (
          <button className="btn-secondary" style={{ marginTop: 14 }} onClick={onRetry}>
            Retry
          </button>
        )}
      </div>
    );
  }

  if (empty) {
    return (
      <div className="empty-state">
        <EmptyIcon size={22} style={{ marginBottom: 10, opacity: 0.5 }} />
        <h4>{emptyTitle}</h4>
        {emptyMessage && <p>{emptyMessage}</p>}
        {emptyAction}
      </div>
    );
  }

  return children;
}
