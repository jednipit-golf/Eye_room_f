import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { leaveAPI } from '../api';

function NewLeave() {
  const navigate = useNavigate();
  const dateInputRef = useRef(null);
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

  // แปลงวันที่จาก YYYY-MM-DD เป็น DD/MM/YYYY สำหรับแสดงผล
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const handleCalendarClick = () => {
    dateInputRef.current?.showPicker();
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
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={formatDateForDisplay(formData.startDate)}
                readOnly
                placeholder="DD/MM/YYYY"
                required
                style={{ 
                  paddingRight: '50px',
                  cursor: 'pointer'
                }}
                onClick={handleCalendarClick}
              />
              <input
                ref={dateInputRef}
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                style={{
                  position: 'absolute',
                  right: '0',
                  top: '0',
                  bottom: '0',
                  width: '45px',
                  opacity: '0',
                  cursor: 'pointer'
                }}
              />
              <button
                type="button"
                onClick={handleCalendarClick}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  padding: '5px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'none'
                }}
              >
                📅
              </button>
            </div>
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
            <li>คำขอลาจะต้องได้รับการอนุญาตจากผู้ดูแลระบบ</li>
            <li>สามารถยกเลิกคำขอลาได้ในขณะที่รอการอนุญาต</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default NewLeave;
