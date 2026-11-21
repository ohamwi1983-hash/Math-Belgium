import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'

export interface ActionMenu {
  texte: string
  onChoisir: () => void
  danger?: boolean
  desactive?: boolean
}

/**
 * Menu « … » des actions secondaires d'une séance (fiche, téléchargement, modifier, supprimer) : un
 * bouton `aria-haspopup="menu"` / `aria-expanded`, une liste `role="menu"` d'éléments
 * `role="menuitem"`. Clavier : flèches haut / bas, Début / Fin, Échap (referme et rend le focus au
 * bouton, sans fermer le panneau qui contiendrait le menu), Tab referme. Clic à côté : referme. Le
 * menu s'ouvre vers le haut s'il manque de place en dessous.
 */
export function MenuActions({ libelle, actions, classe = '' }: { libelle: string; actions: ActionMenu[]; classe?: string }) {
  const id = useId()
  const [ouvert, setOuvert] = useState(false)
  const [versLeHaut, setVersLeHaut] = useState(false)
  const bouton = useRef<HTMLButtonElement>(null)
  const liste = useRef<HTMLUListElement>(null)

  useEffect(() => {
    if (!ouvert) return
    liste.current?.querySelector<HTMLButtonElement>('[role="menuitem"]:not([disabled])')?.focus()
    const dehors = (e: PointerEvent) => {
      const cible = e.target as Node
      if (!liste.current?.contains(cible) && !bouton.current?.contains(cible)) setOuvert(false)
    }
    document.addEventListener('pointerdown', dehors)
    return () => document.removeEventListener('pointerdown', dehors)
  }, [ouvert])

  function basculer() {
    if (!ouvert && bouton.current) {
      const r = bouton.current.getBoundingClientRect()
      setVersLeHaut(window.innerHeight - r.bottom < 60 * actions.length + 16 && r.top > window.innerHeight - r.bottom)
    }
    setOuvert(!ouvert)
  }

  function fermer(rendreFocus: boolean) {
    setOuvert(false)
    if (rendreFocus) bouton.current?.focus()
  }

  function clavier(e: KeyboardEvent<HTMLUListElement>) {
    const items = [...(liste.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not([disabled])') ?? [])]
    const i = items.indexOf(document.activeElement as HTMLButtonElement)
    if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      fermer(true)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      items[(i + 1) % items.length]?.focus()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      items[(i - 1 + items.length) % items.length]?.focus()
    } else if (e.key === 'Home') {
      e.preventDefault()
      items[0]?.focus()
    } else if (e.key === 'End') {
      e.preventDefault()
      items[items.length - 1]?.focus()
    } else if (e.key === 'Tab') {
      fermer(false)
    }
  }

  return (
    <div className={`carnet-menu-actions ${classe}`}>
      <button
        ref={bouton}
        type="button"
        className="carnet-bouton carnet-bouton-trois-points"
        aria-label={libelle}
        aria-haspopup="menu"
        aria-expanded={ouvert}
        aria-controls={ouvert ? `${id}-menu` : undefined}
        onClick={basculer}
      >
        <span aria-hidden="true">…</span>
      </button>
      {ouvert && (
        <ul ref={liste} id={`${id}-menu`} role="menu" aria-label={libelle} className={`carnet-menu-liste${versLeHaut ? ' vers-le-haut' : ''}`} onKeyDown={clavier}>
          {actions.map((a) => (
            <li key={a.texte} role="none">
              <button
                type="button"
                role="menuitem"
                className={a.danger ? 'danger' : undefined}
                disabled={a.desactive}
                onClick={() => {
                  fermer(true)
                  a.onChoisir()
                }}
              >
                {a.texte}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
