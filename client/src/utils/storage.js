const read = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const write = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable */
  }
};

export const STORE_KEYS = {
  settings: 'gt_settings',
  orders: 'gt_orders',
  customers: 'gt_customers',
  products: 'gt_admin_products',
  admin: 'gt_admin',
  cookie: 'gt_cookie_consent',
  checkoutDraft: 'gt_checkout_draft',
};

export const DEFAULT_SETTINGS = {
  storeName: 'MahfilGifts',
  storeEmail: 'hello@mahfilgifts.com',
  storePhone: '+91 99990 00000',
  storeAddress: 'B-42, Andheri East, Mumbai, Maharashtra 400069',
  announcements: [
    'Buy any 2 & get 5% off',
    'Buy any 3 & get 10% off',
    'Free delivery above ₹999',
    '15 Lakh+ happy customers',
  ],
  freeShippingThreshold: 999,
  deliveryCharge: 99,
  codCharge: 40,
  buy2Discount: 5,
  buy3Discount: 10,
  whatsappNumber: '919999000000',
};

export const getSettings = () => ({ ...DEFAULT_SETTINGS, ...read(STORE_KEYS.settings, {}) });
export const saveSettings = (settings) => write(STORE_KEYS.settings, settings);

export const getOrders = () => read(STORE_KEYS.orders, []);
export const saveOrder = (order) => {
  const orders = getOrders().filter((o) => o.orderId !== order.orderId);
  orders.unshift(order);
  write(STORE_KEYS.orders, orders);
  return order;
};
export const updateOrder = (orderId, patch) => {
  const orders = getOrders().map((o) => (o.orderId === orderId ? { ...o, ...patch } : o));
  write(STORE_KEYS.orders, orders);
  return orders.find((o) => o.orderId === orderId);
};

export const getCustomers = () => read(STORE_KEYS.customers, []);
export const upsertCustomer = (customer) => {
  const customers = getCustomers().filter((c) => c.email !== customer.email);
  customers.unshift(customer);
  write(STORE_KEYS.customers, customers);
};

export const getAdminProducts = () => read(STORE_KEYS.products, []);
export const saveAdminProducts = (products) => write(STORE_KEYS.products, products);

export const getAdminSession = () => read(STORE_KEYS.admin, null);
export const setAdminSession = (admin) => write(STORE_KEYS.admin, admin);
export const clearAdminSession = () => localStorage.removeItem(STORE_KEYS.admin);

const TOKEN_KEYS = { user: 'gt_user_token', admin: 'gt_admin_token' };

export const getUserToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEYS.user) || '';
  } catch {
    return '';
  }
};
export const setUserToken = (token) => {
  try {
    if (token) localStorage.setItem(TOKEN_KEYS.user, token);
  } catch { /* storage unavailable */ }
};
export const clearUserToken = () => {
  try {
    localStorage.removeItem(TOKEN_KEYS.user);
  } catch { /* storage unavailable */ }
};

export const getAdminToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEYS.admin) || '';
  } catch {
    return '';
  }
};
export const setAdminToken = (token) => {
  try {
    if (token) localStorage.setItem(TOKEN_KEYS.admin, token);
  } catch { /* storage unavailable */ }
};
export const clearAdminToken = () => {
  try {
    localStorage.removeItem(TOKEN_KEYS.admin);
  } catch { /* storage unavailable */ }
};

export const hasConsentedCookie = () => localStorage.getItem(STORE_KEYS.cookie) === 'accepted';
export const acceptCookie = () => localStorage.setItem(STORE_KEYS.cookie, 'accepted');

export const getCheckoutDraft = () => read(STORE_KEYS.checkoutDraft, null);
export const setCheckoutDraft = (draft) => write(STORE_KEYS.checkoutDraft, draft);
export const clearCheckoutDraft = () => localStorage.removeItem(STORE_KEYS.checkoutDraft);

export const SEED_CUSTOMERS = [];

export const SEED_ORDERS = [];