import { useEffect, useId, useRef } from 'react'
import { RichText } from '../Math'
import { InteractiveWidget } from './InteractiveWidget'
import { LecteurVideo, titreAtelier } from './ContenuEtape'
import type { Panneau } from './ContenuEtape'
import { Icone } from './Icones'

/**
 * Atelier (ou vidéo) ouvert par-dessus l'étape : plein écran sur téléphone, grand panneau centré
 * sur ordinateur. `<dialog>` natif ouvert par `showModal()` : le reste de la page devient inerte
 * (focus piégé par le navigateur), Échap ferme, le focus revient au bouton d'ouverture. La page
 * dessous ne défile plus (`html.panneau-ouvert`) ; dans l'atelier, les figures ne font pas défiler
 * le panneau (`figuresTactiles`, voir `InteractiveWidget`) : le doigt déplace les flèches.
 * Le widget n'est monté qu'à l'ouverture, et démonté à la fermeture.
 */
export function PanneauModal({ panneau, fermer }: { panneau: Panneau | null; fermer: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  const titreId = useId()
  const retourFocus = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (panneau && !d.open) {
      retourFocus.current = document.activeElement as HTMLElement | null
      document.documentElement.classList.add('panneau-ouvert')
      try {
        d.showModal()
      } catch {
        d.setAttribute('open', '')
      }
    } else if (!panneau && d.open) {
      d.close()
    }
  }, [panneau])

  useEffect(() => () => document.documentElement.classList.remove('panneau-ouvert'), [])

  function surFermeture() {
    document.documentElement.classList.remove('panneau-ouvert')
    fermer()
    const el = retourFocus.current
    if (el && el.isConnected) requestAnimationFrame(() => el.focus({ preventScroll: true }))
  }

  const titre = panneau ? (panneau.type === 'atelier' ? titreAtelier(panneau.bloc) : panneau.bloc.title) : ''

  return (
    <dialog
      ref={ref}
      className={`panneau-modal no-export${panneau?.type === 'video' ? ' panneau-video' : ''}`}
      aria-labelledby={titreId}
      onClose={surFermeture}
      onClick={(e) => {
        // Clic sur le fond (hors du contenu) : ferme.
        if (e.target === e.currentTarget) ref.current?.close()
      }}
    >
      {panneau && (
        <div className="panneau-contenu">
          <div className="panneau-entete">
            <span className="panneau-type">
              <Icone nom={panneau.type === 'atelier' ? 'main' : 'lecture'} taille={16} />
              <span className="sr-only">{panneau.type === 'atelier' ? 'Atelier : ' : 'Vidéo : '}</span>
            </span>
            <h2 id={titreId}>{titre}</h2>
            <button type="button" className="panneau-fermer" onClick={() => ref.current?.close()}>
              Fermer <span aria-hidden="true">✕</span>
            </button>
          </div>
          <div className="panneau-corps">
            {panneau.type === 'atelier' ? (
              <>
                <InteractiveWidget tag={panneau.bloc.tag} figuresTactiles panneau />
                {panneau.bloc.caption && (
                  <p className="panneau-legende">
                    <RichText text={panneau.bloc.caption} />
                  </p>
                )}
              </>
            ) : (
              <LecteurVideo bloc={panneau.bloc} />
            )}
          </div>
        </div>
      )}
    </dialog>
  )
}
