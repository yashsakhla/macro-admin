import { useMemo } from 'react';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { ArrowLeft, LifeBuoy, MessageSquare, Clock4, UserCheck } from 'lucide-react';
import { getProductData } from '../data/mockData';
import { StatusBadge } from './Dashboard';

export default function QueryDetail() {
  const { product } = useOutletContext();
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const { tickets } = getProductData(product.id);
  const ticket = tickets.find((t) => t.id === ticketId);

  const thread = useMemo(
    () => [
      {
        from: 'Customer',
        message: 'I am seeing an error while trying to renew my plan.',
        time: ticket?.updated || 'Today',
      },
      {
        from: 'Support',
        message: 'We are checking the payment gateway response and will update you shortly.',
        time: '2026-07-19 10:45 AM',
      },
    ],
    [ticket]
  );

  if (!ticket) {
    return (
      <div className="card">
        <button className="btn-secondary" onClick={() => navigate(-1)}>
          <ArrowLeft size={14} /> Back
        </button>
        <h3 style={{ marginTop: 18 }}>Query not found</h3>
        <p>The selected support query does not exist for this product.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-toolbar" style={{ justifyContent: 'space-between' }}>
        <button className="btn-secondary" onClick={() => navigate(-1)}>
          <ArrowLeft size={14} /> Back to queries
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <StatusBadge status={ticket.status} />
          <span className="badge blue">{ticket.priority}</span>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 22 }}>
        <div className="card-title">{ticket.subject}</div>
        <div className="card-subtitle">Ticket ID {ticket.id} · Customer {ticket.customer}</div>
        <div className="detail-row" style={{ marginTop: 14, gap: 18 }}>
          <div>
            <div className="cell-primary">Last updated</div>
            <div className="cell-sub">{ticket.updated}</div>
          </div>
          <div>
            <div className="cell-primary">Priority</div>
            <div className="cell-sub">{ticket.priority}</div>
          </div>
        </div>
      </div>

      <div className="section-row" style={{ marginBottom: 22 }}>
        <div className="card">
          <span className="card-title">Conversation thread</span>
          {thread.map((item, index) => (
            <div key={index} className="message-row">
              <div className="message-meta">
                <span>{item.from}</span>
                <span>{item.time}</span>
              </div>
              <p>{item.message}</p>
            </div>
          ))}
        </div>

        <div className="card">
          <span className="card-title">Action summary</span>
          <div className="detail-row" style={{ gap: 14 }}>
            <div>
              <div className="cell-primary">Assigned team</div>
              <div className="cell-sub">Payments support</div>
            </div>
            <div>
              <div className="cell-primary">Resolution ETA</div>
              <div className="cell-sub">2 business hours</div>
            </div>
          </div>
          <div className="form-field" style={{ marginTop: 18 }}>
            <label>Next update</label>
            <textarea readOnly value="Review gateway logs and confirm the renewal status with Razorpay." />
          </div>
        </div>
      </div>
    </div>
  );
}
