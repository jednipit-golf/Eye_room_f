import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <h1>📅 ระบบจองวันลา</h1>
      <ul className="nav-links">
        <li><Link to="/">หน้าหลัก</Link></li>
        <li><Link to="/my-leaves">วันลาของฉัน</Link></li>
        <li><Link to="/new-leave">จองวันลา</Link></li>
        {user?.role === 'admin' && (
          <li><Link to="/manage-leaves">จัดการคำขอลา</Link></li>
        )}
      </ul>
      <div className="nav-user">
        <span>สวัสดี, {user?.name}</span>
        <button className="btn-logout" onClick={logout}>
          ออกจากระบบ
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
