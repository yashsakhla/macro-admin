// Deterministic mock data, seeded per product id, so every product's
// screens have believable, distinct-looking numbers without a backend.

function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function seedFromString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) || 1;
}

const FIRST_NAMES = [
  'Aarav', 'Priya', 'Rohan', 'Sneha', 'Vikram', 'Ananya', 'Karan', 'Isha',
  'Arjun', 'Meera', 'Dev', 'Kavya', 'Nikhil', 'Riya', 'Sahil', 'Tara',
];
const LAST_NAMES = [
  'Sharma', 'Verma', 'Iyer', 'Patel', 'Reddy', 'Nair', 'Gupta', 'Chawla',
  'Menon', 'Joshi', 'Kapoor', 'Rao',
];

const COMPANY_WORDS = [
  'Sunrise', 'Blue Harbor', 'Northline', 'Kestrel', 'Vantage', 'Silverback',
  'Cobalt', 'Redwood', 'Anchor', 'Highfield', 'Riverstone', 'Meridian',
];
const COMPANY_SUFFIX = ['Traders', 'Logistics', 'Fuels Pvt Ltd', 'Retail', 'Enterprises', 'Group'];

const CUSTOMER_TAGS = ['VIP', 'Renewing', 'High value', 'Priority', 'Retail', 'Startup', 'Enterprise', 'Support'];

function randomDateString(rand, startYear) {
  const year = startYear + Math.floor(rand() * 2);
  const month = 1 + Math.floor(rand() * 12);
  const day = 1 + Math.floor(rand() * 27);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function razorpayId(rand, prefix) {
  const digits = Array.from({ length: 8 }, () => Math.floor(rand() * 10)).join('');
  return `${prefix}_${digits}`;
}

function buildCustomers(productId, count) {
  const rand = seededRandom(seedFromString(productId + '-customers'));
  const statuses = ['Active', 'Active', 'Active', 'Pending', 'Suspended'];
  const plans = ['Starter', 'Growth', 'Pro', 'Enterprise'];
  const customers = [];
  for (let i = 0; i < count; i++) {
    const customerRand = seededRandom(seedFromString(`${productId}-customer-${i}`));
    const first = FIRST_NAMES[Math.floor(customerRand() * FIRST_NAMES.length)];
    const last = LAST_NAMES[Math.floor(customerRand() * LAST_NAMES.length)];
    const company = `${COMPANY_WORDS[Math.floor(customerRand() * COMPANY_WORDS.length)]} ${COMPANY_SUFFIX[Math.floor(customerRand() * COMPANY_SUFFIX.length)]}`;
    const joined = randomDateString(customerRand, 2023);
    const plan = plans[Math.floor(customerRand() * plans.length)];
    const spend = Math.floor(4000 + customerRand() * 96000);
    const tags = Array.from(new Set([
      CUSTOMER_TAGS[Math.floor(customerRand() * CUSTOMER_TAGS.length)],
      CUSTOMER_TAGS[Math.floor(customerRand() * CUSTOMER_TAGS.length)],
    ])).slice(0, 2);
    const campaigns = 1 + Math.floor(customerRand() * 24);
    const messages = {
      day: 5 + Math.floor(customerRand() * 32),
      week: 18 + Math.floor(customerRand() * 140),
      month: 80 + Math.floor(customerRand() * 340),
    };
    const firstPurchase = joined;
    const lastRenewal = randomDateString(customerRand, 2024);
    const transactionCount = 1 + Math.floor(customerRand() * 4);
    const transactions = Array.from({ length: transactionCount }, (_, txIndex) => {
      const txRand = seededRandom(seedFromString(`${productId}-cust-${i}-tx-${txIndex}`));
      const planName = plans[Math.floor(txRand() * plans.length)];
      const amount = Math.round((5000 + txRand() * 14000) / 100) * 100;
      const date = randomDateString(txRand, 2024);
      return {
        id: `${productId}-tx-${i + 1}-${txIndex + 1}`,
        plan: planName,
        type: txIndex === 0 ? 'Purchase' : 'Renewal',
        amount,
        date,
        razorpayId: razorpayId(txRand, 'pay'),
      };
    });
    customers.push({
      id: `${productId}-cust-${i + 1}`,
      name: `${first} ${last}`,
      company,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@${company.split(' ')[0].toLowerCase()}.com`,
      status: statuses[Math.floor(customerRand() * statuses.length)],
      plan,
      joined,
      spend,
      tags,
      campaigns,
      messages,
      firstPurchase,
      lastRenewal,
      transactions,
    });
  }
  return customers;
}

function buildTickets(productId, count) {
  const rand = seededRandom(seedFromString(productId + '-tickets'));
  const subjects = [
    'Unable to reconcile last invoice',
    'Login OTP not received',
    'Dashboard chart not loading',
    'Need help upgrading plan',
    'Duplicate transaction reported',
    'API webhook failing intermittently',
    'Request for data export',
    'Branch access permissions issue',
    'Refund not credited yet',
    'Onboarding new outlet',
  ];
  const statuses = ['Open', 'In Progress', 'Waiting on Customer', 'Resolved', 'Closed'];
  const priorities = ['Low', 'Medium', 'High', 'Urgent'];
  const tickets = [];
  for (let i = 0; i < count; i++) {
    const first = FIRST_NAMES[Math.floor(rand() * FIRST_NAMES.length)];
    const last = LAST_NAMES[Math.floor(rand() * LAST_NAMES.length)];
    tickets.push({
      id: `${productId.toUpperCase().slice(0, 2)}-${1000 + i}`,
      subject: subjects[Math.floor(rand() * subjects.length)],
      customer: `${first} ${last}`,
      status: statuses[Math.floor(rand() * statuses.length)],
      priority: priorities[Math.floor(rand() * priorities.length)],
      updated: `${1 + Math.floor(rand() * 27)} Jul 2026`,
    });
  }
  return tickets;
}

function buildLeads(productId, count) {
  const rand = seededRandom(seedFromString(productId + '-leads'));
  const sources = ['Website Form', 'Referral', 'Cold Outreach', 'Trade Show', 'Partner', 'Ad Campaign'];
  const stages = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost'];
  const leads = [];
  for (let i = 0; i < count; i++) {
    const first = FIRST_NAMES[Math.floor(rand() * FIRST_NAMES.length)];
    const last = LAST_NAMES[Math.floor(rand() * LAST_NAMES.length)];
    const company = `${COMPANY_WORDS[Math.floor(rand() * COMPANY_WORDS.length)]} ${COMPANY_SUFFIX[Math.floor(rand() * COMPANY_SUFFIX.length)]}`;
    leads.push({
      id: `${productId}-lead-${i + 1}`,
      name: `${first} ${last}`,
      company,
      phone: `+91 9${Math.floor(100000000 + rand() * 899999999)}`,
      source: sources[Math.floor(rand() * sources.length)],
      stage: stages[Math.floor(rand() * stages.length)],
      value: Math.floor(10000 + rand() * 250000),
    });
  }
  return leads;
}

function buildPlans(productId) {
  const base = [
    { name: 'Starter', price: 999, cycle: 'month', subscribers: 0, features: ['1 outlet', 'Basic reports', 'Email support'] },
    { name: 'Growth', price: 2999, cycle: 'month', subscribers: 0, features: ['Up to 5 outlets', 'Advanced reports', 'Priority email support', 'API access'] },
    { name: 'Pro', price: 6999, cycle: 'month', subscribers: 0, features: ['Up to 20 outlets', 'Custom dashboards', 'Phone support', 'API access', 'Dedicated account manager'] },
    { name: 'Enterprise', price: 0, cycle: 'custom', subscribers: 0, features: ['Unlimited outlets', 'SLA guarantee', '24/7 support', 'Custom integrations'] },
  ];
  const rand = seededRandom(seedFromString(productId + '-plans'));
  return base.map((p, i) => ({
    ...p,
    id: `${productId}-plan-${i + 1}`,
    subscribers: Math.floor(20 + rand() * 400),
  }));
}

function buildChat(productId) {
  const rand = seededRandom(seedFromString(productId + '-chat'));
  const names = ['Priya Sharma', 'Rohan Verma', 'Sneha Iyer', 'Karan Gupta', 'Meera Nair'];
  return names.map((name, i) => {
    const initiated = i % 2 === 0;
    return {
      id: `${productId}-chat-${i + 1}`,
      name,
      initiated,
      lastMessage: initiated
        ? [
            'Is my transaction settled yet?',
            'Can you help me change my plan?',
            'The invoice PDF is not downloading.',
            'Thanks, that solved it!',
            'When will the new outlet go live?',
          ][i % 5]
        : 'Conversation not started yet',
      time: `${9 + Math.floor(rand() * 8)}:${String(Math.floor(rand() * 60)).padStart(2, '0')} AM`,
      unread: i < 2,
    };
  });
}

export function getDashboardStats(productId) {
  const rand = seededRandom(seedFromString(productId + '-stats'));
  const revenueTrend = Array.from({ length: 7 }, (_, i) => ({
    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
    value: Math.floor(20000 + rand() * 80000),
  }));
  return {
    totalCustomers: Math.floor(300 + rand() * 2200),
    activeCustomers: Math.floor(200 + rand() * 1800),
    openTickets: Math.floor(3 + rand() * 40),
    monthlyRevenue: Math.floor(400000 + rand() * 3200000),
    revenueTrend,
  };
}

const cache = {};

export function getProductData(productId) {
  if (cache[productId]) return cache[productId];
  const data = {
    customers: buildCustomers(productId, 42),
    tickets: buildTickets(productId, 24),
    leads: buildLeads(productId, 30),
    plans: buildPlans(productId),
    chats: buildChat(productId),
    stats: getDashboardStats(productId),
  };
  cache[productId] = data;
  return data;
}
