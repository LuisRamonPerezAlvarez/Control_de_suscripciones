import { NavLink } from 'react-router-dom';
import { DashboardIcon, SubscriptionsIcon, ServicesIcon, MoneyIcon } from '../../icons';

const navItems = [
  { to: '/', label: 'Dashboard', icon: DashboardIcon },
  { to: '/suscripciones', label: 'Suscripciones', icon: SubscriptionsIcon },
  { to: '/servicios', label: 'Servicios', icon: ServicesIcon },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <span className="sidebar__logo"><MoneyIcon /></span>
        <div>
          <h1 className="sidebar__title">Control de</h1>
          <p className="sidebar__subtitle">Suscripciones</p>
        </div>
      </div>
      <nav className="sidebar__nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
              }
            >
              <span className="sidebar__icon"><Icon /></span>
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
