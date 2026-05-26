import { api } from './api';

export const orderService = {
  /** Place a new order. payload: { seller_id, items: [{product_id, quantity, price}] } */
  place: (payload) => api.post('/api/orders', payload),

  /** Get all orders for the logged-in user (buyer or seller) */
  getAll: () => api.get('/api/orders'),

  /** Get a single order by ID with full tracking */
  getById: (id) => api.get(`/api/orders/${id}`),

  /** Seller updates order status: 'packed' | 'shipped' | 'delivered' */
  updateStatus: (id, status) => api.patch(`/api/orders/${id}/status`, { status }),
};
