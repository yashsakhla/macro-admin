import { useMemo, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Search, Plus, ArrowRight } from 'lucide-react';
import { getProductData } from '../data/mockData';
import { StatusBadge } from './Dashboard';

export default function Customers() {
  const { product } = useOutletContext();
  const navigate = useNavigate();
  const { customers } = getProductData(product.id);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
    );
  }, [query, customers]);

  return (
    <div>
      <div className="page-toolbar">
        <input
          className="search-input"
          placeholder="Search customers by name, company or email"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="table-toolbar-count">{filtered.length} of {customers.length}</span>
          <button className="btn-primary">
            <Plus size={15} /> Add customer
          </button>
        </div>
      </div>

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Plan</th>
              <th>Status</th>
              <th>Total spend</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id}>
                <td>
                  <div className="cell-primary">{c.name}</div>
                  <div className="cell-sub">{c.company} · {c.email}</div>
                </td>
                <td>{c.plan}</td>
                <td><StatusBadge status={c.status} /></td>
                <td>₹{c.spend.toLocaleString('en-IN')}</td>
                <td>{c.joined}</td>
                <td>
                  <button
                    className="btn-secondary"
                    onClick={() => navigate(`/p/${product.id}/customers/${c.id}`)}
                  >
                    View details <ArrowRight size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="empty-state">
            <Search size={22} style={{ marginBottom: 10, opacity: 0.5 }} />
            <h4>No customers found</h4>
            <p>Try a different search term.</p>
          </div>
        )}
      </div>
    </div>
  );
}
