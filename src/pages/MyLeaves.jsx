import { useState, useEffect } from 'react';
import { leaveAPI } from '../api';

function MyLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeave, setSelectedLeave] = useState(null);

  useEffect(() => {
    fetchMyLeaves();
  }, []);

  const fetchMyLeaves = async () => {
    try {
      const response = await leaveAPI.getMyLeaves();
      setLeaves(response.data.data);
    } catch (error) {
      console.error('Error fetching leaves:', error);
      alert('เกิดข้อผิดพลาดในการดึงข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (leaveId) => {
    if (!window.confirm('คุณต้องการยกเลิกคำขอลานี้หรือไม่?')) {
      return;
    }

    try {
      await leaveAPI.cancelLeave(leaveId);
      alert('ยกเลิกคำขอลาเรียบร้อยแล้ว');
      fetchMyLeaves();
    } catch (error) {
      alert(error.response?.data?.message || 'เกิดข้อผิดพลาดในการยกเลิกคำขอลา');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'badge-pending',
      approved: 'badge-approved',
      rejected: 'badge-rejected',
      cancelled: 'badge-cancelled'
    };
    const labels = {
      pending: 'รออนุมัติ',
      approved: 'อนุมัติ',
      rejected: 'ไม่อนุมัติ',
      cancelled: 'ยกเลิก'
    };
    return <span className={`badge ${badges[status]}`}>{labels[status]}</span>;
  };

  if (loading) {
    return <div className="loading">กำลังโหลด...</div>;
  }

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>วันลาของฉัน</h1>

      <div className="card">
        {leaves.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>วันที่เริ่ม</th>
                <th>จำนวนวัน</th>
                <th>เหตุผล</th>
                <th>สถานะ</th>
                <th>การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((leave) => (
                <tr key={leave._id}>
                  <td>{leave.formattedStartDate || new Date(leave.startDate).toLocaleDateString('th-TH')}</td>
                  <td>{leave.totalDays} วัน</td>
                  <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {leave.reason}
                  </td>
                  <td>{getStatusBadge(leave.status)}</td>
                  <td>
                    <button
                      className="btn btn-secondary"
                      style={{ marginRight: '0.5rem', padding: '0.4rem 0.8rem', fontSize: '0.875rem' }}
                      onClick={() => setSelectedLeave(leave)}
                    >
                      ดูรายละเอียด
                    </button>
                    {leave.status === 'pending' && (
                      <button
                        className="btn btn-danger"
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.875rem' }}
                        onClick={() => handleCancel(leave._id)}
                      >
                        ยกเลิก
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
            <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>ยังไม่มีคำขอลา</p>
            <a href="/new-leave" className="btn btn-primary">
              จองวันลา
            </a>
          </div>
        )}
      </div>

      {/* Modal แสดงรายละเอียด */}
      {selectedLeave && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setSelectedLeave(null)}
        >
          <div 
            className="card" 
            style={{ maxWidth: '600px', width: '90%', margin: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>รายละเอียดคำขอลา</h2>
            <table className="table">
              <tbody>
                <tr>
                  <td><strong>วันที่เริ่ม</strong></td>
                  <td>{selectedLeave.formattedStartDate || new Date(selectedLeave.startDate).toLocaleDateString('th-TH')}</td>
                </tr>
                <tr>
                  <td><strong>จำนวนวัน</strong></td>
                  <td>{selectedLeave.totalDays} วัน</td>
                </tr>
                <tr>
                  <td><strong>เหตุผล</strong></td>
                  <td>{selectedLeave.reason}</td>
                </tr>
                <tr>
                  <td><strong>สถานะ</strong></td>
                  <td>{getStatusBadge(selectedLeave.status)}</td>
                </tr>
                {selectedLeave.approvedBy && (
                  <tr>
                    <td><strong>ผู้อนุมัติ</strong></td>
                    <td>{selectedLeave.approvedBy.name}</td>
                  </tr>
                )}
                <tr>
                  <td><strong>วันที่ส่งคำขอ</strong></td>
                  <td>{new Date(selectedLeave.createdAt).toLocaleString('th-TH')}</td>
                </tr>
              </tbody>
            </table>
            <button 
              className="btn btn-secondary" 
              style={{ width: '100%' }}
              onClick={() => setSelectedLeave(null)}
            >
              ปิด
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyLeaves;
