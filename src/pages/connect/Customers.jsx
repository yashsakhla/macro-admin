import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, Tags } from 'lucide-react';
import { listCustomers } from '../../api/macropageConnect/customers';
import { listTags } from '../../api/macropageConnect/tags';
import { usePaginatedQuery, useApiQuery } from '../../api/macropageConnect/hooks';
import { StatusBadge } from '../Dashboard';
import AsyncState from './components/AsyncState';
import Pagination from './components/Pagination';
import TagsModal from './TagsModal';

// billingPlan filter enum — distinct from the pricing catalog's tier names
// (Starter/Growth/Scale/Enterprise); this is the customer's billing status.
const BILLING_PLANS = ['TRIAL', 'STARTER', 'GROWTH', 'BUSINESS', 'ENTERPRISE'];

export default function ConnectCustomers() {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [billingPlan, setBillingPlan] = useState('');
  const [tagId, setTagId] = useState('');
  const [page, setPage] = useState(1);
  const [showTagsModal, setShowTagsModal] = useState(false);
  const limit = 20;

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [search, billingPlan, tagId]);

  const { items, total, totalPages, loading, error, refetch } = usePaginatedQuery(listCustomers, {
    page,
    limit,
    search: search || undefined,
    billingPlan: billingPlan || undefined,
    tagId: tagId || undefined,
  });

  const { data: tags, refetch: refetchTags } = useApiQuery(() => listTags(), []);

  // Tags own the relationship (tag.customerIds), customers don't carry a
  // `tags` field — invert it into a customerId -> tags lookup for the table.
  const tagsByCustomer = useMemo(() => {
    const map = new Map();
    (tags || []).forEach((t) => {
      (t.customerIds || []).forEach((cid) => {
        if (!map.has(cid)) map.set(cid, []);
        map.get(cid).push(t);
      });
    });
    return map;
  }, [tags]);

  return (
    <div>
      <div className="page-toolbar">
        <input
          className="search-input"
          placeholder="Search customers by name, company or email"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <select className="filter-select" value={billingPlan} onChange={(e) => setBillingPlan(e.target.value)}>
          <option value="">All plans</option>
          {BILLING_PLANS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <select className="filter-select" value={tagId} onChange={(e) => setTagId(e.target.value)}>
          <option value="">All tags</option>
          {(tags || []).map((t) => (
            <option key={t._id} value={t._id}>{t.name}</option>
          ))}
        </select>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="table-toolbar-count">{total} customers</span>
          <button className="btn-secondary" onClick={() => setShowTagsModal(true)}>
            <Tags size={15} /> Manage tags
          </button>
        </div>
      </div>

      <div className="data-table-wrap">
        <AsyncState
          loading={loading}
          error={error}
          empty={!loading && !error && items.length === 0}
          emptyIcon={Search}
          emptyTitle="No customers found"
          emptyMessage="Try a different search term or filter."
          onRetry={refetch}
        >
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Tags</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => {
                const customerId = c._id || c.id;
                const customerTags = tagsByCustomer.get(customerId) || [];
                return (
                  <tr key={customerId}>
                    <td>
                      <div className="cell-primary">{c.name || c.businessName}</div>
                      <div className="cell-sub">{c.company || c.businessName} · {c.email}</div>
                    </td>
                    <td>{c.billingPlan || c.plan || '—'}</td>
                    <td>{c.status ? <StatusBadge status={c.status} /> : '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {customerTags.length === 0
                          ? '—'
                          : customerTags.map((t) => (
                              <span key={t._id} className="badge gray">{t.name}</span>
                            ))}
                      </div>
                    </td>
                    <td>{c.createdAt || c.joined || '—'}</td>
                    <td>
                      <button className="btn-secondary" onClick={() => navigate(`/p/macropage-connect/customers/${customerId}`)}>
                        View details <ArrowRight size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </AsyncState>

        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>

      {showTagsModal && (
        <TagsModal
          onClose={() => {
            setShowTagsModal(false);
            refetchTags();
          }}
        />
      )}
    </div>
  );
}
