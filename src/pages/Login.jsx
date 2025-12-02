import { useState } from 'react';
import { useAuth } from '../AuthContext';

function Login() {
  const [telephone, setTelephone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login({ telephone, password });
    
    if (!result.success) {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>🔐 เข้าสู่ระบบ</h2>
        
        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>เบอร์โทรศัพท์</label>
            <input
              type="tel"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              placeholder="0812345678"
              required
            />
          </div>

          <div className="form-group">
            <label>รหัสผ่าน</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>

        <div className="alert alert-info" style={{ marginTop: '1.5rem' }}>
          <strong>ทดสอบระบบ:</strong><br />
          ใช้บัญชีที่สร้างโดย admin เท่านั้น<br />
          ไม่มีระบบสมัครสมาชิก
        </div>
      </div>
    </div>
  );
}

export default Login;
