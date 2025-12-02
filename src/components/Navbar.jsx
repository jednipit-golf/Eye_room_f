import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    if (path === '/members') {
      return location.pathname === '/members' || location.pathname.startsWith('/members/');
    }
    return location.pathname === path;
  };

  return (
    <nav className="navbar">
      <h1>📅 ระบบจองวันลา</h1>
      <ul className="nav-links">
        <li><Link to="/" className={isActive('/') ? 'active' : ''}>หน้าหลัก</Link></li>
        <li><Link to="/my-leaves" className={isActive('/my-leaves') ? 'active' : ''}>วันลาของฉัน</Link></li>
        <li><Link to="/new-leave" className={isActive('/new-leave') ? 'active' : ''}>จองวันลา</Link></li>
        {user?.role === 'admin' && (
          <>
            <li><Link to="/manage-leaves" className={isActive('/manage-leaves') ? 'active' : ''}>จัดการคำขอลา</Link></li>
            <li><Link to="/members" className={isActive('/members') ? 'active' : ''}>สมาชิกทั้งหมด</Link></li>
          </>
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
