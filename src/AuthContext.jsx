import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from './api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // ถ้าอยู่หน้า login (root path) ไม่ต้องเช็ค auth
      if (window.location.pathname === '/') {
        setUser(null);
        setLoading(false);
        return;
      }

      // ตรวจสอบว่ามี cookies หรือไม่โดยเรียก /auth/me
      const response = await authAPI.getMe();
      setUser(response.data.user);
    } catch (error) {
      // ถ้าไม่มี cookies หรือ token หมดอายุ
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      // Backend จะส่ง cookies มาให้อัตโนมัติ ไม่ต้องเก็บใน localStorage
      const { user } = response.data;
      setUser(user);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ'
      };
    }
  };

  const logout = async () => {
    try {
      // เรียก API เพื่อลบ refresh token จาก database และ clear cookies
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      // ไม่ต้อง reload หน้า ให้ App.jsx จัดการ navigation แทน
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
