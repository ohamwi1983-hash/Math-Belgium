import { lazy, Suspense, useEffect, useId, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import type { PhraseVoix } from '../../lib/voixLecture'
import { arreter, estPrerendu, lire, useLecture, voixDisponible } from '../../lib/voixLecture'
import { phrasesEtape } from '../../lib/phrasesPage'

/** Barre de lecture (planche 08) : chargée à la première lecture (aucun poids avant, rien au pré-rendu). */
const chargerLecteur = () => import('./LecteurVoix')
const LecteurVoix = lazy(chargerLecteur)

/** Le navigateur sait lire à voix haute (après le montage : jamais dans la page pré-rendue). */
export function useVoixPossible(): boolean {
  const [possible, setPossible] = useState(false)
  useEffect(() => {
    setPossible(voixDisponible() && !estPrerendu())
  }, [])
  return possible
}

export function IconeHautParleur({ taille = 18 }: { taille?: number }) {
  return (
    <svg width={taille} height={taille} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M11 5 6 9H2v6h4l5 4V5z" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
      <path d="M19 5a10 10 0 0 1 0 14" />
    </svg>
  )
}

function IconeArret({ taille = 18 }: { taille?: number }) {
  return (
    <svg width={taille} height={taille} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <rect x="6" y="6" width="12" height="12" rx="1.5" />
    </svg>
  )
}

/**
 * Bouton « Écouter » commun (étape du cours, énoncé, aides, corrigé des générateurs…). Absent tant que la
 * page n'est pas montée, au pré-rendu, et sans synthèse vocale (la lecture en mots reste à la loupe).
 * Pendant SA lecture, il devient « Arrêter la lecture ». `phrases` est appelé au toucher (le DOM du
 * moment : tiroirs ouverts, écran courant).
 */
export function BoutonEcouter({
  libelle,
  phrases,
  titre,
  zone,
  className = '',
  libelleCourt,
}: {
  libelle: string
  phrases: () => PhraseVoix[]
  titre?: string
  /** Zone où toucher une phrase relance la lecture à partir d'elle (lecture d'une page). */
  zone?: () => Element | null
  className?: string
  /** Texte visible plus court (« Écouter ») ; `libelle` reste le nom accessible. */
  libelleCourt?: string
}) {
  const possible = useVoixPossible()
  const source = useId()
  const lecture = useLecture()
  const actif = !!lecture && lecture.source === source
  useEffect(() => {
    if (possible) void chargerLecteur().catch(() => undefined)
  }, [possible])
  if (!possible) return null
  return (
    <button
      type="button"
      className={`ecouter-bouton no-export${actif ? ' est-actif' : ''}${className ? ` ${className}` : ''}`}
      aria-label={actif ? 'Arrêter la lecture' : libelle}
      onClick={(e) => {
        e.stopPropagation()
        if (actif) arreter()
        else lire(phrases(), { source, titre, zone: zone?.() ?? null })
      }}
    >
      {actif ? <IconeArret /> : <IconeHautParleur />}
      <span aria-hidden="true">{actif ? 'Arrêter' : (libelleCourt ?? libelle)}</span>
    </button>
  )
}

/**
 * Hôte unique de la barre de lecture (dans `App`, à côté du panneau « Aa »). Rien n'est rendu sans
 * lecture en cours. Changement de page, d'étape ou de vue (chemin ou fragment de l'adresse) : la voix
 * s'arrête proprement.
 */
export function HoteLecteurVoix() {
  const lecture = useLecture()
  const { pathname, hash } = useLocation()
  const premier = useRef(true)
  useEffect(() => {
    if (premier.current) {
      premier.current = false
      return
    }
    arreter()
  }, [pathname, hash])
  if (!lecture) return null
  return (
    <Suspense fallback={null}>
      <LecteurVoix />
    </Suspense>
  )
}

/**
 * « Écouter le point » (cours, vue étape) : sous le titre de l'étape, avant le texte. Lit l'étape phrase
 * par phrase (titre, sous-titre, « L'essentiel », le corps, les annexes ; ateliers, vidéos et cartes
 * « À toi » en une phrase). Rien sans synthèse vocale ni au pré-rendu (pas même le conteneur).
 */
export function EcouterEtape({ numero }: { numero: number | string }) {
  const possible = useVoixPossible()
  const ref = useRef<HTMLDivElement>(null)
  if (!possible) return null
  const section = () => ref.current?.closest('.chapter-section') ?? null
  return (
    <div className="etape-ecouter no-export" ref={ref}>
      <BoutonEcouter
        libelle={`Écouter le point ${numero}`}
        libelleCourt="Écouter le point"
        titre={`Point ${numero}`}
        phrases={() => {
          const s = section()
          return s ? phrasesEtape(s) : []
        }}
        zone={section}
      />
    </div>
  )
}
