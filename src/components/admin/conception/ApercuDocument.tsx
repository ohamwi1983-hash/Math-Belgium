import { useEffect, useRef, useState } from 'react'
import type { DocumentGenere } from '../../../lib/evaluationLocal'

/** Largeur de mise en page des documents (viewport `width=820` des documents générés). */
const LARGEUR_DOCUMENT = 820

/**
 * Aperçu du VRAI document (même pipeline que « Générer » : `construirePlan` puis
 * `genererDocumentsDepuisPlan`), dans une fenêtre par-dessus la page — rien n'est enregistré dans
 * l'historique tant que le professeur ne garde pas ce tirage. Le document (page A4 de 21 cm) est
 * affiché à sa largeur réelle puis réduit à la largeur de la fenêtre (téléphone compris).
 */
export function ApercuDocument({
  titre,
  documents,
  enCours,
  erreur,
  onFermer,
  onAutreTirage,
  onGarder,
}: {
  titre: string
  documents: DocumentGenere[]
  enCours: boolean
  erreur: string | null
  onFermer: () => void
  onAutreTirage: () => void
  onGarder: () => void
}) {
  const [choisi, setChoisi] = useState(0)
  const doc = documents[Math.min(choisi, documents.length - 1)]
  // URL créée et révoquée par le même effet (le double montage du mode strict ne la révoque pas
  // sous les pieds de l'iframe).
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    if (!doc) {
      setUrl(null)
      return
    }
    const u = URL.createObjectURL(doc.blob)
    setUrl(u)
    return () => URL.revokeObjectURL(u)
  }, [doc])

  const cadre = useRef<HTMLDivElement>(null)
  const [mesure, setMesure] = useState({ largeur: LARGEUR_DOCUMENT, hauteur: 600 })
  useEffect(() => {
    const el = cadre.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const obs = new ResizeObserver(([e]) => setMesure({ largeur: e.contentRect.width, hauteur: e.contentRect.height }))
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  const echelle = Math.min(1, mesure.largeur / LARGEUR_DOCUMENT)

  // Fermeture au clavier (Échap) et focus sur la fenêtre à l'ouverture.
  const fenetre = useRef<HTMLDivElement>(null)
  useEffect(() => {
    fenetre.current?.focus()
    const touche = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onFermer()
    }
    document.addEventListener('keydown', touche)
    const ancien = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', touche)
      document.body.style.overflow = ancien
    }
  }, [onFermer])

  return (
    <div className="conc-apercu-fond" onClick={(e) => e.target === e.currentTarget && onFermer()}>
      <div className="conc-apercu" role="dialog" aria-modal="true" aria-labelledby="conc-apercu-titre" tabIndex={-1} ref={fenetre}>
        <div className="conc-apercu-tete">
          <h2 id="conc-apercu-titre">Aperçu — {titre}</h2>
          <button type="button" className="conc-bouton conc-bouton-discret" onClick={onFermer}>
            Fermer
          </button>
        </div>
        {documents.length > 1 && (
          <div className="conc-apercu-docs" role="group" aria-label="Document affiché">
            {documents.map((d, i) => (
              <button key={d.suffixe} type="button" className="conc-puce" aria-pressed={i === choisi} onClick={() => setChoisi(i)}>
                {d.libelle}
              </button>
            ))}
          </div>
        )}
        <div className="conc-apercu-cadre" ref={cadre}>
          {enCours && <p className="conc-apercu-attente">Tirage en cours…</p>}
          {!enCours && erreur && <p className="conc-apercu-attente admin-gate-error">{erreur}</p>}
          {!enCours && !erreur && url && (
            <iframe
              key={url}
              title={`Aperçu : ${doc?.libelle ?? ''}`}
              src={url}
              className="conc-apercu-page"
              style={{ width: LARGEUR_DOCUMENT, height: mesure.hauteur / echelle, left: Math.max(0, (mesure.largeur - LARGEUR_DOCUMENT * echelle) / 2), transform: `scale(${echelle})` }}
            />
          )}
        </div>
        <div className="conc-apercu-pied">
          <span className="conc-apercu-note">Aperçu : rien n'est enregistré dans l'historique.</span>
          <button type="button" className="conc-bouton" onClick={onAutreTirage} disabled={enCours}>
            Autre tirage
          </button>
          <button type="button" className="conc-bouton conc-bouton-principal" onClick={onGarder} disabled={enCours || !!erreur || documents.length === 0}>
            Garder ce tirage
          </button>
        </div>
      </div>
    </div>
  )
}
