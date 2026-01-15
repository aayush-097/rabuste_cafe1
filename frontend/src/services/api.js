import axios from 'axios';

// Base axios instance
//const api = axios.create({
//  baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:5000/api',
//});
const API_BASE = import.meta.env.VITE_API_BASE;

if (!API_BASE) {
  throw new Error('VITE_API_BASE is not defined');
}

const api = axios.create({
  baseURL: API_BASE,
});

// Attach JWT token if present
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('rabuste_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ================== AUTH ================== */
export const login = (payload) => api.post('/auth/login', payload);
export const signup = (payload) => api.post('/auth/signup', payload);

/* ================== USER API ================== */
export const fetchCoffee = () => api.get('/coffee');
export const fetchArt = () => api.get('/art');
export const fetchWorkshops = () => api.get('/workshops');
export const registerWorkshop = (payload) => api.post('/workshops/register', payload);
export const submitFranchise = (payload) => api.post('/franchise/enquiry', payload);
export const fetchInsights = () => api.get('/insights/popular');

/* ================== AI ================== */
export const aiCoffee = (payload) => api.post('/ai/coffee', payload);
export const aiArt = (payload) => api.post('/ai/art', payload);
export const aiWorkshop = (payload) => api.post('/ai/workshop', payload);

/* ================== MENU/IMAGES ================== */
export const fetchMenuImages = () => api.get('/images');

/* ================== ADMIN ================== */
export const adminGetMenu = () => api.get('/admin/menu');
export const adminCreateMenu = (payload) => api.post('/admin/menu', payload);
export const adminUpdateMenu = (id, payload) => api.put(`/admin/menu/${id}`, payload);
export const adminDeleteMenu = (id) => api.delete(`/admin/menu/${id}`);

export const adminGetWorkshops = () => api.get('/admin/workshops');
export const adminCreateWorkshop = (payload) => api.post('/admin/workshops', payload);
export const adminUpdateWorkshop = (id, payload) => api.put(`/admin/workshops/${id}`, payload);
export const adminDeleteWorkshop = (id) => api.delete(`/admin/workshops/${id}`);
export const adminGetWorkshopRegistrations = () => api.get('/admin/workshops/registrations');

export const adminGetArt = () => api.get('/admin/art');
export const adminCreateArt = (payload) => api.post('/admin/art', payload);
export const adminUpdateArt = (id, payload) => api.put(`/admin/art/${id}`, payload);
export const adminDeleteArt = (id) => api.delete(`/admin/art/${id}`);

export const bookArt = (payload) => api.post('/art/book', payload);
export const adminGetBookings = () => api.get('/admin/art/bookings');
export const adminAcceptBooking = (id) => api.patch(`/admin/art/bookings/${id}/accept`);
export const adminRejectBooking = (id) => api.patch(`/admin/art/bookings/${id}/reject`);

export const adminGetFranchiseEnquiries = () => api.get('/admin/franchise/enquiries');
export const adminUpdateEnquiryStatus = (id, status) => api.patch(`/admin/franchise/enquiries/${id}/status`, { status });

/* ================== ORDERS ================== */
export const createOrder = (payload) => api.post('/orders', payload);
export const getCart = () => api.get('/cart');
export const addToCart = (payload) => api.post('/cart/add', payload);
export const updateCart = (payload) => api.patch('/cart/update', payload);
export const removeFromCart = (itemId) => api.delete(`/cart/remove/${itemId}`);
export const clearCart = () => api.delete('/cart/clear');
export const adminGetOrders = (filter) => {
  const params = {};
  if (filter) params.filter = filter;
  return api.get('/admin/orders', { params });
};
export const adminCompleteOrder = (id) => api.put(`/admin/orders/${id}/complete`);
export const adminMarkOrderAsPaid = (id) => api.put(`/admin/orders/${id}/mark-paid`);
export const adminVerifyAndCompleteOrder = (id) => api.put(`/admin/orders/${id}/verify-complete`);

export default api;
