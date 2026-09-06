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
  storeName: 'GiftedThreads',
  storeEmail: 'hello@giftedthreads.com',
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

export const hasConsentedCookie = () => localStorage.getItem(STORE_KEYS.cookie) === 'accepted';
export const acceptCookie = () => localStorage.setItem(STORE_KEYS.cookie, 'accepted');

export const getCheckoutDraft = () => read(STORE_KEYS.checkoutDraft, null);
export const setCheckoutDraft = (draft) => write(STORE_KEYS.checkoutDraft, draft);
export const clearCheckoutDraft = () => localStorage.removeItem(STORE_KEYS.checkoutDraft);

export const SEED_CUSTOMERS = [
  { name: 'Ananya Sharma', email: 'ananya@example.com', phone: '9812345670', joined: '2025-01-12', orders: 4, spent: 5896 },
  { name: 'Rohit Verma', email: 'rohit@example.com', phone: '9823456781', joined: '2025-02-03', orders: 2, spent: 2598 },
  { name: 'Priya Patel', email: 'priya@example.com', phone: '9834567892', joined: '2025-02-21', orders: 3, spent: 4297 },
  { name: 'Kunal Mehta', email: 'kunal@example.com', phone: '9845678903', joined: '2025-03-15', orders: 1, spent: 899 },
  { name: 'Sneha Iyer', email: 'sneha@example.com', phone: '9856789014', joined: '2025-04-09', orders: 5, spent: 7120 },
  { name: 'Aarav Gupta', email: 'aarav@example.com', phone: '9867890125', joined: '2025-05-18', orders: 2, spent: 3144 },
];

export const SEED_ORDERS = [
  {
    orderId: 'GFT1725000123',
    date: '2026-08-28T10:12:00.000Z',
    customer: { name: 'Ananya Sharma', email: 'ananya@example.com', phone: '9812345670' },
    items: [
      { name: 'Customized Floral Printed Black & White Handheld Box Bag', quantity: 1, price: 1299 },
      { name: 'Personalised Photo Ceramic Mug', quantity: 2, price: 399 },
    ],
    subtotal: 2097,
    discount: 210,
    delivery: 0,
    total: 1887,
    paymentMethod: 'UPI',
    status: 'Shipped',
    address: { city: 'Mumbai', state: 'Maharashtra', pincode: '400069' },
  },
  {
    orderId: 'GFT1725000124',
    date: '2026-08-30T15:40:00.000Z',
    customer: { name: 'Rohit Verma', email: 'rohit@example.com', phone: '9823456781' },
    items: [
      { name: 'Personalised Coffee Mug With Name', quantity: 1, price: 449 },
      { name: 'Personalised Wooden Keychain', quantity: 1, price: 299 },
    ],
    subtotal: 748,
    discount: 0,
    delivery: 99,
    total: 847,
    paymentMethod: 'Cash on Delivery',
    status: 'Processing',
    address: { city: 'Delhi', state: 'Delhi', pincode: '110001' },
  },
  {
    orderId: 'GFT1725000125',
    date: '2026-09-01T09:05:00.000Z',
    customer: { name: 'Priya Patel', email: 'priya@example.com', phone: '9834567892' },
    items: [
      { name: 'Personalised Name Engraved Leather Wallet', quantity: 1, price: 799 },
      { name: 'Customised Name Necklace', quantity: 1, price: 799 },
    ],
    subtotal: 1598,
    discount: 80,
    delivery: 0,
    total: 1518,
    paymentMethod: 'Credit/Debit Card',
    status: 'Delivered',
    address: { city: 'Ahmedabad', state: 'Gujarat', pincode: '380015' },
  },
];