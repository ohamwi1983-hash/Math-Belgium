import { useEffect, useId, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { useLocation } from 'react-router-dom'
import type { ChapterContent, MotDuCours } from '../../content/types'
import { RichText } from '../Math'
import { SansMotsDuCours, abonnerMotOuvert, fermerMot, motOuvert } from '../motsDuCoursContexte'
import { lexiqueAlphabetique } from '../../lib/motsDuCours'
import { arreter, lire, useLecture } from '../../lib/voixLecture'
import { phrasesDe } from '../../lib/phrasesPage'
import { useVoixPossible, IconeHautParleur } from '../lecture/BoutonEcouter'
import { titreCourt } from '../../lib/parcoursChapitre'
import { animationsReduites } from '../../lib/reglagesLecture'
import type { Aller } from './CarteChapitre'
import './motsDuCours.css'

/** Id de la section « Les mots du cours » de l'onglet Réviser. */
export const ID_LEXIQUE = 'mots-du-cours'

/** Fait défiler jusqu'au lexique (après le changement de vue : `ChapterPage` remonte d'abord en haut). */
function allerAuLexique(aller: Aller) {
  aller('reviser')
  window.setTimeout(() => {
    const el = document.getElementById(ID_LEXIQUE)
    if (!el) return
    el.scrollIntoView({ behavior: animationsReduites() ? 'auto' : 'smooth', block: 'start' })
    el.querySelector<HTMLElement>('h2')?.focus({ preventScroll: true })
  }, 80)
}

/**
 * Bulle d'un mot du cours (non modale) : le mot, sa définition simple, l'exemple, « Écouter » (synthèse
 * du navigateur, seulement si elle existe), « Revoir l'étape n » (si le mot est expliqué dans une autre
 * étape), « Tous les mots du cours », « Fermer ». Échap, un clic à côté ou un changement de vue la
 * referment ; le focus revient au mot. Téléphone (< 760 px) : feuille du bas ; ordinateur : bulle
 * posée sous (ou au-dessus du) mot. Rendue dans `body` (portail) : elle n'existe qu'ouverte, n'est
 * jamais pré-rendue, et « un bloc à la fois » ne la prend pas pour un bloc de l'étape.
 */
export function HoteMotsDuCours({ chapter, aller }: { chapter: ChapterContent; aller: Aller }) {
  const ouvert = useSyncExternalStore(abonnerMotOuvert, motOuvert, () => null)
  const { pathname, hash } = useLocation()
  useEffect(() => () => fermerMot(false), [])
  // Changer de vue (étape, Réviser…) referme la bulle.
  useEffect(() => fermerMot(false), [pathname, hash])
  if (!ouvert || !chapter.lexique) return null
  const mot = chapter.lexique[ouvert.mot]
  if (!mot) return null
  return createPortal(<Bulle key={`${ouvert.mot}-${ouvert.el.dataset.mot}`} mot={mot} ancre={ouvert.el} chapter={chapter} aller={aller} />, document.body)
}

function Bulle({ mot, ancre, chapter, aller }: { mot: MotDuCours; ancre: HTMLElement; chapter: ChapterContent; aller: Aller }) {
  const ref = useRef<HTMLDivElement>(null)
  const contenu = useRef<HTMLDivElement>(null)
  const titreId = useId()
  const source = useId()
  const voix = useVoixPossible()
  const lecture = useLecture()
  const lit = !!lecture && lecture.source === source
  const [pos, setPos] = useState<{ top: number; left: number; largeur: number } | null>(null)
  const [feuille, setFeuille] = useState(() => !window.matchMedia('(min-width: 760px)').matches)

  // Étape où le mot est expliqué : bouton seulement si on n'y est pas déjà.
  const section = mot.etape ? chapter.sections.find((s) => s.id === mot.etape) : undefined
  const ici = ancre.closest('.chapter-section')?.id
  const revoir = section && section.id !== ici ? section : undefined

  // Place : sous le mot s'il y a la place, sinon au-dessus ; dans l'écran, à 16 px des bords. Téléphone
  // (feuille du bas) : à l'ouverture, la page remonte juste assez pour que le mot reste visible au-dessus
  // de la feuille (sans passer sous l'en-tête collant de l'étape).
  const remonte = useRef(false)
  useLayoutEffect(() => {
    const poser = () => {
      const tel = !window.matchMedia('(min-width: 760px)').matches
      setFeuille(tel)
      if (tel && ref.current && !remonte.current) {
        remonte.current = true
        const r = ancre.getBoundingClientRect()
        const hautFeuille = window.innerHeight - ref.current.offsetHeight - 8
        const ecart = r.bottom + 12 - hautFeuille
        if (ecart > 0) window.scrollBy({ top: Math.min(ecart, Math.max(0, r.top - 140)), behavior: 'auto' })
      }
      if (tel || !ref.current) return
      const r = ancre.getBoundingClientRect()
      const largeur = Math.min(380, window.innerWidth - 32)
      const h = ref.current.offsetHeight
      const dessous = r.bottom + 8 + h <= window.innerHeight - 16 || r.top - 8 - h < 72
      const top = dessous ? r.bottom + 8 : r.top - 8 - h
      const left = Math.max(16, Math.min(r.left + r.width / 2 - largeur / 2, window.innerWidth - 16 - largeur))
      setPos({ top: Math.round(top), left: Math.round(left), largeur })
    }
    poser()
    const obs = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(poser) : null
    if (ref.current) obs?.observe(ref.current)
    window.addEventListener('resize', poser)
    window.addEventListener('scroll', poser, { passive: true })
    return () => {
      obs?.disconnect()
      window.removeEventListener('resize', poser)
      window.removeEventListener('scroll', poser)
    }
  }, [ancre])

  // Focus dans la bulle dès qu'elle est placée (une bulle encore en `visibility: hidden` ne prend pas le
  // focus) ; une seule fois.
  const pret = feuille || pos !== null
  const focusDonne = useRef(false)
  useEffect(() => {
    if (!pret || focusDonne.current) return
    focusDonne.current = true
    ref.current?.focus({ preventScroll: true })
  }, [pret])

  // Échap et clic à côté referment (focus rendu au mot).
  useEffect(() => {
    const touche = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.preventDefault()
      e.stopPropagation()
      fermerMot(true)
    }
    const clic = (e: PointerEvent) => {
      const cible = e.target as Element
      if (ref.current?.contains(cible) || ancre.contains(cible)) return
      // Un autre mot souligné : son propre clic ouvrira sa bulle (pas de focus rendu à l'ancien mot).
      fermerMot(!cible.closest?.('.mot-cours'))
    }
    document.addEventListener('keydown', touche, true)
    document.addEventListener('pointerdown', clic, true)
    return () => {
      document.removeEventListener('keydown', touche, true)
      document.removeEventListener('pointerdown', clic, true)
    }
  }, [ancre])

  // Fermer la bulle arrête SA lecture.
  const litRef = useRef(false)
  litRef.current = lit
  useEffect(
    () => () => {
      if (litRef.current) arreter()
    },
    [],
  )

  const style = feuille ? undefined : pos ? { top: pos.top, left: pos.left, width: pos.largeur } : { visibility: 'hidden' as const, top: 0, left: 0 }
  return (
    <div
      ref={ref}
      className={`mot-bulle${feuille ? ' mot-bulle--feuille' : ''}`}
      role="dialog"
      aria-modal="false"
      aria-labelledby={titreId}
      tabIndex={-1}
      style={style}
    >
      <SansMotsDuCours>
        <div ref={contenu}>
          <p className="mot-bulle-titre" id={titreId}>
            {mot.mot}
          </p>
          <p className="mot-bulle-def">
            <RichText text={mot.definition} />
          </p>
          {mot.exemple && (
            <p className="mot-bulle-exemple">
              <span className="mot-bulle-etiquette">Exemple : </span>
              <RichText text={mot.exemple} />
            </p>
          )}
        </div>
      </SansMotsDuCours>
      <div className="mot-bulle-actions">
        {voix && (
          <button
            type="button"
            className="mot-bulle-bouton"
            aria-label={lit ? 'Arrêter la lecture' : `Écouter la définition de « ${mot.mot} »`}
            onClick={() => {
              if (lit) arreter()
              else lire(phrasesDe(contenu.current), { source, titre: mot.mot, sansBarre: true })
            }}
          >
            <IconeHautParleur taille={17} />
            {lit ? 'Arrêter' : 'Écouter'}
          </button>
        )}
        {revoir && (
          <button
            type="button"
            className="mot-bulle-bouton"
            onClick={() => {
              fermerMot(false)
              aller(revoir.id)
            }}
          >
            Revoir l’étape {revoir.number}
            <span className="sr-only"> : {titreCourt(revoir)}</span>
          </button>
        )}
        <button
          type="button"
          className="mot-bulle-bouton"
          onClick={() => {
            fermerMot(false)
            allerAuLexique(aller)
          }}
        >
          Tous les mots
        </button>
        <button type="button" className="mot-bulle-bouton mot-bulle-fermer" onClick={() => fermerMot(true)}>
          Fermer
        </button>
      </div>
    </div>
  )
}

/** Lexique du chapitre (onglet Réviser) : tous les mots du cours par ordre alphabétique, avec leur
 * définition, leur exemple et « Revoir l'étape n ». Aucun mot n'y est souligné (pas de bulle dans le
 * lexique). Écran seulement (`no-export`, dans `ReviserVue`). */
export function LexiqueChapitre({ chapter, aller }: { chapter: ChapterContent; aller: Aller }) {
  if (!chapter.lexique?.length) return null
  const mots = lexiqueAlphabetique(chapter.lexique)
  return (
    <section className="lexique-chapitre" id={ID_LEXIQUE} aria-labelledby="lexique-titre">
      <h2 id="lexique-titre" tabIndex={-1}>
        Les mots du cours
      </h2>
      <p className="lexique-intro">
        Les mots soulignés en pointillé dans le cours. Touche un mot souligné pour revoir sa définition sans quitter ta lecture.
      </p>
      <SansMotsDuCours>
        <dl>
          {mots.map((m) => {
            const s = m.etape ? chapter.sections.find((x) => x.id === m.etape) : undefined
            return (
              <div key={m.mot} className="lexique-mot">
                <dt>{m.mot}</dt>
                <dd>
                  <p>
                    <RichText text={m.definition} />
                  </p>
                  {m.exemple && (
                    <p className="lexique-exemple">
                      <span className="mot-bulle-etiquette">Exemple : </span>
                      <RichText text={m.exemple} />
                    </p>
                  )}
                  {s && (
                    <button type="button" className="lexique-revoir" onClick={() => aller(s.id)}>
                      Revoir l’étape {s.number} · {titreCourt(s)}
                    </button>
                  )}
                </dd>
              </div>
            )
          })}
        </dl>
      </SansMotsDuCours>
    </section>
  )
}
