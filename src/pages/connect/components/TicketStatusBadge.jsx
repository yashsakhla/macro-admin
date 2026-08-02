// Colors for the ticket status enum: open | pending | resolved | closed
const COLORS = {
  open: 'blue',
  pending: 'amber',
  resolved: 'green',
  closed: 'gray',
};

export default function TicketStatusBadge({ status }) {
  return <span className={`badge ${COLORS[status] || 'gray'}`}>{status}</span>;
}
