// Colors for the message status enum: PENDING | SENT | DELIVERED | READ | FAILED
const COLORS = {
  PENDING: 'gray',
  SENT: 'blue',
  DELIVERED: 'amber',
  READ: 'green',
  FAILED: 'red',
};

export default function MessageStatusBadge({ status }) {
  return <span className={`badge ${COLORS[status] || 'gray'}`}>{status}</span>;
}
