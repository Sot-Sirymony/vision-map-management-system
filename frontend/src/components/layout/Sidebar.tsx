import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/vision-areas', label: 'Vision Areas' },
  { to: '/dreams', label: 'Dreams' },
  { to: '/goals', label: 'Goals' },
  { to: '/steps', label: 'Steps' },
  { to: '/tasks', label: 'Tasks' },
  { to: '/partners', label: 'Partners' },
  { to: '/obstacles', label: 'Obstacles' },
  { to: '/communication', label: 'Communication' },
  { to: '/reviews', label: 'Reviews' },
  { to: '/import-export', label: 'Import / Export' },
];

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark">VM</span>
        <span>Vision Map</span>
      </div>
      <nav className="nav-list" aria-label="Main navigation">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.to === '/'}>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
