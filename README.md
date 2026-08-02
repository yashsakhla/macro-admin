# Admin Portal

A React admin console for managing three web products from one login:

- **Macropage**
- **Macropage Connect**
- **Mr Fuels Transact**

## Getting started

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

**Login:** this is a front-end demo with no backend, so any email + a
password of 4 or more characters will log you in. Swap the logic in
`src/context/AuthContext.jsx` for a real API call when you're ready to
connect a backend.

## How it's organized

```
src/
  config/products.js      // the 3 products + which tabs each one has
  data/mockData.js         // fake customers/tickets/leads/plans per product
  context/AuthContext.jsx  // login state, persisted to localStorage
  components/ProtectedRoute.jsx
  pages/
    Login.jsx              // /login
    ProductSelect.jsx       // / — pick which product to manage
    ProductLayout.jsx       // /p/:productId — sidebar + tab shell
    Dashboard.jsx           // shared tab
    Customers.jsx           // shared tab
    SupportQuery.jsx        // shared tab
    Plans.jsx               // Macropage Connect + Mr Fuels Transact only
    LiveChat.jsx            // Macropage Connect + Mr Fuels Transact only
    GenerateLeads.jsx       // Macropage Connect + Mr Fuels Transact only
    ManageLeads.jsx         // Macropage Connect + Mr Fuels Transact only
```

## Flow

1. **Login** (`/login`) — sign in.
2. **Product picker** (`/`) — cards for the three products.
3. **Product dashboard** (`/p/<product>/dashboard`) — a sidebar with the
   tabs that product supports. Macropage only has Dashboard, Customers and
   Support Query. Macropage Connect and Mr Fuels Transact also get Plans,
   Live Chat, Generate Leads and Manage Leads.

## Wiring up a real backend

Everything currently reads from `src/data/mockData.js`, which generates
consistent-looking fake data per product. To connect a real API:

- Replace `getProductData(productId)` calls with `fetch`/`axios` calls in
  each page (`Dashboard.jsx`, `Customers.jsx`, etc).
- Replace the `login()` function in `AuthContext.jsx` with a call to your
  auth endpoint, and store a real token instead of the demo user object.

## Adding a fourth product

Add an entry to `PRODUCTS` in `src/config/products.js` with an `id`,
`name`, `accent` color and a `tabs` array — the sidebar and routes pick it
up automatically, no other file needs to change.
