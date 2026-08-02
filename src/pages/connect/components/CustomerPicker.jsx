import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { listCustomers } from '../../../api/macropageConnect/customers';
import { useApiQuery } from '../../../api/macropageConnect/hooks';

// Search-as-you-type customer picker, reused wherever the API needs a
// customerId (or a list of them for targeted sends).
// - multiSelect=false: value is a single id string (or ''), onChange(id)
// - multiSelect=true: value is an array of ids, onChange(ids)
export default function CustomerPicker({ value, onChange, multiSelect = false, placeholder = 'Search customers by name or email…' }) {
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [selectedLabels, setSelectedLabels] = useState({});

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 350);
    return () => clearTimeout(t);
  }, [query]);

  const { data } = useApiQuery(
    () => (debounced ? listCustomers({ page: 1, limit: 8, search: debounced }) : Promise.resolve(null)),
    [debounced]
  );
  const results = data?.items || [];

  function pick(customer) {
    const id = customer._id || customer.id;
    setSelectedLabels((prev) => ({ ...prev, [id]: customer.name || customer.businessName || customer.email }));
    if (multiSelect) {
      const ids = Array.isArray(value) ? value : [];
      if (!ids.includes(id)) onChange([...ids, id]);
    } else {
      onChange(id);
    }
    setQuery('');
  }

  function remove(id) {
    if (multiSelect) {
      onChange((value || []).filter((v) => v !== id));
    } else {
      onChange('');
    }
  }

  const selectedIds = multiSelect ? value || [] : value ? [value] : [];

  return (
    <div>
      {selectedIds.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
          {selectedIds.map((id) => (
            <span key={id} className="tag-chip" onClick={() => remove(id)}>
              {selectedLabels[id] || id} <X size={12} />
            </span>
          ))}
        </div>
      )}
      <input
        className="form-field"
        style={{ margin: 0 }}
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {debounced && results.length > 0 && (
        <div
          style={{
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            marginTop: 6,
            maxHeight: 160,
            overflowY: 'auto',
          }}
        >
          {results.map((c) => (
            <div
              key={c._id || c.id}
              onClick={() => pick(c)}
              style={{ padding: '8px 12px', fontSize: 13, cursor: 'pointer', borderBottom: '1px solid var(--border)' }}
            >
              <div className="cell-primary" style={{ fontSize: 13 }}>{c.name || c.businessName}</div>
              <div className="cell-sub">{c.email}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
