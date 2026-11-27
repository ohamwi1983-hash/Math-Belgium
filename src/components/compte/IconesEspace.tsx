/**
 * Icônes au trait de l'espace professeur, partagées par `MenuEspace` (menu « Mon espace », barre du
 * bas, bandeaux) et `MenuCompte` (menu « Mon compte » de l'en-tête, mode `compte` : 20 px). Fichier
 * sans dépendance : `MenuCompte` est dans le paquet principal (toutes les pages), il ne doit pas tirer
 * le code du carnet.
 */
export type ModeIcone = 'menu' | 'barre' | 'bandeau' | 'compte'

function proprietes(mode: ModeIcone) {
  const barre = mode === 'barre'
  const bandeau = mode === 'bandeau'
  const compte = mode === 'compte'
  const taille = bandeau ? 26 : barre ? 22 : compte ? 20 : 18
  return {
    width: taille,
    height: taille,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: barre ? 1.8 : 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    focusable: false,
    className: bandeau ? undefined : barre ? 'carnet-barre-icone' : compte ? 'menu-compte-icone' : 'espace-menu-icone',
  }
}

export function IconeProfil({ mode = 'menu' }: { mode?: ModeIcone }) {
  return (
    <svg {...proprietes(mode)}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
    </svg>
  )
}

export function IconeCarnet({ mode = 'menu' }: { mode?: ModeIcone }) {
  return (
    <svg {...proprietes(mode)}>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </svg>
  )
}

export function IconeFeuille({ mode = 'menu' }: { mode?: ModeIcone }) {
  return (
    <svg {...proprietes(mode)}>
      <path d="M6 3h9l3 3v15H6z" />
      <path d="M9 12h6M9 16h6" />
    </svg>
  )
}

export function IconeEvaluation({ mode = 'menu' }: { mode?: ModeIcone }) {
  return (
    <svg {...proprietes(mode)}>
      <path d="M9 11l2 2 4-4" />
      <rect x="4" y="3" width="16" height="18" rx="2" />
    </svg>
  )
}

export function IconeCoffre({ mode = 'menu' }: { mode?: ModeIcone }) {
  return (
    <svg {...proprietes(mode)}>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5h8v2" />
    </svg>
  )
}

export function IconeAdmin({ mode = 'menu' }: { mode?: ModeIcone }) {
  return (
    <svg {...proprietes(mode)}>
      <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" />
    </svg>
  )
}

export function IconeSortie({ mode = 'menu' }: { mode?: ModeIcone }) {
  return (
    <svg {...proprietes(mode)}>
      <path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10" />
    </svg>
  )
}

export function IconePlus() {
  return (
    <svg {...proprietes('barre')}>
      <circle cx="6" cy="12" r="1.3" />
      <circle cx="12" cy="12" r="1.3" />
      <circle cx="18" cy="12" r="1.3" />
    </svg>
  )
}

/* Icônes de la barre du carnet (reprises de l'ancien `MenuCarnet`). */
export function IconeJour() {
  return (
    <svg {...proprietes('barre')}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  )
}

export function IconeSemaine() {
  return (
    <svg {...proprietes('barre')}>
      <rect x="3.5" y="5" width="17" height="15" rx="1.5" />
      <path d="M3.5 10h17M9 10v10M14.5 10v10M8 3v4M16 3v4" />
    </svg>
  )
}

export function IconeClasses() {
  return (
    <svg {...proprietes('barre')}>
      <path d="M5 4.5h11a3 3 0 0 1 3 3v12H8a3 3 0 0 1-3-3z" />
      <path d="M5 16.5a3 3 0 0 1 3-3h11M9 8h6" />
    </svg>
  )
}

/* Pages de connexion, d'inscription et de mot de passe (pastille du bandeau, mode `bandeau`). */
export function IconeCle({ mode = 'bandeau' }: { mode?: ModeIcone }) {
  return (
    <svg {...proprietes(mode)}>
      <circle cx="8" cy="14" r="4" />
      <path d="M11 11l9-9M16 6l3 3M14 8l2 2" />
    </svg>
  )
}

export function IconeEnveloppe({ mode = 'bandeau' }: { mode?: ModeIcone }) {
  return (
    <svg {...proprietes(mode)}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  )
}

/* Espace professeur réorganisé (27/11/2026) : tableau de bord, les quatre portes, retour au site. */
export function IconeAccueil({ mode = 'menu' }: { mode?: ModeIcone }) {
  return (
    <svg {...proprietes(mode)}>
      <path d="M4 11.5L12 4l8 7.5" />
      <path d="M6.5 9.5V20h11V9.5" />
    </svg>
  )
}

export function IconeGroupe({ mode = 'menu' }: { mode?: ModeIcone }) {
  return (
    <svg {...proprietes(mode)}>
      <circle cx="9" cy="8.5" r="3.2" />
      <path d="M3.5 19.5c.9-3.3 3-5 5.5-5s4.6 1.7 5.5 5" />
      <circle cx="16.5" cy="9.5" r="2.6" />
      <path d="M15.5 14.6c2.3-.2 4.2 1.3 5 4.4" />
    </svg>
  )
}

export function IconePreparer({ mode = 'menu' }: { mode?: ModeIcone }) {
  return (
    <svg {...proprietes(mode)}>
      <path d="M4 20l1-4.5L15.5 5a2.1 2.1 0 0 1 3 3L8 18.5z" />
      <path d="M13.5 7l3 3" />
    </svg>
  )
}

export function IconeDocuments({ mode = 'menu' }: { mode?: ModeIcone }) {
  return (
    <svg {...proprietes(mode)}>
      <path d="M3.5 6.5A1.5 1.5 0 0 1 5 5h4.2l2 2.2H19a1.5 1.5 0 0 1 1.5 1.5v9.8A1.5 1.5 0 0 1 19 20H5a1.5 1.5 0 0 1-1.5-1.5z" />
      <path d="M3.5 10h17" />
    </svg>
  )
}

export function IconeReglages({ mode = 'menu' }: { mode?: ModeIcone }) {
  return (
    <svg {...proprietes(mode)}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2.8v2.6M12 18.6v2.6M21.2 12h-2.6M5.4 12H2.8M18.5 5.5l-1.8 1.8M7.3 16.7l-1.8 1.8M18.5 18.5l-1.8-1.8M7.3 7.3L5.5 5.5" />
    </svg>
  )
}

export function IconeRetour({ mode = 'menu' }: { mode?: ModeIcone }) {
  return (
    <svg {...proprietes(mode)}>
      <path d="M9 14L4 9l5-5" />
      <path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />
    </svg>
  )
}

/** Triangle « lecture » des boutons Projeter (plein, pas au trait). */
export function IconeProjeter({ taille = 16 }: { taille?: number }) {
  return (
    <svg width={taille} height={taille} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M7 4.5v15l12.5-7.5z" fill="currentColor" />
    </svg>
  )
}

/** Coche des boutons « Noter la matière vue ». */
export function IconeCoche({ taille = 16 }: { taille?: number }) {
  return (
    <svg width={taille} height={taille} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  )
}
