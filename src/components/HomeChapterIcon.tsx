/**
 * Icônes de la page d'accueil (une par chapitre, voir `CHAPTER_ICON` dans `HomePage.tsx`) —
 * chacune est une MINIATURE D'ILLUSTRATION, pas un pictogramme monochrome : elle réutilise la
 * palette sémantique déjà posée pour les illustrations de contenu (`.svg-accent` pour une courbe
 * mise en avant, `.svg-good`/`.svg-bad` pour un point remarquable ou une racine, `.svg-plan`/
 * `.svg-sky` pour un second objet du même diagramme, `.svg-band` pour une aire ombrée — voir
 * `.claude/rules/illustration-components.md`), au lieu d'un simple trait `currentColor`. Chaque
 * icône reflète un trait mathématique réel et spécifique du chapitre (vertex + axe de symétrie
 * d'une parabole, région solution ombrée entre deux racines, point avec ses projections sur les
 * axes, arbre de probabilités à deux couleurs de branches...) : une première version de cette page
 * réutilisait une seule courbe générique pour 10 des 23 chapitres, ce qui annulait l'intérêt d'un
 * index visuel.
 *
 * Piège de remplissage SVG à connaître avant d'ajouter un cas : le `<svg>` racine pose
 * `fill="none"`, hérité par tout enfant qui ne fixe pas lui-même `fill`. Une classe combinée
 * trait+fond (`.svg-accent`, `.svg-good`, `.svg-bad`, `.svg-plan`, `.svg-sky`, `.svg-rose`,
 * `.svg-ink-stroke`) ÉCRASE cet héritage dès qu'elle est posée sur l'élément — sans risque sur un
 * segment droit ou un marqueur de flèche (aire quasi nulle une fois le tracé refermé), mais sur une
 * courbe de Bézier ou une forme fermée (cercle, ellipse, chemin avec `Z`) ça remplit toute l'aire
 * englobée d'un aplat de couleur. Pour une courbe ou une forme fermée qui doit rester un simple
 * contour, utiliser la variante `-outline` correspondante (`svg-accent-outline`,
 * `svg-good-outline`, `svg-bad-outline`, `svg-plan-outline`, qui fixent `fill: none` dans la
 * classe elle-même) — il n'existe pas de variante `-outline` pour `sky`/`rose`, donc ces deux tons
 * sont réservés aux segments droits, pointillés et points, jamais à une courbe.
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
    <svg viewBox="0 0 36 36" width="36" height="36" fill="none" aria-hidden="true" className={className}>
      {renderIconContent(kind)}
    </svg>
  )
}

const AXIS = <path d="M4 32V4M4 32H32" className="svg-line" strokeWidth="1.8" strokeLinecap="round" />

function renderIconContent(kind: HomeIconKind) {
  switch (kind) {
    case 'parabola':
      return (
        <>
          {AXIS}
          <path d="M18 21V6" className="svg-faint" strokeWidth="1.3" strokeDasharray="2 2" />
          <path d="M8 10C8 24 28 24 28 10" className="svg-accent-outline" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="18" cy="21" r="2.1" className="svg-good" />
        </>
      )
    case 'parabolaRoots':
      return (
        <>
          <path d="M4 21H32" className="svg-line" strokeWidth="1.5" />
          <path d="M12 21C15 27 23 27 26 21Z" className="svg-band" />
          <path d="M8 10C8 26 30 26 30 10" className="svg-accent-outline" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="12" cy="21" r="2" className="svg-bad" />
          <circle cx="26" cy="21" r="2" className="svg-bad" />
        </>
      )
    case 'curveFamily':
      return (
        <>
          {AXIS}
          <path d="M6 30L30 8" className="svg-ink-stroke" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M6 26C10 10 26 10 30 12" className="svg-accent-outline" strokeWidth="1.8" strokeLinecap="round" />
          <path
            d="M10 30L18 16L26 30"
            className="svg-plan-outline"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )
    case 'bars':
      return (
        <>
          {AXIS}
          <path d="M5 17H31" className="svg-good" strokeWidth="1.2" strokeDasharray="2 2" />
          <rect x="8" y="20" width="4.5" height="10" className="svg-bar" />
          <rect x="15.5" y="13" width="4.5" height="17" className="svg-bar" />
          <rect x="23" y="17" width="4.5" height="13" className="svg-bar" />
        </>
      )
    case 'circleAngle':
      return (
        <>
          <circle cx="18" cy="18" r="12" className="svg-line" strokeWidth="1.8" />
          <path d="M18 18H28M28 11V18" className="svg-sky" strokeWidth="1.3" strokeDasharray="2 2" />
          <path d="M24.3 18A6.3 6.3 0 0 0 23.2 14.2" className="svg-good-outline" strokeWidth="1.4" />
          <path d="M18 18L28 11" className="svg-accent-outline" strokeWidth="2" strokeLinecap="round" />
        </>
      )
    case 'vector':
      return (
        <>
          {AXIS}
          <path d="M6 30L19 15" className="svg-accent-outline" strokeWidth="2.2" strokeLinecap="round" />
          <path
            d="M19 15L14.5 16.8M19 15L17 10.8"
            className="svg-accent"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M19 15L30 9" className="svg-sky" strokeWidth="2" strokeLinecap="round" />
          <path
            d="M30 9L25.5 9.8M30 9L27.3 5.3"
            className="svg-sky"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M6 30L30 9" className="svg-plan-outline" strokeWidth="1.3" strokeDasharray="2 2" />
        </>
      )
    case 'axesPoint':
      return (
        <>
          {AXIS}
          <path d="M24 12V32" className="svg-sky" strokeWidth="1.2" strokeDasharray="2 2" />
          <path d="M4 12H24" className="svg-sky" strokeWidth="1.2" strokeDasharray="2 2" />
          <circle cx="24" cy="12" r="2.4" className="svg-accent" />
        </>
      )
    case 'cube':
      return (
        <>
          <path d="M8 13L18 7L28 13L18 19Z" className="svg-plan-fill" />
          <path d="M8 13L18 7L28 13V24L18 30L8 24V13Z" className="svg-line" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M8 13L18 19M18 19L28 13M18 19V30" className="svg-line" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M8 13L28 24" className="svg-accent-outline" strokeWidth="1.2" strokeDasharray="2 2" />
        </>
      )
    case 'curve':
      return (
        <>
          {AXIS}
          <path d="M19 19V9" className="svg-sky" strokeWidth="1.2" strokeDasharray="2 2" />
          <path d="M6 27C10 27 12 19 19 19" className="svg-accent-outline" strokeWidth="2" strokeLinecap="round" />
          <path d="M12 9C16 9 22 9 30 4" className="svg-plan-outline" strokeWidth="2" strokeLinecap="round" />
          <circle cx="19" cy="19" r="2" className="svg-good" />
          <circle cx="19" cy="9" r="2" className="svg-good" />
        </>
      )
    case 'sineWave':
      return (
        <>
          {AXIS}
          <path d="M5 9H31M5 27H31" className="svg-faint" strokeWidth="1.1" strokeDasharray="2 2" />
          <path
            d="M5 18C9 7 13 7 17 18C21 29 25 29 29 18"
            className="svg-accent-outline"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="11" cy="9.3" r="1.8" className="svg-good" />
        </>
      )
    case 'sequence':
      return (
        <>
          {AXIS}
          <path d="M9 25L15 20L21 14L27 9" className="svg-faint" strokeWidth="1.2" strokeDasharray="2 2" />
          <circle cx="9" cy="25" r="2.1" className="svg-accent" />
          <circle cx="15" cy="20" r="2.1" className="svg-accent" />
          <circle cx="21" cy="14" r="2.1" className="svg-accent" />
          <circle cx="27" cy="9" r="2.3" className="svg-good" />
        </>
      )
    case 'curveAsymptote':
      return (
        <>
          {AXIS}
          <path d="M12 12H32" className="svg-bad" strokeWidth="1.3" strokeDasharray="2 2" />
          <path d="M6 28C11 18 15 13 32 12" className="svg-accent-outline" strokeWidth="2.2" strokeLinecap="round" />
        </>
      )
    case 'curveTangent':
      return (
        <>
          {AXIS}
          <path d="M7 22L29 5" className="svg-sky" strokeWidth="1.4" />
          <path d="M22 9.7H27V5" className="svg-faint" strokeWidth="1.1" />
          <path d="M6 27C12 14 20 11 30 10" className="svg-accent-outline" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="18" cy="13.5" r="2.2" className="svg-good" />
        </>
      )
    case 'curveMirror':
      return (
        <>
          <path d="M5 31L31 5" className="svg-faint" strokeWidth="1.1" strokeDasharray="2 2" />
          <path d="M6 29C9 15 18 10 30 9" className="svg-accent-outline" strokeWidth="2" strokeLinecap="round" />
          <path d="M29 6C15 9 10 18 9 30" className="svg-plan-outline" strokeWidth="2" strokeLinecap="round" />
        </>
      )
    case 'expCurve':
      return (
        <>
          {AXIS}
          <path d="M4 28H14" className="svg-bad" strokeWidth="1.2" strokeDasharray="2 2" />
          <path
            d="M5 28C12 28 17 24 22 15C26 9 28 6 32 3"
            className="svg-accent-outline"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </>
      )
    case 'logCurve':
      return (
        <>
          {AXIS}
          <path d="M6 28V10" className="svg-bad" strokeWidth="1.2" strokeDasharray="2 2" />
          <path
            d="M6 31C8 13 12 6 18 5C23 4.3 27 4.3 32 4.3"
            className="svg-accent-outline"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </>
      )
    case 'curveArea':
      return (
        <>
          {AXIS}
          <path d="M10 30V18C14 12 20 11 24 13V30Z" className="svg-band" />
          <path d="M10 30V22M24 30V22" className="svg-faint" strokeWidth="1.1" />
          <path d="M6 28C11 15 19 11 31 12" className="svg-accent-outline" strokeWidth="2.2" strokeLinecap="round" />
        </>
      )
    case 'complexPlane':
      return (
        <>
          {AXIS}
          <path d="M4 31A9 9 0 0 1 13 22" className="svg-good-outline" strokeWidth="1.3" />
          <path d="M23 11V31" className="svg-sky" strokeWidth="1.1" strokeDasharray="2 2" />
          <path d="M4 11H23" className="svg-sky" strokeWidth="1.1" strokeDasharray="2 2" />
          <path d="M4 31L23 11" className="svg-accent-outline" strokeWidth="2.1" strokeLinecap="round" />
          <circle cx="23" cy="11" r="2.2" className="svg-accent" />
        </>
      )
    case 'tree':
      return (
        <>
          <path d="M5 18L15 9" className="svg-accent-outline" strokeWidth="1.4" />
          <path d="M5 18L15 27" className="svg-plan-outline" strokeWidth="1.4" />
          <path d="M15 9L27 4M15 9L27 13" className="svg-accent-outline" strokeWidth="1.3" />
          <path d="M15 27L27 22M15 27L27 31" className="svg-plan-outline" strokeWidth="1.3" />
          <circle cx="5" cy="18" r="2.1" className="svg-good" />
          <circle cx="15" cy="9" r="1.9" className="svg-accent" />
          <circle cx="15" cy="27" r="1.9" className="svg-plan" />
          <circle cx="27" cy="4" r="1.5" className="svg-accent" />
          <circle cx="27" cy="13" r="1.5" className="svg-accent" />
          <circle cx="27" cy="22" r="1.5" className="svg-plan" />
          <circle cx="27" cy="31" r="1.5" className="svg-plan" />
        </>
      )
    case 'gridSelect':
      return (
        <>
          <circle cx="9" cy="9" r="2" className="svg-accent" />
          <circle cx="18" cy="9" r="2" className="svg-line" strokeWidth="1.4" fill="none" />
          <circle cx="27" cy="9" r="2" className="svg-accent" />
          <circle cx="9" cy="18" r="2" className="svg-line" strokeWidth="1.4" fill="none" />
          <circle cx="18" cy="18" r="2" className="svg-line" strokeWidth="1.4" fill="none" />
          <circle cx="27" cy="18" r="2" className="svg-line" strokeWidth="1.4" fill="none" />
          <circle cx="9" cy="27" r="2" className="svg-line" strokeWidth="1.4" fill="none" />
          <circle cx="18" cy="27" r="2" className="svg-accent" />
          <circle cx="27" cy="27" r="2" className="svg-line" strokeWidth="1.4" fill="none" />
        </>
      )
    case 'bump':
      return (
        <>
          {AXIS}
          <rect x="10.5" y="21" width="3" height="9" className="svg-band" />
          <rect x="16.5" y="14" width="3" height="16" className="svg-band" />
          <rect x="22.5" y="21" width="3" height="9" className="svg-band" />
          <path
            d="M5 28C10 28 13 9 18 9C23 9 26 28 31 28"
            className="svg-accent-outline"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </>
      )
    case 'circleLocus':
      return (
        <>
          <circle cx="18" cy="18" r="12" className="svg-plan-outline" strokeWidth="1.5" strokeDasharray="3 2.5" />
          <circle cx="18" cy="6" r="1.4" className="svg-plan" opacity="0.45" />
          <circle cx="7" cy="23" r="1.4" className="svg-plan" opacity="0.45" />
          <circle cx="27" cy="23" r="2.3" className="svg-accent" />
          <circle cx="18" cy="18" r="1.6" className="svg-good" />
        </>
      )
    case 'ellipse':
      return (
        <>
          <ellipse cx="18" cy="18" rx="13" ry="8" className="svg-accent-outline" strokeWidth="2" />
          <path d="M10.5 18L18 10M25.5 18L18 10" className="svg-sky" strokeWidth="1.1" strokeDasharray="2 2" />
          <circle cx="10.5" cy="18" r="1.7" className="svg-good" />
          <circle cx="25.5" cy="18" r="1.7" className="svg-good" />
          <circle cx="18" cy="10" r="1.6" className="svg-bad" />
        </>
      )
  }
}
