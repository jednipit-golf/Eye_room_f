import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1';

// สร้าง axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// เพิ่ม token ใน header ทุกครั้งที่ส่ง request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// จัดการ response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
  logout: () => api.get('/auth/logout'),
  getAllMembers: () => api.get('/auth/members'),
};

// Leave APIs
export const leaveAPI = {
  getMyLeaves: () => api.get('/leaves/my-leaves'),
  getAllLeaves: (params) => api.get('/leaves', { params }),
  getLeaveById: (id) => api.get(`/leaves/${id}`),
  createLeave: (data) => api.post('/leaves', data),
  approveLeave: (id) => api.put(`/leaves/${id}/approve`),
  rejectLeave: (id) => api.put(`/leaves/${id}/reject`),
  cancelLeave: (id) => api.put(`/leaves/${id}/cancel`),
  getStats: () => api.get('/leaves/stats'),
};

export default api;
