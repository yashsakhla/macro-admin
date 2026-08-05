// Colors for the demo request status enum: PENDING | CONTACTED | SCHEDULED | COMPLETED | CANCELLED
const COLORS = {
  PENDING: 'amber',
  CONTACTED: 'blue',
  SCHEDULED: 'blue',
  COMPLETED: 'green',
  CANCELLED: 'gray',
};

const LABELS = {
  PENDING: 'Pending',
  CONTACTED: 'Contacted',
  SCHEDULED: 'Scheduled',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export default function DemoRequestStatusBadge({ status }) {
  return <span className={`badge ${COLORS[status] || 'gray'}`}>{LABELS[status] || status}</span>;
}
