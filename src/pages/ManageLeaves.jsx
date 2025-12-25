import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { leaveAPI } from '../api';

function ManageLeaves() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [selectedLeave, setSelectedLeave] = useState(null);

  // Authorization check - only admin and system-admin can access
  useEffect(() => {
    if (user && user.role !== 'admin' && user.role !== 'system-admin') {
      alert('คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
      navigate('/');
      return;
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user) {
      fetchLeaves();
    }
  }, [filter, user]);

  const fetchLeaves = async () => {
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await leaveAPI.getAllLeaves(params);
      setLeaves(response.data.data);
    } catch (error) {
      console.error('Error fetching leaves:', error);
      alert('เกิดข้อผิดพลาดในการดึงข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (leaveId) => {
    if (!window.confirm('คุณต้องการอนุมัติคำขอลานี้หรือไม่?')) {
      return;
    }

    try {
      await leaveAPI.approveLeave(leaveId);
      alert('อนุมัติคำขอลาเรียบร้อยแล้ว');
      fetchLeaves();
    } catch (error) {
      alert(error.response?.data?.message || 'เกิดข้อผิดพลาดในการอนุมัติคำขอลา');
    }
  };

  const handleReject = async (leaveId) => {
    if (!window.confirm('คุณต้องการปฏิเสธคำขอลานี้หรือไม่?')) {
      return;
    }

    try {
      await leaveAPI.rejectLeave(leaveId);
      alert('ปฏิเสธคำขอลาเรียบร้อยแล้ว');
      setSelectedLeave(null);
      fetchLeaves();
    } catch (error) {
      alert(error.response?.data?.message || 'เกิดข้อผิดพลาดในการปฏิเสธคำขอลา');
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
      <h1 style={{ marginBottom: '2rem' }}>จัดการคำขอลา</h1>

      {/* ฟิลเตอร์ */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('all')}
          >
            ทั้งหมด
          </button>
          <button
            className={`btn ${filter === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('pending')}
          >
            รออนุมัติ
          </button>
          <button
            className={`btn ${filter === 'approved' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('approved')}
          >
            อนุมัติแล้ว
          </button>
          <button
            className={`btn ${filter === 'rejected' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('rejected')}
          >
            ไม่อนุมัติ
          </button>
        </div>
      </div>

      {/* ตารางคำขอลา */}
      <div className="card">
        {leaves.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>พนักงาน</th>
                <th>เบอร์โทร</th>
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
                  <td data-label="พนักงาน">{leave.user?.name || 'N/A'}</td>
                  <td data-label="เบอร์โทร">{leave.user?.telephone || 'N/A'}</td>
                  <td data-label="วันที่เริ่ม">{leave.formattedStartDate || new Date(leave.startDate).toLocaleDateString('th-TH')}</td>
                  <td data-label="จำนวนวัน">{leave.totalDays} วัน</td>
                  <td data-label="เหตุผล" style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {leave.reason}
                  </td>
                  <td data-label="สถานะ">{getStatusBadge(leave.status)}</td>
                  <td data-label="การจัดการ">
                    <button
                      className="btn btn-secondary"
                      style={{ marginRight: '0.5rem', padding: '0.4rem 0.8rem', fontSize: '0.875rem' }}
                      onClick={() => setSelectedLeave(leave)}
                    >
                      ดู
                    </button>
                    {leave.status === 'pending' && (
                      <>
                        <button
                          className="btn btn-success"
                          style={{ marginRight: '0.5rem', padding: '0.4rem 0.8rem', fontSize: '0.875rem' }}
                          onClick={() => handleApprove(leave._id)}
                        >
                          อนุมัติ
                        </button>
                        <button
                          className="btn btn-danger"
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.875rem' }}
                          onClick={() => handleReject(leave._id)}
                        >
                          ไม่อนุมัติ
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
            <p style={{ fontSize: '1.2rem' }}>ไม่มีคำขอลาในสถานะนี้</p>
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
                  <td><strong>พนักงาน</strong></td>
                  <td>{selectedLeave.user?.name || 'N/A'}</td>
                </tr>
                <tr>
                  <td><strong>เบอร์โทรศัพท์</strong></td>
                  <td>{selectedLeave.user?.telephone || 'N/A'}</td>
                </tr>
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

            {selectedLeave.status === 'pending' && (
              <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                <button 
                  className="btn btn-success"
                  onClick={() => handleApprove(selectedLeave._id)}
                >
                  อนุมัติ
                </button>
                <button 
                  className="btn btn-danger"
                  onClick={() => handleReject(selectedLeave._id)}
                >
                  ไม่อนุมัติ
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => setSelectedLeave(null)}
                >
                  ปิด
                </button>
              </div>
            )}

            {selectedLeave.status !== 'pending' && (
              <button 
                className="btn btn-secondary" 
                style={{ width: '100%', marginTop: '1rem' }}
                onClick={() => setSelectedLeave(null)}
              >
                ปิด
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageLeaves;
