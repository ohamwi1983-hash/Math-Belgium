import { useLayoutEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'

/**
 * Palette « compacte » quand la hauteur disponible ne suffit pas (écran bas en paysage, vue réduite du professeur) :
 * la palette passe alors sur deux / trois colonnes côte à côte au lieu de défiler. Mesuré avant l'affichage
 * (`useLayoutEffect`, pas de clignotement) : en disposition normale, un contenu qui déborde → compacte (sa hauteur
 * normale est retenue) ; en compacte, retour à la normale dès que `disponible(el)` (hauteur offerte, px) la permet.
 * Revu à chaque changement de taille du conteneur positionné et de la palette (ResizeObserver).
 */
export function useCompacte(ref: RefObject<HTMLElement | null>, disponible: (el: HTMLElement) => number, force = false): boolean {
  const [compacte, setCompacte] = useState(false)
  const etat = useRef(compacte)
  etat.current = compacte
  const hauteurNormale = useRef(0)
  const dispo = useRef(disponible)
  dispo.current = disponible
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const verifier = () => {
      if (!etat.current) {
        if (el.scrollHeight > el.clientHeight + 1) {
          hauteurNormale.current = el.scrollHeight
          etat.current = true
          setCompacte(true)
        }
      } else if (hauteurNormale.current > 0 && dispo.current(el) >= hauteurNormale.current + 8) {
        // Marge de 8 px : sans elle, une hauteur offerte presque égale au contenu faisait basculer la palette sans fin
        // entre les deux dispositions (constaté le 28/11/2026 avec les onglets du traceur).
        etat.current = false
        setCompacte(false)
      }
    }
    verifier()
    const ro = new ResizeObserver(verifier)
    ro.observe(el)
    const parent = el.offsetParent ?? el.parentElement
    if (parent) ro.observe(parent)
    return () => ro.disconnect()
  }, [ref])
  return compacte || force
}

/** Hauteur offerte à une palette posée en absolu au-dessus de la pastille (colonne, nuancier) : du haut du conteneur
 * (8 px de marge) jusqu'à son bord bas. */
export function hauteurAuDessus(el: HTMLElement): number {
  const parent = el.offsetParent as HTMLElement | null
  if (!parent) return 0
  return parent.clientHeight - parseFloat(getComputedStyle(el).bottom || '0') - 8
}
