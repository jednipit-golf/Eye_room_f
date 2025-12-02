import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { leaveAPI } from '../api';

function NewLeave() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    startDate: '',
    totalDays: '',
    reason: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // แปลงวันที่จาก input (YYYY-MM-DD) เป็น DD-MM-YYYY (พ.ศ.)
  const convertDateToBuddhistEra = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear() + 543; // แปลง ค.ศ. เป็น พ.ศ.
    return `${day}-${month}-${year}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const dataToSend = {
        startDate: convertDateToBuddhistEra(formData.startDate),
        totalDays: parseInt(formData.totalDays),
        reason: formData.reason
      };

      await leaveAPI.createLeave(dataToSend);
      alert('ส่งคำขอลาเรียบร้อยแล้ว');
      navigate('/my-leaves');
    } catch (error) {
      setError(error.response?.data?.message || 'เกิดข้อผิดพลาดในการส่งคำขอลา');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>จองวันลา</h1>

      <div className="card">
        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>วันที่เริ่มลา *</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>จำนวนวันที่ลา *</label>
            <input
              type="number"
              name="totalDays"
              value={formData.totalDays}
              onChange={handleChange}
              min="1"
              placeholder="เช่น 3"
              required
            />
            <small style={{ color: '#666', fontSize: '0.875rem' }}>
              ระบุจำนวนวันที่ต้องการลา (ตัวเลข)
            </small>
          </div>

          <div className="form-group">
            <label>เหตุผลการลา *</label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              placeholder="กรุณาระบุเหตุผลการลา..."
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'กำลังส่งคำขอ...' : 'ส่งคำขอลา'}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => navigate('/my-leaves')}
              disabled={loading}
            >
              ยกเลิก
            </button>
          </div>
        </form>

        <div className="alert alert-info" style={{ marginTop: '1.5rem' }}>
          <strong>หมายเหตุ:</strong>
          <ul style={{ marginTop: '0.5rem', marginLeft: '1.5rem' }}>
            <li>ระบุวันที่เริ่มลาและจำนวนวันที่ต้องการลา</li>
            <li>คำขอลาจะต้องได้รับการอนุมัติจากผู้ดูแลระบบ</li>
            <li>สามารถยกเลิกคำขอลาได้ในขณะที่รอการอนุมัติ</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default NewLeave;
