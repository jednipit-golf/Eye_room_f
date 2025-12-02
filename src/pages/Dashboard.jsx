import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { leaveAPI } from '../api';

function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, leavesRes] = await Promise.all([
        leaveAPI.getStats(),
        leaveAPI.getMyLeaves()
      ]);
      
      setStats(statsRes.data.data);
      setRecentLeaves(leavesRes.data.data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
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
      <h1 style={{ marginBottom: '2rem' }}>
        ยินดีต้อนรับ, {user?.name}
      </h1>

      {/* สถิติวันลา */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>วันลาที่ใช้ไปแล้ว (ปีนี้)</h3>
          <div className="value" style={{ color: '#3498db' }}>
            {stats?.totalDays || 0} วัน
          </div>
        </div>
        <div className="stat-card">
          <h3>จำนวนครั้งที่ลา (ปีนี้)</h3>
          <div className="value" style={{ color: '#27ae60' }}>
            {stats?.totalLeaves || 0} ครั้ง
          </div>
        </div>
      </div>

      {/* ข้อมูลผู้ใช้ */}
      <div className="card">
        <h2>ข้อมูลของฉัน</h2>
        <table className="table">
          <tbody>
            <tr>
              <td><strong>ชื่อ</strong></td>
              <td>{user?.name}</td>
            </tr>
            <tr>
              <td><strong>เบอร์โทรศัพท์</strong></td>
              <td>{user?.telephone}</td>
            </tr>
            <tr>
              <td><strong>สิทธิ์</strong></td>
              <td>
                {user?.role === 'system-admin' && '⚡ System Admin'}
                {user?.role === 'admin' && '👑 ผู้ดูแลระบบ'}
                {user?.role === 'user' && '👤 ผู้ใช้งาน'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* คำขอลาล่าสุด */}
      <div className="card">
        <h2>คำขอลาล่าสุด</h2>
        {recentLeaves.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>วันที่เริ่ม</th>
                <th>จำนวนวัน</th>
                <th>เหตุผล</th>
                <th>สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {recentLeaves.map((leave) => (
                <tr key={leave._id}>
                  <td data-label="วันที่เริ่ม">{leave.formattedStartDate || new Date(leave.startDate).toLocaleDateString('th-TH')}</td>
                  <td data-label="จำนวนวัน">{leave.totalDays} วัน</td>
                  <td data-label="เหตุผล" style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {leave.reason}
                  </td>
                  <td data-label="สถานะ">{getStatusBadge(leave.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
            ยังไม่มีคำขอลา
          </p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
