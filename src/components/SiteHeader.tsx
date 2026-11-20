import { Link } from 'react-router-dom'
import { MenuCompte } from './compte/MenuCompte'
import { supabaseConfigure } from '../lib/supabase'

export function SiteHeader({ breadcrumb }: { breadcrumb?: { label: string; to?: string }[] }) {
  // Comptes professeurs : lien « Se connecter » / menu « Mon compte » seulement si Supabase est
  // configuré — sinon l'en-tête est exactement celui d'avant (pages publiques inchangées).
  const avecCompte = supabaseConfigure()
  return (
    <header className="site-header">
      <div className={avecCompte ? 'site-header-inner avec-compte' : 'site-header-inner'}>
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
        {avecCompte && <MenuCompte />}
      </div>
    </header>
  )
}
