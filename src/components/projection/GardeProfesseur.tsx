import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useCompte } from '../../lib/compteContexte'
import './garde.css'

/**
 * Garde du mode « Projeter en classe » (décision de l'utilisateur : réservé au professeur connecté).
 * Même règle que `PageReservee` (`useCompte({ demarrer: true })`, compte actif avec profil lu), mais
 * sans redirection : la page affiche « Connecte-toi pour projeter ce chapitre » avec un lien vers
 * `/connexion?retour=<page demandée>` (retour au même endroit après connexion). Sert au lanceur
 * (`#projeter`), à la page de projection et à la fenêtre des diapos (même navigateur, même session).
 */
export function GardeProfesseur({ retour, children, cadre = (m) => m }: { retour: string; children: ReactNode; cadre?: (message: ReactNode) => ReactNode }) {
  const compte = useCompte({ demarrer: true })
  if (compte.etat === 'inactif' || compte.etat === 'chargement' || (compte.etat === 'connecte' && !compte.profil && !compte.erreurProfil)) {
    return cadre(
      <p className="projection-garde-chargement" role="status" aria-live="polite">
        Chargement du compte…
      </p>,
    )
  }
  if (compte.etat === 'connecte' && compte.profil?.actif) return <>{children}</>
  const desactive = compte.etat === 'connecte' && compte.profil && !compte.profil.actif
  return cadre(
    <div className="projection-garde" role="status">
      <h1>Projeter en classe</h1>
      {compte.etat === 'indisponible' ? (
        <p>Le mode projection est réservé aux professeurs connectés, et la connexion n'est pas disponible sur ce site pour l'instant.</p>
      ) : desactive ? (
        <p>Ton compte professeur a été désactivé par l'administrateur du site : le mode projection n'est pas disponible.</p>
      ) : compte.erreurProfil ? (
        <p>{compte.erreurProfil}</p>
      ) : (
        <>
          <p>
            <strong>Connecte-toi pour projeter ce chapitre.</strong> Le mode projection (diapos, outils, deux écrans, PowerPoint) est réservé aux professeurs.
          </p>
          <Link className="projection-garde-lien" to={`/connexion?retour=${encodeURIComponent(retour)}`}>
            Me connecter
          </Link>
        </>
      )}
    </div>,
  )
}
