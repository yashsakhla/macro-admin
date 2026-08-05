// Central definition of every product this admin portal manages.
// Adding a new product = add an entry here + matching mock data.

export const PRODUCTS = [
  {
    id: 'macropage',
    name: 'Macropage',
    tagline: 'Core publishing & page management',
    accent: '#6366F1',
    accentSoft: '#EEF0FE',
    initials: 'MP',
    tabs: ['dashboard', 'customers', 'support-query'],
  },
  {
    id: 'macropage-connect',
    name: 'Macropage Connect',
    tagline: 'Integrations & partner network',
    accent: '#0D9488',
    accentSoft: '#E6F6F4',
    initials: 'MC',
    tabs: [
      'dashboard',
      'customers',
      'support-query',
      'plans',
      'live-chat',
      'generate-leads',
      'manage-leads',
      'push-notifications',
      'ads-popup',
      'templates',
      'help-center',
      'integration-platforms',
      'videos',
      'demo-requests',
    ],
  },
  {
    id: 'mr-fuels-transact',
    name: 'Mr Fuels Transact',
    tagline: 'Fuel transaction & billing platform',
    accent: '#F59E0B',
    accentSoft: '#FEF3E2',
    initials: 'MF',
    tabs: [
      'dashboard',
      'customers',
      'support-query',
      'plans',
      'live-chat',
      'generate-leads',
      'manage-leads',
    ],
  },
];

export const TAB_LABELS = {
  dashboard: 'Dashboard',
  customers: 'Customers',
  'support-query': 'Support Query',
  plans: 'Plans',
  'live-chat': 'Live Chat',
  'generate-leads': 'Generate Leads',
  'manage-leads': 'Manage Leads',
  'push-notifications': 'Push Notifications',
  'ads-popup': 'Ads Popup',
  templates: 'Templates',
  'help-center': 'Help Center',
  'integration-platforms': 'Integration Platforms',
  videos: 'Videos',
  'demo-requests': 'Demo Requests',
};

export function getProduct(id) {
  return PRODUCTS.find((p) => p.id === id);
}
