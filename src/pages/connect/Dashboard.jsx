import { useEffect, useState } from 'react';
import { Users, UserCheck, Send, AlertTriangle, MessageSquare } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { useOutletContext } from 'react-router-dom';
import { getDashboardStats } from '../../api/macropageConnect/stats';
import { listMessageLogs, getMessageStats, MESSAGE_STATUSES } from '../../api/macropageConnect/messages';
import { useApiQuery, usePaginatedQuery } from '../../api/macropageConnect/hooks';
import AsyncState from './components/AsyncState';
import MessageStatusBadge from './components/MessageStatusBadge';
import Pagination from './components/Pagination';

function normalizePoint(point) {
  return {
    label: point.date || point.day || point.period || point.month || '',
    sent: point.sent ?? point.sentCount ?? 0,
    failed: point.failed ?? point.failedCount ?? 0,
    total: point.total ?? (point.sent ?? 0) + (point.failed ?? 0),
  };
}

export default function ConnectDashboard() {
  const { product } = useOutletContext();
  const [groupBy, setGroupBy] = useState('day');
  const [logStatus, setLogStatus] = useState('');
  const [logPage, setLogPage] = useState(1);
  const logLimit = 10;

  const { data: stats, loading: statsLoading, error: statsError, refetch: refetchStats } = useApiQuery(
    () => getDashboardStats(),
    []
  );

  const {
    data: messageStats,
    loading: chartLoading,
    error: chartError,
    refetch: refetchChart,
  } = useApiQuery(() => getMessageStats({ groupBy }), [groupBy]);

  useEffect(() => {
    setLogPage(1);
  }, [logStatus]);

  const {
    items: logItems,
    total: logTotal,
    totalPages: logTotalPages,
    loading: logsLoading,
    error: logsError,
    refetch: refetchLogs,
  } = usePaginatedQuery(listMessageLogs, {
    page: logPage,
    limit: logLimit,
    status: logStatus || undefined,
  });

  const chartData = Array.isArray(messageStats) ? messageStats.map(normalizePoint) : [];

  return (
    <div>
      <AsyncState loading={statsLoading} error={statsError} onRetry={refetchStats}>
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-icon"><Users /></div>
            <div className="stat-value">{(stats?.totalCustomers ?? 0).toLocaleString('en-IN')}</div>
            <div className="stat-label">Total customers</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><UserCheck /></div>
            <div className="stat-value">{(stats?.totalEnrolledCustomers ?? 0).toLocaleString('en-IN')}</div>
            <div className="stat-label">Enrolled customers</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><Send /></div>
            <div className="stat-value">{(stats?.messagesSentToday ?? 0).toLocaleString('en-IN')}</div>
            <div className="stat-label">Messages sent today</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><AlertTriangle /></div>
            <div className="stat-value">{(stats?.messagesFailedToday ?? 0).toLocaleString('en-IN')}</div>
            <div className="stat-label">Messages failed today</div>
          </div>
        </div>
      </AsyncState>

      <div className="card" style={{ marginBottom: 22 }}>
        <div className="page-toolbar" style={{ marginBottom: 4 }}>
          <div>
            <span className="card-title">Message volume</span>
            <span className="card-subtitle">Sent vs. failed messages for {product.name}</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['day', 'month'].map((g) => (
              <button
                key={g}
                className="btn-secondary"
                style={
                  groupBy === g
                    ? { background: 'var(--accent)', color: '#fff', borderColor: 'var(--accent)' }
                    : undefined
                }
                onClick={() => setGroupBy(g)}
              >
                By {g}
              </button>
            ))}
          </div>
        </div>

        <AsyncState
          loading={chartLoading}
          error={chartError}
          empty={!chartLoading && !chartError && chartData.length === 0}
          emptyTitle="No message activity yet"
          emptyMessage="Message stats will appear here once notifications start going out."
          onRetry={refetchChart}
        >
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData} margin={{ left: -18, top: 8 }}>
              <defs>
                <linearGradient id={`grad-sent-${product.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={product.accent} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={product.accent} stopOpacity={0} />
                </linearGradient>
                <linearGradient id={`grad-failed-${product.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef1f5" />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} width={50} />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="sent"
                name="Sent"
                stroke={product.accent}
                strokeWidth={2.5}
                fill={`url(#grad-sent-${product.id})`}
              />
              <Area
                type="monotone"
                dataKey="failed"
                name="Failed"
                stroke="#dc2626"
                strokeWidth={2}
                fill={`url(#grad-failed-${product.id})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        </AsyncState>
      </div>

      <div className="card">
        <div className="page-toolbar" style={{ marginBottom: 4 }}>
          <div>
            <span className="card-title">Message logs</span>
            <span className="card-subtitle">Recent messages sent to customers</span>
          </div>
          <select className="filter-select" value={logStatus} onChange={(e) => setLogStatus(e.target.value)}>
            <option value="">All statuses</option>
            {MESSAGE_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="data-table-wrap">
          <AsyncState
            loading={logsLoading}
            error={logsError}
            empty={!logsLoading && !logsError && logItems.length === 0}
            emptyIcon={MessageSquare}
            emptyTitle="No message logs"
            emptyMessage="Messages sent to customers will show up here."
            onRetry={refetchLogs}
          >
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Channel</th>
                  <th>Status</th>
                  <th>Sent</th>
                </tr>
              </thead>
              <tbody>
                {logItems.map((m, i) => (
                  <tr key={m.id || m._id || i}>
                    <td>{m.customer?.name || m.customerName || m.customerId || '—'}</td>
                    <td>{m.channel || '—'}</td>
                    <td><MessageStatusBadge status={m.status} /></td>
                    <td>{m.createdAt || m.sentAt || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </AsyncState>

          <Pagination page={logPage} totalPages={logTotalPages} onChange={setLogPage} />
        </div>
        {!logsLoading && !logsError && logTotal > 0 && (
          <div className="table-toolbar-count" style={{ marginTop: 10 }}>{logTotal} message logs</div>
        )}
      </div>
    </div>
  );
}
