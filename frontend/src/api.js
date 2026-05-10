import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:5000' });

export const getExperts = (params) => api.get('/experts', { params });
export const getExpertById = (id) => api.get(`/experts/${id}`);
export const createBooking = (data) => api.post('/bookings', data);
export const getBookingsByEmail = (email) => api.get('/bookings', { params: { email } });
export const updateBookingStatus = (id, status) => api.patch(`/bookings/${id}/status`, { status });

export default api;
