/** Pictogrammes au trait des outils de l'écran blanc ajoutés le 28/11/2026 (gabarits, copier / coller), même style que
 * `Pictogrammes.tsx` (gardés à part : ce fichier-là reste inchangé). */
export type NomPictoBlanc = 'gabarit' | 'copier' | 'coller' | 'rectangle' | 'lasso' | 'deplacer' | 'lecture' | 'pause' | 'page-blanche'

export function PictoBlanc({ nom, taille = 20 }: { nom: NomPictoBlanc; taille?: number }) {
  return (
    <svg aria-hidden="true" width={taille} height={taille} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none' }}>
      {trace(nom)}
    </svg>
  )
}

function trace(nom: NomPictoBlanc) {
  switch (nom) {
    case 'gabarit':
      return (
        <>
          <rect x="3" y="5" width="18" height="14" rx="1" />
          <path d="M3 10h18M9 5v14M15 10v9" />
        </>
      )
    case 'copier':
    case 'rectangle':
      return <rect x="4" y="5" width="16" height="13" rx="1" strokeDasharray="3 3" />
    case 'coller':
      return (
        <>
          <rect x="6" y="4" width="12" height="17" rx="1.5" />
          <path d="M9 4V3h6v1M9 10h6M9 14h6M9 18h3" />
        </>
      )
    case 'lasso':
      return (
        <>
          <path d="M12 4c5 0 8 2.2 8 5s-3.6 5-8 5-8-2.2-8-5 3-5 8-5z" strokeDasharray="3 2.5" />
          <path d="M7 13c-1 2 0 4 2 4s2 2 1 3" />
        </>
      )
    case 'deplacer':
      return (
        <>
          <circle cx="9" cy="6" r="1.2" fill="currentColor" stroke="none" />
          <circle cx="15" cy="6" r="1.2" fill="currentColor" stroke="none" />
          <circle cx="9" cy="12" r="1.2" fill="currentColor" stroke="none" />
          <circle cx="15" cy="12" r="1.2" fill="currentColor" stroke="none" />
          <circle cx="9" cy="18" r="1.2" fill="currentColor" stroke="none" />
          <circle cx="15" cy="18" r="1.2" fill="currentColor" stroke="none" />
        </>
      )
    case 'lecture':
      return <path d="M8 5l11 7-11 7z" fill="currentColor" />
    case 'pause':
      return <path d="M8 5v14M16 5v14" strokeWidth="3" />
    case 'page-blanche':
      return <rect x="3" y="6" width="18" height="13" rx="1.5" />
  }
}
