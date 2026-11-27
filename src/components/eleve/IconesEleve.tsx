import type { ReactElement } from 'react'
/** Pictogrammes au trait du côté élève (barre du bas, portes de l'accueil) : `currentColor`, `aria-hidden`. */
export type NomIconeEleve = 'accueil' | 'cours' | 'entrainer' | 'interro' | 'classe' | 'aide' | 'chrono'

const TRACES: Record<NomIconeEleve, ReactElement> = {
  accueil: <path d="M4 11.5 12 4l8 7.5M6.5 9.5V20h11V9.5M10 20v-5.5h4V20" />,
  cours: (
    <>
      <path d="M12 6.5C10 5 7 4.5 3.5 5v13c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5Z" />
      <path d="M12 6.5v13" />
    </>
  ),
  entrainer: (
    <>
      <path d="M15.5 4.5 19.5 8.5 9 19H5v-4L15.5 4.5Z" />
      <path d="M13 7l4 4" />
    </>
  ),
  interro: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="12" cy="12" r="0.9" fill="currentColor" />
    </>
  ),
  classe: (
    <>
      <circle cx="9" cy="8.5" r="3" />
      <path d="M3.5 19c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5" />
      <path d="M15.5 6.2a3 3 0 0 1 0 5.6M17.5 14.4c1.6.6 2.7 2.2 3 4.6" />
    </>
  ),
  aide: (
    <>
      <path d="M9.2 9.3a2.9 2.9 0 0 1 5.6 1c0 2-2.8 2.4-2.8 4.2" />
      <circle cx="12" cy="18" r="0.9" fill="currentColor" />
    </>
  ),
  chrono: (
    <>
      <circle cx="12" cy="13" r="7" />
      <path d="M12 9.5V13l2.5 2M10 3.5h4" />
    </>
  ),
}

export function IconeEleve({ nom, taille = 24 }: { nom: NomIconeEleve; taille?: number }) {
  return (
    <svg aria-hidden="true" focusable="false" width={taille} height={taille} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      {TRACES[nom]}
    </svg>
  )
}
