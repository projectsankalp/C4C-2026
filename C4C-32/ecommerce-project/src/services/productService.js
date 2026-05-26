import { api } from './api';

export const productService = {
  /** Fetch all products. Optional: { category_id, seller_id, search, limit, page } */
  getAll: (params = {}) => {
    const query = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ''))
    ).toString();
    return api.get(`/api/products${query ? `?${query}` : ''}`);
  },

  /** Fetch a single product by ID */
  getById: (id) => api.get(`/api/products/${id}`),

  /** Fetch all categories */
  getCategories: () => api.get('/api/products/categories'),

  /** Create a new product (seller only) */
  create: (payload) => api.post('/api/products', payload),

  /** Update a product by ID (seller only) */
  update: (id, updates) => api.patch(`/api/products/${id}`, updates),

  /** Delete a product by ID (seller only) */
  remove: (id) => api.del(`/api/products/${id}`),
};
