import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Wallet, Home, LogIn, GraduationCap } from 'lucide-react';

const Navbar: React.FC = () => {
  return (
    <nav className="navbar">
      <div className="logo">
        <GraduationCap size={32} className="logo-icon" />
        <span>UniSkill</span>
      </div>
      <div className="links">
        <Link to="/">
          <Home size={18} />
          <span>Home</span>
        </Link>
        <Link to="/dashboard">
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </Link>
        <Link to="/wallet">
          <Wallet size={18} />
          <span>Wallet</span>
        </Link>
        <Link to="/login" className="btn btn-primary btn-sm" style={{ padding: '0.5rem 1rem', marginLeft: '2rem' }}>
          <LogIn size={16} />
          <span>Login</span>
        </Link>
      </div>

      <style>{`
        .navbar .logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .logo-icon {
          color: var(--primary);
        }
        .navbar .links {
          display: flex;
          align-items: center;
        }
        .navbar .links a {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          text-decoration: none;
        }
        .navbar .links a span {
          margin-top: 1px;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
