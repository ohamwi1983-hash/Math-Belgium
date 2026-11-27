import { useId, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { SiteHeader } from '../SiteHeader'
import { usePageNonIndexee } from '../../lib/useDocumentMeta'
import { BandeauEspace } from './BandeauEspace'
import './acces.css'

/**
 * Cadre des pages d'accès à l'espace professeur — `/connexion` (et « mot de passe oublié »),
 * `/inscription`, `/mot-de-passe` (maquettes du 22/11/2026) : en-tête du site, bandeau sombre
 * « ESPACE PROFESSEUR » (`BandeauEspace` : pastille avec une icône, `<h1>`, sous-titre éventuel), puis
 * le contenu dans une carte blanche. `eleve` : phrase « Tu es élève ? Pas besoin de compte… » sous le
 * bandeau. Ordinateur (≥ 860 px) : bandeau (+ phrase de présentation) à gauche, carte à droite.
 * Page non indexée, comme avant (`usePageNonIndexee`).
 */
export function PageAcces({ titre, icone, sousTitre, eleve = false, children }: { titre: string; icone: ReactNode; sousTitre?: ReactNode; eleve?: boolean; children: ReactNode }) {
  usePageNonIndexee(titre)
  const id = useId()
  return (
    <>
      <SiteHeader />
      <main className="page-acces">
        <div className="acces-cote">
          <BandeauEspace
            titreId={`${id}-titre`}
            titre={titre}
            icone={icone}
            classe="acces-bandeau"
            classeIcone="acces-bandeau-icone"
            apresTitre={
              <>
                {sousTitre && <p className="acces-sous-titre">{sousTitre}</p>}
                <p className="acces-presentation">Prépare tes feuilles, évaluations et examens, range-les dans tes documents et tiens le journal de tes classes.</p>
              </>
            }
          />
          {eleve && (
            <p className="acces-eleve">
              Tu es élève ? Pas besoin de compte : les cours et les exercices sont ouverts à tous. <Link to="/">Retour aux chapitres</Link>
            </p>
          )}
        </div>
        <div className="acces-carte">{children}</div>
      </main>
    </>
  )
}

/** Message de réussite ou d'erreur dans la carte : pastille verte (✓) ou rouge (!), titre, texte. */
export function MessageAcces({ ton, titre, role, children }: { ton: 'succes' | 'erreur'; titre: string; role: 'status' | 'alert'; children: ReactNode }) {
  return (
    <div className={`acces-message ${ton}`} role={role}>
      <span className="acces-message-pastille" aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" focusable="false">
          {ton === 'succes' ? <path d="M5 12l5 5 9-10" /> : <path d="M12 7v6M12 17h.01" />}
        </svg>
      </span>
      <div className="acces-message-texte">
        <p className="acces-message-titre">{titre}</p>
        {children}
      </div>
    </div>
  )
}
