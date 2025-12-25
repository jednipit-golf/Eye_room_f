import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { authAPI } from '../api';
import '../index.css';

function ManageUsers() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('register'); // 'register' หรือ 'reset'
  
  // Authorization check - only system-admin can access
  useEffect(() => {
    if (user && user.role !== 'system-admin') {
      alert('คุณไม่มีสิทธิ์เข้าถึงหน้านี้ (สำหรับ System Admin เท่านั้น)');
      window.location.href = '/';
      return;
    }
  }, [user]);
  
  // Register User State
  const [registerData, setRegisterData] = useState({
    name: '',
    telephone: '',
    password: '',
    confirmPassword: ''
  });
  const [registerMessage, setRegisterMessage] = useState({ type: '', text: '' });
  const [isRegistering, setIsRegistering] = useState(false);

  // Reset Password State
  const [resetData, setResetData] = useState({
    telephone: '',
    password: '',
    confirmPassword: ''
  });
  const [resetMessage, setResetMessage] = useState({ type: '', text: '' });
  const [isResetting, setIsResetting] = useState(false);

  // Format phone number as XXX-XXX-XXXX
  const formatPhoneNumber = (value) => {
    // Remove all non-digits
    const phoneNumber = value.replace(/\D/g, '');
    
    // Limit to 10 digits
    const limitedPhone = phoneNumber.slice(0, 10);
    
    // Format as XXX-XXX-XXXX
    if (limitedPhone.length <= 3) {
      return limitedPhone;
    } else if (limitedPhone.length <= 6) {
      return `${limitedPhone.slice(0, 3)}-${limitedPhone.slice(3)}`;
    } else {
      return `${limitedPhone.slice(0, 3)}-${limitedPhone.slice(3, 6)}-${limitedPhone.slice(6)}`;
    }
  };

  // Get raw phone number (digits only)
  const getRawPhoneNumber = (value) => {
    return value.replace(/\D/g, '');
  };

  // Handle Register User
  const handleRegister = async (e) => {
    e.preventDefault();
    setIsRegistering(true);
    setRegisterMessage({ type: '', text: '' });

    // Validate phone number is exactly 10 digits
    if (registerData.telephone.length !== 10) {
      setRegisterMessage({ 
        type: 'error', 
        text: 'กรุณากรอกเบอร์โทรศัพท์ให้ครบ 10 หลัก' 
      });
      setIsRegistering(false);
      return;
    }

    
    // Validate phone number starts with 0
    if (!registerData.telephone.startsWith('0')) {
      setRegisterMessage({ 
        type: 'error', 
        text: 'wrong telephone number' 
      });
      setIsRegistering(false);
      return;
    }

    // Validate password match
    if (registerData.password !== registerData.confirmPassword) {
      setRegisterMessage({ 
        type: 'error', 
        text: 'รหัสผ่านไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง' 
      });
      setIsRegistering(false);
      return;
    }

    try {
      const response = await authAPI.register(registerData);
      
      if (response.data.success) {
        setRegisterMessage({ 
          type: 'success', 
          text: `ลงทะเบียนสำเร็จ! ผู้ใช้: ${registerData.name}` 
        });
        // Clear form
        setRegisterData({ name: '', telephone: '', password: '', confirmPassword: '' });
      }
    } catch (error) {
      setRegisterMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'เกิดข้อผิดพลาดในการลงทะเบียน' 
      });
    } finally {
      setIsRegistering(false);
    }
  };

  // Handle Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsResetting(true);
    setResetMessage({ type: '', text: '' });

    // Validate phone number is exactly 10 digits
    if (resetData.telephone.length !== 10) {
      setResetMessage({ 
        type: 'error', 
        text: 'กรุณากรอกเบอร์โทรศัพท์ให้ครบ 10 หลัก' 
      });
      setIsResetting(false);
      return;
    }

    // Validate password match
    if (resetData.password !== resetData.confirmPassword) {
      setResetMessage({ 
        type: 'error', 
        text: 'รหัสผ่านไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง' 
      });
      setIsResetting(false);
      return;
    }

    try {
      const response = await authAPI.resetPassword(resetData);
      
      if (response.data.success) {
        setResetMessage({ 
          type: 'success', 
          text: response.data.message || 'รีเซ็ตรหัสผ่านสำเร็จ' 
        });
        // Clear form
        setResetData({ telephone: '', password: '', confirmPassword: '' });
      }
    } catch (error) {
      setResetMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน' 
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="manage-users-container">
      <h2>🔧 จัดการผู้ใช้งาน</h2>
      <p className="subtitle">สำหรับ System Admin เท่านั้น</p>

      {/* Tabs */}
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'register' ? 'active' : ''}`}
          onClick={() => setActiveTab('register')}
        >
          📝 ลงทะเบียนผู้ใช้ใหม่
        </button>
        <button 
          className={`tab ${activeTab === 'reset' ? 'active' : ''}`}
          onClick={() => setActiveTab('reset')}
        >
          🔑 รีเซ็ตรหัสผ่าน
        </button>
      </div>

      {/* Register User Tab */}
      {activeTab === 'register' && (
        <div className="tab-content">
          <form onSubmit={handleRegister} className="user-form">
            <div className="form-group">
              <label htmlFor="name">ชื่อ-นามสกุล *</label>
              <input
                type="text"
                id="name"
                value={registerData.name}
                onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                placeholder="Jan Doe"
                required
                disabled={isRegistering}
              />
            </div>

            <div className="form-group">
              <label htmlFor="register-telephone">เบอร์โทรศัพท์ *</label>
              <input
                type="tel"
                id="register-telephone"
                value={formatPhoneNumber(registerData.telephone)}
                onChange={(e) => {
                  const rawPhone = getRawPhoneNumber(e.target.value);
                  setRegisterData({ ...registerData, telephone: rawPhone });
                }}
                placeholder="088-888-8888"
                maxLength="12"
                required
                disabled={isRegistering}
              />
              <small>กรอกเบอร์โทร 10 หลัก (ใช้เป็น username)</small>
            </div>

            <div className="form-group">
              <label htmlFor="register-password">รหัสผ่าน *</label>
              <input
                type="password"
                id="register-password"
                value={registerData.password}
                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                placeholder="อย่างน้อย 6 ตัวอักษร"
                minLength="6"
                required
                disabled={isRegistering}
              />
              <small>รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร</small>
            </div>

            <div className="form-group">
              <label htmlFor="register-confirm-password">ยืนยันรหัสผ่าน *</label>
              <input
                type="password"
                id="register-confirm-password"
                value={registerData.confirmPassword}
                onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                placeholder="กรอกรหัสผ่านอีกครั้ง"
                minLength="6"
                required
                disabled={isRegistering}
              />
              <small>กรอกรหัสผ่านอีกครั้งเพื่อยืนยัน</small>
            </div>

            {registerMessage.text && (
              <div className={`message ${registerMessage.type}`}>
                {registerMessage.text}
              </div>
            )}

            <button 
              type="submit" 
              className="btn-primary"
              disabled={isRegistering}
            >
              {isRegistering ? '⏳ กำลังลงทะเบียน...' : '✅ ลงทะเบียนผู้ใช้ใหม่'}
            </button>
          </form>
        </div>
      )}

      {/* Reset Password Tab */}
      {activeTab === 'reset' && (
        <div className="tab-content">
          <form onSubmit={handleResetPassword} className="user-form">
            <div className="form-group">
              <label htmlFor="reset-telephone">เบอร์โทรศัพท์ *</label>
              <input
                type="tel"
                id="reset-telephone"
                value={formatPhoneNumber(resetData.telephone)}
                onChange={(e) => {
                  const rawPhone = getRawPhoneNumber(e.target.value);
                  setResetData({ ...resetData, telephone: rawPhone });
                }}
                placeholder="088-888-8888"
                maxLength="12"
                required
                disabled={isResetting}
              />
              <small>ระบุเบอร์โทรของผู้ใช้ที่ต้องการรีเซ็ตรหัสผ่าน </small>
            </div>

            <div className="form-group">
              <label htmlFor="reset-password">รหัสผ่านใหม่ *</label>
              <input
                type="password"
                id="reset-password"
                value={resetData.password}
                onChange={(e) => setResetData({ ...resetData, password: e.target.value })}
                placeholder="อย่างน้อย 6 ตัวอักษร"
                minLength="6"
                required
                disabled={isResetting}
              />
              <small>รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร</small>
            </div>

            <div className="form-group">
              <label htmlFor="reset-confirm-password">ยืนยันรหัสผ่านใหม่ *</label>
              <input
                type="password"
                id="reset-confirm-password"
                value={resetData.confirmPassword}
                onChange={(e) => setResetData({ ...resetData, confirmPassword: e.target.value })}
                placeholder="กรอกรหัสผ่านอีกครั้ง"
                minLength="6"
                required
                disabled={isResetting}
              />
              <small>กรอกรหัสผ่านอีกครั้งเพื่อยืนยัน</small>
            </div>

            {resetMessage.text && (
              <div className={`message ${resetMessage.type}`}>
                {resetMessage.text}
              </div>
            )}

            <button 
              type="submit" 
              className="btn-primary"
              disabled={isResetting}
            >
              {isResetting ? '⏳ กำลังรีเซ็ตรหัสผ่าน...' : '🔑 รีเซ็ตรหัสผ่าน'}
            </button>
          </form>

          <div className="warning-box">
            <strong>⚠️ คำเตือน:</strong> การรีเซ็ตรหัสผ่านจะทำให้ผู้ใช้ต้องเข้าสู่ระบบใหม่ด้วยรหัสผ่านใหม่ทันที
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageUsers;
