import { useOutletContext } from 'react-router-dom';
import { Users, UserCheck, LifeBuoy, Wallet, ArrowUpRight } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { getProductData } from '../data/mockData';

function formatINR(value) {
  return `₹${value.toLocaleString('en-IN')}`;
}

export default function Dashboard() {
  const { product } = useOutletContext();
  const data = getProductData(product.id);
  const { stats, tickets, customers } = data;

  const recentTickets = tickets.slice(0, 5);
  const recentCustomers = customers.slice(0, 5);

  return (
    <div>
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon"><Users /></div>
          <div className="stat-value">{stats.totalCustomers.toLocaleString('en-IN')}</div>
          <div className="stat-label">Total customers</div>
          <span className="stat-delta up"><ArrowUpRight size={13} /> 4.2% this month</span>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><UserCheck /></div>
          <div className="stat-value">{stats.activeCustomers.toLocaleString('en-IN')}</div>
          <div className="stat-label">Active customers</div>
          <span className="stat-delta up"><ArrowUpRight size={13} /> 2.1% this month</span>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><LifeBuoy /></div>
          <div className="stat-value">{stats.openTickets}</div>
          <div className="stat-label">Open support queries</div>
          <span className="stat-delta down">Needs attention</span>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><Wallet /></div>
          <div className="stat-value">{formatINR(stats.monthlyRevenue)}</div>
          <div className="stat-label">Revenue this month</div>
          <span className="stat-delta up"><ArrowUpRight size={13} /> 8.6% vs last month</span>
        </div>
      </div>

      <div className="section-row">
        <div className="card">
          <span className="card-title">Revenue, last 7 days</span>
          <span className="card-subtitle">{product.name} transaction volume</span>
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={stats.revenueTrend} margin={{ left: -18, top: 8 }}>
              <defs>
                <linearGradient id={`grad-${product.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={product.accent} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={product.accent} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef1f5" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} width={60} />
              <Tooltip formatter={(v) => formatINR(v)} />
              <Area
                type="monotone"
                dataKey="value"
                stroke={product.accent}
                strokeWidth={2.5}
                fill={`url(#grad-${product.id})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <span className="card-title">Recent support queries</span>
          <span className="card-subtitle">Latest tickets raised by customers</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {recentTickets.map((t) => (
              <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                <div style={{ minWidth: 0 }}>
                  <div className="cell-primary" style={{ fontSize: 13.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {t.subject}
                  </div>
                  <div className="cell-sub">{t.customer} · {t.id}</div>
                </div>
                <StatusBadge status={t.status} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <span className="card-title">Newest customers</span>
        <span className="card-subtitle">Most recently onboarded accounts for {product.name}</span>
        <div className="data-table-wrap" style={{ border: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {recentCustomers.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div className="cell-primary">{c.name}</div>
                    <div className="cell-sub">{c.company}</div>
                  </td>
                  <td>{c.plan}</td>
                  <td><StatusBadge status={c.status} /></td>
                  <td>{c.joined}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function StatusBadge({ status }) {
  const map = {
    Active: 'green',
    Resolved: 'green',
    Closed: 'gray',
    Pending: 'amber',
    'In Progress': 'amber',
    'Waiting on Customer': 'amber',
    Suspended: 'red',
    Open: 'blue',
    New: 'blue',
    Contacted: 'amber',
    Qualified: 'blue',
    'Proposal Sent': 'amber',
    Won: 'green',
    Lost: 'red',
  };
  return <span className={`badge ${map[status] || 'gray'}`}>{status}</span>;
}
