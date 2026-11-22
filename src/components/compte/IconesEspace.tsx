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
