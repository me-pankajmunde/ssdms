import axios from 'axios';
import {
  ApiResponse,
  PaginatedResponse,
  Event,
  Donation,
  DonationCreateRequest,
  PanchangData,
  Festival,
  User,
  DashboardStats,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// Events API
export const eventsApi = {
  list: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    eventType?: string;
    featured?: boolean;
  }): Promise<PaginatedResponse<Event>> => {
    const response = await api.get('/events', { params });
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Event>> => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },

  getUpcoming: async (days?: number): Promise<ApiResponse<Event[]>> => {
    const response = await api.get('/events/upcoming', { params: { days } });
    return response.data;
  },

  getFeatured: async (): Promise<ApiResponse<Event[]>> => {
    const response = await api.get('/events/featured');
    return response.data;
  },

  getCalendar: async (year: number, month: number): Promise<ApiResponse<Event[]>> => {
    const response = await api.get(`/events/calendar/${year}/${month}`);
    return response.data;
  },

  create: async (event: Partial<Event>): Promise<ApiResponse<Event>> => {
    const response = await api.post('/events', event);
    return response.data;
  },

  update: async (id: string, event: Partial<Event>): Promise<ApiResponse<Event>> => {
    const response = await api.put(`/events/${id}`, event);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  },
};

// Donations API
export const donationsApi = {
  list: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<PaginatedResponse<Donation> & { summary: { totalAmount: number } }> => {
    const response = await api.get('/donations', { params });
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Donation>> => {
    const response = await api.get(`/donations/${id}`);
    return response.data;
  },

  getCategories: async (): Promise<ApiResponse<Array<{ value: string; marathi: string; english: string }>>> => {
    const response = await api.get('/donations/categories');
    return response.data;
  },

  create: async (donation: DonationCreateRequest): Promise<ApiResponse<Donation>> => {
    const response = await api.post('/donations', donation);
    return response.data;
  },

  createOrder: async (donationId: string): Promise<ApiResponse<{
    orderId: string;
    amount: number;
    currency: string;
    donationId: string;
    keyId: string;
  }>> => {
    const response = await api.post('/donations/create-order', { donationId });
    return response.data;
  },

  verifyPayment: async (data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    donationId: string;
  }): Promise<ApiResponse<Donation>> => {
    const response = await api.post('/donations/verify', data);
    return response.data;
  },

  getReceipt: async (id: string): Promise<ApiResponse<unknown>> => {
    const response = await api.get(`/donations/${id}/receipt`);
    return response.data;
  },
};

// Panchang API
export const panchangApi = {
  getToday: async (): Promise<ApiResponse<PanchangData>> => {
    const response = await api.get('/panchang/today');
    return response.data;
  },

  getByDate: async (date: string): Promise<ApiResponse<PanchangData>> => {
    const response = await api.get(`/panchang/date/${date}`);
    return response.data;
  },

  getMonthly: async (year: number, month: number): Promise<ApiResponse<{
    year: number;
    month: number;
    marathiMonth: string;
    days: PanchangData[];
  }>> => {
    const response = await api.get(`/panchang/month/${year}/${month}`);
    return response.data;
  },

  getFestivals: async (year: number): Promise<ApiResponse<{ year: number; festivals: Festival[] }>> => {
    const response = await api.get(`/panchang/festivals/${year}`);
    return response.data;
  },

  getUpcomingEkadashis: async (count?: number): Promise<ApiResponse<PanchangData[]>> => {
    const response = await api.get('/panchang/upcoming-ekadashis', { params: { count } });
    return response.data;
  },
};

// Auth API
export const authApi = {
  login: async (username: string, password: string): Promise<ApiResponse<{
    access_token: string;
    token_type: string;
    user: User;
  }>> => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    const response = await api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  register: async (data: {
    username: string;
    email: string;
    password: string;
    role: string;
    profile: { name: string; designation?: string };
  }): Promise<ApiResponse<User>> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<ApiResponse<null>> => {
    const response = await api.post('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return response.data;
  },
};

// Admin API
export const adminApi = {
  getDashboard: async (): Promise<ApiResponse<DashboardStats>> => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  getDonationReport: async (params?: {
    startDate?: string;
    endDate?: string;
    groupBy?: 'day' | 'week' | 'month' | 'category';
  }): Promise<ApiResponse<{
    report: Array<{ period?: string; category?: string; totalAmount: number; count: number; avgAmount: number }>;
    summary: { totalAmount: number; totalCount: number; startDate: string; endDate: string };
  }>> => {
    const response = await api.get('/admin/reports/donations', { params });
    return response.data;
  },

  getEventsReport: async (params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<{
    byCategory: Array<{ category: string; count: number }>;
    byStatus: Array<{ status: string; count: number }>;
    total: number;
  }>> => {
    const response = await api.get('/admin/reports/events', { params });
    return response.data;
  },

  listUsers: async (params?: { page?: number; limit?: number }): Promise<PaginatedResponse<User>> => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  toggleUserStatus: async (userId: string): Promise<ApiResponse<null>> => {
    const response = await api.put(`/admin/users/${userId}/toggle-status`);
    return response.data;
  },
};

export default api;
