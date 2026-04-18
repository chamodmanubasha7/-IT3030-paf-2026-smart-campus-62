import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/MockAuthContext';
import { Wrench } from 'lucide-react';

const Navbar = () => {
  const { role, userName, switchRole } = useAuth();

  return (
    <nav className="navbar">
      <Link to="/" className="flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
        <Wrench color="var(--primary-color)" />
        <h2>IncidentTicketing</h2>
      </Link>
      
      <div className="nav-links">
        <Link to="/">Dashboard</Link>
        {role === 'USER' && <Link to="/new">New Ticket</Link>}
        
        <div className="role-switcher">
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Mock Role:</span>
          <select 
            value={role} 
            onChange={(e) => switchRole(e.target.value)}
            className="form-select"
            style={{ padding: '0.25rem', width: 'auto', background: 'transparent' }}
          >
            <option value="USER">User (Submitter)</option>
            <option value="TECHNICIAN">Technician</option>
            <option value="ADMIN">Admin</option>
          </select>
          <span className={`badge badge-role`}>{userName}</span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
