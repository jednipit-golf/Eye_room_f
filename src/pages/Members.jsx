import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api';

function Members() {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getAllMembers();
      setMembers(response.data.data);
    } catch (error) {
      setError(error.response?.data?.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const handleMemberClick = (memberId) => {
    navigate(`/members/${memberId}`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear() + 543;
    return `${day}/${month}/${year}`;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'รออนุมัติ', class: 'badge-warning' },
      approved: { label: 'อนุมัติ', class: 'badge-success' },
      rejected: { label: 'ไม่อนุมัติ', class: 'badge-error' }
    };
    const config = statusConfig[status] || { label: status, class: '' };
    return <span className={`badge ${config.class}`}>{config.label}</span>;
  };

  const getRoleBadge = (role) => {
    return role === 'admin' ? (
      <span className="badge" style={{ backgroundColor: '#ff6b6b', color: 'white' }}>ผู้ดูแลระบบ</span>
    ) : (
      <span className="badge" style={{ backgroundColor: '#4dabf7', color: 'white' }}>ผู้ใช้งาน</span>
    );
  };

  const filteredMembers = filterRole === 'all' 
    ? members 
    : members.filter(m => m.role === filterRole);

  if (loading) {
    return <div className="loading">กำลังโหลดข้อมูล...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>รายชื่อสมาชิกทั้งหมด</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className={`btn ${filterRole === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterRole('all')}
            style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
          >
            ทั้งหมด ({members.length})
          </button>
          <button 
            className={`btn ${filterRole === 'user' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterRole('user')}
            style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
          >
            ผู้ใช้งาน ({members.filter(m => m.role === 'user').length})
          </button>
          <button 
            className={`btn ${filterRole === 'admin' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterRole('admin')}
            style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
          >
            ผู้ดูแล ({members.filter(m => m.role === 'admin').length})
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredMembers.length === 0 ? (
          <div className="card">
            <p style={{ textAlign: 'center', color: '#666' }}>ไม่พบข้อมูลสมาชิก</p>
          </div>
        ) : (
          filteredMembers.map((member) => (
            <div 
              key={member.id} 
              className="card"
              onClick={() => handleMemberClick(member.id)}
              style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <h3 style={{ margin: 0 }}>{member.name}</h3>
                    {getRoleBadge(member.role)}
                  </div>
                  <div style={{ color: '#666', fontSize: '0.9rem' }}>
                    <p style={{ margin: '0.25rem 0' }}>📱 {member.telephone}</p>
                    <p style={{ margin: '0.25rem 0' }}>
                      📊 การลาทั้งหมด: {member.stats.total} ครั้ง | 
                      อนุมัติ: {member.stats.approved} ครั้ง ({member.stats.totalDaysApproved} วัน) | 
                      รอพิจารณา: {member.stats.pending} ครั้ง | 
                      ไม่อนุมัติ: {member.stats.rejected} ครั้ง
                    </p>
                  </div>
                </div>
                <div style={{ fontSize: '1.5rem', color: '#666' }}>
                  ▶
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="alert alert-info" style={{ marginTop: '2rem' }}>
        <strong>ข้อมูลสถิติ:</strong>
        <ul style={{ marginTop: '0.5rem', marginLeft: '1.5rem' }}>
          <li>แสดงรายชื่อสมาชิกทั้งหมดในระบบ</li>
          <li>คลิกที่การ์ดสมาชิกเพื่อดูประวัติการลาโดยละเอียด</li>
          <li>แสดงสถิติการลาของแต่ละคน (อนุมัติ, รอพิจารณา, ไม่อนุมัติ)</li>
        </ul>
      </div>
    </div>
  );
}

export default Members;
