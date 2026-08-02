import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { getProductData } from '../data/mockData';

const STAGES = ['New', 'Contacted', 'Qualified', 'Proposal Sent'];

export default function ManageLeads() {
  const { product } = useOutletContext();
  const data = getProductData(product.id);
  const [leads, setLeads] = useState(data.leads);

  function advance(leadId) {
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id !== leadId) return l;
        const idx = STAGES.indexOf(l.stage);
        if (idx === -1 || idx === STAGES.length - 1) return { ...l, stage: 'Won' };
        return { ...l, stage: STAGES[idx + 1] };
      })
    );
  }

  const grouped = STAGES.reduce((acc, stage) => {
    acc[stage] = leads.filter((l) => l.stage === stage);
    return acc;
  }, {});

  return (
    <div>
      <div className="page-toolbar">
        <span className="table-toolbar-count">
          {leads.length} leads in the {product.name} pipeline · won {leads.filter((l) => l.stage === 'Won').length}, lost {leads.filter((l) => l.stage === 'Lost').length}
        </span>
      </div>

      <div className="kanban-board">
        {STAGES.map((stage) => (
          <div key={stage} className="kanban-col">
            <div className="kanban-col-title">
              <span>{stage}</span>
              <span>{grouped[stage].length}</span>
            </div>
            {grouped[stage].map((l) => (
              <div key={l.id} className="kanban-card">
                <div className="kc-name">{l.name}</div>
                <div className="kc-company">{l.company}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="kc-value">₹{l.value.toLocaleString('en-IN')}</span>
                  {stage !== 'Proposal Sent' ? (
                    <button
                      className="btn-secondary"
                      style={{ padding: '4px 8px', fontSize: 11 }}
                      onClick={() => advance(l.id)}
                    >
                      Move &rarr;
                    </button>
                  ) : (
                    <button
                      className="btn-primary"
                      style={{ padding: '4px 8px', fontSize: 11 }}
                      onClick={() => advance(l.id)}
                    >
                      Mark won
                    </button>
                  )}
                </div>
              </div>
            ))}
            {grouped[stage].length === 0 && (
              <div style={{ fontSize: 12, color: 'var(--ink-500)', textAlign: 'center', padding: '20px 0' }}>
                Nothing here
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
