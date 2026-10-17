/**
 * Icônes au trait de la page d'accueil (une par chapitre, voir `CHAPTER_ICON` dans `HomePage.tsx`)
 * — chacune reflète un trait mathématique réel et spécifique du chapitre (ex. une parabole avec
 * son axe de symétrie et son sommet pour "La fonction du second degré", la même parabole avec la
 * région solution ombrée entre les racines pour "Équations et inéquations", un point avec ses
 * projections sur les axes pour "Géométrie analytique" vs. un vecteur avec sa pointe fléchée pour
 * "Calcul vectoriel") — jamais une forme générique réutilisée par catégorie : une première version
 * de cette page réutilisait une seule courbe générique pour 10 des 23 chapitres (toute la famille
 * "fonctions"), ce qui annulait l'intérêt d'un index visuel. Couleur portée par `currentColor` (le
 * composant appelant fixe `color` via CSS, voir `.home-chapter-icon` dans `index.css`), jamais une
 * classe `svg-*` : ce sont des icônes d'interface, pas des illustrations de contenu
 * (`.claude/rules/illustration-components.md`).
 */
export type HomeIconKind =
  | 'parabola'
  | 'parabolaRoots'
  | 'curveFamily'
  | 'bars'
  | 'circleAngle'
  | 'vector'
  | 'axesPoint'
  | 'cube'
  | 'curve'
  | 'sineWave'
  | 'sequence'
  | 'curveAsymptote'
  | 'curveTangent'
  | 'curveMirror'
  | 'expCurve'
  | 'logCurve'
  | 'curveArea'
  | 'complexPlane'
  | 'tree'
  | 'gridSelect'
  | 'bump'
  | 'circleLocus'
  | 'ellipse'

export function HomeChapterIcon({ kind, className }: { kind: HomeIconKind; className?: string }) {
  return (
    <svg viewBox="0 0 28 28" width="28" height="28" fill="none" aria-hidden="true" className={className}>
      {renderIconContent(kind)}
    </svg>
  )
}

const AXIS = <path d="M3 24V4M3 24H25" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />

function renderIconContent(kind: HomeIconKind) {
  switch (kind) {
    case 'parabola':
      return (
        <>
          {AXIS}
          <path d="M14 16V4" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" opacity="0.5" />
          <path d="M6 8Q14 24 22 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="14" cy="16" r="1.8" fill="currentColor" />
        </>
      )
    case 'parabolaRoots':
      return (
        <>
          <path d="M3 18H25" stroke="currentColor" strokeWidth="1.3" />
          <path d="M8.3 18Q14 26 19.7 18Z" fill="currentColor" opacity="0.15" />
          <path d="M5 10Q14 26 23 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="8.3" cy="18" r="1.6" fill="currentColor" />
          <circle cx="19.7" cy="18" r="1.6" fill="currentColor" />
        </>
      )
    case 'curveFamily':
      return (
        <>
          {AXIS}
          <path d="M5 23L23 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M5 20Q10 6 23 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
          <path
            d="M9 23L14 15L19 23"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.4"
          />
        </>
      )
    case 'bars':
      return (
        <>
          {AXIS}
          <path d="M5 13.5H24" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" opacity="0.5" />
          <rect x="6" y="16" width="3.5" height="8" fill="currentColor" />
          <rect x="12" y="11" width="3.5" height="13" fill="currentColor" />
          <rect x="18" y="14" width="3.5" height="10" fill="currentColor" />
        </>
      )
    case 'circleAngle':
      return (
        <>
          <circle cx="14" cy="14" r="9" stroke="currentColor" strokeWidth="1.6" />
          <path d="M14 14H23" stroke="currentColor" strokeWidth="1.1" strokeDasharray="2 2" opacity="0.5" />
          <path d="M21 9V14" stroke="currentColor" strokeWidth="1.1" strokeDasharray="2 2" opacity="0.5" />
          <path d="M14 14L21 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </>
      )
    case 'vector':
      return (
        <>
          {AXIS}
          <path d="M5 23L23 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path
            d="M23 7L18 8.5M23 7L21 11.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )
    case 'axesPoint':
      return (
        <>
          {AXIS}
          <path d="M18 10V24" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" opacity="0.55" />
          <path d="M3 10H18" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" opacity="0.55" />
          <circle cx="18" cy="10" r="2" fill="currentColor" />
        </>
      )
    case 'cube':
      return (
        <>
          <path d="M5 10L14 5L23 10V19L14 24L5 19V10Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M5 10L14 15M14 15L23 10M14 15V24" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M5 10L23 19" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" opacity="0.45" />
        </>
      )
    case 'curve':
      return (
        <>
          {AXIS}
          <path d="M15 15V8" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" opacity="0.55" />
          <path d="M5 21C8 21 10 15 15 15" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          <path d="M10 8C14 8 18 8 24 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" opacity="0.6" />
          <circle cx="15" cy="15" r="1.6" fill="currentColor" />
          <circle cx="15" cy="8" r="1.6" fill="currentColor" opacity="0.6" />
        </>
      )
    case 'sineWave':
      return (
        <>
          {AXIS}
          <path d="M4 7H25M4 21H25" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" opacity="0.35" />
          <path
            d="M4 14C7 6 10 6 13 14C16 22 19 22 22 14C23 10 24 9.5 25 10.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </>
      )
    case 'sequence':
      return (
        <>
          {AXIS}
          <path d="M7 19L12 15L17 11L22 8" stroke="currentColor" strokeWidth="1.1" strokeDasharray="2 2" opacity="0.5" />
          <circle cx="7" cy="19" r="1.8" fill="currentColor" />
          <circle cx="12" cy="15" r="1.8" fill="currentColor" />
          <circle cx="17" cy="11" r="1.8" fill="currentColor" />
          <circle cx="22" cy="8" r="1.8" fill="currentColor" />
        </>
      )
    case 'curveAsymptote':
      return (
        <>
          {AXIS}
          <path d="M10 10H25" stroke="currentColor" strokeWidth="1.1" strokeDasharray="2 2" />
          <path d="M5 22C9 14 12 10.5 25 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </>
      )
    case 'curveTangent':
      return (
        <>
          {AXIS}
          <path d="M6 17L22 4" stroke="currentColor" strokeWidth="1.2" opacity="0.7" />
          <path d="M18 7.4H21.5V4" stroke="currentColor" strokeWidth="1" opacity="0.45" />
          <path d="M5 21C10 11 16 9 24 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="14" cy="10.5" r="1.8" fill="currentColor" />
        </>
      )
    case 'curveMirror':
      return (
        <>
          <path d="M4 24L24 4" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
          <path d="M5 23C7 12 14 8 24 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          <path d="M23 5C12 7 8 14 7 24" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" opacity="0.55" />
        </>
      )
    case 'expCurve':
      return (
        <>
          {AXIS}
          <path d="M3 21.5H11" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" opacity="0.5" />
          <path d="M4 22C9 22 13 19 17 12C20 7 22 5 25 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </>
      )
    case 'logCurve':
      return (
        <>
          {AXIS}
          <path d="M4.5 22V8" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" opacity="0.5" />
          <path d="M4 24C6 10 9 5 14 4C18 3.5 21 3.5 25 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </>
      )
    case 'curveArea':
      return (
        <>
          {AXIS}
          <path d="M8 24V14C11 10 15 9.3 18 10.3V24Z" fill="currentColor" opacity="0.18" />
          <path d="M8 24V17M18 24V17" stroke="currentColor" strokeWidth="1" opacity="0.5" />
          <path d="M5 22C9 12 15 9 24 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </>
      )
    case 'complexPlane':
      return (
        <>
          {AXIS}
          <path d="M3 24A7 7 0 0 1 10 17" stroke="currentColor" strokeWidth="1" opacity="0.5" />
          <path d="M18 9V24" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" opacity="0.4" />
          <path d="M3 9H18" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" opacity="0.4" />
          <path d="M3 24L18 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="18" cy="9" r="1.8" fill="currentColor" />
        </>
      )
    case 'tree':
      return (
        <>
          <path
            d="M4 14L12 7M4 14L12 21M12 7L21 3.5M12 7L21 10M12 21L21 18M12 21L21 24.5"
            stroke="currentColor"
            strokeWidth="1.3"
          />
          <circle cx="4" cy="14" r="1.8" fill="currentColor" />
          <circle cx="12" cy="7" r="1.6" fill="currentColor" />
          <circle cx="12" cy="21" r="1.6" fill="currentColor" />
          <circle cx="21" cy="3.5" r="1.3" fill="currentColor" />
          <circle cx="21" cy="10" r="1.3" fill="currentColor" />
          <circle cx="21" cy="18" r="1.3" fill="currentColor" />
          <circle cx="21" cy="24.5" r="1.3" fill="currentColor" />
        </>
      )
    case 'gridSelect':
      return (
        <>
          <circle cx="7" cy="7" r="1.6" fill="currentColor" />
          <circle cx="14" cy="7" r="1.6" fill="none" stroke="currentColor" strokeWidth="1.3" />
          <circle cx="21" cy="7" r="1.6" fill="currentColor" />
          <circle cx="7" cy="14" r="1.6" fill="none" stroke="currentColor" strokeWidth="1.3" />
          <circle cx="14" cy="14" r="1.6" fill="none" stroke="currentColor" strokeWidth="1.3" />
          <circle cx="21" cy="14" r="1.6" fill="none" stroke="currentColor" strokeWidth="1.3" />
          <circle cx="7" cy="21" r="1.6" fill="none" stroke="currentColor" strokeWidth="1.3" />
          <circle cx="14" cy="21" r="1.6" fill="currentColor" />
          <circle cx="21" cy="21" r="1.6" fill="none" stroke="currentColor" strokeWidth="1.3" />
        </>
      )
    case 'bump':
      return (
        <>
          {AXIS}
          <rect x="8.5" y="17" width="2.4" height="7" fill="currentColor" opacity="0.22" />
          <rect x="12.8" y="12" width="2.4" height="12" fill="currentColor" opacity="0.22" />
          <rect x="17.1" y="17" width="2.4" height="7" fill="currentColor" opacity="0.22" />
          <path d="M4 22C8 22 10 8 14 8C18 8 20 22 24 22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </>
      )
    case 'circleLocus':
      return (
        <>
          <circle cx="14" cy="14" r="9" stroke="currentColor" strokeWidth="1.4" strokeDasharray="3 2" />
          <circle cx="14" cy="5" r="1.2" fill="currentColor" opacity="0.4" />
          <circle cx="7" cy="14" r="1.2" fill="currentColor" opacity="0.4" />
          <circle cx="21" cy="14" r="1.9" fill="currentColor" />
        </>
      )
    case 'ellipse':
      return (
        <>
          <ellipse cx="14" cy="14" rx="10" ry="6" stroke="currentColor" strokeWidth="1.6" />
          <path d="M8.5 14L14 8M19.5 14L14 8" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" opacity="0.5" />
          <circle cx="8.5" cy="14" r="1.3" fill="currentColor" />
          <circle cx="19.5" cy="14" r="1.3" fill="currentColor" />
          <circle cx="14" cy="8" r="1.3" fill="currentColor" />
        </>
      )
  }
}
