import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// สร้าง axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // สำคัญ! เพื่อส่ง cookies ไปกับทุก request
});

// Response interceptor - จัดการ token expired และ auto-refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // ถ้า token หมดอายุและยังไม่เคย retry
    if (
      error.response?.status === 401 && 
      error.response?.data?.expired && 
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        // เรียก refresh token endpoint
        await axios.post(
          `${API_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );
        
        // ลองส่ง request เดิมอีกครั้งด้วย access token ใหม่
        return api(originalRequest);
      } catch (refreshError) {
        // ถ้า refresh token หมดอายุ หรือไม่ valid - ไม่ต้อง redirect ที่นี่
        // ให้ App.jsx จัดการแทน
        return Promise.reject(refreshError);
      }
    }

    // ซ่อน error 401 ของ /auth/me เพราะเป็น initial check ที่ยังไม่ได้ login
    if (error.response?.status === 401 && originalRequest.url?.includes('/auth/me')) {
      // Silent fail - ไม่ log error
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
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
