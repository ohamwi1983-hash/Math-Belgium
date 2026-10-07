import { useEffect, useRef, useState } from 'react'
import type { ChapterContent } from '../../content/types'

interface SectionRepere {
  id: string
  number: number
  title: string
}

/**
 * Aides de navigation pour un chapitre long, pensées pour la lecture sur smartphone (où le
 * repliement des sections — déjà en place, voir `ChapterPage` — ne suffit pas à lui seul : une
 * fois DANS une section, ou au milieu d'un long défilement, deux besoins restent entiers : "où
 * j'en suis ?" et "comment sauter ailleurs sans tout remonter ?"). Comparées et validées avec
 * l'utilisateur via un artefact interactif avant implémentation ("Je prends toutes les options") :
 *
 * - barre de progression (fixe, tout en haut) ;
 * - en-tête de section collant, juste en dessous (numéro + titre de la section actuellement lue) ;
 * - bouton flottant "Sections" (bas, gauche) qui ouvre un tiroir listant toutes les sections, la
 *   section courante repérée, pour sauter directement ailleurs sans remonter en haut ;
 * - bouton flottant "remonter en haut" (bas, droite), visible seulement après un peu de défilement.
 *
 * Toutes du DOM direct (pas de refs par section) : la liste des `<details class="chapter-section"
 * data-repliable>` est retrouvée par le même sélecteur que `toutesLesSections` dans `ChapterPage`,
 * pour rester une SEULE source de vérité sur "qu'est-ce qu'une section repliable de ce chapitre".
 */
export function LectureAids({ chapter }: { chapter: ChapterContent }) {
  const sections: SectionRepere[] = chapter.sections.map((s) => ({ id: s.id, number: s.number, title: s.title }))

  const [progression, setProgression] = useState(0)
  const [indexCourant, setIndexCourant] = useState(0)
  const [enteteVisible, setEnteteVisible] = useState(false)
  const [boutonHautVisible, setBoutonHautVisible] = useState(false)
  const [tiroirOuvert, setTiroirOuvert] = useState(false)
  const elementsRef = useRef<HTMLElement[]>([])

  useEffect(() => {
    elementsRef.current = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null)

    let frameId = 0
    function mesurer() {
      frameId = 0
      const scrollY = window.scrollY
      const hauteurMax = document.documentElement.scrollHeight - window.innerHeight
      setProgression(hauteurMax > 0 ? Math.min(100, (scrollY / hauteurMax) * 100) : 0)

      const elements = elementsRef.current
      if (elements.length > 0) {
        let idx = 0
        const seuil = scrollY + 72
        elements.forEach((el, i) => {
          if (el.offsetTop <= seuil) idx = i
        })
        setIndexCourant(idx)
        setEnteteVisible(scrollY > elements[0].offsetTop - 80)
      }

      setBoutonHautVisible(scrollY > 400)
    }

    function onScroll() {
      if (frameId) return
      frameId = requestAnimationFrame(mesurer)
    }

    mesurer()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frameId) cancelAnimationFrame(frameId)
    }
  }, [chapter.slug]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!tiroirOuvert) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setTiroirOuvert(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [tiroirOuvert])

  if (sections.length === 0) return null

  function allerA(section: SectionRepere) {
    const details = document.getElementById(section.id) as HTMLDetailsElement | null
    if (details) {
      details.open = true
      details.scrollIntoView({ block: 'start', behavior: 'smooth' })
    }
    setTiroirOuvert(false)
  }

  function remonterEnHaut() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const courante = sections[indexCourant]

  return (
    <>
      <div className="lecture-progress no-export" aria-hidden="true">
        <div className="lecture-progress-fill" style={{ width: `${progression}%` }} />
      </div>

      <div className={`lecture-sticky-head no-export${enteteVisible ? ' visible' : ''}`} aria-hidden={!enteteVisible}>
        <span className="num">{courante.number}</span>
        <span>{courante.title}</span>
      </div>

      <button
        type="button"
        className="lecture-fab-toc no-export"
        onClick={() => setTiroirOuvert(true)}
        aria-haspopup="dialog"
        aria-expanded={tiroirOuvert}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="18" x2="14" y2="18" />
        </svg>
        Sections
      </button>

      <button
        type="button"
        className={`lecture-fab-top no-export${boutonHautVisible ? ' visible' : ''}`}
        onClick={remonterEnHaut}
        aria-label="Remonter en haut du chapitre"
        tabIndex={boutonHautVisible ? 0 : -1}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="19" x2="12" y2="5" />
          <polyline points="5 12 12 5 19 12" />
        </svg>
      </button>

      <div
        className={`lecture-sheet no-export${tiroirOuvert ? ' open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Aller à une section"
        onClick={(e) => {
          if (e.target === e.currentTarget) setTiroirOuvert(false)
        }}
      >
        <div className="lecture-sheet-body">
          <p className="lecture-sheet-title">Dans ce chapitre</p>
          {sections.map((s, i) => (
            <button
              key={s.id}
              type="button"
              className={`lecture-sheet-item${i === indexCourant ? ' current' : ''}`}
              onClick={() => allerA(s)}
            >
              <span className="n">{s.number}</span>
              <span>{s.title}</span>
            </button>
          ))}
          <button type="button" className="lecture-sheet-close" onClick={() => setTiroirOuvert(false)}>
            Fermer
          </button>
        </div>
      </div>
    </>
  )
}
