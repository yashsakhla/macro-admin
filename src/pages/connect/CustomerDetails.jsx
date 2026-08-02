import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Tags, MessageSquare, CreditCard } from 'lucide-react';
import { getCustomer, getCustomerProfile } from '../../api/macropageConnect/customers';
import { getCustomerCurrentPlan, getCustomerPlanHistory } from '../../api/macropageConnect/plans';
import { listMessageLogs } from '../../api/macropageConnect/messages';
import { listTags } from '../../api/macropageConnect/tags';
import { useApiQuery } from '../../api/macropageConnect/hooks';
import { StatusBadge } from '../Dashboard';
import AsyncState from './components/AsyncState';
import MessageStatusBadge from './components/MessageStatusBadge';
import TagsModal from './TagsModal';

export default function ConnectCustomerDetails() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [showTagsModal, setShowTagsModal] = useState(false);

  const { data: customer, loading, error, refetch } = useApiQuery(
    () => getCustomer(customerId),
    [customerId]
  );
  const { data: profile, loading: profileLoading, error: profileError } = useApiQuery(
    () => getCustomerProfile(customerId),
    [customerId]
  );
  const { data: currentPlan } = useApiQuery(() => getCustomerCurrentPlan(customerId), [customerId]);
  const { data: planHistory } = useApiQuery(() => getCustomerPlanHistory(customerId), [customerId]);
  const {
    data: customerMessageLogs,
    loading: customerMessageLoading,
    error: customerMessageError,
    refetch: refetchCustomerMessageLogs,
  } = useApiQuery(() => listMessageLogs({ customerId, page: 1, limit: 20 }), [customerId]);
  const { data: allMessageLogs, loading: allMessageLogsLoading, error: allMessageLogsError } = useApiQuery(
    () => listMessageLogs({ page: 1, limit: 1 }),
    []
  );
  const { data: allTags, refetch: refetchTags } = useApiQuery(() => listTags(), []);

  // Tags own the relationship (tag.customerIds) rather than the customer
  // carrying a `tags` field, so filter the full tag list down to this customer.
  const tags = (allTags || []).filter((t) => (t.customerIds || []).includes(customerId));
  const tagIds = tags.map((t) => t._id);
  const messageStats = profile?.messageStats || {};
  const historyRows = Array.isArray(planHistory) ? planHistory : planHistory?.items || [];
  const customerLogItems = Array.isArray(customerMessageLogs?.items)
    ? customerMessageLogs.items
    : Array.isArray(customerMessageLogs)
      ? customerMessageLogs
      : [];
  const totalCustomerLogs = customerMessageLogs?.total ?? customerMessageLogs?.count ?? customerLogItems.length;
  const totalAllLogs = allMessageLogs?.total ?? allMessageLogs?.count ?? 0;

  return (
    <div>
      <div className="page-toolbar" style={{ justifyContent: 'space-between' }}>
        <button className="btn-secondary" onClick={() => navigate(-1)}>
          <ArrowLeft size={14} /> Back to customers
        </button>
      </div>

      <AsyncState loading={loading} error={error} onRetry={refetch}>
        {customer && (
          <>
            <div className="page-toolbar" style={{ justifyContent: 'flex-start', gap: 12, marginTop: -8 }}>
              {customer.status && <StatusBadge status={customer.status} />}
              <span className="badge gray">{customer.billingPlan || customer.plan || 'No plan'}</span>
            </div>

            <div className="section-row" style={{ marginBottom: 20 }}>
              <div className="card">
                <span className="card-title">Customer profile</span>
                <span className="card-subtitle">Details for {customer.name || customer.businessName}</span>
                <div style={{ display: 'grid', gap: 12 }}>
                  <div className="detail-row">
                    <div>
                      <div className="cell-primary">Company</div>
                      <div className="cell-sub">{customer.company || customer.businessName || '—'}</div>
                    </div>
                    <div>
                      <div className="cell-primary">Email</div>
                      <div className="cell-sub">{customer.email || '—'}</div>
                    </div>
                  </div>
                  <div className="detail-row">
                    <div>
                      <div className="cell-primary">Phone</div>
                      <div className="cell-sub">{customer.phone || '—'}</div>
                    </div>
                    <div>
                      <div className="cell-primary">Joined on</div>
                      <div className="cell-sub">{customer.createdAt || customer.joined || '—'}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <span className="card-title">Tags</span>
                <span className="card-subtitle">Used to group customers for targeted notifications</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
                  {tags.length === 0 && <span className="cell-sub">No tags assigned.</span>}
                  {tags.map((t) => (
                    <span key={t._id} className="badge gray">{t.name}</span>
                  ))}
                </div>
                <button className="btn-primary" type="button" onClick={() => setShowTagsModal(true)}>
                  <Tags size={15} /> Manage tags
                </button>
              </div>
            </div>

            <AsyncState loading={profileLoading} error={profileError}>
              <div className="stat-grid" style={{ marginBottom: 22 }}>
                <div className="stat-card">
                  <div className="stat-icon"><CreditCard /></div>
                  <div className="stat-value">{currentPlan?.name || currentPlan?.planName || '—'}</div>
                  <div className="stat-label">Current plan</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon"><MessageSquare /></div>
                  <div className="stat-value">{messageStats.today ?? messageStats.day ?? 0}</div>
                  <div className="stat-label">Messages today</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon"><MessageSquare /></div>
                  <div className="stat-value">{messageStats.week ?? messageStats.thisWeek ?? 0}</div>
                  <div className="stat-label">Messages this week</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon"><MessageSquare /></div>
                  <div className="stat-value">{messageStats.month ?? messageStats.thisMonth ?? 0}</div>
                  <div className="stat-label">Messages this month</div>
                </div>
              </div>
            </AsyncState>

            <div className="card" style={{ marginBottom: 22 }}>
              <div className="page-toolbar" style={{ marginBottom: 8 }}>
                <div>
                  <span className="card-title">Message logs</span>
                  <span className="card-subtitle">Recent messages for this customer</span>
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <span className="badge gray">Customer logs: {totalCustomerLogs}</span>
                  <span className="badge gray">All logs: {totalAllLogs}</span>
                </div>
              </div>

              <div className="data-table-wrap">
                <AsyncState
                  loading={customerMessageLoading}
                  error={customerMessageError}
                  empty={!customerMessageLoading && !customerMessageError && customerLogItems.length === 0}
                  emptyIcon={MessageSquare}
                  emptyTitle="No message logs"
                  emptyMessage="Messages sent to this customer will show up here once they exist."
                  onRetry={refetchCustomerMessageLogs}
                >
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Channel</th>
                        <th>Status</th>
                        <th>Sent</th>
                        <th>Message</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customerLogItems.map((log, index) => (
                        <tr key={log.id || log._id || `${log.customerId || customerId}-${index}`}>
                          <td>{log.channel || '—'}</td>
                          <td><MessageStatusBadge status={log.status} /></td>
                          <td>{log.createdAt || log.sentAt || '—'}</td>
                          <td style={{ maxWidth: 260, whiteSpace: 'pre-wrap' }}>
                            {log.message || log.body || log.content || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </AsyncState>
              </div>
            </div>

            <div className="card">
              <div className="card-title">Plan purchase &amp; renewal history</div>
              <div className="card-subtitle">All plan transactions for this customer</div>
              <div className="data-table-wrap" style={{ marginTop: 12 }}>
                {historyRows.length === 0 ? (
                  <div className="empty-state">
                    <CreditCard size={22} style={{ marginBottom: 10, opacity: 0.5 }} />
                    <h4>No plan history yet</h4>
                    <p>Purchases and renewals will show up here.</p>
                  </div>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Plan</th>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyRows.map((h, i) => (
                        <tr key={h.id || i}>
                          <td>{h.planName || h.plan?.name || '—'}</td>
                          <td>{h.type || '—'}</td>
                          <td>{h.amount != null ? `₹${Number(h.amount).toLocaleString('en-IN')}` : '—'}</td>
                          <td>{h.date || h.createdAt || '—'}</td>
                          <td>{h.status || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </>
        )}
      </AsyncState>

      {showTagsModal && (
        <TagsModal
          customerId={customerId}
          initialTagIds={tagIds}
          onClose={() => setShowTagsModal(false)}
          onAssigned={refetchTags}
        />
      )}
    </div>
  );
}
