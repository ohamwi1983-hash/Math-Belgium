import { Link } from 'react-router-dom'

export function SiteHeader({ breadcrumb }: { breadcrumb?: { label: string; to?: string }[] }) {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link className="brand" to="/">
          Chapitres de maths
        </Link>
        {breadcrumb && (
          <nav className="breadcrumb">
            {breadcrumb.map((crumb, i) => (
              <span key={i}>
                {i > 0 && ' / '}
                {crumb.to ? <Link to={crumb.to}>{crumb.label}</Link> : crumb.label}
              </span>
            ))}
          </nav>
        )}
      </div>
    </header>
  )
}
