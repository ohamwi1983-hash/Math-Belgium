import { Link } from 'react-router-dom'
import { MenuCompte } from './compte/MenuCompte'
import { RechercheSite } from './RechercheSite'
import { supabaseConfigure } from '../lib/supabase'

/** En-tête du site : marque, fil d'Ariane, recherche (chapitres, étapes, sous-titres —
 * `RechercheSite`), puis « Je suis professeur » / « Mon compte » (`MenuCompte`). */
export function SiteHeader({ breadcrumb }: { breadcrumb?: { label: string; to?: string }[] }) {
  // Comptes professeurs : lien « Je suis professeur » / menu « Mon compte » seulement si Supabase est
  // configuré — sinon aucun lien de compte (pages publiques inchangées).
  const avecCompte = supabaseConfigure()
  return (
    <header className="site-header">
      <div className={`site-header-inner${breadcrumb ? ' avec-fil' : ''}`}>
        <Link className="brand" to="/">
          Chapitres de maths
        </Link>
        {breadcrumb && (
          <nav className="breadcrumb" aria-label="Fil d'Ariane">
            {breadcrumb.map((crumb, i) => (
              <span key={i}>
                {i > 0 && ' / '}
                {crumb.to ? <Link to={crumb.to}>{crumb.label}</Link> : crumb.label}
              </span>
            ))}
          </nav>
        )}
        <RechercheSite />
        {avecCompte && <MenuCompte />}
      </div>
    </header>
  )
}
