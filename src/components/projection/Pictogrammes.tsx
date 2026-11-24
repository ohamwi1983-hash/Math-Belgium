/** Pictogrammes au trait du mode projection (mêmes tracés que les maquettes du 24/11/2026). */
export type NomPictogramme =
  | 'crayon'
  | 'minuteur'
  | 'ecran-blanc'
  | 'grille'
  | 'plein-ecran'
  | 'quitter-plein-ecran'
  | 'precedent'
  | 'suivant'
  | 'ecran'
  | 'deux-ecrans'
  | 'main'
  | 'gomme'
  | 'effacer'
  | 'fermer'
  | 'telecharger'
  | 'coche'
  | 'equerre'
  | 'compas'
  | 'calculatrice'
  | 'annuler'
  | 'surligneur'
  | 'epingle'
  | 'masquer'

export function Pictogramme({ nom, taille = 20 }: { nom: NomPictogramme; taille?: number }) {
  return (
    <svg aria-hidden="true" width={taille} height={taille} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none' }}>
      {trace(nom)}
    </svg>
  )
}

function trace(nom: NomPictogramme) {
  switch (nom) {
    case 'crayon':
      return (
        <>
          <path d="M4 20l4-1 11-11-3-3L5 16z" />
          <path d="M14 6l3 3" />
        </>
      )
    case 'minuteur':
      return (
        <>
          <circle cx="12" cy="13" r="8" />
          <path d="M12 9v4l2 2M9 2h6" />
        </>
      )
    case 'ecran-blanc':
      return (
        <>
          <path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z" />
          <path d="M4 4l16 16" />
        </>
      )
    case 'grille':
      return (
        <>
          <rect x="4" y="4" width="7" height="7" />
          <rect x="13" y="4" width="7" height="7" />
          <rect x="4" y="13" width="7" height="7" />
          <rect x="13" y="13" width="7" height="7" />
        </>
      )
    case 'plein-ecran':
      return <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
    case 'quitter-plein-ecran':
      return <path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" />
    case 'precedent':
      return <path d="M15 5l-7 7 7 7" />
    case 'suivant':
      return <path d="M9 5l7 7-7 7" />
    case 'ecran':
      return (
        <>
          <rect x="3" y="4" width="18" height="12" rx="1.5" />
          <path d="M9 20h6M12 16v4" />
        </>
      )
    case 'deux-ecrans':
      return (
        <>
          <rect x="2" y="5" width="12" height="9" rx="1.2" />
          <rect x="14" y="9" width="8" height="6" rx="1" />
          <path d="M6 18h4M8 14v4" />
        </>
      )
    case 'main':
      return (
        <>
          <path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V12" />
          <path d="M11 11.5V4a1.5 1.5 0 0 1 3 0v7.5" />
          <path d="M14 11.5V6a1.5 1.5 0 0 1 3 0v8a6 6 0 0 1-6 6h-1a6 6 0 0 1-5-2.7L3 14a1.5 1.5 0 0 1 2.4-1.8L8 15" />
        </>
      )
    case 'gomme':
      return (
        <>
          <path d="M7 20h13" />
          <path d="M4.5 15.5l9-9a2 2 0 0 1 2.8 0l2.2 2.2a2 2 0 0 1 0 2.8L11 19H8.5z" />
          <path d="M9 11l5 5" />
        </>
      )
    case 'effacer':
      return (
        <>
          <path d="M4 7h16M10 11v6M14 11v6" />
          <path d="M6 7l1 13h10l1-13M9 7V4h6v3" />
        </>
      )
    case 'fermer':
      return <path d="M6 6l12 12M18 6L6 18" />
    case 'telecharger':
      return <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
    case 'coche':
      return <path d="M5 12l5 5 9-10" />
    case 'equerre':
      return (
        <>
          <path d="M3 20h18L3 4z" />
          <path d="M7 20v-2M11 20v-3M15 20v-2M7 13.5V20" />
        </>
      )
    case 'compas':
      return (
        <>
          <circle cx="12" cy="4.5" r="1.6" />
          <path d="M11.2 6L6 20M12.8 6L18 20M8.2 14.5h7.6" />
        </>
      )
    case 'calculatrice':
      return (
        <>
          <rect x="5" y="3" width="14" height="18" rx="2" />
          <path d="M8 7h8M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 16h.01M12 16h.01M15.5 16h.01" />
        </>
      )
    case 'annuler':
      return (
        <>
          <path d="M9 14L4 9l5-5" />
          <path d="M4 9h10a6 6 0 0 1 0 12h-3" />
        </>
      )
    case 'surligneur':
      return (
        <>
          <path d="M9 15l-3 3h4l1.5-1.5" />
          <path d="M9 15l6.5-10.5 4 4L9 15z" />
          <path d="M4 21h16" />
        </>
      )
    case 'epingle':
      return (
        <>
          <path d="M9 4h6l-1 6 3 3H7l3-3z" />
          <path d="M12 13v7" />
        </>
      )
    case 'masquer':
      return (
        <>
          <path d="M3 12s3.5-6 9-6c1.6 0 3 .5 4.2 1.2M21 12s-3.5 6-9 6c-1.6 0-3-.5-4.2-1.2" />
          <path d="M4 20L20 4" />
        </>
      )
  }
}
