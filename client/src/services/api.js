import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message = err.response?.data?.message || 'Something went wrong';
    return Promise.reject({ message, status: err.response?.status });
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getBySlug: (slug) => api.get(`/products/${slug}`),
};

export const categoryAPI = {
  getAll: () => api.get('/categories'),
};

export const collectionAPI = {
  getAll: () => api.get('/collections'),
};

export const occasionAPI = {
  getAll: () => api.get('/occasions'),
};

export const budgetAPI = {
  getAll: () => api.get('/budgets'),
};

export const cartAPI = {
  get: () => api.get('/cart'),
  add: (data) => api.post('/cart', data),
  update: (id, data) => api.put(`/cart/${id}`, data),
  remove: (id) => api.delete(`/cart/${id}`),
};

export const wishlistAPI = {
  get: () => api.get('/wishlist'),
  add: (productId) => api.post('/wishlist', { productId }),
  remove: (productId) => api.delete(`/wishlist/${productId}`),
};

export const orderAPI = {
  create: (data) => api.post('/orders', data),
  getAll: () => api.get('/orders'),
  getOne: (id) => api.get(`/orders/${id}`),
};

export const paymentAPI = {
  createOrder: (data) => api.post('/payments/create', data),
  verify: (data) => api.post('/payments/verify', data),
};

export const reviewAPI = {
  getByProduct: (productId) => api.get(`/reviews/product/${productId}`),
  add: (productId, data) => api.post(`/reviews/product/${productId}`, data),
};

export const couponAPI = {
  validate: (data) => api.post('/coupons/validate', data),
};

export const settingsAPI = {
  get: () => api.get('/settings'),
};

export const newsletterAPI = {
  subscribe: (email) => api.post('/newsletter/subscribe', { email }),
};

export const shippingAPI = {
  check: (data) => api.post('/shipping/check', data),
};

export const addressAPI = {
  getAll: () => api.get('/auth/addresses'),
  add: (data) => api.post('/auth/addresses', data),
  update: (id, data) => api.put(`/auth/addresses/${id}`, data),
  remove: (id) => api.delete(`/auth/addresses/${id}`),
};

export const adminAPI = {
  login: (data) => api.post('/admin/login', data),
  getDashboard: () => api.get('/admin/dashboard'),
};

export default api;
