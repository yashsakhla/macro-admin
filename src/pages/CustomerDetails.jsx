import { useMemo, useState } from 'react';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Tag,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { getProductData } from '../data/mockData';
import { StatusBadge } from './Dashboard';

export default function CustomerDetails() {
  const { product } = useOutletContext();
  const { customerId } = useParams();
  const navigate = useNavigate();
  const { customers } = getProductData(product.id);
  const customer = customers.find((c) => c.id === customerId);
  const [tags, setTags] = useState(customer?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [range, setRange] = useState({
    from: customer?.firstPurchase || '',
    to: customer?.lastRenewal || '',
  });

  const messageSummary = useMemo(
    () => [
      { label: 'Today', value: customer?.messages.day ?? 0 },
      { label: 'This week', value: customer?.messages.week ?? 0 },
      { label: 'This month', value: customer?.messages.month ?? 0 },
    ],
    [customer]
  );

  if (!customer) {
    return (
      <div className="card">
        <button className="btn-secondary" onClick={() => navigate(-1)}>
          <ArrowLeft size={14} /> Back
        </button>
        <h3 style={{ marginTop: 18 }}>Customer not found</h3>
        <p>The selected customer does not exist for this product.</p>
      </div>
    );
  }

  const addTag = () => {
    const trimmed = newTag.trim();
    if (!trimmed || tags.includes(trimmed)) return;
    setTags((prev) => [...prev, trimmed]);
    setNewTag('');
  };

  const removeTag = (tag) => setTags((prev) => prev.filter((item) => item !== tag));

  const transactionRows = customer.transactions.slice().sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <div>
      <div className="page-toolbar" style={{ justifyContent: 'space-between' }}>
        <button className="btn-secondary" onClick={() => navigate(-1)}>
          <ArrowLeft size={14} /> Back to customers
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="badge blue">{customer.status}</span>
          <span className="badge gray">{customer.plan}</span>
        </div>
      </div>

      <div className="section-row" style={{ marginBottom: 20 }}>
        <div className="card">
          <span className="card-title">Customer profile</span>
          <span className="card-subtitle">Details for {customer.name}</span>
          <div style={{ display: 'grid', gap: 12 }}>
            <div className="detail-row">
              <div>
                <div className="cell-primary">Company</div>
                <div className="cell-sub">{customer.company}</div>
              </div>
              <div>
                <div className="cell-primary">Email</div>
                <div className="cell-sub">{customer.email}</div>
              </div>
            </div>
            <div className="detail-row">
              <div>
                <div className="cell-primary">Joined on</div>
                <div className="cell-sub">{customer.joined}</div>
              </div>
              <div>
                <div className="cell-primary">Total spend</div>
                <div className="cell-sub">₹{customer.spend.toLocaleString('en-IN')}</div>
              </div>
            </div>
            <div className="detail-row">
              <div>
                <div className="cell-primary">First purchase</div>
                <div className="cell-sub">{customer.firstPurchase}</div>
              </div>
              <div>
                <div className="cell-primary">Last renewal</div>
                <div className="cell-sub">{customer.lastRenewal}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <span className="card-title">Tag categories</span>
          <span className="card-subtitle">Use tags to group and push notifications later</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
            {tags.map((tag) => (
              <button key={tag} className="tag-chip" type="button" onClick={() => removeTag(tag)}>
                <Tag size={12} /> {tag}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <input
              className="form-field"
              placeholder="Add new tag"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              style={{ flex: 1, maxWidth: 240 }}
            />
            <button className="btn-primary" type="button" onClick={addTag}>
              Add tag
            </button>
          </div>
          <p style={{ marginTop: 12, color: '#525f7f', fontSize: 13 }}>
            Click a tag to remove it from this customer.
          </p>
        </div>
      </div>

      <div className="stat-grid" style={{ marginBottom: 22 }}>
        <div className="stat-card">
          <div className="stat-icon"><Sparkles /></div>
          <div className="stat-value">{customer.campaigns}</div>
          <div className="stat-label">Campaigns run</div>
        </div>
        {messageSummary.map((item) => (
          <div className="stat-card" key={item.label}>
            <div className="stat-icon"><MessageSquare /></div>
            <div className="stat-value">{item.value}</div>
            <div className="stat-label">Messages {item.label.toLowerCase()}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginBottom: 22 }}>
        <div className="card-title">Active billing window</div>
        <div className="card-subtitle">Select a custom date range for reporting</div>
        <div className="detail-row" style={{ gap: 16, flexWrap: 'wrap' }}>
          <div className="form-field" style={{ flex: 1, minWidth: 180 }}>
            <label>From</label>
            <input
              type="date"
              value={range.from}
              onChange={(e) => setRange((prev) => ({ ...prev, from: e.target.value }))}
            />
          </div>
          <div className="form-field" style={{ flex: 1, minWidth: 180 }}>
            <label>To</label>
            <input
              type="date"
              value={range.to}
              onChange={(e) => setRange((prev) => ({ ...prev, to: e.target.value }))}
            />
          </div>
        </div>
        <div style={{ marginTop: 14, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <span className="badge gray">Report window: {range.from || 'start'} → {range.to || 'end'}</span>
          <span className="badge blue">Plan: {customer.plan}</span>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Transactions log</div>
        <div className="card-subtitle">Plan purchases and renewals with Razorpay IDs</div>
        <div className="data-table-wrap" style={{ marginTop: 12 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Transaction</th>
                <th>Plan</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Razorpay ID</th>
              </tr>
            </thead>
            <tbody>
              {transactionRows.map((tx) => (
                <tr key={tx.id}>
                  <td>{tx.id}</td>
                  <td>{tx.plan}</td>
                  <td>{tx.type}</td>
                  <td>₹{tx.amount.toLocaleString('en-IN')}</td>
                  <td>{tx.date}</td>
                  <td>{tx.razorpayId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
