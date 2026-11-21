/** Petites icônes au trait (24 × 24, `currentColor`) du parcours de chapitre — décoratives
 * (`aria-hidden`), le texte voisin porte toujours le sens. */
const base = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  focusable: false,
}

export type NomIcone = 'livre' | 'cartes' | 'main' | 'cible' | 'avion' | 'lecture' | 'parchemin' | 'menu' | 'coche' | 'fleche' | 'horloge'

export function Icone({ nom, taille = 18 }: { nom: NomIcone; taille?: number }) {
  const p = { ...base, width: taille, height: taille }
  switch (nom) {
    case 'livre':
      return (
        <svg {...p}>
          <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" />
          <path d="M4 19V5" />
        </svg>
      )
    case 'cartes':
      return (
        <svg {...p}>
          <rect x="7" y="7" width="13" height="13" rx="2" />
          <path d="M4 16V6a2 2 0 0 1 2-2h10" />
        </svg>
      )
    case 'main':
      return (
        <svg {...p}>
          <path d="M8 12V5a1.5 1.5 0 0 1 3 0v6" />
          <path d="M11 11V4a1.5 1.5 0 0 1 3 0v7" />
          <path d="M14 11V6a1.5 1.5 0 0 1 3 0v8a6 6 0 0 1-6 6h-1a6 6 0 0 1-5-3l-2-4a1.5 1.5 0 0 1 2.6-1.5L8 14" />
        </svg>
      )
    case 'cible':
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="12" cy="12" r="1" />
        </svg>
      )
    case 'avion':
      return (
        <svg {...p}>
          <path d="M2 16l20-6-20-6 4 6z" />
        </svg>
      )
    case 'lecture':
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="9" />
          <path d="M10 8l6 4-6 4z" />
        </svg>
      )
    case 'parchemin':
      return (
        <svg {...p}>
          <path d="M8 4h10a2 2 0 0 1 2 2v1h-4" />
          <path d="M16 7v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-1h10" />
          <path d="M8 4a2 2 0 0 0-2 2v11" />
          <path d="M9.5 10h4M9.5 13.5h4" />
        </svg>
      )
    case 'menu':
      return (
        <svg {...p}>
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      )
    case 'coche':
      return (
        <svg {...p}>
          <path d="M5 12l5 5 9-10" />
        </svg>
      )
    case 'fleche':
      return (
        <svg {...p}>
          <path d="M9 6l6 6-6 6" />
        </svg>
      )
    case 'horloge':
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      )
  }
}
