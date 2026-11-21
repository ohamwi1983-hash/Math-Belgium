import { useEffect, useRef, type KeyboardEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

const FOCUSABLES = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])'

function focusables(racine: HTMLElement): HTMLElement[] {
  return [...racine.querySelectorAll<HTMLElement>(FOCUSABLES)].filter((el) => el.offsetParent !== null || el === document.activeElement)
}

/**
 * Panneau latéral modal du carnet (« Noter une séance », une séance ouverte) : s'ouvre par-dessus la
 * page sans la quitter. `role="dialog"` + `aria-modal`, focus placé dans le panneau (élément
 * `[data-autofocus]`, sinon le panneau lui-même) et PIÉGÉ (Tab / Maj+Tab bouclent), Échap ferme, le
 * focus revient à l'élément qui l'a ouvert ; défilement de la page bloqué pendant l'ouverture. Un
 * clic sur le voile ne ferme PAS (une saisie en cours ne doit pas se perdre sur un geste de travers).
 */
export function PanneauLateral({ titreId, onFermer, children }: { titreId: string; onFermer: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const precedent = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const el = ref.current
    const cible = el?.querySelector<HTMLElement>('[data-autofocus]') ?? el
    cible?.focus({ preventScroll: true })
    const debordement = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = debordement
      if (precedent && document.contains(precedent)) precedent.focus({ preventScroll: true })
    }
  }, [])

  function clavier(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Escape' && !e.defaultPrevented) {
      e.preventDefault()
      onFermer()
      return
    }
    if (e.key !== 'Tab' || !ref.current) return
    const liste = focusables(ref.current)
    if (liste.length === 0) {
      e.preventDefault()
      return
    }
    const premier = liste[0]
    const dernier = liste[liste.length - 1]
    const actif = document.activeElement
    if (e.shiftKey && (actif === premier || actif === ref.current)) {
      e.preventDefault()
      dernier.focus()
    } else if (!e.shiftKey && actif === dernier) {
      e.preventDefault()
      premier.focus()
    }
  }

  return createPortal(
    <div className="carnet-panneau-fond" onKeyDown={clavier}>
      <div className="carnet-panneau-voile" aria-hidden="true" />
      <div className="carnet-panneau" role="dialog" aria-modal="true" aria-labelledby={titreId} ref={ref} tabIndex={-1}>
        {children}
      </div>
    </div>,
    document.body,
  )
}
