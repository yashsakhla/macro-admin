import { useOutletContext } from 'react-router-dom';
import { listLeads, updateLeadStage, LEAD_STAGES, LEAD_STAGE_LABELS } from '../api/macropageConnect/leads';
import { usePaginatedQuery, useApiMutation } from '../api/macropageConnect/hooks';
import AsyncState from './connect/components/AsyncState';

export default function ManageLeads() {
  const { product } = useOutletContext();
  const {
    items: leads,
    loading,
    error,
    refetch,
  } = usePaginatedQuery(listLeads, { page: 1, limit: 100 });
  const { mutate: moveStage } = useApiMutation(updateLeadStage);

  async function advance(lead) {
    const idx = LEAD_STAGES.indexOf(lead.stage);
    const nextStage = idx === -1 || idx === LEAD_STAGES.length - 1 ? 'WON' : LEAD_STAGES[idx + 1];
    await moveStage(lead._id || lead.id, nextStage);
    refetch();
  }

  const grouped = LEAD_STAGES.reduce((acc, stage) => {
    acc[stage] = leads.filter((l) => l.stage === stage);
    return acc;
  }, {});

  return (
    <div>
      <div className="page-toolbar">
        <span className="table-toolbar-count">
          {leads.length} leads in the {product.name} pipeline · won {leads.filter((l) => l.stage === 'WON').length}, lost {leads.filter((l) => l.stage === 'LOST').length}
        </span>
      </div>

      <AsyncState
        loading={loading}
        error={error}
        empty={!loading && !error && leads.length === 0}
        emptyTitle="No leads yet"
        emptyMessage="Leads captured under Generate Leads will show up here."
        onRetry={refetch}
      >
        <div className="kanban-board">
          {LEAD_STAGES.map((stage) => (
            <div key={stage} className="kanban-col">
              <div className="kanban-col-title">
                <span>{LEAD_STAGE_LABELS[stage]}</span>
                <span>{grouped[stage].length}</span>
              </div>
              {grouped[stage].map((l) => (
                <div key={l._id || l.id} className="kanban-card">
                  <div className="kc-name">{l.name}</div>
                  <div className="kc-company">{l.company || '—'}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="kc-value">₹{Number(l.value || 0).toLocaleString('en-IN')}</span>
                    {stage !== 'PROPOSAL_SENT' ? (
                      <button
                        className="btn-secondary"
                        style={{ padding: '4px 8px', fontSize: 11 }}
                        onClick={() => advance(l)}
                      >
                        Move &rarr;
                      </button>
                    ) : (
                      <button
                        className="btn-primary"
                        style={{ padding: '4px 8px', fontSize: 11 }}
                        onClick={() => advance(l)}
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
      </AsyncState>
    </div>
  );
}
