import { apiGet, apiPost, apiPatch } from './client';

// params: { page, limit, stage, source, search }
// stage enum: NEW | CONTACTED | QUALIFIED | PROPOSAL_SENT | WON | LOST
// source enum: WEBSITE_FORM | REFERRAL | COLD_OUTREACH | TRADE_SHOW | PARTNER | AD_CAMPAIGN
export function listLeads(params) {
  return apiGet('/platform/leads', params);
}

export function createLead(body) {
  return apiPost('/platform/leads', body);
}

export function updateLeadStage(id, stage) {
  return apiPatch(`/platform/leads/${id}/stage`, { stage });
}

export function getLeadStats() {
  return apiGet('/platform/leads/stats');
}

export const LEAD_STAGES = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT'];
export const LEAD_SOURCES = ['WEBSITE_FORM', 'REFERRAL', 'COLD_OUTREACH', 'TRADE_SHOW', 'PARTNER', 'AD_CAMPAIGN'];

export const LEAD_SOURCE_LABELS = {
  WEBSITE_FORM: 'Website Form',
  REFERRAL: 'Referral',
  COLD_OUTREACH: 'Cold Outreach',
  TRADE_SHOW: 'Trade Show',
  PARTNER: 'Partner',
  AD_CAMPAIGN: 'Ad Campaign',
};

export const LEAD_STAGE_LABELS = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  QUALIFIED: 'Qualified',
  PROPOSAL_SENT: 'Proposal Sent',
  WON: 'Won',
  LOST: 'Lost',
};
