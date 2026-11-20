import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useCompte } from '../../lib/compteContexte'

/**
 * Lien « Se connecter » / menu « Mon compte » discret, à droite de l'en-tête du site. Rien du tout
 * quand Supabase n'est pas configuré (pages publiques inchangées). Ne charge pas supabase-js : sur
 * une page de cours, le menu s'affiche d'après la présence d'une session stockée.
 */
export function MenuCompte() {
  const compte = useCompte()
  const location = useLocation()
  const navigate = useNavigate()
  const [ouvert, setOuvert] = useState(false)
  const racine = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ouvert) return
    const fermer = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === 'Escape' : !racine.current?.contains(e.target as Node)) setOuvert(false)
    }
    document.addEventListener('mousedown', fermer)
    document.addEventListener('keydown', fermer)
    return () => {
      document.removeEventListener('mousedown', fermer)
      document.removeEventListener('keydown', fermer)
    }
  }, [ouvert])

  useEffect(() => setOuvert(false), [location.pathname])

  if (compte.etat === 'indisponible') return null
  const pagesCompte = ['/connexion', '/inscription', '/mot-de-passe']
  if (compte.etat === 'anonyme' || compte.etat === 'inactif') {
    if (pagesCompte.includes(location.pathname)) return null
    const retour = location.pathname === '/' ? '' : `?retour=${encodeURIComponent(location.pathname)}`
    return (
      <Link className="menu-compte-lien" to={`/connexion${retour}`}>
        Se connecter
      </Link>
    )
  }

  const admin = compte.profil?.est_admin === true
  return (
    <div className="menu-compte" ref={racine}>
      <button type="button" className="menu-compte-bouton" aria-expanded={ouvert} aria-haspopup="true" onClick={() => setOuvert((o) => !o)}>
        Mon compte <span aria-hidden="true">▾</span>
      </button>
      {ouvert && (
        <div className="menu-compte-liste">
          {compte.profil && <p className="menu-compte-nom">{compte.profil.nom_affiche}</p>}
          <Link to="/exercice">Feuilles d'exercices</Link>
          <Link to="/evaluation">Évaluations et examens</Link>
          <Link to="/coffre">Mon coffre</Link>
          <Link to="/carnet">Carnet de matière vue</Link>
          <Link to="/profil">Mon profil</Link>
          {admin && <Link to="/admin">Administration</Link>}
          <button
            type="button"
            onClick={() => {
              setOuvert(false)
              void compte.seDeconnecter().then(() => navigate('/'))
            }}
            disabled={!compte.client}
          >
            Se déconnecter
          </button>
        </div>
      )}
    </div>
  )
}
