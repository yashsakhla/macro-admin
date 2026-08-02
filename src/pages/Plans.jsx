import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Users, X } from 'lucide-react';
import { getProductData } from '../data/mockData';

export default function Plans() {
  const { product } = useOutletContext();
  const data = getProductData(product.id);
  const [plans, setPlans] = useState(data.plans);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', price: '', cycle: 'month', features: '' });

  function openModal() {
    setForm({ name: '', price: '', cycle: 'month', features: '' });
    setShowModal(true);
  }

  function handleCreate(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    const newPlan = {
      id: `${product.id}-plan-${Date.now()}`,
      name: form.name.trim(),
      price: Number(form.price) || 0,
      cycle: form.cycle,
      subscribers: 0,
      features: form.features
        .split(',')
        .map((f) => f.trim())
        .filter(Boolean),
    };
    setPlans((prev) => [...prev, newPlan]);
    setShowModal(false);
  }

  return (
    <div>
      <div className="page-toolbar">
        <div>
          <span className="table-toolbar-count">{plans.length} plans configured for {product.name}</span>
        </div>
        <button className="btn-primary" onClick={openModal}>
          <Plus size={15} /> Create plan
        </button>
      </div>

      <div className="plan-grid">
        {plans.map((plan, i) => (
          <div key={plan.id} className={`plan-card${i === 2 ? ' featured' : ''}`}>
            <div className="plan-name">{plan.name}</div>
            <div className="plan-price">
              {plan.price ? `₹${plan.price.toLocaleString('en-IN')}` : 'Custom'}
              {plan.price ? <span> /{plan.cycle}</span> : null}
            </div>
            <div className="plan-subs">
              <Users size={12} style={{ verticalAlign: -2, marginRight: 4 }} />
              {plan.subscribers} subscribers
            </div>
            <ul>
              {plan.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <button className="btn-secondary">Manage plan</button>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h3>Create a new plan</h3>
              <button className="btn-secondary" style={{ padding: 6 }} onClick={() => setShowModal(false)}>
                <X size={14} />
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="form-field">
                <label>Plan name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Premium"
                  required
                />
              </div>
              <div className="form-field">
                <label>Price (₹)</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="e.g. 3999"
                />
              </div>
              <div className="form-field">
                <label>Billing cycle</label>
                <select value={form.cycle} onChange={(e) => setForm({ ...form, cycle: e.target.value })}>
                  <option value="month">Monthly</option>
                  <option value="year">Yearly</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <div className="form-field">
                <label>Features (comma separated)</label>
                <textarea
                  value={form.features}
                  onChange={(e) => setForm({ ...form, features: e.target.value })}
                  placeholder="Up to 10 outlets, Priority support, API access"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
