import { NavLink } from 'react-router-dom';
import { Home, Dumbbell, BarChart3, Settings } from 'lucide-react';
import './Navbar.css';

const navItems = [
  { to: '/', icon: Home, label: 'Accueil' },
  { to: '/salle', icon: Dumbbell, label: 'Ma Salle' },
  { to: '/stats', icon: BarChart3, label: 'Stats' },
  { to: '/settings', icon: Settings, label: 'Options' },
];

export function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `navbar-item ${isActive ? 'navbar-item--active' : ''}`
            }
          >
            <div className="navbar-icon">
              <Icon size={22} strokeWidth={2} />
            </div>
            <span className="navbar-label">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
