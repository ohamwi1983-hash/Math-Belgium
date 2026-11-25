import type { ReactNode } from 'react'

/** Ligne verte « Gardé sur cet appareil… » (pages Mon suivi et Plan de révision, planche 13). */
export function BoucleConfiance({ children }: { children: ReactNode }) {
  return (
    <p className="suivi-confiance">
      <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3l7 3v6c0 4.2-3 7.6-7 9-4-1.4-7-4.8-7-9V6z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
      <span>{children}</span>
    </p>
  )
}

export function IconeLivre() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3h12v18l-6-4-6 4z" />
    </svg>
  )
}
