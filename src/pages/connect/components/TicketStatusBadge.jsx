// Colors for the ticket status enum: OPEN | IN_PROGRESS | RESOLVED | CLOSED
const COLORS = {
  OPEN: 'blue',
  IN_PROGRESS: 'amber',
  RESOLVED: 'green',
  CLOSED: 'gray',
};

const LABELS = {
  OPEN: 'Open',
  IN_PROGRESS: 'In progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
};

export default function TicketStatusBadge({ status }) {
  return <span className={`badge ${COLORS[status] || 'gray'}`}>{LABELS[status] || status}</span>;
}
