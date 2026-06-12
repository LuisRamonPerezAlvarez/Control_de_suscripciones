import { Link, useLocation } from 'react-router-dom';

const routeLabels: Record<string, string> = {
  '/': 'Inicio',
  '/suscripciones': 'Suscripciones',
  '/servicios': 'Servicios',
};

export default function Breadcrumbs() {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  const crumbs: { label: string; path: string }[] = [
    { label: 'Inicio', path: '/' },
  ];

  if (pathSegments.length > 0) {
    let currentPath = '';
    for (const segment of pathSegments) {
      currentPath += `/${segment}`;
      const label = routeLabels[currentPath];
      if (label) {
        crumbs.push({ label, path: currentPath });
      }
    }
  }

  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol className="breadcrumbs__list">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <li key={crumb.path} className="breadcrumbs__item">
              {isLast ? (
                <span className="breadcrumbs__current">{crumb.label}</span>
              ) : (
                <>
                  <Link to={crumb.path} className="breadcrumbs__link">
                    {crumb.label}
                  </Link>
                  <span className="breadcrumbs__separator">&gt;</span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
