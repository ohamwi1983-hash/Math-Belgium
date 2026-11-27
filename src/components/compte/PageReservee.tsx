import type { ReactNode } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { SiteHeader } from '../SiteHeader'
import { useCompte } from '../../lib/compteContexte'
import { usePageNonIndexee } from '../../lib/useDocumentMeta'

/** Cadre commun des pages de compte : en-tête du site, titre, page non indexée. `sansTete` : la
 * page affiche elle-même son titre (`<h1>`, ex. bandeau de « Mon profil » ; `EnTeteCompte` en repli). */
export function PageCompte({ titre, surtitre = 'Espace professeur', large = false, sansTete = false, children }: { titre: string; surtitre?: string; large?: boolean; sansTete?: boolean; children: ReactNode }) {
  usePageNonIndexee(titre)
  return (
    <>
      <SiteHeader />
      <main className={large ? 'page-tool' : 'page-compte'}>
        {!sansTete && <EnTeteCompte titre={titre} surtitre={surtitre} />}
        {children}
      </main>
    </>
  )
}

/** Titre standard d'une page de compte (surtitre + `<h1>`). */
export function EnTeteCompte({ titre, surtitre = 'Espace professeur' }: { titre: string; surtitre?: string }) {
  return (
    <header className="chapter-head compte-tete">
      <p className="eyebrow">{surtitre}</p>
      <h1 className="chapter-title">{titre}</h1>
    </header>
  )
}

/** « Connexion indisponible (configuration manquante) » — Supabase non configuré. */
export function MessageIndisponible() {
  return (
    <div className="compte-encadre" role="status">
      <p>
        <strong>Connexion indisponible (configuration manquante).</strong>
      </p>
      <p>
        Les comptes professeurs ne sont pas encore activés sur ce site. Les cours et les générateurs d'exercices restent accessibles depuis{' '}
        <Link to="/">l'accueil</Link>.
      </p>
    </div>
  )
}

export function MessageChargement() {
  return (
    <p className="compte-chargement" role="status" aria-live="polite">
      Chargement du compte…
    </p>
  )
}

/**
 * Garde d'une page réservée aux professeurs connectés (panneau de conception, profil, coffre,
 * administration). Sans session : redirection vers `/connexion?retour=<page demandée>`.
 * `admin` : réservée en plus à `profils.est_admin`.
 */
export function PageReservee({ children, admin = false }: { children: ReactNode; admin?: boolean }) {
  const compte = useCompte({ demarrer: true })
  const location = useLocation()
  if (compte.etat === 'indisponible') return <MessageIndisponible />
  if (compte.etat === 'inactif' || compte.etat === 'chargement') return <MessageChargement />
  if (compte.etat === 'anonyme') return <Navigate to={`/connexion?retour=${encodeURIComponent(location.pathname + location.search)}`} replace />
  if (!compte.profil) {
    return compte.erreurProfil ? (
      <div className="compte-encadre compte-erreur" role="alert">
        <p>{compte.erreurProfil}</p>
        <p>
          <button type="button" className="compte-bouton-secondaire" onClick={() => void compte.rafraichir()}>
            Réessayer
          </button>{' '}
          <button type="button" className="compte-bouton-secondaire" onClick={() => void compte.seDeconnecter()}>
            Se déconnecter
          </button>
        </p>
      </div>
    ) : (
      <MessageChargement />
    )
  }
  if (!compte.profil.actif) {
    return (
      <div className="compte-encadre compte-erreur" role="alert">
        <p>
          <strong>Compte désactivé.</strong> Ton compte a été désactivé par l'administrateur du site : tes enregistrements sont conservés mais inaccessibles. Contacte-le pour le
          réactiver.
        </p>
        <p>
          <button type="button" className="compte-bouton-secondaire" onClick={() => void compte.seDeconnecter()}>
            Se déconnecter
          </button>
        </p>
      </div>
    )
  }
  if (admin && !compte.profil.est_admin) {
    return (
      <div className="compte-encadre compte-erreur" role="alert">
        <p>Page réservée à l'administrateur du site.</p>
        <p>
          <Link to="/espace">Retour au tableau de bord</Link>
        </p>
      </div>
    )
  }
  return <>{children}</>
}
