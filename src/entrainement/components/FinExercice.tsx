import { useEffect, useRef, useState, type RefObject } from 'react'
import { Link } from 'react-router-dom'
import { competencesGenerateur, NOM_COMPETENCE, type Competence } from '../../lib/competencesGenerateur'
import { EXPLICATION_COMPETENCE, bilanExercice, tonBilan } from '../../lib/guideEleve'
import { estClos, type StoreCadre } from './cadreGenerateur'
import '../../components/eleve/guideEleve.css'

/** Bouton du générateur qui lance un nouvel exercice (libellés partagés des applis : « Nouvel exercice »…). */
const NOUVEL_EXERCICE = /^\s*(nouvel exercice|nouvel essai|nouvelle question|nouvelle série|nouveau tirage|recommencer|un autre exercice|exercice suivant)/i

function boutonNouvelExercice(racine: HTMLElement): HTMLButtonElement | null {
  const candidats = [...racine.querySelectorAll<HTMLButtonElement>('button')].filter((b) => !b.closest('.ge-fin-ex') && !b.disabled && b.getClientRects().length > 0 && NOUVEL_EXERCICE.test(b.textContent ?? ''))
  return candidats.find((b) => b.getAttribute('data-barre') === 'principal') ?? candidats[candidats.length - 1] ?? null
}

const COULEUR_ECRAN: Record<string, string> = { o: 'var(--good)', a: 'var(--attn)', r: 'var(--bad)' }
const MOT_ECRAN: Record<string, string> = { o: 'juste du premier coup', a: 'juste avec une aide', r: 'réponse révélée' }

/**
 * Fin d'exercice des générateurs (maquette « fin-exercice » du 27/11/2026), au point commun de la page d'un
 * générateur (`EntrainementPage`) — jamais générateur par générateur : elle apparaît sous l'exercice quand
 * « Ma progression » note un essai (tous les écrans clos, `observerProgression`), et disparaît dès qu'un
 * nouvel exercice commence (puces publiées remises à zéro, ou bouton « Nouvel exercice » du générateur).
 * « Question n sur N · étape k », bilan en une phrase (`bilanExercice`), trois choix (Un autre exercice —
 * le bouton du générateur, sinon l'appli remontée —, Revoir le cours de l'étape, Voir ma progression),
 * pastilles de compétence qui s'expliquent en une ligne au toucher. `SelecteurVarianteDev` et l'appli ne
 * sont jamais touchés.
 */
export function FinExercice({
  ecrans,
  fermer,
  racineRef,
  store,
  generatorId,
  titre,
  etape,
  lienCours,
  lienProgression,
  relancer,
}: {
  ecrans: string
  fermer: () => void
  racineRef: RefObject<HTMLDivElement | null>
  store: StoreCadre
  generatorId: string
  titre: string
  /** Numéro de l'étape du cours qui propose ce générateur (`null` : quiz de fin de chapitre). */
  etape: number | null
  lienCours: string
  lienProgression: string
  /** Remonte l'appli (aucun bouton « Nouvel exercice » trouvé). */
  relancer: () => void
}) {
  const [explique, setExplique] = useState<Competence | null>(null)
  const carte = useRef<HTMLElement>(null)
  const competences = competencesGenerateur(generatorId, titre)
  const ton = tonBilan(ecrans)

  // Un nouvel exercice commence (aucun écran clos dans les puces publiées) : la carte s'en va.
  useEffect(() => {
    let avant = store.lire().segments
    return store.abonner(() => {
      const s = store.lire().segments
      if (s && s !== avant && s.length > 0 && !s.some(estClos)) fermer()
      avant = s
    })
  }, [store, fermer])

  // Bouton « Nouvel exercice » du générateur touché directement : la carte s'en va aussi.
  useEffect(() => {
    const racine = racineRef.current
    if (!racine) return
    const clic = (e: MouseEvent) => {
      const b = e.target instanceof Element ? e.target.closest('button') : null
      if (b && !b.closest('.ge-fin-ex') && NOUVEL_EXERCICE.test(b.textContent ?? '')) fermer()
    }
    racine.addEventListener('click', clic, true)
    return () => racine.removeEventListener('click', clic, true)
  }, [racineRef, fermer])

  function unAutre() {
    const racine = racineRef.current
    const bouton = racine ? boutonNouvelExercice(racine) : null
    fermer()
    if (bouton) bouton.click()
    else relancer()
    window.scrollTo({ top: 0 })
  }

  const n = ecrans.length
  return (
    <section ref={carte} className="ge-fin-ex no-export" aria-labelledby="ge-fin-ex-titre" data-fin-exercice="">
      <div className="ge-fin-ex-tete">
        <p className="ge-fin-ex-repere">
          {n > 1 ? `Question ${n} sur ${n}` : 'Exercice'}
          {etape ? ` · étape ${etape}` : ''}
        </p>
        {competences.length > 0 && (
          <div className="ge-pastilles">
            {competences.map((c) => (
              <button
                key={c}
                type="button"
                className="ge-pastille-bouton"
                aria-expanded={explique === c}
                aria-controls="ge-fin-ex-explication"
                aria-label={`Compétence ${c} : ${NOM_COMPETENCE[c]} — qu’est-ce que c’est ?`}
                onClick={() => setExplique((e) => (e === c ? null : c))}
              >
                <span className={`pastille-competence pastille-competence-${c}`} aria-hidden="true">
                  <span className="pastille-competence-num">{c}</span>
                  {NOM_COMPETENCE[c]}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="ge-fin-ex-puces" role="img" aria-label={[...ecrans].map((x, i) => `question ${i + 1} : ${MOT_ECRAN[x]}`).join(', ')}>
        {[...ecrans].map((x, i) => (
          <span key={i} style={{ background: COULEUR_ECRAN[x] }} />
        ))}
      </div>
      <div className="ge-fin-ex-carte" role="status">
        <span className="ge-fin-ex-emoji" aria-hidden="true">
          {ton === 'bien' ? '👏' : ton === 'aide' ? '👍' : '💪'}
        </span>
        <h2 id="ge-fin-ex-titre">Exercice terminé</h2>
        <p>{bilanExercice(ecrans)}</p>
      </div>
      <button type="button" className="ge-bouton-plein" onClick={unAutre}>
        Un autre exercice
      </button>
      <Link className="ge-bouton-contour" to={lienCours}>
        {etape ? `Revoir le cours de l’étape ${etape}` : 'Revoir le cours du chapitre'}
      </Link>
      <Link className="ge-bouton-contour" to={lienProgression}>
        Voir ma progression
      </Link>
      {explique ? (
        <p className="ge-explication" id="ge-fin-ex-explication" aria-live="polite">
          <strong>« {NOM_COMPETENCE[explique]} »</strong>, {EXPLICATION_COMPETENCE[explique]}
        </p>
      ) : (
        competences.length > 0 && (
          <p className="ge-fin-ex-repere" id="ge-fin-ex-explication" aria-live="polite">
            Touche une pastille pour savoir ce qu’elle veut dire.
          </p>
        )
      )}
    </section>
  )
}
