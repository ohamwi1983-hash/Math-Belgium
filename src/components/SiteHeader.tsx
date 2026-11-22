import { Link } from 'react-router-dom'
import { MenuCompte } from './compte/MenuCompte'
import { RechercheSite } from './RechercheSite'
import { supabaseConfigure } from '../lib/supabase'

/** En-tête du site (bannière claire, maquette « A » du 22/11/2026) : petit logo + marque, recherche
 * (chapitres, étapes, sous-titres — `RechercheSite`), puis « Professeur » / « Mon compte »
 * (`MenuCompte`) ; fil d'Ariane éventuel sous la ligne, discret. */
export function SiteHeader({ breadcrumb }: { breadcrumb?: { label: string; to?: string }[] }) {
  // Comptes professeurs : bouton « Professeur » / menu « Mon compte » seulement si Supabase est
  // configuré — sinon aucun lien de compte (pages publiques inchangées).
  const avecCompte = supabaseConfigure()
  return (
    <header className="site-header">
      <div className={`site-header-inner${breadcrumb ? ' avec-fil' : ''}`}>
        <Link className="brand" to="/">
          <span className="brand-logo" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" focusable="false">
              <path d="M3 19c3 0 4-14 9-14s5 10 9 10" />
            </svg>
          </span>
          <span className="brand-nom">Chapitres de maths</span>
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
