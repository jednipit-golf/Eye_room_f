import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { authAPI } from '../api';

function MemberLeaves() {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [member, setMember] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  // ป้องกัน non-admin เข้าถึง
  useEffect(() => {
    if (user && user.role !== 'admin' && user.role !== 'system-admin') {
      alert('คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchMemberData();
  }, [memberId]);

  const fetchMemberData = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getAllMembers();
      const memberData = response.data.data.find(m => m.id === memberId);
      
      if (!memberData) {
        setError('ไม่พบข้อมูลสมาชิก');
        return;
      }
      
      setMember(memberData);
      setLeaves(memberData.leaves);
      setFilteredLeaves(memberData.leaves);
    } catch (error) {
      setError(error.response?.data?.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  // กรองข้อมูลตาม status
  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredLeaves(leaves);
    } else {
      setFilteredLeaves(leaves.filter(leave => leave.status === statusFilter));
    }
  }, [statusFilter, leaves]);

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear() + 543;
    return `${day}/${month}/${year}`;
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'badge-pending',
      approved: 'badge-approved',
      rejected: 'badge-rejected',
      cancelled: 'badge-cancelled'
    };
    const labels = {
      pending: 'รออนุญาต',
      approved: 'อนุญาต',
      rejected: 'ไม่อนุญาต',
      cancelled: 'ยกเลิก'
    };
    return <span className={`badge ${badges[status]}`}>{labels[status]}</span>;
  };

  if (loading) {
    return <div className="loading">กำลังโหลด...</div>;
  }

  if (error) {
    return (
      <div>
        <div className="alert alert-error">{error}</div>
        <button className="btn btn-secondary" onClick={() => navigate('/members')}>
          กลับ
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          className="btn btn-secondary" 
          onClick={() => navigate('/members')}
          style={{ padding: '0.5rem 1rem' }}
        >
          ← กลับ
        </button>
        <h1 style={{ margin: 0 }}>วันลาของ {member?.name}</h1>
      </div>

      {/* ข้อมูลสมาชิก */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>ข้อมูลสมาชิก</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <p style={{ color: '#666', fontSize: '0.875rem', margin: '0 0 0.25rem 0' }}>ชื่อ-นามสกุล</p>
            <p style={{ fontWeight: '500', margin: 0 }}>{member?.name}</p>
          </div>
          <div>
            <p style={{ color: '#666', fontSize: '0.875rem', margin: '0 0 0.25rem 0' }}>เบอร์โทรศัพท์</p>
            <p style={{ fontWeight: '500', margin: 0 }}>{member?.telephone}</p>
          </div>
          <div>
            <p style={{ color: '#666', fontSize: '0.875rem', margin: '0 0 0.25rem 0' }}>บทบาท</p>
            <p style={{ fontWeight: '500', margin: 0 }}>
              {member?.role === 'admin' ? (
                <span className="badge" style={{ backgroundColor: '#ff6b6b', color: 'white' }}>ผู้ดูแลระบบ</span>
              ) : (
                <span className="badge" style={{ backgroundColor: '#4dabf7', color: 'white' }}>ผู้ใช้งาน</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* สถิติการลา */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>สถิติการลา</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
          <div 
            style={{ 
              textAlign: 'center', 
              padding: '1rem', 
              backgroundColor: statusFilter === 'all' ? '#e9ecef' : '#f8f9fa', 
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              border: statusFilter === 'all' ? '2px solid #495057' : '2px solid transparent'
            }}
            onClick={() => handleStatusFilter('all')}
            onMouseEnter={(e) => {
              if (statusFilter !== 'all') e.currentTarget.style.backgroundColor = '#e9ecef';
            }}
            onMouseLeave={(e) => {
              if (statusFilter !== 'all') e.currentTarget.style.backgroundColor = '#f8f9fa';
            }}
          >
            <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0 0 0.5rem 0', color: '#495057' }}>
              {member?.stats.total}
            </p>
            <p style={{ margin: 0, color: '#666' }}>ครั้งทั้งหมด</p>
          </div>
          <div 
            style={{ 
              textAlign: 'center', 
              padding: '1rem', 
              backgroundColor: statusFilter === 'approved' ? '#c3fae8' : '#d3f9d8', 
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              border: statusFilter === 'approved' ? '2px solid #2b8a3e' : '2px solid transparent'
            }}
            onClick={() => handleStatusFilter('approved')}
            onMouseEnter={(e) => {
              if (statusFilter !== 'approved') e.currentTarget.style.backgroundColor = '#c3fae8';
            }}
            onMouseLeave={(e) => {
              if (statusFilter !== 'approved') e.currentTarget.style.backgroundColor = '#d3f9d8';
            }}
          >
            <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0 0 0.5rem 0', color: '#2b8a3e' }}>
              {member?.stats.approved}
            </p>
            <p style={{ margin: 0, color: '#2b8a3e' }}>อนุญาต</p>
          </div>
          <div 
            style={{ 
              textAlign: 'center', 
              padding: '1rem', 
              backgroundColor: statusFilter === 'pending' ? '#ffe066' : '#fff3bf', 
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              border: statusFilter === 'pending' ? '2px solid #e67700' : '2px solid transparent'
            }}
            onClick={() => handleStatusFilter('pending')}
            onMouseEnter={(e) => {
              if (statusFilter !== 'pending') e.currentTarget.style.backgroundColor = '#ffe066';
            }}
            onMouseLeave={(e) => {
              if (statusFilter !== 'pending') e.currentTarget.style.backgroundColor = '#fff3bf';
            }}
          >
            <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0 0 0.5rem 0', color: '#e67700' }}>
              {member?.stats.pending}
            </p>
            <p style={{ margin: 0, color: '#e67700' }}>รอพิจารณา</p>
          </div>
          <div 
            style={{ 
              textAlign: 'center', 
              padding: '1rem', 
              backgroundColor: statusFilter === 'rejected' ? '#ffc9c9' : '#ffe0e0', 
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              border: statusFilter === 'rejected' ? '2px solid #c92a2a' : '2px solid transparent'
            }}
            onClick={() => handleStatusFilter('rejected')}
            onMouseEnter={(e) => {
              if (statusFilter !== 'rejected') e.currentTarget.style.backgroundColor = '#ffc9c9';
            }}
            onMouseLeave={(e) => {
              if (statusFilter !== 'rejected') e.currentTarget.style.backgroundColor = '#ffe0e0';
            }}
          >
            <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0 0 0.5rem 0', color: '#c92a2a' }}>
              {member?.stats.rejected}
            </p>
            <p style={{ margin: 0, color: '#c92a2a' }}>ไม่อนุญาต</p>
          </div>
          <div 
            style={{ 
              textAlign: 'center', 
              padding: '1rem', 
              backgroundColor: statusFilter === 'totalDays' ? '#a5d8ff' : '#e7f5ff', 
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              border: statusFilter === 'totalDays' ? '2px solid #1971c2' : '2px solid transparent'
            }}
            onClick={() => handleStatusFilter('approved')}
            onMouseEnter={(e) => {
              if (statusFilter !== 'totalDays') e.currentTarget.style.backgroundColor = '#a5d8ff';
            }}
            onMouseLeave={(e) => {
              if (statusFilter !== 'totalDays') e.currentTarget.style.backgroundColor = '#e7f5ff';
            }}
          >
            <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0 0 0.5rem 0', color: '#1971c2' }}>
              {member?.stats.totalDaysApproved}
            </p>
            <p style={{ margin: 0, color: '#1971c2' }}>วันที่อนุญาต</p>
          </div>
        </div>
      </div>

      {/* ตารางวันลา */}
      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>
          ประวัติการลา ({filteredLeaves.length} รายการ
          {statusFilter !== 'all' && ` - ${
            statusFilter === 'approved' ? 'อนุญาต' :
            statusFilter === 'pending' ? 'รอพิจารณา' :
            statusFilter === 'rejected' ? 'ไม่อนุญาต' : ''
          }`})
        </h3>
        {filteredLeaves.length > 0 ? (
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
              {filteredLeaves.map((leave) => (
                <tr key={leave._id}>
                  <td data-label="วันที่เริ่ม">{formatDate(leave.startDate)}</td>
                  <td data-label="จำนวนวัน">{leave.totalDays} วัน</td>
                  <td data-label="เหตุผล" style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {leave.reason}
                  </td>
                  <td data-label="สถานะ">{getStatusBadge(leave.status)}</td>
                  <td data-label="การจัดการ">
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.875rem' }}
                      onClick={() => setSelectedLeave(leave)}
                    >
                      ดูรายละเอียด
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
            <p style={{ fontSize: '1.2rem' }}>
              {statusFilter === 'all' ? 'ยังไม่มีประวัติการลา' : `ไม่มีประวัติการลา${
                statusFilter === 'approved' ? 'ที่อนุญาต' :
                statusFilter === 'pending' ? 'ที่รอพิจารณา' :
                statusFilter === 'rejected' ? 'ที่ไม่อนุญาต' : ''
              }`}
            </p>
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
                  <td>{formatDate(selectedLeave.startDate)}</td>
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
                    <td><strong>ผู้พิจารณา</strong></td>
                    <td>{selectedLeave.approvedBy.name}</td>
                  </tr>
                )}
                {selectedLeave.approvedDate && (
                  <tr>
                    <td><strong>วันที่พิจารณา</strong></td>
                    <td>{formatDate(selectedLeave.approvedDate)}</td>
                  </tr>
                )}
                <tr>
                  <td><strong>วันที่ส่งคำขอ</strong></td>
                  <td>{formatDate(selectedLeave.createdAt)}</td>
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

export default MemberLeaves;
