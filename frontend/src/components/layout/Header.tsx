import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Breadcrumbs from './Breadcrumbs';

export default function Header() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div>
        <h2 className="header__title">Panel de control</h2>
        <p className="header__subtitle">Gestiona tus suscripciones y servicios</p>
      </div>
      <div className="header__right">
        <Breadcrumbs />
        <button className="header__logout" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}
